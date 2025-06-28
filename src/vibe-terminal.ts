import * as pty from 'node-pty';
import * as os from 'os';
import { randomUUID } from 'crypto';
import { 
  TerminalResult, 
  CommandRecord, 
  SessionState, 
  TerminalConfig 
} from './types.js';

export class VibeTerminal {
  private pty: pty.IPty;
  private sessionId: string;
  private output: string = '';
  private commandHistory: CommandRecord[] = [];
  private currentWorkingDirectory: string;
  private startTime: Date;
  private shellType: SessionState['shellType'];
  private promptTimeout: number;
  private isExecuting: boolean = false;
  private disableOutputCleaning: boolean;
  
  constructor(config: TerminalConfig = {}) {
    this.sessionId = randomUUID();
    this.startTime = new Date();
    this.currentWorkingDirectory = config.cwd || process.cwd();
    this.promptTimeout = config.promptTimeout || 5000; // Default 5 second timeout
    this.disableOutputCleaning = process.env.NODE_ENV === 'test';
    
    // Determine shell
    const defaultShell = config.shell || this.getDefaultShell();
    this.shellType = this.detectShellType(defaultShell);
    
    // Create PTY instance
    this.pty = pty.spawn(defaultShell, [], {
      name: 'xterm-256color',
      cols: config.cols || 80,
      rows: config.rows || 24,
      cwd: this.currentWorkingDirectory,
      env: { 
        ...process.env, 
        ...config.env,
        LANG: 'en_US.UTF-8',
        LC_ALL: 'en_US.UTF-8',
        GH_NO_UPDATE_NOTIFIER: '1', // Disable gh update notifications
        GH_FORCE_TTY: '0', // Prevent gh from using TTY features
        CI: '1' // Make CLI tools think they're in CI mode
      }
    });
    
    console.error(`Vibe Terminal: Created session ${this.sessionId} with ${this.shellType} shell (PID: ${this.pty.pid})`);
    
    // Initial working directory is set from config or process.cwd()
  }
  
  private getDefaultShell(): string {
    if (os.platform() === 'win32') {
      return 'powershell.exe';
    }
    // Check SHELL environment variable first
    if (process.env.SHELL) {
      return process.env.SHELL;
    }
    // Use bash by default on macOS for better compatibility
    return '/bin/bash';
  }
  
  private detectShellType(shellPath: string): SessionState['shellType'] {
    if (shellPath.includes('bash')) return 'bash';
    if (shellPath.includes('zsh')) return 'zsh';
    if (shellPath.includes('fish')) return 'fish';
    if (shellPath.includes('sh')) return 'sh';
    return 'unknown';
  }
  
  async execute(command: string): Promise<TerminalResult> {
    if (this.isExecuting) {
      throw new Error('Another command is currently executing');
    }
    
    this.isExecuting = true;
    const startTime = Date.now();
    
    const resultPromise = new Promise<TerminalResult>((resolve, reject) => {
      let commandOutput = '';
      let promptDetected = false;
      let timedOut = false;
      let timeoutHandle: NodeJS.Timeout;
      let dataListener: any; // Store the disposable
      
      const cleanup = () => {
        this.isExecuting = false;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (dataListener) dataListener.dispose(); // Properly remove the listener
      };
      
      const onData = (data: string) => {
        commandOutput += data;
        this.output += data; // Keep full session history
        
        // Check for prompt
        if (this.isAtPrompt(commandOutput) && !timedOut) {
          promptDetected = true;
          cleanup();
          
          // Extract working directory from output if it's a cd or pwd command
          if (command.trim() === 'pwd') {
            // pwd command - output is the directory
            const pwdOutput = this.cleanOutput(commandOutput, command).trim();
            if (pwdOutput && pwdOutput.startsWith('/')) {
              this.currentWorkingDirectory = pwdOutput;
            }
          } else {
            // Try to extract from prompt
            const newCwd = this.extractWorkingDirectory(commandOutput);
            if (newCwd) {
              this.currentWorkingDirectory = newCwd;
            }
          }
          
          const duration = Date.now() - startTime;
          const result: TerminalResult = {
            output: this.cleanOutput(commandOutput, command),
            exitCode: this.extractExitCode(commandOutput),
            duration,
            sessionId: this.sessionId,
            timestamp: new Date(),
            command,
            workingDirectory: this.currentWorkingDirectory
          };
          
          // Store in history
          this.commandHistory.push({
            timestamp: result.timestamp,
            command,
            output: result.output,
            exitCode: result.exitCode,
            duration,
            workingDirectory: this.currentWorkingDirectory
          });
          
          resolve(result);
        }
      };
      
      // Set timeout for prompt detection
      timeoutHandle = setTimeout(() => {
        if (!promptDetected) {
          timedOut = true;
          // Send Ctrl+C to interrupt the running command
          this.pty.write('\x03');
          
          // Give it a moment to process the interrupt
          setTimeout(() => {
            cleanup();
            
            // Still return what we have
            const duration = Date.now() - startTime;
            const result: TerminalResult = {
              output: this.cleanOutput(commandOutput, command),
              exitCode: -1, // Timeout
              duration,
              sessionId: this.sessionId,
              timestamp: new Date(),
              command,
              workingDirectory: this.currentWorkingDirectory
            };
            
            this.commandHistory.push({
              timestamp: result.timestamp,
              command,
              output: result.output,
              exitCode: result.exitCode,
              duration,
              workingDirectory: this.currentWorkingDirectory
            });
            
            resolve(result);
          }, 100); // Small delay to allow Ctrl+C to be processed
        }
      }, this.promptTimeout);
      
      // Listen for data - node-pty uses onData method
      dataListener = this.pty.onData(onData);
      
      // Write command
      this.pty.write(command + '\r');
    });
    
    // Wait for the command to complete
    const result = await resultPromise;
    
    // After a command that includes cd, update the working directory
    const trimmedCommand = command.trim();
    const hasCdCommand = trimmedCommand.startsWith('cd ') || 
                        trimmedCommand === 'cd' || 
                        trimmedCommand.includes(' cd ') ||
                        trimmedCommand.includes('&& cd ') ||
                        trimmedCommand.includes('; cd ');
    
    if (hasCdCommand) {
      await this.updateWorkingDirectoryAfterCd();
      
      // Update the last command in history with the new working directory
      if (this.commandHistory.length > 0) {
        const lastCommand = this.commandHistory[this.commandHistory.length - 1];
        lastCommand.workingDirectory = this.currentWorkingDirectory;
      }
      
      // Update the result with the new working directory
      result.workingDirectory = this.currentWorkingDirectory;
    }
    
    return result;
  }
  
  private isAtPrompt(output: string): boolean {
    const lines = output.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // Shell-specific prompt detection
    switch (this.shellType) {
      case 'bash':
        return /\$\s*$/.test(lastLine) || /#\s*$/.test(lastLine);
      
      case 'zsh':
        // ZSH with its fancy prompts and escape sequences
        return /\$\s*$/.test(lastLine) || 
               /#\s*$/.test(lastLine) ||
               /%\s*$/.test(lastLine) ||
               />\s*$/.test(lastLine) ||
               // Handle zsh bracketed paste mode
               /\?2004h$/.test(lastLine) ||
               // Handle escape sequences at end
               /\x1B\[K.*\x1B\[\?2004h$/.test(lastLine);
      
      case 'fish':
        return />\s*$/.test(lastLine) || /»\s*$/.test(lastLine);
      
      default:
        // Generic prompt detection
        return /\$\s*$/.test(lastLine) || 
               /#\s*$/.test(lastLine) ||
               />\s*$/.test(lastLine) ||
               /%\s*$/.test(lastLine);
    }
  }
  
  private cleanOutput(rawOutput: string, command: string): string {
    if (this.disableOutputCleaning) {
      // In test mode, clean more aggressively for zsh
      let cleaned = rawOutput;
      
      // Remove ANSI escape sequences
      cleaned = cleaned.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
      cleaned = cleaned.replace(/\x1B\[[0-9;]*\?[0-9]*[a-zA-Z]/g, '');
      
      // Remove backspace characters
      cleaned = cleaned.replace(/.\x08/g, '');
      
      // Extract just the output after the command
      const lines = cleaned.split('\n');
      const commandIndex = lines.findIndex(line => line.includes(command));
      if (commandIndex >= 0) {
        // Get lines after the command, excluding trailing prompt
        const outputLines = lines.slice(commandIndex + 1);
        // Remove the last line if it looks like a prompt
        if (outputLines.length > 0 && /[%$#>]\s*$/.test(outputLines[outputLines.length - 1])) {
          outputLines.pop();
        }
        cleaned = outputLines.join('\n');
      }
      
      return cleaned.trim();
    }
    
    // Split by lines
    let lines = rawOutput.split('\n');
    
    // Remove known shell startup messages
    const shellMessages = [
      'The default interactive shell is now zsh.',
      'To update your account to use zsh',
      'For more details, please visit'
    ];
    
    lines = lines.filter(line => !shellMessages.some(msg => line.includes(msg)));
    
    // Special handling for first command in session - it may include the prompt
    const isFirstCommand = this.commandHistory.length === 0;
    
    // Find where actual command output starts (after command echo)
    let outputStartIndex = -1;
    
    // Look for the command from the end backwards (most recent occurrence)
    for (let i = lines.length - 1; i >= 0; i--) {
      // More precise matching - look for the exact command
      if (lines[i].trim().endsWith(command) || lines[i].includes(`$ ${command}`) || lines[i].includes(`# ${command}`)) {
        outputStartIndex = i + 1;
        break;
      }
    }
    
    // If we couldn't find the command echo and it's the first command, try to find output differently
    if (outputStartIndex === -1 && isFirstCommand) {
      // For first command, output might start after any line containing the command
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes(command)) {
          outputStartIndex = i + 1;
          break;
        }
      }
    }
    
    if (outputStartIndex > 0) {
      lines = lines.slice(outputStartIndex);
    }
    
    // Find where output ends (before next prompt)
    let outputEndIndex = lines.length;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (this.looksLikePrompt(lines[i])) {
        outputEndIndex = i;
        break;
      }
    }
    
    lines = lines.slice(0, outputEndIndex);
    
    // Clean ANSI escape sequences
    const cleaned = lines.join('\n')
      .replace(/\x1b\[[0-9;]*m/g, '') // Color codes
      .replace(/\x1b\[[0-9]*[GKJH]/g, '') // Cursor movement
      .replace(/\x1b\[\?[0-9]+[hl]/g, '') // Mode changes
      .replace(/\x1b\]11;\?\x1b\\/g, '') // OSC 11 query (gh uses this)
      .replace(/\x1b\[6n/g, '') // Cursor position request (gh uses this)
      .replace(/\]11;\?\\?\[6n/g, '') // Combined OSC 11 + cursor position
      .replace(/\r/g, '') // Carriage returns
      .replace(/\[K/g, '') // Clear line
      .replace(/\[\?2004[lh]/g, '') // Bracketed paste mode
      .replace(/\[1m\[7m/g, '') // Bold/reverse video
      .replace(/\[27m\[1m\[0m/g, '') // Reset
      .replace(/\[0m/g, '') // Reset
      .replace(/\[24m/g, '') // Not underlined
      .replace(/\[J/g, '') // Clear screen
      .replace(/dquote>/g, '') // ZSH quote prompts
      .trim();
    
    return cleaned;
  }
  
  private looksLikePrompt(line: string): boolean {
    // Common prompt patterns
    return /[$#%>]\s*$/.test(line) || 
           /\]\s*[$#%>]\s*$/.test(line) ||
           line.includes('[K[?2004h') ||
           line.includes('ehukaimedia@') ||
           line.trim() === '%';
  }
  
  private extractExitCode(output: string): number {
    // This is tricky - we might need to inject a command to get exit code
    // For now, return 0 if no obvious error, -1 if unknown
    if (output.includes('command not found') || 
        output.includes('No such file or directory') ||
        output.includes('Permission denied') ||
        output.includes('error:') ||
        output.includes('Error:')) {
      return 1;
    }
    return 0; // Assume success if no obvious error
  }
  
  private async updateWorkingDirectoryAfterCd(): Promise<void> {
    // Run pwd asynchronously to update working directory after cd
    try {
      const pwdResult = await this.executeInternalCommand('pwd');
      if (pwdResult && pwdResult.startsWith('/')) {
        this.currentWorkingDirectory = pwdResult;
      }
    } catch (error) {
      console.error('Vibe Terminal: Failed to update working directory after cd:', error);
    }
  }
  
  private async executeInternalCommand(command: string): Promise<string> {
    // Execute a command internally without adding to history
    return new Promise((resolve) => {
      let output = '';
      let dataListener: any;
      let timeoutHandle: NodeJS.Timeout;
      let promptDetected = false;
      
      const cleanup = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        if (dataListener) dataListener.dispose();
      };
      
      const onData = (data: string) => {
        output += data;
        if (this.isAtPrompt(output)) {
          promptDetected = true;
          cleanup();
          const cleaned = this.cleanOutput(output, command).trim();
          resolve(cleaned);
        }
      };
      
      timeoutHandle = setTimeout(() => {
        if (!promptDetected) {
          cleanup();
          const cleaned = this.cleanOutput(output, command).trim();
          resolve(cleaned);
        }
      }, 500); // Short timeout for internal commands
      
      dataListener = this.pty.onData(onData);
      this.pty.write(command + '\r');
    });
  }
  
  private extractWorkingDirectory(output: string): string | null {
    // Try to extract cwd from prompt
    const lines = output.split('\n');
    
    // Look for prompt patterns in the last few lines
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 3); i--) {
      const line = lines[i];
      
      // Common patterns in prompts that show directory
      // user@host:~/path$ or user@host:/full/path$
      const patterns = [
        /:\s*([~\/][^\s$#%>]*)\s*[$#%>]/, // user@host:/path$
        /\[([~\/][^\]]+)\]/, // [/path]
        /\s+([~\/][^\s]+)\s+[$#%>]/, // /path $
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          let path = match[1];
          if (path.startsWith('~')) {
            path = path.replace('~', os.homedir());
          }
          return path;
        }
      }
    }
    
    return null;
  }
  
  getSessionState(): SessionState {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      lastActivity: new Date(),
      workingDirectory: this.currentWorkingDirectory,
      environmentVariables: {}, // Would need to query these
      commandHistory: this.commandHistory,
      currentPrompt: '', // Would need to track this
      shellType: this.shellType
    };
  }
  
  getHistory(): CommandRecord[] {
    return [...this.commandHistory];
  }
  
  kill(): void {
    if (this.pty) {
      console.error(`Vibe Terminal: Killing session ${this.sessionId}`);
      this.pty.kill();
    }
  }
}

// Singleton instance for the MCP server
let terminalInstance: VibeTerminal | null = null;

export function getTerminal(): VibeTerminal {
  if (!terminalInstance) {
    terminalInstance = new VibeTerminal();
    
    // Handle process cleanup
    process.on('exit', () => {
      if (terminalInstance) {
        terminalInstance.kill();
      }
    });
  }
  return terminalInstance;
}

export async function executeTerminalCommand(command: string): Promise<TerminalResult> {
  const terminal = getTerminal();
  return terminal.execute(command);
}

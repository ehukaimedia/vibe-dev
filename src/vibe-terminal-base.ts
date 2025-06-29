import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { createPtyAdapter, IPtyAdapter } from './pty-adapter.js';
import { 
  TerminalResult, 
  CommandRecord, 
  SessionState, 
  TerminalConfig 
} from './types.js';

export abstract class VibeTerminalBase {
  protected ptyProcess: IPtyAdapter | null = null;
  protected sessionId: string;
  protected output: string = '';
  protected commandHistory: CommandRecord[] = [];
  protected currentWorkingDirectory: string;
  protected startTime: Date;
  protected shellType: SessionState['shellType'];
  protected promptTimeout: number;
  protected isExecuting: boolean = false;
  protected disableOutputCleaning: boolean;
  
  constructor(config: TerminalConfig = {}) {
    this.sessionId = randomUUID();
    this.startTime = new Date();
    this.currentWorkingDirectory = config.cwd || process.cwd();
    this.promptTimeout = config.promptTimeout || 5000; // Default 5 second timeout
    this.disableOutputCleaning = process.env.NODE_ENV === 'test';
    
    // Determine shell
    const defaultShell = config.shell || this.getDefaultShell();
    this.shellType = this.detectShellType(defaultShell);
    
    // Create PTY instance using adapter
    this.ptyProcess = createPtyAdapter(defaultShell, [], {
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
    
    console.error(`Vibe Terminal: Created session ${this.sessionId} with ${this.shellType} shell (PID: ${this.ptyProcess.pid})`);
  }
  
  // Abstract methods for platform-specific operations
  abstract getDefaultShell(): string;
  abstract detectShellType(shellPath: string): SessionState['shellType'];
  protected abstract isAtPrompt(output: string): boolean;
  protected abstract _cleanOutput(rawOutput: string, command: string): string;
  
  // Generic helper methods
  protected fileExists(path: string): boolean {
    try {
      return existsSync(path);
    } catch {
      return false;
    }
  }
  
  // Basic path normalization (enhanced by platform classes)
  protected normalizePath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', process.env.HOME || process.env.USERPROFILE || '');
    }
    return path;
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
      
      const cleanup = () => {
        this.isExecuting = false;
        if (timeoutHandle) clearTimeout(timeoutHandle);
        // Note: With the adapter pattern, we don't have a direct way to remove listeners
        // This is a limitation of the child_process fallback
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
            const pwdOutput = this._cleanOutput(commandOutput, command).trim();
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
            output: this._cleanOutput(commandOutput, command),
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
          // Don't send Ctrl+C - it contaminates the session
          // Just return with timeout indicator
          cleanup();
          
          const duration = Date.now() - startTime;
          const result: TerminalResult = {
            output: this._cleanOutput(commandOutput, command),
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
        }
      }, this.promptTimeout);
      
      // Listen for data - adapter uses onData method
      this.ptyProcess?.onData(onData);
      
      // Write command
      this.ptyProcess?.write(command + '\r');
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
  
  protected extractExitCode(output: string): number {
    // This is difficult to determine from output alone
    // Would need to check shell-specific status indicators
    // For now, return 0 if output doesn't contain obvious errors
    if (output.includes('command not found') || 
        output.includes('No such file or directory') ||
        output.includes('Permission denied') ||
        output.includes('fatal:') ||
        output.includes('error:')) {
      return 1;
    }
    return 0;
  }
  
  protected extractWorkingDirectory(output: string): string | null {
    // Look for common prompt patterns that include cwd
    const lines = output.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      
      // Try to extract path from various prompt formats
      // Example: user@host:~/path$
      const bashMatch = line.match(/[^:]+:([^$#]+)[$#]/);
      if (bashMatch) {
        const path = bashMatch[1].trim();
        return this.normalizePath(path);
      }
      
      // ZSH often shows just the directory name or full path
      const pathMatch = line.match(/([~/][^%$#]*)\s*[%$#]/);
      if (pathMatch) {
        const path = pathMatch[1].trim();
        return this.normalizePath(path);
      }
    }
    
    return null;
  }
  
  protected async updateWorkingDirectoryAfterCd(): Promise<void> {
    // Run pwd to get the actual working directory
    const pwdResult = await this.executePwd();
    if (pwdResult.exitCode === 0 && pwdResult.output.trim()) {
      this.currentWorkingDirectory = pwdResult.output.trim();
    }
  }
  
  private async executePwd(): Promise<TerminalResult> {
    // Temporarily disable the executing check for internal pwd
    const wasExecuting = this.isExecuting;
    this.isExecuting = false;
    
    try {
      const result = await this.execute('pwd');
      return result;
    } finally {
      this.isExecuting = wasExecuting;
    }
  }
  
  getSessionState(): SessionState {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      lastActivity: new Date(),
      workingDirectory: this.currentWorkingDirectory,
      environmentVariables: process.env as Record<string, string>,
      commandHistory: this.commandHistory,
      currentPrompt: '',
      shellType: this.shellType
    };
  }
  
  getHistory(limit?: number): CommandRecord[] {
    if (limit) {
      return this.commandHistory.slice(-limit);
    }
    return [...this.commandHistory];
  }
  
  getSessionId(): string {
    return this.sessionId;
  }
  
  getCurrentWorkingDirectory(): string {
    return this.currentWorkingDirectory;
  }
  
  getOutput(): string {
    return this.output;
  }
  
  async changeDirectory(path: string): Promise<void> {
    const result = await this.execute(`cd "${path}"`);
    if (result.exitCode === 0) {
      // Working directory will be updated by execute method
    } else {
      throw new Error(`Failed to change directory: ${result.output}`);
    }
  }
  
  kill(): void {
    if (this.ptyProcess) {
      console.error(`Vibe Terminal: Killing session ${this.sessionId}`);
      this.ptyProcess.kill();
    }
  }
  
  destroy(): void {
    this.kill();
  }
}
import { execSync } from 'child_process';
import type { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';

export class VibeTerminalMac extends VibeTerminalBase {
  private macOSVersion: string | null = null;
  
  constructor(config: TerminalConfig = {}) {
    super(config);
  }
  
  /**
   * Get macOS version (e.g., "15.5" for Sequoia)
   */
  getMacOSVersion(): string {
    if (!this.macOSVersion) {
      try {
        this.macOSVersion = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
      } catch {
        this.macOSVersion = '10.15'; // Default to Catalina
      }
    }
    return this.macOSVersion;
  }
  
  /**
   * Get macOS code name (e.g., "Sequoia", "Sonoma")
   */
  getMacOSCodeName(): string {
    const version = this.getMacOSVersion();
    const [major, minor = 0] = version.split('.').map(n => parseInt(n));
    
    // macOS version mapping
    if (major >= 15) return 'Sequoia';
    if (major >= 14) return 'Sonoma';
    if (major >= 13) return 'Ventura';
    if (major >= 12) return 'Monterey';
    if (major >= 11) return 'Big Sur';
    if (major === 10) {
      if (minor >= 15) return 'Catalina';
      if (minor >= 14) return 'Mojave';
    }
    return 'Unknown';
  }
  
  /**
   * Mac-specific shell detection based on macOS version
   */
  getDefaultShell(): string {
    // Check if we're on Catalina or later
    const version = this.getMacOSVersion();
    const [major, minor = 0] = version.split('.').map(n => parseInt(n));
    
    // macOS 10.15+ defaults to zsh
    if (major > 10 || (major === 10 && minor >= 15)) {
      return process.env.SHELL || '/bin/zsh';
    }
    
    // Older macOS defaults to bash
    return process.env.SHELL || '/bin/bash';
  }
  
  /**
   * Detect shell type with Mac-specific paths
   */
  detectShellType(shellPath: string): SessionState['shellType'] {
    // Mac-specific shell locations
    const macShells: Record<string, SessionState['shellType']> = {
      '/bin/bash': 'bash',
      '/bin/zsh': 'zsh',
      '/bin/sh': 'sh',
      '/usr/local/bin/fish': 'fish',      // Intel Mac Homebrew
      '/opt/homebrew/bin/fish': 'fish',   // Apple Silicon Homebrew
      '/usr/local/bin/bash': 'bash',      // Homebrew bash
      '/opt/homebrew/bin/bash': 'bash',   // Apple Silicon
    };
    
    // Check exact path first
    if (macShells[shellPath]) {
      return macShells[shellPath];
    }
    
    // Fallback to name detection
    const shellName = shellPath.split('/').pop() || '';
    if (shellName.includes('bash')) return 'bash';
    if (shellName.includes('zsh')) return 'zsh';
    if (shellName.includes('fish')) return 'fish';
    if (shellName === 'sh') return 'sh';
    
    return 'unknown';
  }
  
  /**
   * Detect which terminal app is being used
   */
  getTerminalApp(): string {
    // Check environment variables that terminals set
    if (process.env.TERM_PROGRAM === 'Apple_Terminal') {
      return 'Terminal.app';
    }
    if (process.env.TERM_PROGRAM === 'iTerm.app') {
      return 'iTerm2';
    }
    if (process.env.TERM_PROGRAM === 'vscode') {
      return 'VS Code';
    }
    return 'Unknown';
  }
  
  /**
   * Get available shells on Mac
   */
  getAvailableMacShells(): string[] {
    const shells: string[] = [];
    
    // Standard macOS shells
    const standardShells = ['/bin/bash', '/bin/zsh', '/bin/sh'];
    
    // Homebrew paths (both Intel and Apple Silicon)
    const homebrewShells = [
      '/usr/local/bin/bash',
      '/usr/local/bin/zsh', 
      '/usr/local/bin/fish',
      '/opt/homebrew/bin/bash',
      '/opt/homebrew/bin/zsh',
      '/opt/homebrew/bin/fish'
    ];
    
    // Check all possible shells
    [...standardShells, ...homebrewShells].forEach(shell => {
      if (this.fileExists(shell)) {
        shells.push(shell);
      }
    });
    
    return shells;
  }
  
  
  /**
   * Expand Mac-specific paths
   */
  expandMacPath(path: string): string {
    // Handle ~ expansion
    if (path.startsWith('~')) {
      path = path.replace('~', process.env.HOME || '/Users/' + process.env.USER);
    }
    
    // Handle iCloud Drive shortcuts
    path = path.replace('~/iCloud', '~/Library/Mobile Documents/com~apple~CloudDocs');
    
    return path;
  }
  
  /**
   * Mac-specific path normalization
   */
  protected normalizePath(path: string): string {
    // First apply base normalization, then Mac-specific expansion
    const basePath = super.normalizePath(path);
    return this.expandMacPath(basePath);
  }
  
  protected isAtPrompt(output: string): boolean {
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
  
  // Public wrappers for testing
  cleanOutput(rawOutput: string, command: string): string {
    return this._cleanOutput(rawOutput, command);
  }
  
  // Testing wrapper for normalizePath
  testNormalizePath(path: string): string {
    return this.normalizePath(path);
  }
  
  // Testing wrapper for isAtPrompt
  testIsAtPrompt(output: string): boolean {
    return this.isAtPrompt(output);
  }
  
  protected _cleanOutput(rawOutput: string, command: string): string {
    // Start with basic cleaning
    let cleaned = rawOutput;
    
    // FIX: Remove the command echo bug pattern where first char is typed, then backspace, then full command
    // Pattern: firstChar + \b + fullCommand + [?2004l
    if (command.length > 0) {
      const firstChar = command[0];
      // Handle the specific pattern: e\becho or p\bpwd
      const echoPattern = new RegExp(`${firstChar}\\x08${command}`, 'g');
      cleaned = cleaned.replace(echoPattern, command);
    }
    
    // Remove bracketed paste mode markers
    cleaned = cleaned.replace(/\[.*?2004h/g, '');
    cleaned = cleaned.replace(/\[.*?2004l/g, '');
    
    // Remove ANSI escape sequences
    cleaned = cleaned.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1B\[[0-9;]*\?[0-9]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1B\].*?\x1B\\/g, ''); // OSC sequences
    cleaned = cleaned.replace(/\x1B\[.*?m/g, ''); // SGR sequences
    
    // Remove special escape patterns like [1m[7m%[27m[1m[0m
    cleaned = cleaned.replace(/\[1m\[7m%\[27m\[1m\[0m/g, '');
    cleaned = cleaned.replace(/\[\d+m/g, ''); // Remove remaining escape codes
    
    // Remove backspace characters and their preceding character
    cleaned = cleaned.replace(/.\x08/g, '');
    
    // Remove carriage returns
    cleaned = cleaned.replace(/\r/g, '');
    
    // For test mode, be more aggressive
    if (this.disableOutputCleaning) {
      // Split into lines
      const lines = cleaned.split('\n');
      
      // Debug logging in test mode
      if (process.env.DEBUG_CLEAN) {
        console.log('TEST MODE - Lines:', lines);
        console.log('TEST MODE - Command:', command);
      }
      
      // Find the line containing the command - look for the first line that contains the command
      let commandLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for lines containing the command with various prompt formats
        if (line.includes(`% ${command}`) || 
            line.includes(`$ ${command}`) ||
            line.includes(`# ${command}`) ||
            line.endsWith(` ${command}`) ||
            line.trim() === command ||  // Handle case where command is on its own line
            (line.includes(command) && (line.includes('%') || line.includes('$') || line.includes('#')))) {
          commandLineIndex = i;
          break;
        }
      }
      
      if (commandLineIndex >= 0) {
        if (process.env.DEBUG_CLEAN) {
          console.log('TEST MODE - Found command at index:', commandLineIndex);
        }
        // Get lines after the command
        let outputLines = lines.slice(commandLineIndex + 1);
        
        // Remove trailing prompt lines and filter out command echoes
        outputLines = outputLines.filter(line => {
          const cleanedLine = line.replace(/\x1B/g, '').trim();
          // Filter out command echo and prompt lines with command
          return cleanedLine !== command && 
                 !(line.includes('%') && line.includes(command)) &&
                 !line.match(/^%\s*$/);
        });
        
        while (outputLines.length > 0) {
          const lastLine = outputLines[outputLines.length - 1];
          const cleanedLastLine = lastLine.replace(/\x1B/g, '').trim();
          // Check if last line looks like a prompt
          if (/[%$#>]\s*$/.test(lastLine) || 
              /^%\s*$/.test(cleanedLastLine) ||  // Just a % with spaces
              lastLine.includes('@') && lastLine.includes('%') ||
              lastLine.trim() === '' ||
              lastLine.includes('ehukaimedia@')) {
            outputLines.pop();
          } else {
            break;
          }
        }
        
        return outputLines.join('\n').trim();
      }
      
      // Fallback: find lines that contain the command and extract output after
      // First, try to find lines with prompt + command pattern
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(command) && (lines[i].includes('%') || lines[i].includes('$') || lines[i].includes('#'))) {
          // Get lines after the command, filtering out prompts
          const outputLines = lines.slice(i + 1).filter(line => {
            // Also filter out lines that are just the command with escape chars
            const cleanedLine = line.replace(/\x1B/g, '').trim();
            return !(line.match(/^%\s*$/) || 
                    line.match(/[%$#>]\s*$/) ||
                    (line.includes('@') && line.includes('%')) ||
                    line.includes('ehukaimedia@') ||
                    line.trim() === '' ||
                    cleanedLine === command);  // Filter out command echo
          });
          if (outputLines.length > 0) {
            return outputLines.join('\n').trim();
          }
        }
      }
      
      // Second fallback: just find the command anywhere
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(command) || lines[i].trim() === command) {
          // Get lines after the command, filtering out prompts
          const outputLines = lines.slice(i + 1).filter(line => {
            // Also filter out lines that are just the command with escape chars
            const cleanedLine = line.replace(/\x1B/g, '').trim();
            return !(line.match(/^%\s*$/) || 
                    line.match(/[%$#>]\s*$/) ||
                    (line.includes('@') && line.includes('%')) ||
                    line.includes('ehukaimedia@') ||
                    line.trim() === '' ||
                    cleanedLine === command);  // Filter out command echo
          });
          if (outputLines.length > 0) {
            return outputLines.join('\n').trim();
          }
        }
      }
      
      // Last resort: just remove obvious prompt lines
      if (process.env.DEBUG_CLEAN) {
        console.log('TEST MODE - Using last resort filter');
      }
      const outputLines = lines.filter(line => {
        const cleanedLine = line.replace(/\x1B/g, '').trim();
        return !(/^[%$#>]\s*$/.test(line) || 
                 (line.includes('@') && line.includes('%')) ||
                 line.includes('ehukaimedia@') ||
                 cleanedLine === command ||  // Filter out command echo
                 (line.includes('%') && line.includes(command)));  // Filter out prompt with command
      });
      
      return outputLines.join('\n').trim();
    }
    
    // Split by lines
    let lines = cleaned.split('\n');
    
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
      if (lines[i].trim().endsWith(command) || 
          lines[i].includes(`$ ${command}`) || 
          lines[i].includes(`# ${command}`) ||
          lines[i].includes(`% ${command}`)) {  // Add support for % prompt
        outputStartIndex = i + 1;
        break;
      }
    }
    
    // Special case: if the first line is just the command (common in cleaned output)
    if (outputStartIndex === -1 && lines.length > 0 && lines[0].trim() === command) {
      outputStartIndex = 1;
    }
    
    // If we couldn't find the command echo and it's the first command, try to find output differently
    if (outputStartIndex === -1 && isFirstCommand) {
      // For first command, output might start after any line containing the command
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(command)) {
          outputStartIndex = i + 1;
          break;
        }
      }
    }
    
    // Still not found? Look for common prompt indicators
    if (outputStartIndex === -1) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/[$#>%]\s*$/) && lines[i].includes(command)) {
          outputStartIndex = i + 1;
          break;
        }
      }
    }
    
    // Extract only the actual output (not the command echo or prompt)
    if (outputStartIndex > 0 && outputStartIndex < lines.length) {
      lines = lines.slice(outputStartIndex);
    }
    
    // Remove trailing prompt line(s)
    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      // Common prompt patterns including escape sequences
      if (lastLine.match(/[$#>%]\s*$/) || 
          lastLine.match(/\x1b\[.*?[mK]/) ||  // ANSI escape sequences
          lastLine.match(/\[1m\[7m%\[27m\[1m\[0m/) || // Specific zsh prompt pattern
          lastLine.trim() === '' ||
          lastLine.includes('@') && lastLine.includes('%')) {
        lines.pop();
      } else {
        break;
      }
    }
    
    return lines.join('\n').trim();
  }
}
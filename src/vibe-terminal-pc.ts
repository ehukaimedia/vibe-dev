import { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';
import * as os from 'os';

export class VibeTerminalPC extends VibeTerminalBase {
  constructor(config: TerminalConfig = {}) {
    super(config);
  }
  
  getDefaultShell(): string {
    return 'powershell.exe';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    const lowerPath = shellPath.toLowerCase();
    if (lowerPath.includes('powershell')) return 'powershell';
    if (lowerPath.includes('bash')) return 'bash';
    if (lowerPath.includes('zsh')) return 'zsh';
    if (lowerPath.includes('fish')) return 'fish';
    if (lowerPath.includes('sh')) return 'sh';
    // Note: 'cmd' is not in the type union, return 'unknown'
    return 'unknown';
  }
  
  normalizePath(path: string): string {
    // Handle tilde expansion
    if (path.startsWith('~')) {
      const homeDir = os.homedir();
      path = path.replace('~', homeDir);
    }
    
    // Expand environment variables
    path = path.replace(/%([^%]+)%/g, (match, varName) => {
      return process.env[varName] || match;
    });
    
    // Normalize drive letter to uppercase
    if (/^[a-z]:/i.test(path)) {
      path = path[0].toUpperCase() + path.slice(1);
    }
    
    return path;
  }
  
  protected isAtPrompt(output: string): boolean {
    // Split into lines and check the last non-empty line
    const lines = output.split(/\r?\n/);
    
    // Find the last non-empty line
    let lastLine = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line) {
        lastLine = line;
        break;
      }
    }
    
    if (!lastLine) return false;
    
    // PowerShell prompt: PS C:\...>
    if (/^PS [A-Z]:\\.*>\s*$/.test(lastLine)) return true;
    
    // CMD prompt: C:\...>
    if (/^[A-Z]:\\.*>\s*$/.test(lastLine)) return true;
    
    // Git Bash prompt: ends with $
    if (/\$\s*$/.test(lastLine)) return true;
    
    return false;
  }
  
  cleanOutput(rawOutput: string, command: string): string {
    let output = rawOutput;
    
    // Convert Windows line endings to Unix
    output = output.replace(/\r\n/g, '\n');
    
    // Special handling for 'cd' command with no arguments
    const trimmedCommand = command.trim();
    if (trimmedCommand === 'cd') {
      // For 'cd' alone in PowerShell/CMD, the output IS the current directory
      const lines = output.split('\n');
      const result = [];
      
      for (const line of lines) {
        // Skip prompts but keep path output
        if (!/^PS [A-Z]:\\.*>\s*$/.test(line) && 
            !/^[A-Z]:\\.*>\s*$/.test(line) &&
            line.trim() !== trimmedCommand) {
          result.push(line);
        }
      }
      
      return result.join('\n').trim();
    }
    
    // For other commands, remove command echo if present
    if (output.startsWith(command)) {
      const lines = output.split('\n');
      if (lines[0].trim() === command.trim()) {
        lines.shift(); // Remove first line
        output = lines.join('\n');
      }
    }
    
    // Remove PowerShell prompts
    output = output.replace(/^PS [A-Z]:\\.*>\s*/gm, '');
    
    // Remove CMD prompts
    output = output.replace(/^[A-Z]:\\.*>\s*/gm, '');
    
    // Remove trailing whitespace and prompts
    const lines = output.split('\n');
    while (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      if (this.isPromptLine(lastLine)) {
        lines.pop();
      } else {
        break;
      }
    }
    
    return lines.join('\n').trim();
  }
  
  private isPromptLine(line: string): boolean {
    const trimmed = line.trim();
    return /^PS [A-Z]:\\.*>\s*$/.test(trimmed) ||
           /^[A-Z]:\\.*>\s*$/.test(trimmed) ||
           /\$\s*$/.test(trimmed);
  }
  
  protected _cleanOutput(rawOutput: string, command: string): string {
    return this.cleanOutput(rawOutput, command);
  }
  
  protected extractWorkingDirectory(output: string): string | null {
    const lines = output.split(/\r?\n/);
    
    // Look for PowerShell prompt with path
    for (const line of lines) {
      const psMatch = line.match(/^PS ([A-Z]:\\.*?)>\s*$/);
      if (psMatch) {
        return psMatch[1];
      }
      
      // CMD prompt
      const cmdMatch = line.match(/^([A-Z]:\\.*?)>\s*$/);
      if (cmdMatch) {
        return cmdMatch[1];
      }
    }
    
    return null;
  }
}
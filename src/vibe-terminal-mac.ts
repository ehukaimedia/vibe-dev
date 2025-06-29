import { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';

export class VibeTerminalMac extends VibeTerminalBase {
  constructor(config: TerminalConfig = {}) {
    super(config);
  }
  
  getDefaultShell(): string {
    // Check SHELL environment variable first
    if (process.env.SHELL) {
      return process.env.SHELL;
    }
    // Use bash by default on macOS for better compatibility
    return '/bin/bash';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    if (shellPath.includes('bash')) return 'bash';
    if (shellPath.includes('zsh')) return 'zsh';
    if (shellPath.includes('fish')) return 'fish';
    if (shellPath.includes('/sh')) return 'sh';
    return 'unknown';
  }
  
  normalizePath(path: string): string {
    if (path.startsWith('~')) {
      return path.replace('~', process.env.HOME || '');
    }
    return path;
  }
  
  isAtPrompt(output: string): boolean {
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
  
  cleanOutput(rawOutput: string, command: string): string {
    // Start with basic cleaning
    let cleaned = rawOutput;
    
    // Remove ANSI escape sequences
    cleaned = cleaned.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1B\[[0-9;]*\?[0-9]*[a-zA-Z]/g, '');
    cleaned = cleaned.replace(/\x1B\].*?\x1B\\/g, ''); // OSC sequences
    cleaned = cleaned.replace(/\x1B\[.*?m/g, ''); // SGR sequences
    
    // Remove backspace characters and their preceding character
    cleaned = cleaned.replace(/.\x08/g, '');
    
    // Remove carriage returns
    cleaned = cleaned.replace(/\r/g, '');
    
    // For test mode, be more aggressive
    if (this.disableOutputCleaning) {
      // Split into lines
      const lines = cleaned.split('\n');
      
      // Find the line containing the command - look for the first line that contains the command
      let commandLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for lines containing the command
        if (line.includes(`% ${command}`) || 
            line.includes(`$ ${command}`) ||
            line.includes(`# ${command}`) ||
            (line.includes(command) && i === 0)) { // First line often has the prompt
          commandLineIndex = i;
          break;
        }
      }
      
      if (commandLineIndex >= 0) {
        // Get lines after the command
        let outputLines = lines.slice(commandLineIndex + 1);
        
        // Remove trailing prompt lines
        while (outputLines.length > 0) {
          const lastLine = outputLines[outputLines.length - 1];
          // Check if last line looks like a prompt
          if (/[%$#>]\s*$/.test(lastLine) || 
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
      
      // Fallback: just remove obvious prompt lines
      const outputLines = lines.filter(line => {
        return !(/^[%$#>]\s*$/.test(line) || 
                 (line.includes('@') && line.includes('%')) ||
                 line.includes('ehukaimedia@'));
      });
      
      return outputLines.join('\n').trim();
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
    
    // Remove trailing prompt line
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      // Common prompt patterns
      if (lastLine.match(/[$#>%]\s*$/) || lastLine.includes('$') || lastLine.includes('#')) {
        lines.pop();
      }
    }
    
    return lines.join('\n').trim();
  }
}
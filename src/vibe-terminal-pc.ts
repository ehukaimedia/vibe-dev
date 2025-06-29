import { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';

export class VibeTerminalPC extends VibeTerminalBase {
  constructor(config: TerminalConfig = {}) {
    super(config);
  }
  
  // TODO: Implement on Windows
  getDefaultShell(): string {
    return 'powershell.exe';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    // TODO: Implement Windows shell detection
    if (shellPath.includes('powershell')) return 'powershell';
    throw new Error('PC implementation pending');
  }
  
  normalizePath(path: string): string {
    // TODO: Implement Windows path normalization
    // This would need to handle:
    // - C:\path\to\file
    // - %USERPROFILE%
    // - Backslash to forward slash conversion
    throw new Error('PC implementation pending');
  }
  
  protected isAtPrompt(output: string): boolean {
    // TODO: Implement Windows prompt detection
    // PowerShell uses PS> or similar
    throw new Error('PC implementation pending');
  }
  
  cleanOutput(rawOutput: string, command: string): string {
    // TODO: Fix command echo bug here
    // Windows has specific issues with command echo that need to be addressed
    throw new Error('PC implementation pending');
  }
  
  protected _cleanOutput(rawOutput: string, command: string): string {
    // TODO: Implement Windows-specific output cleaning
    throw new Error('PC implementation pending');
  }
}
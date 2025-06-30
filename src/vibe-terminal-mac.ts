import { execSync } from 'child_process';
import type { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';
import { IntelligentOutputParser } from './intelligent-output-parser.js';

export class VibeTerminalMac extends VibeTerminalBase {
  private macOSVersion: string | null = null;
  private outputParser: IntelligentOutputParser | null = null;
  
  constructor(config: TerminalConfig = {}) {
    super(config);
    // Initialize output parser after parent constructor sets shellType
    this.outputParser = new IntelligentOutputParser(this.shellType, 'mac');
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
    // Use the intelligent output parser
    if (!this.outputParser) {
      this.outputParser = new IntelligentOutputParser(this.shellType, 'mac');
    }
    return this.outputParser.parse(rawOutput, command);
  }
}
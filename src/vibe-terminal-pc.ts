import type { SessionState, TerminalConfig } from './types.js';
import { VibeTerminalBase } from './vibe-terminal-base.js';
import { IntelligentOutputParser } from './intelligent-output-parser.js';
import * as os from 'os';
import * as fs from 'fs';
import { execSync } from 'child_process';

export class VibeTerminalPC extends VibeTerminalBase {
  private windowsVersion: string | null = null;
  private outputParser: IntelligentOutputParser | null = null;
  
  constructor(config: TerminalConfig = {}) {
    super(config);
    // Initialize output parser after parent constructor sets shellType
    this.outputParser = new IntelligentOutputParser(this.shellType, 'windows');
  }
  
  getDefaultShell(): string {
    // Try to detect installed shells in order of preference
    const shells = this.getAvailableWindowsShells();
    
    // Prefer PowerShell 7, then Windows PowerShell, then CMD
    const preferred = ['pwsh.exe', 'powershell.exe', 'cmd.exe'];
    
    for (const pref of preferred) {
      const found = shells.find(s => s.toLowerCase().endsWith(pref));
      if (found) return found;
    }
    
    // Fallback to CMD if nothing else found
    return 'C:\\Windows\\System32\\cmd.exe';
  }
  
  detectShellType(shellPath: string): SessionState['shellType'] {
    const lowerPath = shellPath.toLowerCase();
    
    // PowerShell variants
    if (lowerPath.includes('pwsh') || lowerPath.includes('powershell')) {
      return 'powershell';
    }
    
    // Bash variants (Git Bash, WSL, Cygwin)
    if (lowerPath.includes('bash')) return 'bash';
    
    // Other shells
    if (lowerPath.includes('zsh')) return 'zsh';
    if (lowerPath.includes('fish')) return 'fish';
    
    // Basic sh (but not powershell)
    if (lowerPath.includes('sh') && !lowerPath.includes('powershell')) {
      return 'sh';
    }
    
    // CMD and other Windows shells
    if (lowerPath.includes('cmd') || lowerPath.includes('command')) {
      return 'unknown'; // CMD is not in the type union
    }
    
    // WSL
    if (lowerPath.includes('wsl')) {
      return 'bash'; // WSL typically runs bash by default
    }
    
    return 'unknown';
  }  
  normalizePath(path: string): string {
    // Use the more comprehensive expandWindowsPath
    path = this.expandWindowsPath(path);
    
    // Additional normalization for drive letters
    if (/^[a-z]:/i.test(path)) {
      path = path[0].toUpperCase() + path.slice(1);
    }
    
    // Ensure consistent path separators
    path = path.replace(/\//g, '\\');
    
    // Remove trailing backslash unless it's root
    if (path.length > 3 && path.endsWith('\\')) {
      path = path.slice(0, -1);
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
    if (/^PS [A-Z]:\\.*>\s*$/.test(lastLine)) {
      return true;
    }
    
    // PowerShell custom prompt (may not have PS prefix)
    if (/^[A-Z]:\\.*>\s*$/.test(lastLine) && this.shellType === 'powershell') {
      return true;
    }
    
    // CMD prompt: C:\...>
    if (/^[A-Z]:\\.*>\s*$/.test(lastLine) && this.shellType !== 'powershell') {
      return true;
    }
    
    // Git Bash prompt: ends with $ or #
    if (/[$#]\s*$/.test(lastLine)) {
      return true;
    }
    
    // WSL prompt patterns
    if (/.*@.*:.*[$#]\s*$/.test(lastLine)) {
      return true;
    }
    
    // Cygwin prompt
    if (/.*@.*\s+.*\s*[$#]\s*$/.test(lastLine)) {
      return true;
    }
    
    return false;
  }  
  cleanOutput(rawOutput: string, command: string): string {
    // Use the intelligent output parser
    if (!this.outputParser) {
      this.outputParser = new IntelligentOutputParser(this.shellType, 'windows');
    }
    return this.outputParser.parse(rawOutput, command);
  }
  
  private isPromptLine(line: string): boolean {
    const trimmed = line.trim();
    
    // PowerShell prompts
    if (/^PS [A-Z]:\\.*>\s*$/.test(trimmed)) return true;
    
    // CMD prompts  
    if (/^[A-Z]:\\.*>\s*$/.test(trimmed)) return true;
    
    // Git Bash / Unix-like prompts
    if (/[$#]\s*$/.test(trimmed) && trimmed.length < 100) return true;
    
    // WSL prompts (user@host:path$)
    if (/.*@.*:.*[$#]\s*$/.test(trimmed)) return true;
    
    // Cygwin prompts
    if (/.*@.*\s+.*\s*[$#]\s*$/.test(trimmed)) return true;
    
    return false;
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
  
  // Windows version detection
  getWindowsVersion(): string {
    if (this.windowsVersion) return this.windowsVersion;
    
    try {
      // Use wmic to get OS version
      const output = execSync('wmic os get Version /value', { encoding: 'utf8' });
      const match = output.match(/Version=(\d+\.\d+\.\d+)/);
      if (match) {
        this.windowsVersion = match[1];
        return this.windowsVersion;
      }
    } catch (error) {
      // Fallback to os.release()
      this.windowsVersion = os.release();
    }
    
    return this.windowsVersion || 'Unknown';
  }
  
  getWindowsCodeName(): string {
    const version = this.getWindowsVersion();
    const [major, minor, build] = version.split('.').map(Number);
    
    // Windows 11 (build 22000+)
    if (major === 10 && build >= 22000) {
      return 'Windows 11';
    }
    
    // Windows 10
    if (major === 10 && minor === 0) {
      if (build >= 19045) return 'Windows 10 22H2';
      if (build >= 19044) return 'Windows 10 21H2';
      if (build >= 19043) return 'Windows 10 21H1';
      if (build >= 19042) return 'Windows 10 20H2';
      return 'Windows 10';
    }
    
    // Windows Server
    if (major === 10) {
      if (build >= 20348) return 'Windows Server 2022';
      if (build >= 17763) return 'Windows Server 2019';
      return 'Windows Server 2016';
    }
    
    // Older versions
    if (major === 6 && minor === 3) return 'Windows 8.1';
    if (major === 6 && minor === 2) return 'Windows 8';
    if (major === 6 && minor === 1) return 'Windows 7';
    
    return `Windows ${version}`;
  }
  
  // Terminal application detection
  getTerminalApp(): string {
    // Check environment variables for terminal detection
    const termProgram = process.env.TERM_PROGRAM;
    const wtSession = process.env.WT_SESSION;
    const vscodeTerm = process.env.TERM_PROGRAM_VERSION;
    
    if (wtSession) {
      return 'Windows Terminal';
    }
    
    if (termProgram === 'vscode') {
      return 'VS Code';
    }
    
    // Check parent process name
    try {
      const output = execSync('wmic process where ProcessId=$PPID get Name /value', { encoding: 'utf8' });
      if (output.includes('WindowsTerminal')) return 'Windows Terminal';
      if (output.includes('Code.exe')) return 'VS Code';
      if (output.includes('pwsh.exe')) return 'PowerShell 7';
      if (output.includes('powershell.exe')) return 'Windows PowerShell';
      if (output.includes('cmd.exe')) return 'Command Prompt';
    } catch (error) {
      // Fallback detection
    }
    
    return 'Unknown Terminal';
  }
  
  // Available shells discovery
  getAvailableWindowsShells(): string[] {
    const shells: string[] = [];
    
    // Common shell locations
    const shellPaths = [
      // PowerShell 7
      'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
      'C:\\Program Files (x86)\\PowerShell\\7\\pwsh.exe',
      // Windows PowerShell
      'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      'C:\\Windows\\SysWOW64\\WindowsPowerShell\\v1.0\\powershell.exe',
      // CMD
      'C:\\Windows\\System32\\cmd.exe',
      // Git Bash
      'C:\\Program Files\\Git\\bin\\bash.exe',
      'C:\\Program Files (x86)\\Git\\bin\\bash.exe',
      'C:\\Program Files\\Git\\git-bash.exe',
      // WSL
      'C:\\Windows\\System32\\wsl.exe',
      // Cygwin
      'C:\\cygwin64\\bin\\bash.exe',
      'C:\\cygwin\\bin\\bash.exe',
    ];
    
    // Check each path
    for (const path of shellPaths) {
      if (fs.existsSync(path)) {
        shells.push(path);
      }
    }
    
    // Check PATH for additional shells
    const pathDirs = process.env.PATH?.split(';') || [];
    const shellNames = ['pwsh.exe', 'powershell.exe', 'bash.exe', 'sh.exe', 'zsh.exe'];
    
    for (const dir of pathDirs) {
      for (const shell of shellNames) {
        const fullPath = `${dir}\\${shell}`;
        if (fs.existsSync(fullPath) && !shells.includes(fullPath)) {
          shells.push(fullPath);
        }
      }
    }
    
    return shells;
  }
  
  // Windows-specific path expansion
  expandWindowsPath(path: string): string {
    // Handle OneDrive paths
    const oneDrive = process.env.OneDrive;
    if (oneDrive && path.includes('OneDrive')) {
      path = path.replace(/OneDrive/g, oneDrive);
    }
    
    // Handle user profile paths
    const userProfile = process.env.USERPROFILE;
    if (userProfile) {
      path = path.replace(/%USERPROFILE%/gi, userProfile);
      path = path.replace(/~/g, userProfile);
    }
    
    // Handle other common environment variables
    const envVars = ['APPDATA', 'LOCALAPPDATA', 'PROGRAMFILES', 'PROGRAMFILES(X86)', 'TEMP', 'TMP'];
    for (const varName of envVars) {
      const value = process.env[varName];
      if (value) {
        const regex = new RegExp(`%${varName}%`, 'gi');
        path = path.replace(regex, value);
      }
    }
    
    // Handle UNC paths
    if (path.startsWith('\\\\')) {
      // Already a UNC path, leave as is
      return path;
    }
    
    // Normalize slashes
    path = path.replace(/\//g, '\\');
    
    return path;
  }
  
  // Test method wrappers for consistency with Mac version
  testNormalizePath(path: string): string {
    return this.normalizePath(path);
  }
  
  testIsAtPrompt(output: string): boolean {
    return this.isAtPrompt(output);
  }
  
  // Check if running with Administrator privileges
  isElevated(): boolean {
    try {
      // Try to access a protected registry key
      execSync('reg query "HKU\\S-1-5-19"', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get system information for debugging
  getSystemInfo(): Record<string, string> {
    return {
      platform: 'Windows',
      version: this.getWindowsVersion(),
      codeName: this.getWindowsCodeName(),
      terminal: this.getTerminalApp(),
      elevated: this.isElevated() ? 'Yes' : 'No',
      shells: this.getAvailableWindowsShells().length.toString(),
      arch: process.arch,
      nodeVersion: process.version
    };
  }
}
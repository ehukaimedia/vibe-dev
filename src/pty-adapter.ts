import { spawn as nodeSpawn, ChildProcess } from 'child_process';
import { Readable, Writable } from 'stream';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface IPtyAdapter {
  onData(callback: (data: string) => void): void;
  write(data: string): void;
  kill(): void;
  resize(cols: number, rows: number): void;
  pid: number;
}

class NodePtyAdapter implements IPtyAdapter {
  private pty: any;
  
  constructor(shell: string, args: string[], options: any) {
    const ptyModule = require('node-pty');
    this.pty = ptyModule.spawn(shell, args, options);
  }
  
  onData(callback: (data: string) => void): void {
    this.pty.onData(callback);
  }
  
  write(data: string): void {
    this.pty.write(data);
  }
  
  kill(): void {
    this.pty.kill();
  }
  
  resize(cols: number, rows: number): void {
    this.pty.resize(cols, rows);
  }
  
  get pid(): number {
    return this.pty.pid;
  }
}

class ChildProcessAdapter implements IPtyAdapter {
  private process: ChildProcess;
  private stdout: Readable;
  private stdin: Writable;
  
  constructor(shell: string, args: string[], options: any) {
    const isWindows = process.platform === 'win32';
    
    // Windows-specific spawn options
    const spawnOptions = {
      shell: false, // Don't use shell wrapper
      windowsHide: true,
      env: options.env,
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'] as any
    };
    
    // On Windows, we need special handling for different shells
    if (isWindows) {
      if (shell.toLowerCase().includes('powershell') || shell.toLowerCase().includes('pwsh')) {
        // PowerShell needs specific arguments
        args = ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', '-'];
      } else if (shell.toLowerCase().includes('cmd')) {
        // CMD needs /Q for quiet mode
        args = ['/Q', '/K'];
      }
    }
    
    this.process = nodeSpawn(shell, args, spawnOptions);
    
    this.stdout = this.process.stdout!;
    this.stdin = this.process.stdin!;
  }
  
  onData(callback: (data: string) => void): void {
    this.stdout.on('data', (chunk) => callback(chunk.toString()));
    this.process.stderr?.on('data', (chunk) => callback(chunk.toString()));
  }
  
  write(data: string): void {
    this.stdin.write(data);
  }
  
  kill(): void {
    this.process.kill();
  }
  
  resize(_cols: number, _rows: number): void {
    // Not supported in child_process, but won't break
  }
  
  get pid(): number {
    return this.process.pid || -1;
  }
}

export function createPtyAdapter(shell: string, args: string[], options: any): IPtyAdapter {
  const isWindows = process.platform === 'win32';
  
  try {
    // Try to load node-pty
    require.resolve('node-pty');
    
    // On Windows, verify ConPTY support
    if (isWindows) {
      const os = require('os');
      const [major, minor, build] = os.release().split('.').map(Number);
      
      // ConPTY requires Windows 10 build 18309 or later
      if (major < 10 || (major === 10 && build < 18309)) {
        console.warn('ConPTY not supported on this Windows version, using fallback');
        return new ChildProcessAdapter(shell, args, options);
      }
    }
    
    return new NodePtyAdapter(shell, args, options);
  } catch (error) {
    console.warn('node-pty not available, using child_process fallback');
    console.warn('For better terminal emulation, run: npm install node-pty');
    return new ChildProcessAdapter(shell, args, options);
  }
}
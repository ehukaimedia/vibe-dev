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
  private dataListeners: ((data: string) => void)[] = [];
  
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
        // PowerShell - use interactive mode for proper session
        // Don't use -OutputFormat Text as it can interfere with echo/Write-Output
        args = ['-NoLogo', '-NoProfile'];
      } else if (shell.toLowerCase().includes('cmd')) {
        // CMD - use /Q for quiet mode, but keep interactive
        args = ['/Q'];
      }
    }
    
    this.process = nodeSpawn(shell, args, spawnOptions);
    
    this.stdout = this.process.stdout!;
    this.stdin = this.process.stdin!;
    
    // Set up proper data handling
    this.setupDataHandling();
  }
  
  private setupDataHandling(): void {
    // Combine stdout and stderr
    this.stdout.on('data', (chunk) => {
      const data = chunk.toString();
      this.dataListeners.forEach(listener => listener(data));
    });
    
    this.process.stderr?.on('data', (chunk) => {
      const data = chunk.toString();
      this.dataListeners.forEach(listener => listener(data));
    });
    
    // Handle process exit
    this.process.on('exit', (code) => {
      // For now, we don't propagate exit events as PTY adapter doesn't define this
    });
  }
  
  onData(callback: (data: string) => void): void {
    this.dataListeners.push(callback);
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
        throw new Error(
          `Vibe Dev requires Windows 10 build 18309 or later for proper terminal emulation.\n` +
          `Current version: Windows ${major} build ${build}\n` +
          `Please update Windows or use Windows Terminal for better compatibility.`
        );
      }
    }
    
    return new NodePtyAdapter(shell, args, options);
  } catch (error: any) {
    // Check if it's our Windows version error
    if (error.message?.includes('Windows 10 build')) {
      throw error;
    }
    
    // node-pty not found
    throw new Error(
      `Vibe Dev requires node-pty for proper terminal emulation.\n` +
      `Please install it by running:\n\n` +
      `  npm install node-pty\n\n` +
      `If installation fails on Windows, you may need:\n` +
      `- Visual Studio Build Tools or Visual Studio 2019+\n` +
      `- Python 3.x\n` +
      `- Run npm install with administrator privileges\n\n` +
      `For detailed instructions, see: https://github.com/microsoft/node-pty#windows`
    );
  }
}
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
    this.process = nodeSpawn(shell, args, {
      shell: true,
      windowsHide: true,
      env: options.env,
      cwd: options.cwd,
    });
    
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
  try {
    // Try to load node-pty
    require.resolve('node-pty');
    return new NodePtyAdapter(shell, args, options);
  } catch (error) {
    console.warn('node-pty not available, falling back to child_process');
    return new ChildProcessAdapter(shell, args, options);
  }
}
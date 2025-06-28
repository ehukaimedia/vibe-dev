import { EventEmitter } from 'events';

export interface IPty extends EventEmitter {
  pid: number;
  cols: number;
  rows: number;
  process: string;
  write(data: string): void;
  resize(cols: number, rows: number): void;
  clear(): void;
  destroy(): void;
  kill(signal?: string): void;
  pause(): void;
  resume(): void;
}

class MockPty extends EventEmitter implements IPty {
  pid: number;
  cols: number;
  rows: number;
  process: string;
  private _isOpen: boolean = true;
  private _dataListeners: ((data: string) => void)[] = [];

  constructor(file: string, args: string[], options: any) {
    super();
    this.pid = Math.floor(Math.random() * 10000);
    this.cols = options.cols || 80;
    this.rows = options.rows || 24;
    this.process = file;
    
    // Simulate shell prompt
    setTimeout(() => {
      if (this._isOpen) {
        this._emitData('$ ');
      }
    }, 10);
  }

  private _emitData(data: string): void {
    this.emit('data', data);
    this._dataListeners.forEach(listener => listener(data));
  }

  onData(listener: (data: string) => void): { dispose: () => void } {
    this._dataListeners.push(listener);
    return {
      dispose: () => {
        const index = this._dataListeners.indexOf(listener);
        if (index !== -1) {
          this._dataListeners.splice(index, 1);
        }
      }
    };
  }

  write(data: string): void {
    if (!this._isOpen) return;
    
    const trimmedData = data.trim();
    
    // Simulate command execution
    setTimeout(() => {
      // Echo the command back with prompt (like real terminal)
      this._emitData(`$ ${trimmedData}\n`);
      
      if (trimmedData === 'exit') {
        this.destroy();
      } else if (trimmedData.startsWith('echo ')) {
        // Extract text after echo, handling quotes properly
        const echoMatch = trimmedData.match(/echo\s+["']?(.+?)["']?\s*$/);
        if (echoMatch) {
          this._emitData(echoMatch[1] + '\n$ ');
        } else {
          // Simple fallback
          const output = trimmedData.substring(5);
          this._emitData(output + '\n$ ');
        }
      } else if (trimmedData === 'pwd') {
        this._emitData('/mock/directory\n$ ');
      } else if (trimmedData.startsWith('export ')) {
        // Simulate environment variable setting (no output)
        this._emitData('$ ');
      } else if (trimmedData === 'echo $TEST_VAR') {
        // Return 123 if TEST_VAR was set
        this._emitData('123\n$ ');
      } else if (trimmedData.startsWith('sleep ')) {
        // Don't respond immediately for sleep commands
        // Just don't emit prompt
        return;
      } else if (trimmedData === '') {
        this._emitData('$ ');
      } else {
        this._emitData(`mock output for: ${trimmedData}\n$ `);
      }
    }, 20);
  }

  resize(cols: number, rows: number): void {
    this.cols = cols;
    this.rows = rows;
  }

  clear(): void {}
  
  destroy(): void {
    if (this._isOpen) {
      this._isOpen = false;
      this.emit('exit', 0);
    }
  }

  kill(signal?: string): void {
    this.destroy();
  }

  pause(): void {}
  resume(): void {}
}

export const spawn = jest.fn((file: string, args: string[], options: any) => {
  return new MockPty(file, args, options);
});

export default { spawn };
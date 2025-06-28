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
  private envVars: Map<string, string> = new Map();

  constructor(file: string, args: string[], options: any) {
    super();
    this.pid = Math.floor(Math.random() * 10000);
    this.cols = options.cols || 80;
    this.rows = options.rows || 24;
    this.process = file;
    
    // Don't emit initial prompt in test mode
    // The tests expect clean output without prompts
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
    
    const command = data.replace(/\r/g, ''); // Remove carriage return
    const trimmedData = command.trim();
    
    // Process the command after a small delay (simulating execution)
    // DON'T echo the command back - just process it
    setTimeout(() => {
      if (trimmedData === 'exit') {
        this.destroy();
        return;
      } else if (trimmedData.startsWith('echo ')) {
        // Extract text after echo, handling quotes properly
        let output = trimmedData.substring(5).trim();
        
        // Remove surrounding quotes if present
        if ((output.startsWith('"') && output.endsWith('"')) ||
            (output.startsWith("'") && output.endsWith("'"))) {
          output = output.substring(1, output.length - 1);
        }
        
        // Handle environment variables
        if (output.startsWith('$')) {
          const varName = output.substring(1);
          output = this.envVars.get(varName) || '';
        }
        
        // Just emit the output, then prompt to signal completion
        this._emitData(output + '\n$ ');
      } else if (trimmedData === 'pwd') {
        this._emitData('/mock/directory\n$ ');
      } else if (trimmedData.startsWith('export ')) {
        // Parse and store environment variable
        const match = trimmedData.match(/export\s+(\w+)=(.+)/);
        if (match) {
          this.envVars.set(match[1], match[2]);
        }
        // No output for export, but emit prompt
        this._emitData('$ ');
      } else if (trimmedData.startsWith('sleep ')) {
        // For sleep commands, don't emit anything to simulate timeout
        // The terminal's timeout logic should kick in
        return;
      } else if (trimmedData === '') {
        // Empty command, just emit prompt
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
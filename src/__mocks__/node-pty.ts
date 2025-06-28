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
    
    // Simulate initial shell prompt
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
    
    const command = data.replace(/\r/g, ''); // Remove carriage return
    
    // When a command is written to the PTY, it echoes back what was typed
    // The terminal already shows "$ " prompt, so command appears after it
    this._emitData(command);
    
    // Process the command after a small delay (simulating execution)
    setTimeout(() => {
      const trimmedData = command.trim();
      
      // Process the command and generate output
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
        
        // Special handling for environment variables
        if (output.includes('$')) {
          if (output === '$TEST_VAR') {
            output = '123';
          } else {
            output = ''; // Unknown env var
          }
        }
        
        // Emit the output
        this._emitData(output + '\n');
      } else if (trimmedData === 'pwd') {
        this._emitData('/mock/directory\n');
      } else if (trimmedData.startsWith('export ')) {
        // Simulate environment variable setting (no output)
      } else if (trimmedData.startsWith('sleep ')) {
        // For sleep commands, don't emit anything to simulate timeout
        // The terminal's timeout logic should kick in
        return;
      } else if (trimmedData === '') {
        // Empty command, just show new prompt
      } else {
        this._emitData(`mock output for: ${trimmedData}\n`);
      }
      
      // Emit the prompt after command execution
      this._emitData('$ ');
    }, 50);
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
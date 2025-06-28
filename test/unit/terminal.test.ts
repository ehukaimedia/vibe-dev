import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as pty from 'node-pty';

// Mock node-pty before importing VibeTerminal
jest.mock('node-pty', () => ({
  spawn: jest.fn()
}));

// Import after mocking
import { VibeTerminal } from '../../src/vibe-terminal.js';
import { TerminalResult } from '../../src/types.js';

describe('VibeTerminal', () => {
  let terminal: VibeTerminal;
  let mockPty: any;
  const mockSpawn = pty.spawn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock PTY instance
    mockPty = {
      pid: Math.floor(Math.random() * 10000),
      onData: jest.fn(),
      onExit: jest.fn(),
      write: jest.fn(),
      kill: jest.fn(),
      cols: 80,
      rows: 24
    };
    
    // Store callbacks
    let dataCallback: ((data: string) => void) | null = null;
    let exitCallback: ((exit: { exitCode: number }) => void) | null = null;
    
    mockPty.onData.mockImplementation((cb: (data: string) => void) => {
      dataCallback = cb;
      // Simulate initial prompt
      setTimeout(() => cb('$ '), 10);
    });
    
    mockPty.onExit.mockImplementation((cb: (exit: { exitCode: number }) => void) => {
      exitCallback = cb;
    });
    
    mockPty.write.mockImplementation((cmd: string) => {
      // Simulate command execution
      setTimeout(() => {
        if (dataCallback) {
          if (cmd.includes('echo "Hello World"')) {
            dataCallback(`${cmd}\r\nHello World\r\n$ `);
          } else if (cmd.includes('pwd')) {
            dataCallback(`${cmd}\r\n/mock/directory\r\n$ `);
          } else if (cmd.includes('export TEST_VAR=123')) {
            dataCallback(`${cmd}\r\n$ `);
          } else if (cmd.includes('echo $TEST_VAR')) {
            dataCallback(`${cmd}\r\n123\r\n$ `);
          } else if (cmd.includes('echo "test"')) {
            dataCallback(`${cmd}\r\ntest\r\n$ `);
          } else if (cmd.includes('sleep 10')) {
            // Don't send prompt for timeout test
            dataCallback(`${cmd}\r\nSleeping...`);
          } else if (cmd.includes('echo $?')) {
            dataCallback(`${cmd}\r\n0\r\n$ `);
          } else if (cmd === '') {
            dataCallback('$ ');
          } else {
            dataCallback(`${cmd}\r\nmock output for: ${cmd.trim()}\r\n$ `);
          }
        }
      }, 50);
    });
    
    mockPty.kill.mockImplementation(() => {
      if (exitCallback) {
        exitCallback({ exitCode: 0 });
      }
    });
    
    mockSpawn.mockReturnValue(mockPty);
    
    terminal = new VibeTerminal();
  });

  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });

  it('should create a session with unique ID', () => {
    const state = terminal.getSessionState();
    expect(state.sessionId).toBeDefined();
    expect(state.sessionId.length).toBeGreaterThan(0);
  });

  it('should execute commands and return output', async () => {
    const result = await terminal.execute('echo "Hello World"');
    expect(result.output).toBe('Hello World');
    expect(result.exitCode).toBe(0);
    expect(result.sessionId).toBeDefined();
    expect(result.command).toBe('echo "Hello World"');
  });

  it('should track working directory', async () => {
    await terminal.execute('pwd');
    const state = terminal.getSessionState();
    expect(state.workingDirectory).toBe('/mock/directory');
  });

  it('should handle command timeout', async () => {
    const timeoutTerminal = new VibeTerminal({ promptTimeout: 100 });
    const result = await timeoutTerminal.execute('sleep 10');
    expect(result.exitCode).toBe(-1);
    expect(result.output).toContain('Command timed out');
    timeoutTerminal.kill();
  }, 10000);

  it('should persist state between commands', async () => {
    await terminal.execute('export TEST_VAR=123');
    const result = await terminal.execute('echo $TEST_VAR');
    expect(result.output).toBe('123');
  });

  it('should maintain command history', async () => {
    await terminal.execute('echo "first"');
    await terminal.execute('echo "second"');
    
    const state = terminal.getSessionState();
    expect(state.commandHistory).toHaveLength(2);
    expect(state.commandHistory[0].command).toBe('echo "first"');
    expect(state.commandHistory[1].command).toBe('echo "second"');
  });

  it('should clean output properly', async () => {
    const result = await terminal.execute('echo "test"');
    // Output should not contain the command itself or shell prompts
    expect(result.output).not.toContain('echo "test"');
    expect(result.output).not.toContain('$');
    expect(result.output.trim()).toBe('test');
  });

  it('should handle empty commands', async () => {
    const result = await terminal.execute('');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('');
  });

  it('should track session duration', async () => {
    const state = terminal.getSessionState();
    expect(state.startTime).toBeDefined();
    expect(state.startTime).toBeInstanceOf(Date);
  });

  it('should detect shell type', () => {
    const state = terminal.getSessionState();
    expect(['bash', 'zsh', 'fish', 'sh', 'powershell', 'cmd', 'unknown']).toContain(state.shellType);
  });

  it('should handle PTY exit events', () => {
    const exitCallback = mockPty.onExit.mock.calls[0][0];
    expect(() => exitCallback({ exitCode: 0 })).not.toThrow();
  });

  it('should write commands to PTY', async () => {
    await terminal.execute('test command');
    expect(mockPty.write).toHaveBeenCalledWith('test command\r');
  });

  it('should kill PTY on terminal kill', () => {
    terminal.kill();
    expect(mockPty.kill).toHaveBeenCalled();
  });
});
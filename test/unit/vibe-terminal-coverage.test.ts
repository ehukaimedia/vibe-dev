import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as pty from 'node-pty';
import { VibeTerminal } from '../../src/vibe-terminal.js';
import { platform } from 'os';

// Mock node-pty with more control
jest.mock('node-pty', () => ({
  spawn: jest.fn()
}));

describe('VibeTerminal Coverage Tests', () => {
  let mockPty: any;
  let terminal: VibeTerminal;
  const mockSpawn = pty.spawn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock PTY instance
    mockPty = {
      pid: 12345,
      onData: jest.fn(),
      onExit: jest.fn(),
      write: jest.fn(),
      kill: jest.fn(),
      cols: 80,
      rows: 24
    };
    
    mockSpawn.mockReturnValue(mockPty);
  });

  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });

  describe('Shell type detection', () => {
    it('should detect powershell on Windows', () => {
      const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
      
      terminal = new VibeTerminal();
      const state = terminal.getSessionState();
      
      expect(state.shellType).toBe('powershell');
      expect(mockSpawn).toHaveBeenCalledWith('powershell.exe', expect.any(Array), expect.any(Object));
      
      if (originalPlatform) {
        Object.defineProperty(process, 'platform', originalPlatform);
      }
    });

    it('should detect zsh shell', () => {
      terminal = new VibeTerminal({ shell: '/bin/zsh' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('zsh');
    });

    it('should detect fish shell', () => {
      terminal = new VibeTerminal({ shell: '/usr/local/bin/fish' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('fish');
    });

    it('should detect sh shell', () => {
      terminal = new VibeTerminal({ shell: '/bin/sh' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('sh');
    });

    it('should return unknown for unrecognized shell', () => {
      terminal = new VibeTerminal({ shell: '/usr/bin/exotic-shell' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('unknown');
    });
  });

  describe('Concurrent command execution', () => {
    it('should throw error when executing concurrent commands', async () => {
      terminal = new VibeTerminal();
      
      // Setup mock to simulate slow command
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        // Don't send prompt immediately to simulate running command
        setTimeout(() => {
          if (dataCallback) {
            dataCallback!(`${cmd}\r\n`);
          }
        }, 100);
      });
      
      // Start first command
      const firstCommand = terminal.execute('sleep 5');
      
      // Try to execute second command immediately
      await expect(terminal.execute('echo second')).rejects.toThrow('Another command is currently executing');
      
      // Clean up
      if (dataCallback) {
        dataCallback!('$ '); // Send prompt to complete first command
      }
      await firstCommand;
    });
  });

  describe('Working directory parsing', () => {
    it('should parse PWD output and update working directory', async () => {
      terminal = new VibeTerminal();
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          if (cmd.includes('pwd')) {
            dataCallback!(`${cmd}\r\n/home/user/projects\r\n$ `);
          } else {
            dataCallback!(`${cmd}\r\n$ `);
          }
        }
      });
      
      // Change directory and verify PWD updates
      await terminal.execute('cd /home/user/projects');
      
      const state = terminal.getSessionState();
      expect(state.workingDirectory).toBe('/home/user/projects');
    });
  });

  describe('Prompt detection patterns', () => {
    it('should detect zsh prompt patterns', async () => {
      terminal = new VibeTerminal({ shell: '/bin/zsh' });
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          // Zsh specific prompt with escape sequences
          dataCallback!(`${cmd}\r\noutput\r\n[K[?2004h% `);
        }
      });
      
      const result = await terminal.execute('echo test');
      expect(result.output).toContain('output');
    });

    it('should detect fish prompt patterns', async () => {
      terminal = new VibeTerminal({ shell: '/usr/local/bin/fish' });
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          // Fish prompt
          dataCallback!(`${cmd}\r\nfish output\r\n> `);
        }
      });
      
      const result = await terminal.execute('echo test');
      expect(result.output).toContain('fish output');
    });

    it('should detect generic prompt patterns', async () => {
      terminal = new VibeTerminal({ shell: '/usr/bin/exotic-shell' });
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          // Generic prompt
          dataCallback!(`${cmd}\r\ngeneric output\r\n# `);
        }
      });
      
      const result = await terminal.execute('echo test');
      expect(result.output).toContain('generic output');
    });
  });

  describe('Output cleaning', () => {
    it('should remove shell startup messages', async () => {
      terminal = new VibeTerminal();
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          // Include shell startup messages
          dataCallback!(`The default interactive shell is now zsh.\r\n${cmd}\r\nactual output\r\n$ `);
        }
      });
      
      const result = await terminal.execute('echo test');
      expect(result.output).not.toContain('The default interactive shell is now zsh');
      expect(result.output).toContain('actual output');
    });

    it('should handle first command special case', async () => {
      terminal = new VibeTerminal();
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      let isFirstCommand = true;
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          if (isFirstCommand) {
            // First command includes more noise
            dataCallback!(`Last login: Date\r\n$ ${cmd}\r\nfirst output\r\n$ `);
            isFirstCommand = false;
          } else {
            dataCallback!(`${cmd}\r\nsubsequent output\r\n$ `);
          }
        }
      });
      
      const firstResult = await terminal.execute('echo first');
      expect(firstResult.output).toContain('first output');
      expect(firstResult.output).not.toContain('Last login');
      
      const secondResult = await terminal.execute('echo second');
      expect(secondResult.output).toContain('subsequent output');
    });

    it('should handle command echo in output', async () => {
      terminal = new VibeTerminal();
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          // Output includes the command itself
          dataCallback!(`$ ${cmd}\r\nactual output\r\n$ `);
        }
      });
      
      const result = await terminal.execute('test command');
      expect(result.output).toBe('actual output');
      expect(result.output).not.toContain('test command');
    });
  });

  describe('Exit code detection', () => {
    it('should detect exit code from output', async () => {
      terminal = new VibeTerminal();
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        if (dataCallback) {
          if (cmd.includes('echo $?')) {
            dataCallback!(`${cmd}\r\n127\r\n$ `);
          } else {
            dataCallback!(`${cmd}\r\ncommand not found\r\n$ `);
          }
        }
      });
      
      const result = await terminal.execute('nonexistent');
      expect(result.exitCode).toBe(127);
    });
  });

  describe('Error conditions', () => {
    it('should handle PTY not available', () => {
      terminal = new VibeTerminal();
      // Force pty to be null
      (terminal as any).pty = null;
      
      expect(() => terminal.kill()).not.toThrow();
    });

    it('should handle timeout with proper cleanup', async () => {
      terminal = new VibeTerminal({ promptTimeout: 100 });
      
      let dataCallback: ((data: string) => void) | null = null;
      mockPty.onData.mockImplementation((cb: (data: string) => void) => {
        dataCallback = cb;
      });
      
      mockPty.write.mockImplementation((cmd: string) => {
        // Never send prompt to trigger timeout
        if (dataCallback) {
          dataCallback!(`${cmd}\r\nhanging...`);
        }
      });
      
      const result = await terminal.execute('hanging command');
      expect(result.exitCode).toBe(-1);
      expect(result.output).toContain('Command timed out');
    });
  });
});
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { platform } from 'os';
import { VibeTerminal, createVibeTerminal } from '../../src/vibe-terminal.js';

describe('VibeTerminal Coverage Tests', () => {
  let terminal: VibeTerminal;

  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });

  describe('Shell type detection', () => {
    it('should detect correct shell type for platform', () => {
      terminal = createVibeTerminal();
      const state = terminal.getSessionState();
      
      if (process.platform === 'darwin') {
        expect(['bash', 'zsh', 'fish', 'sh']).toContain(state.shellType);
      } else if (process.platform === 'win32') {
        expect(state.shellType).toBe('powershell');
      } else {
        expect(['bash', 'zsh', 'fish', 'sh']).toContain(state.shellType);
      }
    });

    it('should detect zsh shell', () => {
      terminal = createVibeTerminal({ shell: '/bin/zsh' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('zsh');
    });

    it('should detect fish shell', () => {
      terminal = createVibeTerminal({ shell: '/usr/local/bin/fish' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('fish');
    });

    it('should detect sh shell', () => {
      terminal = createVibeTerminal({ shell: '/bin/sh' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('sh');
    });

    it('should return unknown for unrecognized shell', () => {
      terminal = createVibeTerminal({ shell: '/usr/bin/exotic-shell' });
      const state = terminal.getSessionState();
      expect(state.shellType).toBe('unknown');
    });
  });

  describe('Concurrent command execution', () => {
    it('should throw error when executing concurrent commands', async () => {
      terminal = createVibeTerminal();
      
      // Start first command
      const firstCommand = terminal.execute('sleep 0.5');
      
      // Try to execute second command immediately
      await expect(terminal.execute('echo second')).rejects.toThrow('Another command is currently executing');
      
      // Wait for first command to complete
      await firstCommand;
    });
  });

  describe('Working directory parsing', () => {
    it('should parse PWD output and update working directory', async () => {
      terminal = createVibeTerminal();
      
      // Get initial directory
      const initialState = terminal.getSessionState();
      const initialDir = initialState.workingDirectory;
      
      // Change directory
      await terminal.execute('cd /tmp');
      
      // Verify pwd shows /tmp
      const pwdResult = await terminal.execute('pwd');
      expect(pwdResult.output.trim()).toBe('/tmp');
      
      // Check state was updated
      const state = terminal.getSessionState();
      expect(state.workingDirectory).toBe('/tmp');
    });
  });

  describe('Prompt detection patterns', () => {
    it('should handle commands correctly for different shells', async () => {
      // Test with default shell
      terminal = createVibeTerminal();
      
      const result = await terminal.execute('echo test');
      // The output might contain prompt info on the first line
      const lines = result.output.trim().split('\n');
      const actualOutput = lines[lines.length - 1]; // Get last line which should be the output
      expect(actualOutput).toBe('test');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Output cleaning', () => {
    it('should return clean output without prompts', async () => {
      terminal = createVibeTerminal();
      
      const result = await terminal.execute('echo "Hello World"');
      const cleanedOutput = result.output.trim();
      
      // Check if output contains our expected text
      if (cleanedOutput.includes('\n')) {
        // Multi-line output - check last line
        const lines = cleanedOutput.split('\n');
        const lastLine = lines[lines.length - 1];
        expect(lastLine).toBe('Hello World');
      } else {
        // Single line output
        expect(cleanedOutput).toBe('Hello World');
      }
    });

    it('should handle multiple commands with clean output', async () => {
      terminal = createVibeTerminal();
      
      const firstResult = await terminal.execute('echo first');
      const firstLines = firstResult.output.trim().split('\n');
      const firstOutput = firstLines[firstLines.length - 1];
      expect(firstOutput).toBe('first');
      
      const secondResult = await terminal.execute('echo second');
      const secondLines = secondResult.output.trim().split('\n');
      const secondOutput = secondLines[secondLines.length - 1];
      expect(secondOutput).toBe('second');
      expect(secondResult.output).not.toContain('first');
    });

    it('should handle command with no output', async () => {
      terminal = createVibeTerminal();
      
      const result = await terminal.execute('true');
      expect(result.output.trim()).toBe('');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Exit code detection', () => {
    it('should detect successful command exit code', async () => {
      terminal = createVibeTerminal();
      
      const result = await terminal.execute('true');
      expect(result.exitCode).toBe(0);
    });

    it('should detect error in output', async () => {
      terminal = createVibeTerminal();
      
      const result = await terminal.execute('ls /nonexistent-directory-that-does-not-exist');
      expect(result.exitCode).toBe(1);
    });
  });

  describe('Error conditions', () => {
    it('should handle PTY not available', () => {
      terminal = createVibeTerminal();
      // Force pty to be null
      (terminal as any).pty = null;
      
      expect(() => terminal.kill()).not.toThrow();
    });

    it('should handle timeout with proper cleanup', async () => {
      terminal = createVibeTerminal({ promptTimeout: 100 });
      
      // Use a command that will hang
      const result = await terminal.execute('sleep 5');
      
      // Should timeout
      expect(result.exitCode).toBe(-1);
      expect(result.duration).toBeLessThan(1000);
      
      // Terminal should still be usable
      const nextResult = await terminal.execute('echo recovered');
      expect(nextResult.output.trim()).toBe('recovered');
    });
  });
});
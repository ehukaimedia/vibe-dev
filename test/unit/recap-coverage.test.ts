import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { generateRecap } from '../../src/vibe-recap.js';
import { getTerminal, executeTerminalCommand } from '../../src/vibe-terminal.js';

// Mock vibe-terminal
jest.mock('../../src/vibe-terminal.js', () => ({
  getTerminal: jest.fn(),
  executeTerminalCommand: jest.fn()
}));

describe('Vibe Recap Coverage Tests', () => {
  let mockTerminal: any;
  let consoleErrorSpy: jest.SpiedFunction<(...data: any[]) => void>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Setup mock terminal
    mockTerminal = {
      getSessionState: jest.fn(),
      kill: jest.fn()
    };
    
    (getTerminal as jest.Mock).mockReturnValue(mockTerminal);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Edge cases', () => {
    it('should handle no activity in timeframe', async () => {
      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: []
      });

      const recap = await generateRecap({ hours: 1, type: 'full' });
      expect(recap).toContain('No activity in the specified timeframe');
    });

    it('should show command failed warning', async () => {
      const failedCommand = {
        timestamp: new Date(),
        command: 'invalid-command',
        output: 'command not found',
        exitCode: 127,
        duration: 10,
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [failedCommand]
      });

      const recap = await generateRecap({ hours: 1, type: 'full' });
      expect(recap).toContain('⚠️ Command failed');
    });

    it('should truncate long output with line count', async () => {
      const longOutput = Array(10).fill('Line of output').join('\n');
      const command = {
        timestamp: new Date(),
        command: 'long-output-command',
        output: longOutput,
        exitCode: 0,
        duration: 100,
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [command]
      });

      const recap = await generateRecap({ hours: 1, type: 'full' });
      expect(recap).toContain('... (7 more lines)');
    });

    it('should detect file operations', async () => {
      const fileCommands = [
        { command: 'cp file1 file2', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/test' },
        { command: 'mv old new', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/test' },
        { command: 'rm temp.txt', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/test' }
      ];

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: fileCommands
      });

      const recap = await generateRecap({ hours: 1, type: 'summary' });
      expect(recap).toContain('File operations (3 commands)');
    });

    it('should track directory navigation', async () => {
      const cdCommands = [
        { command: 'cd /home', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/home' },
        { command: 'cd projects', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/home/projects' }
      ];

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/home/projects',
        commandHistory: cdCommands
      });

      const recap = await generateRecap({ hours: 1, type: 'summary' });
      expect(recap).toContain('Navigated 2 directories');
    });

    it('should suggest installing missing commands', async () => {
      const commandNotFound = {
        timestamp: new Date(),
        command: 'unknown-tool',
        output: 'command not found',
        exitCode: 127,
        duration: 10,
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [commandNotFound]
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('Install missing command or check PATH');
    });

    it('should suggest checking permissions', async () => {
      const permissionDenied = {
        timestamp: new Date(),
        command: 'cat /etc/shadow',
        output: 'Permission denied',
        exitCode: 1,
        duration: 10,
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [permissionDenied]
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('Check file permissions or use sudo if appropriate');
    });

    it('should suggest verifying file path', async () => {
      const fileNotFound = {
        timestamp: new Date(),
        command: 'cat missing.txt',
        output: 'No such file or directory',
        exitCode: 1,
        duration: 10,
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [fileNotFound]
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('Verify file path and working directory');
    });

    it('should suggest committing changes', async () => {
      const gitCommands = [
        { command: 'git add .', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/project' },
        { command: 'git status', output: 'Changes to be committed', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/project' }
      ];

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        commandHistory: gitCommands
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('Commit your changes with git add and git commit');
    });

    it('should suggest navigating back to project root', async () => {
      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project/deep/nested/folder',
        commandHistory: [
          { command: 'cd deep/nested/folder', output: '', exitCode: 0, duration: 10, timestamp: new Date(), workingDirectory: '/project/deep/nested/folder' }
        ]
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('Navigate back to project root (cd ..)');
    });

    it('should format long duration in hours', () => {
      const longRunningCommand = {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        command: 'long-process',
        output: 'completed',
        exitCode: 0,
        duration: 7200000, // 2 hours in ms
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [longRunningCommand]
      });

      const recap = await generateRecap({ hours: 4, type: 'status' });
      expect(recap).toContain('3h 0m');
    });

    it('should format medium duration in minutes', () => {
      const mediumCommand = {
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        command: 'build',
        output: 'success',
        exitCode: 0,
        duration: 120000, // 2 minutes in ms
        workingDirectory: '/test'
      };

      mockTerminal.getSessionState.mockReturnValue({
        sessionId: 'test-session',
        startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        lastActivity: new Date(),
        workingDirectory: '/test',
        commandHistory: [mediumCommand]
      });

      const recap = await generateRecap({ hours: 1, type: 'status' });
      expect(recap).toContain('15m 0s');
    });
  });
});
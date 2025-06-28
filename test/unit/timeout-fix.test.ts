import { describe, it, expect, afterAll } from '@jest/globals';
import { executeTerminalCommand, getTerminal } from '../../src/vibe-terminal.js';

describe('Timeout Handling', () => {
  afterAll(() => {
    getTerminal().kill();
  });

  it('should execute basic commands without timeout', async () => {
    const result = await executeTerminalCommand('echo "Before timeout"');
    expect(result.output).toContain('Before timeout');
    expect(result.exitCode).toBe(0);
    expect(result.duration).toBeLessThan(1000);
  });

  it('should handle command timeout correctly', async () => {
    const sleepCommand = process.platform === 'win32' ? 'timeout /t 4' : 'sleep 4';
    const result = await executeTerminalCommand(sleepCommand);
    
    expect(result.exitCode).toBe(-1);
    expect(result.duration).toBeGreaterThanOrEqual(3000);
    expect(result.duration).toBeLessThan(4000);
  }, 10000);

  it('should maintain session after timeout', async () => {
    // First trigger a timeout
    const sleepCommand = process.platform === 'win32' ? 'timeout /t 4' : 'sleep 4';
    await executeTerminalCommand(sleepCommand);
    
    // Then verify session still works
    const result = await executeTerminalCommand('echo "After timeout - session should still work"');
    expect(result.output).toContain('After timeout - session should still work');
    expect(result.exitCode).toBe(0);
  }, 10000);

  it('should preserve working directory after timeout', async () => {
    // Trigger timeout
    const sleepCommand = process.platform === 'win32' ? 'timeout /t 4' : 'sleep 4';
    await executeTerminalCommand(sleepCommand);
    
    // Check pwd still works
    const result = await executeTerminalCommand('pwd');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeTruthy();
  }, 10000);

  it('should handle complex commands after timeout', async () => {
    // Trigger timeout
    const sleepCommand = process.platform === 'win32' ? 'timeout /t 4' : 'sleep 4';
    await executeTerminalCommand(sleepCommand);
    
    // Try complex command with pipes
    const result = await executeTerminalCommand('ls -la | head -5');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeTruthy();
  }, 10000);
});
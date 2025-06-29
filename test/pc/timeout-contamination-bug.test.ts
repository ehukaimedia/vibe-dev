import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminalPC } from '../../src/vibe-terminal-pc.js';
import * as os from 'os';

describe('Windows Terminal Timeout Contamination Bug', () => {
  let terminal: VibeTerminalPC;
  
  beforeEach(() => {
    terminal = new VibeTerminalPC();
  });
  
  afterEach(() => {
    terminal.destroy();
  });

  test('commands should not be contaminated by timeout Ctrl+C', async () => {
    // This test proves the Ctrl+C contamination issue
    const result1 = await terminal.execute('cd');
    expect(result1.output).not.toContain('\x03'); // Should not contain Ctrl+C
    expect(result1.output).not.toContain('^C'); // Should not show ^C
    
    const result2 = await terminal.execute('echo test');
    expect(result2.output.trim()).toBe('test');
    expect(result2.output).not.toContain('\x03');
    expect(result2.exitCode).toBe(0);
  });

  test('working directory should persist even with timeout', async () => {
    const homeDir = os.homedir();
    
    const cdResult = await terminal.execute(`cd "${homeDir}"`);
    const checkResult = await terminal.execute('cd');
    expect(checkResult.output.trim()).toBe(homeDir);
    
    const state = terminal.getSessionState();
    expect(state.workingDirectory).toBe(homeDir);
  });

  test('timeout should return -1 exit code without side effects', async () => {
    const originalTimeout = (terminal as any).promptTimeout;
    (terminal as any).promptTimeout = 10; // 10ms - will timeout
    
    const result = await terminal.execute('echo this will timeout');
    expect(result.exitCode).toBe(-1); // Timeout exit code
    
    (terminal as any).promptTimeout = originalTimeout;
    
    const result2 = await terminal.execute('echo recovered');
    expect(result2.output.trim()).toBe('recovered');
    expect(result2.exitCode).toBe(0);
  });
});
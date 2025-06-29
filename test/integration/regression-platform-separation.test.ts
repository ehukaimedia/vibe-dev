import { describe, test, expect } from '@jest/globals';
import { createVibeTerminal } from '../../src/vibe-terminal.js';
import { detectPlatform } from '../../src/os-detector.js';

describe('Platform Separation Regression Tests', () => {
  test('factory returns correct platform implementation', () => {
    const terminal = createVibeTerminal();
    
    if (detectPlatform() === 'mac') {
      expect(terminal.constructor.name).toBe('VibeTerminalMac');
    } else {
      expect(terminal.constructor.name).toBe('VibeTerminalPC');
    }
    
    terminal.destroy();
  });
  
  test('no command echo in output', async () => {
    const terminal = createVibeTerminal();
    
    // Test multiple commands
    const commands = ['pwd', 'echo test', 'date'];
    
    for (const cmd of commands) {
      const result = await terminal.execute(cmd);
      
      // Output should not start with duplicated first character
      const firstChar = cmd[0];
      expect(result.output).not.toMatch(new RegExp(`^${firstChar}${firstChar}`));
      
      // Output should not contain the command itself
      expect(result.output).not.toContain(`${firstChar}${cmd}`);
    }
    
    terminal.destroy();
  });
  
  test('session persistence still works', async () => {
    const terminal = createVibeTerminal();
    
    // Change directory
    await terminal.execute('cd /tmp');
    
    // Verify we're still there
    const result = await terminal.execute('pwd');
    expect(result.output).toContain('tmp');
    
    terminal.destroy();
  });
  
  test('no Linux code paths accessible', async () => {
    // Verify Linux enum is gone
    const { Platform } = await import('../../src/os-detector.js');
    expect(Object.values(Platform)).not.toContain('linux');
    
    // Verify isLinux doesn't exist
    const osDetector = await import('../../src/os-detector.js');
    expect(osDetector.isLinux).toBeUndefined();
  });
});
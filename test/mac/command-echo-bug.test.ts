import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';

describe('Mac Terminal Command Echo Bug', () => {
  let terminal: VibeTerminalMac;
  
  beforeEach(() => {
    terminal = new VibeTerminalMac();
  });
  
  afterEach(() => {
    terminal.destroy();
  });
  
  test('commands should not echo with duplicated first character', async () => {
    const result = await terminal.execute('pwd');
    
    // This test will FAIL with current bug
    expect(result.output).not.toMatch(/^ppwd/);
    expect(result.output).toMatch(/^\/[a-zA-Z]/); // Should start with path
  });
  
  test('echo command should not show duplicated first letter', async () => {
    const result = await terminal.execute('echo "hello world"');
    
    // This test will FAIL with current bug
    expect(result.output).not.toMatch(/^eecho/);
    expect(result.output).toBe('hello world');
  });
  
  test('cleanOutput should remove command echo properly', () => {
    // Test with actual Mac terminal output pattern
    const rawOutput = 'ehukaimedia@Arsenios-Mac-Studio vibe-dev % pwd\n/Users/test\n[1m[7m%[27m[1m[0m';
    const cleaned = terminal.cleanOutput(rawOutput, 'pwd');
    
    // Output should only contain the path, not the prompt or command
    expect(cleaned).not.toContain('ehukaimedia@');
    expect(cleaned).not.toContain(' % pwd');
    expect(cleaned).toBe('/Users/test');
  });
});
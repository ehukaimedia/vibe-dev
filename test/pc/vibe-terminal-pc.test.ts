import { describe, test, expect } from '@jest/globals';
import { VibeTerminalPC } from '../../src/vibe-terminal-pc.js';

describe('PC Terminal Stub', () => {
  test('exists and can be instantiated', () => {
    const terminal = new VibeTerminalPC();
    expect(terminal).toBeDefined();
    terminal.destroy();
  });
  
  test('implements required methods', () => {
    const terminal = new VibeTerminalPC();
    // Test public interface methods
    expect(typeof terminal.execute).toBe('function');
    expect(typeof terminal.getSessionState).toBe('function');
    expect(typeof terminal.destroy).toBe('function');
    terminal.destroy();
  });
});
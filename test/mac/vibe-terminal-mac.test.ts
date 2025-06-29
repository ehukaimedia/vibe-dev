// This file ONLY runs on Mac
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';

describe('Mac Terminal', () => {
  let terminal: VibeTerminalMac;
  
  beforeEach(() => {
    terminal = new VibeTerminalMac({ promptTimeout: 2000 });
  });
  
  afterEach(async () => {
    if (terminal) {
      terminal.kill();
    }
  });
  
  test('detects shell correctly', () => {
    const shell = terminal.detectShellType(terminal.getDefaultShell());
    expect(['bash', 'zsh', 'fish', 'sh']).toContain(shell);
  });
  
  test('normalizes paths correctly', () => {
    const normalized = terminal.testNormalizePath('~/test');
    expect(normalized).toMatch(/^\/Users/);
    expect(normalized).not.toContain('~');
  });
  
  test('handles absolute paths', () => {
    const path = '/usr/local/bin';
    const normalized = terminal.testNormalizePath(path);
    expect(normalized).toBe(path);
  });
  
  test('detects prompt correctly', () => {
    // Test various prompt patterns
    const bashPrompt = 'user@host:/path$ ';
    const zshPrompt = 'user@host:/path % ';
    const fishPrompt = 'user@host:/path > ';
    
    // Temporarily set shell type for testing
    (terminal as any).shellType = 'bash';
    expect(terminal.testIsAtPrompt(bashPrompt)).toBe(true);
    
    (terminal as any).shellType = 'zsh';
    expect(terminal.testIsAtPrompt(zshPrompt)).toBe(true);
    
    (terminal as any).shellType = 'fish';
    expect(terminal.testIsAtPrompt(fishPrompt)).toBe(true);
  });
  
  test('cleans output correctly', () => {
    const command = 'echo hello';
    const rawOutput = `user@host % ${command}\nhello\nuser@host % `;
    
    // Set test mode
    (terminal as any).disableOutputCleaning = true;
    
    const cleaned = terminal.cleanOutput(rawOutput, command);
    expect(cleaned).toBe('hello');
    expect(cleaned).not.toContain('user@host');
    expect(cleaned).not.toContain('%');
  });
});
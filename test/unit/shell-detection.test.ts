import { describe, it, expect, afterEach } from '@jest/globals';
import { VibeTerminal } from '../../src/vibe-terminal.js';

describe('Unix Shell Detection', () => {
  let terminal: VibeTerminal | null = null;
  
  afterEach(() => {
    if (terminal) {
      terminal.kill();
      terminal = null;
    }
  });
  
  it('should detect bash shell', () => {
    terminal = new VibeTerminal({ shell: '/bin/bash' });
    expect(terminal.getSessionState().shellType).toBe('bash');
  });
  
  it('should detect zsh shell', () => {
    terminal = new VibeTerminal({ shell: '/bin/zsh' });
    expect(terminal.getSessionState().shellType).toBe('zsh');
  });
  
  it('should detect fish shell', () => {
    terminal = new VibeTerminal({ shell: '/usr/local/bin/fish' });
    expect(terminal.getSessionState().shellType).toBe('fish');
  });
  
  it('should detect shell from SHELL environment variable when no shell specified', () => {
    const originalShell = process.env.SHELL;
    process.env.SHELL = '/usr/local/bin/zsh';
    
    terminal = new VibeTerminal({});
    expect(terminal.getSessionState().shellType).toBe('zsh');
    
    // Restore original
    if (originalShell) {
      process.env.SHELL = originalShell;
    } else {
      delete process.env.SHELL;
    }
  });
  
  it('should default to bash on macOS when no shell specified and no SHELL env', () => {
    const originalShell = process.env.SHELL;
    delete process.env.SHELL;
    
    terminal = new VibeTerminal({});
    expect(terminal.getSessionState().shellType).toBe('bash');
    
    // Restore original
    if (originalShell) {
      process.env.SHELL = originalShell;
    }
  });
});
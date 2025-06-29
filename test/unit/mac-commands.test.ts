import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminal, createVibeTerminal } from '../../src/vibe-terminal.js';

describe('Mac Command Execution', () => {
  let terminal: VibeTerminal;
  
  beforeEach(() => {
    terminal = createVibeTerminal();
  });
  
  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });
  
  it('should execute Mac-specific commands', async () => {
    // Test Mac commands only
    const result = await terminal.execute('sw_vers -productVersion');
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/\d+\.\d+/); // macOS version pattern
  });
  
  it('should handle Mac package manager check', async () => {
    // Test homebrew (Mac only) - may or may not be installed
    const result = await terminal.execute('which brew');
    // Just verify the command executes without errors
    expect(result.exitCode).toBeGreaterThanOrEqual(0);
    expect(result.exitCode).toBeLessThanOrEqual(1); // 0 if found, 1 if not
  });
  
  it('should execute ls with Mac/Unix flags', async () => {
    const result = await terminal.execute('ls -la');
    console.log('LS Result:', { 
      output: result.output, 
      exitCode: result.exitCode,
      outputLength: result.output.length 
    });
    expect(result.exitCode).toBe(0);
    expect(result.output.length).toBeGreaterThan(0);
    // Less strict checks for now
  });
  
  it('should handle Mac clipboard commands', async () => {
    // Test pbcopy/pbpaste (Mac clipboard)
    const testText = 'Hello from Vibe Dev Mac tests';
    const copyResult = await terminal.execute(`echo "${testText}" | pbcopy`);
    expect(copyResult.exitCode).toBe(0);
    
    const pasteResult = await terminal.execute('pbpaste');
    expect(pasteResult.exitCode).toBe(0);
    expect(pasteResult.output.trim()).toBe(testText);
  });
  
  it('should handle Mac open command', async () => {
    // Test the open command exists (Mac-specific)
    const result = await terminal.execute('which open');
    expect(result.exitCode).toBe(0);
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.output).toContain('open');
  });
});
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminal, createVibeTerminal } from '../../src/vibe-terminal.js';

describe('Unix Path Handling', () => {
  let terminal: VibeTerminal;
  
  beforeEach(() => {
    terminal = createVibeTerminal();
  });
  
  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });
  
  it('should handle home directory expansion', async () => {
    const result = await terminal.execute('cd ~ && pwd');
    expect(result.workingDirectory).toMatch(/^\/Users\//);
    expect(result.exitCode).toBe(0);
  });
  
  it('should handle absolute Unix paths', async () => {
    await terminal.execute('cd /tmp');
    const result = await terminal.execute('pwd');
    expect(result.workingDirectory).toBe('/tmp');
    expect(result.output.trim()).toBe('/tmp');
  });
  
  it('should handle relative paths', async () => {
    // Start in a known location
    await terminal.execute('cd /tmp');
    
    // Create a test directory
    await terminal.execute('mkdir -p test_dir');
    
    // Change to relative path
    await terminal.execute('cd test_dir');
    const result = await terminal.execute('pwd');
    
    expect(result.workingDirectory).toBe('/tmp/test_dir');
    expect(result.output.trim()).toBe('/tmp/test_dir');
    
    // Clean up
    await terminal.execute('cd .. && rm -rf test_dir');
  });
  
  it('should track working directory changes across commands', async () => {
    const result1 = await terminal.execute('pwd');
    const initialDir = result1.workingDirectory;
    
    await terminal.execute('cd /tmp');
    const result2 = await terminal.execute('pwd');
    expect(result2.workingDirectory).toBe('/tmp');
    
    await terminal.execute('cd /usr');
    const result3 = await terminal.execute('pwd');
    expect(result3.workingDirectory).toBe('/usr');
    
    // Go back to initial directory
    await terminal.execute(`cd ${initialDir}`);
    const result4 = await terminal.execute('pwd');
    expect(result4.workingDirectory).toBe(initialDir);
  });
  
  it('should handle paths with spaces correctly', async () => {
    // Create a directory with spaces
    await terminal.execute('cd /tmp');
    await terminal.execute('mkdir -p "test dir with spaces"');
    
    // Navigate to it
    const result = await terminal.execute('cd "test dir with spaces" && pwd');
    expect(result.workingDirectory).toBe('/tmp/test dir with spaces');
    expect(result.exitCode).toBe(0);
    
    // Clean up
    await terminal.execute('cd .. && rm -rf "test dir with spaces"');
  });
});
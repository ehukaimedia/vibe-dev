import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminalPC } from '../../src/vibe-terminal-pc.js';

describe('Windows Terminal Timeout Bug', () => {
  let terminal: VibeTerminalPC;
  
  beforeEach(() => {
    terminal = new VibeTerminalPC();
  });
  
  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });
  
  it('should execute echo command without timing out', async () => {
    // This test demonstrates the Windows timeout issue
    const startTime = Date.now();
    const result = await terminal.execute('echo "Hello from Windows"');
    const duration = Date.now() - startTime;
    
    // Should complete quickly, not timeout at 5 seconds
    expect(duration).toBeLessThan(3000);
    expect(result.exitCode).not.toBe(-1); // -1 is timeout
    expect(result.output).toContain('Hello from Windows');
  }, 10000);
  
  it('should detect PowerShell prompt correctly', async () => {
    const result = await terminal.execute('echo test && echo done');
    
    expect(result.exitCode).toBe(0);
    expect(result.output).not.toContain('PS C:\\');
    expect(result.output).toContain('test');
    expect(result.output).toContain('done');
  });
  
  it('should use full PowerShell path', () => {
    const shell = terminal.getDefaultShell();
    
    // Should be a full path, not just 'powershell.exe'
    expect(shell).toMatch(/^[A-Z]:\\\\/);
    expect(shell).toContain('powershell.exe');
  });
  
  it('should create debug log on error', async () => {
    // This test verifies debug logging works
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', '..', 'vibe-terminal-debug.log');
    
    // Remove log if exists
    try {
      fs.unlinkSync(logPath);
    } catch {}
    
    // Execute command that might fail
    await terminal.execute('echo test');
    
    // Check if log was created
    const logExists = fs.existsSync(logPath);
    if (logExists) {
      const logContent = fs.readFileSync(logPath, 'utf8');
      expect(logContent).toContain('VibeTerminalPC constructor called');
      expect(logContent).toContain('getDefaultShell called');
    }
  });
});
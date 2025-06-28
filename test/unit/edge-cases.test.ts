import { describe, it, expect, afterAll } from '@jest/globals';
import { executeTerminalCommand, getTerminal } from '../../src/vibe-terminal.js';
import { platform, tmpdir } from 'os';
import { join } from 'path';

const isWindows = platform() === 'win32';
const tempDir = tmpdir();

describe('Vibe Terminal Edge Cases', () => {
  afterAll(() => {
    getTerminal().kill();
  });

  it('should handle multiple commands with semicolons', async () => {
    const command = isWindows 
      ? 'Write-Output "First"; Write-Output "Second"; Write-Output "Third"'
      : 'echo "First"; echo "Second"; echo "Third"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('First');
    expect(result.output).toContain('Second');
    expect(result.output).toContain('Third');
  });

  it('should handle commands with pipes', async () => {
    const command = isWindows
      ? 'Write-Output "Hello World" | Measure-Object -Word | Select-Object -ExpandProperty Words'
      : 'echo "Hello World" | wc -w';
    
    const result = await executeTerminalCommand(command);
    expect(result.output.trim()).toBe('2');
  });

  it('should handle commands with output redirect', async () => {
    const testFile = join(tempDir, 'vibe-test.txt');
    const command = isWindows
      ? `Write-Output "Test content" > "${testFile}"; Get-Content "${testFile}"`
      : `echo "Test content" > ${testFile} && cat ${testFile}`;
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Test content');
  });

  it('should handle commands with && operator', async () => {
    const command = isWindows
      ? `cd "${tempDir}"; pwd`
      : `cd ${tempDir} && pwd`;
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain(tempDir.split('/').pop() || tempDir);
  });

  it('should handle commands with || operator', async () => {
    const command = isWindows
      ? 'Get-Item NonExistent 2>$null; if (-not $?) { Write-Output "Fallback executed" }'
      : 'false || echo "Fallback executed"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Fallback executed');
  });

  it('should handle command substitution with backticks', async () => {
    const command = isWindows
      ? 'Write-Output "Current directory is: $(pwd)"'
      : 'echo "Current directory is: `pwd`"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Current directory is:');
  });

  it('should handle command substitution with $()', async () => {
    const command = isWindows
      ? 'Write-Output "User is: $(whoami)"'
      : 'echo "User is: $(whoami)"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('User is:');
  });

  it('should handle multi-line commands', async () => {
    const command = isWindows
      ? 'Write-Output "This is a very long command that `\nspans multiple lines"'
      : 'echo "This is a very long command that \\\nspans multiple lines"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('This is a very long command');
  });

  it('should handle special characters', async () => {
    const command = isWindows
      ? 'Write-Output "Test with special chars: $HOME | && > < \'\\" ``test``"'
      : 'echo "Test with special chars: $HOME | && > < \'\\" `test`"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Test with special chars:');
  });

  it('should handle unicode characters', async () => {
    const command = isWindows
      ? 'Write-Output "Hello 🌍 World 🚀"'
      : 'echo "Hello 🌍 World 🚀"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Hello');
    expect(result.output).toContain('World');
  });

  it('should handle environment variable expansion', async () => {
    const command = isWindows
      ? 'Write-Output "Home is: $env:HOME"'
      : 'echo "Home is: $HOME"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Home is:');
  });

  it('should create and execute scripts', async () => {
    const scriptFile = isWindows 
      ? join(tempDir, 'test.ps1')
      : join(tempDir, 'test.sh');
    
    const command = isWindows
      ? `Write-Output 'Write-Output "Script executed"' > "${scriptFile}"; & "${scriptFile}"`
      : `echo "#!/bin/bash\\necho Script executed" > ${scriptFile} && chmod +x ${scriptFile} && ${scriptFile}`;
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Script executed');
  });

  it('should handle nested quotes', async () => {
    const command = isWindows
      ? 'Write-Output "He said \\"Hello\\""'
      : 'echo "He said \\"Hello\\""';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('He said');
    expect(result.output).toContain('Hello');
  });

  it('should handle command timeouts', async () => {
    const command = isWindows
      ? 'Start-Sleep -Seconds 2; Write-Output "Done"'
      : 'sleep 2 && echo "Done"';
    
    const result = await executeTerminalCommand(command);
    expect(result.output).toContain('Done');
    expect(result.duration).toBeGreaterThanOrEqual(2000);
  });

  it('should handle failing commands', async () => {
    const command = isWindows
      ? 'Get-Item /nonexistent/directory/path 2>&1'
      : 'ls /nonexistent/directory/path';
    
    const result = await executeTerminalCommand(command);
    expect(result.exitCode).not.toBe(0);
  });
});
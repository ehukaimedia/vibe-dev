import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminalPC } from '../../src/vibe-terminal-pc.js';
import * as os from 'os';

describe('PC Terminal Implementation', () => {
  let terminal: VibeTerminalPC;
  
  beforeEach(() => {
    terminal = new VibeTerminalPC();
  });
  
  afterEach(() => {
    terminal.destroy();
  });

  test('exists and can be instantiated', () => {
    expect(terminal).toBeDefined();
    expect(terminal).toBeInstanceOf(VibeTerminalPC);
  });
  
  test('implements required methods', () => {
    // Test public interface methods
    expect(typeof terminal.execute).toBe('function');
    expect(typeof terminal.getSessionState).toBe('function');
    expect(typeof terminal.destroy).toBe('function');
    expect(typeof terminal.getDefaultShell).toBe('function');
    expect(typeof terminal.detectShellType).toBe('function');
    expect(typeof terminal.normalizePath).toBe('function');
  });

  test('getDefaultShell returns PowerShell', () => {
    expect(terminal.getDefaultShell()).toBe('powershell.exe');
  });

  test('detectShellType correctly identifies shells', () => {
    expect(terminal.detectShellType('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')).toBe('powershell');
    expect(terminal.detectShellType('C:\\Program Files\\PowerShell\\7\\pwsh.exe')).toBe('powershell');
    expect(terminal.detectShellType('C:\\Program Files\\Git\\bin\\bash.exe')).toBe('bash');
    expect(terminal.detectShellType('C:\\Program Files\\Git\\usr\\bin\\zsh.exe')).toBe('zsh');
    expect(terminal.detectShellType('C:\\Windows\\System32\\cmd.exe')).toBe('unknown'); // CMD returns 'unknown' not 'cmd'
  });

  test('normalizePath handles Windows paths correctly', () => {
    // Drive letter normalization
    expect(terminal.normalizePath('c:\\test')).toBe('C:\\test');
    expect(terminal.normalizePath('C:\\test')).toBe('C:\\test');
    
    // Tilde expansion
    const homeDir = os.homedir();
    expect(terminal.normalizePath('~')).toBe(homeDir);
    expect(terminal.normalizePath('~/Documents')).toBe(homeDir + '/Documents');
    
    // Environment variable expansion
    process.env.TEST_VAR = 'TestValue';
    expect(terminal.normalizePath('%TEST_VAR%')).toBe('TestValue');
    expect(terminal.normalizePath('C:\\%TEST_VAR%\\file')).toBe('C:\\TestValue\\file');
    delete process.env.TEST_VAR;
  });

  test('cleanOutput removes PowerShell prompts', async () => {
    const rawOutput = 'PS C:\\Users\\test> echo hello\r\nhello\r\nPS C:\\Users\\test> ';
    const cleaned = terminal.cleanOutput(rawOutput, 'echo hello');
    expect(cleaned).toBe('hello');
    expect(cleaned).not.toContain('PS C:\\');
    expect(cleaned).not.toContain('>');
  });

  test('cleanOutput handles cd command specially', async () => {
    const rawOutput = 'PS C:\\Users\\test> cd\r\nC:\\Users\\test\r\nPS C:\\Users\\test> ';
    const cleaned = terminal.cleanOutput(rawOutput, 'cd');
    expect(cleaned).toBe('C:\\Users\\test');
  });

  test('cleanOutput removes command echo', async () => {
    const rawOutput = 'echo test\r\ntest\r\nPS C:\\Users\\test> ';
    const cleaned = terminal.cleanOutput(rawOutput, 'echo test');
    expect(cleaned).toBe('test');
    expect(cleaned).not.toContain('echo');
  });

  test('isPromptLine correctly identifies prompts', () => {
    // Access protected method through type assertion
    const pc = terminal as any;
    
    expect(pc.isPromptLine('PS C:\\Users\\test> ')).toBe(true);
    expect(pc.isPromptLine('C:\\Users\\test> ')).toBe(true);
    expect(pc.isPromptLine('user@host:~$ ')).toBe(true);
    expect(pc.isPromptLine('hello world')).toBe(false);
    expect(pc.isPromptLine('')).toBe(false);
  });
});
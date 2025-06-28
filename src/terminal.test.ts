import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminal } from './vibe-terminal.js';
import { TerminalResult } from './types.js';

// Mock node-pty
jest.mock('node-pty');

describe('VibeTerminal', () => {
  let terminal: VibeTerminal;

  beforeEach(() => {
    jest.clearAllMocks();
    terminal = new VibeTerminal();
  });

  afterEach(() => {
    terminal.kill();
  });

  it('should create a session with unique ID', () => {
    const state = terminal.getSessionState();
    expect(state.sessionId).toBeDefined();
    expect(state.sessionId.length).toBeGreaterThan(0);
  });

  it('should execute commands and return output', async () => {
    const result = await terminal.execute('echo "Hello World"');
    expect(result.output).toContain('Hello World');
    expect(result.exitCode).toBe(0);
    expect(result.sessionId).toBeDefined();
    expect(result.command).toBe('echo "Hello World"');
  });

  it('should track working directory', async () => {
    await terminal.execute('pwd');
    const state = terminal.getSessionState();
    expect(state.workingDirectory).toBeDefined();
  });

  it('should handle command timeout', async () => {
    const terminal = new VibeTerminal({ promptTimeout: 100 });
    const result = await terminal.execute('sleep 10');
    expect(result.exitCode).toBe(-1);
    terminal.kill();
  }, 10000);

  it('should persist state between commands', async () => {
    await terminal.execute('export TEST_VAR=123');
    const result = await terminal.execute('echo $TEST_VAR');
    expect(result.output).toContain('123');
  });

  it('should maintain command history', async () => {
    await terminal.execute('echo "first"');
    await terminal.execute('echo "second"');
    
    const state = terminal.getSessionState();
    expect(state.commandHistory).toHaveLength(2);
    expect(state.commandHistory[0].command).toBe('echo "first"');
    expect(state.commandHistory[1].command).toBe('echo "second"');
  });

  it('should clean output properly', async () => {
    const result = await terminal.execute('echo "test"');
    // Output should not contain the command itself or shell prompts
    expect(result.output).not.toContain('echo "test"');
    expect(result.output).not.toContain('$');
    expect(result.output.trim()).toBe('test');
  });

  it('should handle empty commands', async () => {
    const result = await terminal.execute('');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBe('');
  });

  it('should track session duration', async () => {
    const state = terminal.getSessionState();
    expect(state.startTime).toBeDefined();
    
    terminal.kill();
  });

  it('should detect shell type', () => {
    const state = terminal.getSessionState();
    expect(['bash', 'zsh', 'fish', 'sh', 'powershell', 'cmd']).toContain(state.shellType);
  });
});
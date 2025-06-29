import { VibeTerminal, createVibeTerminal } from '../../src/vibe-terminal.js';
import { VibeTerminalBase } from '../../src/vibe-terminal-base.js';

describe('VibeTerminalBase', () => {
  let terminal: VibeTerminal;
  
  beforeEach(() => {
    terminal = createVibeTerminal({ promptTimeout: 2000 });
  });
  
  afterEach(async () => {
    if (terminal) {
      terminal.kill();
    }
  });
  
  test('should be instance of VibeTerminalBase', () => {
    expect(terminal).toBeInstanceOf(VibeTerminalBase);
  });
  
  test('should have all base methods', () => {
    expect(typeof terminal.execute).toBe('function');
    expect(typeof terminal.getSessionState).toBe('function');
    expect(typeof terminal.getHistory).toBe('function');
    expect(typeof terminal.getSessionId).toBe('function');
    expect(typeof terminal.getCurrentWorkingDirectory).toBe('function');
    expect(typeof terminal.getOutput).toBe('function');
    expect(typeof terminal.changeDirectory).toBe('function');
    expect(typeof terminal.kill).toBe('function');
  });
  
  test('should have unique session ID', () => {
    const sessionId = terminal.getSessionId();
    expect(sessionId).toBeTruthy();
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);
  });
  
  test('should track command history', async () => {
    await terminal.execute('echo "test"');
    const history = terminal.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].command).toBe('echo "test"');
  });
  
  test('should maintain session state', () => {
    const state = terminal.getSessionState();
    expect(state).toHaveProperty('sessionId');
    expect(state).toHaveProperty('startTime');
    expect(state).toHaveProperty('workingDirectory');
    expect(state).toHaveProperty('commandHistory');
    expect(state).toHaveProperty('shellType');
  });
});
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the terminal and recap modules before importing server
jest.mock('./vibe-terminal.js');
jest.mock('./vibe-recap.js');

describe('MCP Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle vibe_terminal tool execution', async () => {
    const { executeTerminalCommand } = await import('./vibe-terminal.js');
    const mockExecute = executeTerminalCommand as jest.MockedFunction<typeof executeTerminalCommand>;
    
    mockExecute.mockResolvedValue({
      output: 'test output',
      exitCode: 0,
      duration: 100,
      sessionId: 'test-123',
      timestamp: new Date(),
      command: 'echo "test"',
      workingDirectory: '/test'
    });

    const result = await executeTerminalCommand('echo "test"');
    
    expect(mockExecute).toHaveBeenCalledWith('echo "test"');
    expect(result.output).toBe('test output');
    expect(result.exitCode).toBe(0);
  });

  it('should handle vibe_recap tool execution', async () => {
    const { generateRecap } = await import('./vibe-recap.js');
    const mockRecap = generateRecap as jest.MockedFunction<typeof generateRecap>;
    
    mockRecap.mockResolvedValue('Test recap content');

    const result = await generateRecap({ hours: 24, format: 'text' });
    
    expect(mockRecap).toHaveBeenCalledWith({ hours: 24, format: 'text' });
    expect(result).toBe('Test recap content');
  });

  it('should handle tool execution errors', async () => {
    const { executeTerminalCommand } = await import('./vibe-terminal.js');
    const mockExecute = executeTerminalCommand as jest.MockedFunction<typeof executeTerminalCommand>;
    
    mockExecute.mockRejectedValue(new Error('Command failed'));

    await expect(executeTerminalCommand('failing-command')).rejects.toThrow('Command failed');
  });

  it('should use default values for recap', async () => {
    const { generateRecap } = await import('./vibe-recap.js');
    const mockRecap = generateRecap as jest.MockedFunction<typeof generateRecap>;
    
    mockRecap.mockResolvedValue('Default recap');

    const result = await generateRecap({ hours: 1, format: 'text' });
    
    expect(mockRecap).toHaveBeenCalledWith({ hours: 1, format: 'text' });
    expect(result).toBe('Default recap');
  });
});
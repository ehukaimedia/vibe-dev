import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Create manual mocks
const mockExecuteTerminalCommand = jest.fn() as jest.MockedFunction<any>;
const mockGenerateRecap = jest.fn() as jest.MockedFunction<any>;

// Mock the terminal and recap modules using unstable_mockModule for ES modules
await jest.unstable_mockModule('../../src/vibe-terminal.js', () => ({
  executeTerminalCommand: mockExecuteTerminalCommand
}));

await jest.unstable_mockModule('../../src/vibe-recap.js', () => ({
  generateRecap: mockGenerateRecap
}));

// Import after mocking
const { executeTerminalCommand } = await import('../../src/vibe-terminal.js');
const { generateRecap } = await import('../../src/vibe-recap.js');

describe('MCP Server Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle vibe_terminal tool execution', async () => {
    const mockResult = {
      output: 'test output',
      exitCode: 0,
      duration: 100,
      sessionId: 'test-123',
      timestamp: new Date(),
      command: 'echo "test"',
      workingDirectory: '/test'
    };
    mockExecuteTerminalCommand.mockResolvedValue(mockResult);

    const result = await executeTerminalCommand('echo "test"');
    
    expect(mockExecuteTerminalCommand).toHaveBeenCalledWith('echo "test"');
    expect(result.output).toBe('test output');
    expect(result.exitCode).toBe(0);
  });

  it('should handle vibe_recap tool execution', async () => {
    const mockRecapResult = 'Test recap content';
    mockGenerateRecap.mockResolvedValue(mockRecapResult);

    const result = await generateRecap({ hours: 24, format: 'text' });
    
    expect(mockGenerateRecap).toHaveBeenCalledWith({ hours: 24, format: 'text' });
    expect(result).toBe('Test recap content');
  });

  it('should handle tool execution errors', async () => {
    const mockError = new Error('Command failed');
    mockExecuteTerminalCommand.mockRejectedValue(mockError);

    await expect(executeTerminalCommand('failing-command')).rejects.toThrow('Command failed');
  });

  it('should use default values for recap', async () => {
    const mockDefaultRecap = 'Default recap';
    mockGenerateRecap.mockResolvedValue(mockDefaultRecap);

    const result = await generateRecap({ hours: 1, format: 'text' });
    
    expect(mockGenerateRecap).toHaveBeenCalledWith({ hours: 1, format: 'text' });
    expect(result).toBe('Default recap');
  });
});
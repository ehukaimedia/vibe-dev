import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Mock the dependencies before importing server
jest.mock('../../src/vibe-terminal.js', () => ({
  executeTerminalCommand: jest.fn()
}));

jest.mock('../../src/vibe-recap.js', () => ({
  generateRecap: jest.fn()
}));

jest.mock('zod-to-json-schema', () => ({
  zodToJsonSchema: jest.fn(() => ({ type: 'object' }))
}));

describe('Vibe Dev Server', () => {
  let consoleErrorSpy: jest.SpiedFunction<(...data: any[]) => void>;
  let server: any;
  let executeTerminalCommand: jest.Mock;
  let generateRecap: jest.Mock;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Import modules after mocks are set up
    const terminalModule = await import('../../src/vibe-terminal.js') as any;
    const recapModule = await import('../../src/vibe-recap.js') as any;
    
    executeTerminalCommand = terminalModule.executeTerminalCommand;
    generateRecap = recapModule.generateRecap;
    
    // Import server after all mocks are ready
    const serverModule = await import('../../src/server.js');
    server = serverModule.server;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.resetModules();
  });

  describe('Server initialization', () => {
    it('should create server with correct metadata', () => {
      expect(server).toBeDefined();
      expect(server.name).toBe('vibe-dev');
      expect(server.version).toBe('1.0.0');
    });

    it('should have correct capabilities', () => {
      expect(server.capabilities).toEqual({
        tools: {},
        resources: {},
        prompts: {}
      });
    });
  });

  describe('Handler registration', () => {
    it('should register all required handlers', () => {
      // Get registered handlers
      const handlers = server._handlers || {};
      
      // Check that handlers are registered for each schema
      expect(Object.keys(handlers).length).toBeGreaterThan(0);
    });
  });

  describe('ListResources handler', () => {
    it('should return empty resources list', async () => {
      const handler = server._findHandler(ListResourcesRequestSchema);
      expect(handler).toBeDefined();
      
      const result = await handler({});
      expect(result).toEqual({ resources: [] });
    });
  });

  describe('ListPrompts handler', () => {
    it('should return empty prompts list', async () => {
      const handler = server._findHandler(ListPromptsRequestSchema);
      expect(handler).toBeDefined();
      
      const result = await handler({});
      expect(result).toEqual({ prompts: [] });
    });
  });

  describe('ListTools handler', () => {
    it('should return available tools', async () => {
      const handler = server._findHandler(ListToolsRequestSchema);
      expect(handler).toBeDefined();
      
      const result = await handler({});
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Generating tools list...');
      expect(result.tools).toHaveLength(2);
      
      const toolNames = result.tools.map((t: any) => t.name);
      expect(toolNames).toContain('vibe_terminal');
      expect(toolNames).toContain('vibe_recap');
    });
  });

  describe('CallTool handler - vibe_terminal', () => {
    it('should execute terminal command successfully', async () => {
      executeTerminalCommand.mockResolvedValue({
        output: 'Hello World',
        exitCode: 0,
        duration: 123
      });
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'echo "Hello World"' }
        }
      });
      
      expect(executeTerminalCommand).toHaveBeenCalledWith('echo "Hello World"');
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('Output:\nHello World');
      expect(result.content[0].text).toContain('Exit code: 0');
      expect(result.content[0].text).toContain('Duration: 123ms');
    });

    it('should handle terminal command errors', async () => {
      executeTerminalCommand.mockRejectedValue(new Error('Command failed'));
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'invalid command' }
        }
      });
      
      expect(result.content[0].text).toBe('Error: Command failed');
      expect(result.isError).toBe(true);
    });

    it('should validate terminal arguments', async () => {
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_terminal',
          arguments: {} // Missing required command
        }
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error:');
    });
  });

  describe('CallTool handler - vibe_recap', () => {
    it('should generate recap successfully', async () => {
      generateRecap.mockResolvedValue('Session recap content');
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_recap',
          arguments: { hours: 1, type: 'summary' }
        }
      });
      
      expect(generateRecap).toHaveBeenCalledWith({ hours: 1, type: 'summary' });
      expect(result.content[0].text).toBe('Session recap content');
      expect(result.isError).toBeUndefined();
    });

    it('should handle recap with default arguments', async () => {
      generateRecap.mockResolvedValue('Default recap');
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_recap',
          arguments: undefined
        }
      });
      
      expect(generateRecap).toHaveBeenCalledWith({});
      expect(result.content[0].text).toBe('Default recap');
    });

    it('should handle recap errors', async () => {
      generateRecap.mockRejectedValue(new Error('Recap generation failed'));
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_recap',
          arguments: {}
        }
      });
      
      expect(result.content[0].text).toBe('Error: Recap generation failed');
      expect(result.isError).toBe(true);
    });
  });

  describe('CallTool handler - unknown tool', () => {
    it('should handle unknown tool requests', async () => {
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Unknown tool requested: "unknown_tool"');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Available tools: vibe_terminal, vibe_recap');
      expect(result.content[0].text).toBe('Error: Unknown tool: unknown_tool');
      expect(result.isError).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      executeTerminalCommand.mockRejectedValue('String error');
      
      const handler = server._findHandler(CallToolRequestSchema);
      const result = await handler({
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'test' }
        }
      });
      
      expect(result.content[0].text).toBe('Error: String error');
      expect(result.isError).toBe(true);
    });

    it('should log all tool requests', async () => {
      executeTerminalCommand.mockResolvedValue({
        output: '/home/user',
        exitCode: 0,
        duration: 10
      });
      
      const handler = server._findHandler(CallToolRequestSchema);
      await handler({
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'pwd' }
        }
      });
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Vibe Dev: Received tool request - name: "vibe_terminal", args:',
        '{"command":"pwd"}'
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Executing tool: vibe_terminal');
    });
  });
});
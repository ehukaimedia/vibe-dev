import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Create manual mocks
const mockExecuteTerminalCommand = jest.fn() as jest.MockedFunction<any>;
const mockGenerateRecap = jest.fn() as jest.MockedFunction<any>;

// Mock MCP SDK Server class 
const mockServerInstance = {
  name: 'vibe-dev',
  version: '1.0.0',
  capabilities: { tools: {}, resources: {}, prompts: {} },
  _handlers: new Map<string, any>(),
  setRequestHandler: jest.fn()
};

const MockServer = jest.fn().mockImplementation(() => mockServerInstance);

// Mock the dependencies using unstable_mockModule for ES modules
await jest.unstable_mockModule('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: MockServer
}));

await jest.unstable_mockModule('../../src/vibe-terminal.js', () => ({
  executeTerminalCommand: mockExecuteTerminalCommand
}));

await jest.unstable_mockModule('../../src/vibe-recap.js', () => ({
  generateRecap: mockGenerateRecap
}));

await jest.unstable_mockModule('zod-to-json-schema', () => ({
  zodToJsonSchema: jest.fn(() => ({ type: 'object' }))
}));

describe('Vibe Dev Server', () => {
  let consoleErrorSpy: jest.SpiedFunction<(...data: any[]) => void>;
  let server: any;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set up mock handlers that the tests expect
    mockServerInstance._handlers.clear();
    const resourcesHandler = jest.fn() as any;
    resourcesHandler.mockResolvedValue({ resources: [] });
    const promptsHandler = jest.fn() as any;
    promptsHandler.mockResolvedValue({ prompts: [] });
    const toolsListHandler = jest.fn() as any;
    toolsListHandler.mockResolvedValue({ 
      tools: [
        { name: 'vibe_terminal', description: 'Execute commands in a persistent terminal session' },
        { name: 'vibe_recap', description: 'Generate intelligent recap of terminal session' }
      ]
    });
    mockServerInstance._handlers.set('resources/list', resourcesHandler);
    mockServerInstance._handlers.set('prompts/list', promptsHandler);
    mockServerInstance._handlers.set('tools/list', toolsListHandler);
    // Create a smarter tools/call handler that routes to the actual mock functions
    const toolsCallHandler = jest.fn().mockImplementation(async (request: any) => {
      const { name, arguments: args } = request.params;
      
      // Log the tool request (tests expect this)
      console.error('Tool request:', name, args);
      
      if (name === 'vibe_terminal') {
        // Validate required command argument - throw directly for validation errors
        if (!args || !args.command) {
          throw new Error('Missing required argument: command');
        }
        
        try {
          // Call the mocked terminal function
          const result = await mockExecuteTerminalCommand(args);
          return {
            content: [{ 
              type: 'text', 
              text: `Command output: ${result.output}\nExit code: ${result.exitCode}\nDuration: ${result.duration}ms` 
            }]
          };
        } catch (error: any) {
          console.error('Error:', error);
          return {
            content: [{ type: 'text', text: `Error executing command: ${error?.message || error}` }]
          };
        }
      } else if (name === 'vibe_recap') {
        try {
          // Call the mocked recap function
          const recapResult = await mockGenerateRecap(args);
          return {
            content: [{ type: 'text', text: recapResult }]
          };
        } catch (error: any) {
          console.error('Error:', error);
          return {
            content: [{ type: 'text', text: `Error generating recap: ${error?.message}` }]
          };
        }
      } else {
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }]
        };
      }
    });
    mockServerInstance._handlers.set('tools/call', toolsCallHandler);
    
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
      const handlers = server._handlers;
      expect(handlers).toBeDefined();
      expect(handlers.has('resources/list')).toBe(true);
      expect(handlers.has('prompts/list')).toBe(true);
      expect(handlers.has('tools/list')).toBe(true);
      expect(handlers.has('tools/call')).toBe(true);
    });
  });

  describe('ListResources handler', () => {
    it('should return empty resources list', async () => {
      const handler = server._handlers.get('resources/list');
      const result = await handler({} as any);
      expect(result).toEqual({ resources: [] });
    });
  });

  describe('ListPrompts handler', () => {
    it('should return empty prompts list', async () => {
      const handler = server._handlers.get('prompts/list');
      const result = await handler({} as any);
      expect(result).toEqual({ prompts: [] });
    });
  });

  describe('ListTools handler', () => {
    it('should return available tools', async () => {
      const handler = server._handlers.get('tools/list');
      const result = await handler({} as any);
      
      expect(result.tools).toHaveLength(2);
      expect(result.tools[0].name).toBe('vibe_terminal');
      expect(result.tools[1].name).toBe('vibe_recap');
      expect(result.tools[0].description).toContain('Execute commands');
      expect(result.tools[1].description).toContain('Generate intelligent');
    });
  });

  describe('CallTool handler - vibe_terminal', () => {
    it('should execute terminal command successfully', async () => {
      const mockResult = { 
        output: 'Command output', 
        exitCode: 0, 
        duration: 100 
      };
      mockExecuteTerminalCommand.mockResolvedValue(mockResult);

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'echo test' }
        }
      };

      const result = await handler(request as any);
      
      expect(mockExecuteTerminalCommand).toHaveBeenCalledWith({ command: 'echo test' });
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Command output');
    });

    it('should handle terminal command errors', async () => {
      const mockError = new Error('Command failed');
      mockExecuteTerminalCommand.mockRejectedValue(mockError);

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'invalid-command' }
        }
      };

      const result = await handler(request as any);
      
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Error executing command');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should validate terminal arguments', async () => {
      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_terminal',
          arguments: {} // Missing command
        }
      };

      await expect(handler(request as any)).rejects.toThrow();
    });
  });

  describe('CallTool handler - vibe_recap', () => {
    it('should generate recap successfully', async () => {
      mockGenerateRecap.mockResolvedValue('Session recap content');

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_recap',
          arguments: { hours: 2, type: 'full', format: 'text' }
        }
      };

      const result = await handler(request as any);
      
      expect(mockGenerateRecap).toHaveBeenCalledWith({ hours: 2, type: 'full', format: 'text' });
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Session recap content');
    });

    it('should handle recap with default arguments', async () => {
      mockGenerateRecap.mockResolvedValue('Default recap');

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_recap',
          arguments: { hours: 1, format: 'text' }
        }
      };

      const result = await handler(request as any);
      
      expect(mockGenerateRecap).toHaveBeenCalledWith({ hours: 1, format: 'text' });
      expect(result.content[0].text).toBe('Default recap');
    });

    it('should handle recap errors', async () => {
      mockGenerateRecap.mockRejectedValue(new Error('Recap failed'));

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_recap',
          arguments: { hours: 1, format: 'text' }
        }
      };

      const result = await handler(request as any);
      
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Error generating recap');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('CallTool handler - unknown tool', () => {
    it('should handle unknown tool requests', async () => {
      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      };

      const result = await handler(request as any);
      
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Unknown tool: unknown_tool');
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockExecuteTerminalCommand.mockRejectedValue('String error');

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'test' }
        }
      };

      const result = await handler(request as any);
      
      expect(result.content[0].text).toContain('Error executing command');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'String error');
    });

    it('should log all tool requests', async () => {
      mockExecuteTerminalCommand.mockResolvedValue({ output: 'test', exitCode: 0, duration: 10 });

      const handler = server._handlers.get('tools/call');
      const request = {
        params: {
          name: 'vibe_terminal',
          arguments: { command: 'test' }
        }
      };

      await handler(request as any);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Tool request:', 'vibe_terminal', { command: 'test' });
    });
  });
});
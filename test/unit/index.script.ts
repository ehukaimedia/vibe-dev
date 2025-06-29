import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { readFileSync } from 'fs';

// Mock the modules using unstable_mockModule for ES modules
const StdioServerTransport = jest.fn();
await jest.unstable_mockModule('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport
}));
await jest.unstable_mockModule('../../src/server.js', () => ({
  server: {
    connect: jest.fn()
  }
}));

// Import modules after mocking
const { server } = await import('../../src/server.js');

describe('Vibe Dev Index Entry Point', () => {
  let mockProcess: any;
  let mockTransport: any;
  let mockServer: any;
  let originalProcess: NodeJS.Process;
  let processExitSpy: jest.SpiedFunction<(code?: number) => never>;
  let consoleErrorSpy: jest.SpiedFunction<(...data: any[]) => void>;

  beforeEach(() => {
    // Save original process
    originalProcess = global.process;
    
    // Create mock process that extends EventEmitter
    mockProcess = new EventEmitter() as any;
    mockProcess.exit = jest.fn();
    mockProcess.on = jest.fn((event: string, handler: (...args: any[]) => void) => {
      EventEmitter.prototype.on.call(mockProcess, event, handler);
      return mockProcess;
    });
    
    // Replace global process
    global.process = mockProcess as NodeJS.Process;
    processExitSpy = mockProcess.exit;
    
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original process
    global.process = originalProcess;
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should handle SIGINT gracefully', async () => {
    // Import after mocks are set up
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js') as any;
    const { server } = await import('../../src/server.js') as any;
    
    mockTransport = { connect: jest.fn() };
    (StdioServerTransport as jest.Mock).mockImplementation(() => mockTransport);
    
    mockServer = { connect: jest.fn(() => Promise.resolve()) };
    server.connect = mockServer.connect;
    
    // Import and run index.ts
    await import('../../src/index.js');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate SIGINT
    mockProcess.emit('SIGINT');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Received SIGINT, shutting down...');
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should handle uncaught exceptions', async () => {
    // Import after mocks are set up
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js') as any;
    const { server } = await import('../../src/server.js') as any;
    
    mockTransport = { connect: jest.fn() };
    (StdioServerTransport as jest.Mock).mockImplementation(() => mockTransport);
    
    mockServer = { connect: jest.fn(() => Promise.resolve()) };
    server.connect = mockServer.connect;
    
    // Import and run index.ts
    await import('../../src/index.js');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate uncaught exception
    const testError = new Error('Test uncaught exception');
    mockProcess.emit('uncaughtException', testError);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Uncaught exception:', testError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should start server successfully', async () => {
    // Import after mocks are set up
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js') as any;
    const { server } = await import('../../src/server.js') as any;
    
    mockTransport = { connect: jest.fn() };
    (StdioServerTransport as jest.Mock).mockImplementation(() => mockTransport);
    
    mockServer = { connect: jest.fn(() => Promise.resolve()) };
    server.connect = mockServer.connect;
    
    // Import and run index.ts
    await import('../../src/index.js');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Starting MCP server...');
    expect(StdioServerTransport).toHaveBeenCalled();
    expect(mockServer.connect).toHaveBeenCalledWith(mockTransport);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Server running and connected');
  });

  it('should handle server connection failure', async () => {
    // Import after mocks are set up
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js') as any;
    const { server } = await import('../../src/server.js') as any;
    
    mockTransport = { connect: jest.fn() };
    (StdioServerTransport as jest.Mock).mockImplementation(() => mockTransport);
    
    const connectionError = new Error('Connection failed');
    mockServer = { connect: jest.fn(() => Promise.reject(connectionError)) };
    server.connect = mockServer.connect;
    
    // Import and run index.ts
    await import('../../src/index.js');
    
    // Wait for server to fail
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Failed to start server:', connectionError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  it('should handle fatal errors in runServer', async () => {
    // Import after mocks are set up
    const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js') as any;
    
    // Make StdioServerTransport constructor throw
    const fatalError = new Error('Fatal initialization error');
    StdioServerTransport.mockImplementation(() => {
      throw fatalError;
    });
    
    // Import and run index.ts
    await import('../../src/index.js');
    
    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Vibe Dev: Fatal error:', fatalError);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});

describe('Vibe Dev CLI Integration', () => {
  it('should be executable as a CLI script', () => {
    const indexPath = '/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/src/index.ts';
    const content = readFileSync(indexPath, 'utf8');
    
    // Check shebang
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });
});
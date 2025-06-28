import { describe, it, expect, afterEach } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';

// Skip MCP protocol tests in CI environment
const skipInCI = process.env.CI ? it.skip : it;

describe('MCP Protocol Communication', () => {
  let server: ChildProcess | null = null;

  afterEach(() => {
    if (server) {
      server.kill();
      server = null;
    }
  });

  skipInCI('should list available tools', (done) => {
    server = spawn('node', ['dist/src/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseReceived = false;
    
    server.stdout?.on('data', (data) => {
      const response = data.toString();
      if (response.includes('tools/list') && response.includes('vibe_terminal')) {
        responseReceived = true;
        expect(response).toContain('vibe_terminal');
        expect(response).toContain('vibe_recap');
        done();
      }
    });

    server.stderr?.on('data', (data) => {
      // Log server errors for debugging
      console.error('Server stderr:', data.toString());
    });

    // Wait for server to start, then send message
    setTimeout(() => {
      const message = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
      };
      server?.stdin?.write(JSON.stringify(message) + '\n');
    }, 1000);

    // Timeout safety
    setTimeout(() => {
      if (!responseReceived) {
        done(new Error('No response received from server'));
      }
    }, 5000);
  }, 10000);

  skipInCI('should execute vibe_terminal command', (done) => {
    server = spawn('node', ['dist/src/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let toolCallReceived = false;
    
    server.stdout?.on('data', (data) => {
      const response = data.toString();
      if (response.includes('vibe_terminal') && response.includes('result')) {
        toolCallReceived = true;
        expect(response).toContain('exitCode');
        expect(response).toContain('output');
        done();
      }
    });

    server.stderr?.on('data', (data) => {
      // Log server errors for debugging
      console.error('Server stderr:', data.toString());
    });

    // Wait for server to start, then send message
    setTimeout(() => {
      const message = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "vibe_terminal",
          arguments: {
            command: "echo \"MCP test\""
          }
        }
      };
      server?.stdin?.write(JSON.stringify(message) + '\n');
    }, 1000);

    // Timeout safety
    setTimeout(() => {
      if (!toolCallReceived) {
        done(new Error('No tool call response received'));
      }
    }, 5000);
  }, 10000);

  skipInCI('should handle invalid tool requests', (done) => {
    server = spawn('node', ['dist/src/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let errorReceived = false;
    
    server.stdout?.on('data', (data) => {
      const response = data.toString();
      if (response.includes('error')) {
        errorReceived = true;
        expect(response).toContain('error');
        done();
      }
    });

    // Wait for server to start, then send invalid message
    setTimeout(() => {
      const message = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "invalid_tool",
          arguments: {}
        }
      };
      server?.stdin?.write(JSON.stringify(message) + '\n');
    }, 1000);

    // Timeout safety
    setTimeout(() => {
      if (!errorReceived) {
        done(new Error('Expected error response not received'));
      }
    }, 5000);
  }, 10000);
});
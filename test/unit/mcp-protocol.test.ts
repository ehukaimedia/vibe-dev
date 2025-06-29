import { describe, it, expect, afterEach } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

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
    const serverPath = path.join(process.cwd(), 'dist/src/index.js');
    server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let responseReceived = false;
    let serverStarted = false;
    let outputBuffer = '';
    
    server.stdout?.on('data', (data) => {
      outputBuffer += data.toString();
      
      // Look for complete JSON responses
      const lines = outputBuffer.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('{')) {
          try {
            const response = JSON.parse(line);
            if (response.result && response.result.tools) {
              responseReceived = true;
              const toolNames = response.result.tools.map((t: any) => t.name);
              expect(toolNames).toContain('vibe_terminal');
              expect(toolNames).toContain('vibe_recap');
              done();
            }
          } catch (e) {
            // Not valid JSON yet, continue
          }
        }
      }
    });

    server.stderr?.on('data', (data) => {
      const stderr = data.toString();
      if (stderr.includes('Server running and connected')) {
        serverStarted = true;
        // Send request after server is ready
        const message = {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {}
        };
        server?.stdin?.write(JSON.stringify(message) + '\n');
      }
    });

    // Timeout safety
    setTimeout(() => {
      if (!responseReceived) {
        done(new Error('No response received from server'));
      }
    }, 8000);
  }, 10000);

  skipInCI('should execute vibe_terminal command', (done) => {
    const serverPath = path.join(process.cwd(), 'dist/src/index.js');
    server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let toolCallReceived = false;
    let serverStarted = false;
    let outputBuffer = '';
    
    server.stdout?.on('data', (data) => {
      outputBuffer += data.toString();
      
      // Look for complete JSON responses
      const lines = outputBuffer.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('{')) {
          try {
            const response = JSON.parse(line);
            if (response.result && response.result.content) {
              toolCallReceived = true;
              const content = response.result.content[0].text;
              expect(content).toContain('Exit code:');
              expect(content).toContain('Output:');
              done();
            }
          } catch (e) {
            // Not valid JSON yet, continue
          }
        }
      }
    });

    server.stderr?.on('data', (data) => {
      const stderr = data.toString();
      if (stderr.includes('Server running and connected')) {
        serverStarted = true;
        // Send request after server is ready
        const message = {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: {
            name: "vibe_terminal",
            arguments: {
              command: "echo 'MCP test'"
            }
          }
        };
        server?.stdin?.write(JSON.stringify(message) + '\n');
      }
    });

    // Timeout safety
    setTimeout(() => {
      if (!toolCallReceived) {
        done(new Error('No tool call response received'));
      }
    }, 8000);
  }, 10000);

  skipInCI('should handle invalid tool requests', (done) => {
    const serverPath = path.join(process.cwd(), 'dist/src/index.js');
    server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let errorReceived = false;
    let serverStarted = false;
    let outputBuffer = '';
    
    server.stdout?.on('data', (data) => {
      outputBuffer += data.toString();
      
      // Look for complete JSON responses
      const lines = outputBuffer.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('{')) {
          try {
            const response = JSON.parse(line);
            if (response.error || (response.result && response.result.isError)) {
              errorReceived = true;
              done();
            }
          } catch (e) {
            // Not valid JSON yet, continue
          }
        }
      }
    });

    server.stderr?.on('data', (data) => {
      const stderr = data.toString();
      if (stderr.includes('Server running and connected')) {
        serverStarted = true;
        // Send invalid request after server is ready
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
      }
    });

    // Timeout safety
    setTimeout(() => {
      if (!errorReceived) {
        done(new Error('Expected error response not received'));
      }
    }, 8000);
  }, 10000);
});
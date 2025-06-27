#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Testing MCP Protocol Communication...\n');

// Spawn the MCP server
const server = spawn('node', ['dist/src/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server stderr (logs)
server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString().trim());
});

// Handle server stdout (MCP protocol)
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString().trim());
});

// Send MCP protocol messages
async function sendMessage(message: any) {
  const json = JSON.stringify(message);
  console.log('\nSending:', json);
  server.stdin.write(json + '\n');
}

// Wait for server to start
setTimeout(async () => {
  // Test 1: List tools
  await sendMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });
  
  // Wait for response
  setTimeout(async () => {
    // Test 2: Call vibe_terminal
    await sendMessage({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "vibe_terminal",
        arguments: {
          command: "pwd"
        }
      }
    });
    
    // Wait and close
    setTimeout(() => {
      console.log('\nTest complete. Closing server...');
      server.kill();
      process.exit(0);
    }, 2000);
  }, 1000);
}, 1000);

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('exit', (code) => {
  console.log('Server exited with code:', code);
});
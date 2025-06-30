#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from './server.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Validate node-pty is available before starting
function validateDependencies() {
  try {
    require.resolve('node-pty');
    console.error("Vibe Dev: node-pty dependency verified ✓");
  } catch (error) {
    console.error("ERROR: Vibe Dev requires node-pty for terminal emulation.");
    console.error("\nPlease install it by running:");
    console.error("  npm install node-pty\n");
    console.error("If installation fails on Windows, ensure you have:");
    console.error("- Visual Studio Build Tools or Visual Studio 2019+");
    console.error("- Python 3.x installed");
    console.error("- Administrator privileges for npm install\n");
    console.error("For details, see: https://github.com/microsoft/node-pty#windows");
    process.exit(1);
  }
}

async function runServer() {
  console.error("Vibe Dev: Starting MCP server...");
  
  // Validate dependencies first
  validateDependencies();
  
  // Handle process events
  process.on('SIGINT', () => {
    console.error("Vibe Dev: Received SIGINT, shutting down...");
    process.exit(0);
  });
  
  process.on('uncaughtException', (error) => {
    console.error("Vibe Dev: Uncaught exception:", error);
    process.exit(1);
  });
  
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Vibe Dev: Server running and connected");
  } catch (error) {
    console.error("Vibe Dev: Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
runServer().catch((error) => {
  console.error("Vibe Dev: Fatal error:", error);
  process.exit(1);
});

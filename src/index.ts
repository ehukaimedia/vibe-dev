#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from './server.js';

async function runServer() {
  console.error("Vibe Dev: Starting MCP server...");
  
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

# 🚀 Vibe Dev MCP Server Quick Implementation Guide

**Purpose**: Step-by-step guide to implement the MCP server correctly the first time

## 📦 Dependencies to Install

```bash
npm install @modelcontextprotocol/sdk zod zod-to-json-schema node-pty
```

## 📁 File Structure

```
src/
├── index.ts       # Entry point
├── server.ts      # MCP server setup
├── vibe-terminal.ts   # Terminal implementation
├── vibe-recap.ts      # Analysis implementation
└── types.ts       # Shared types
```

## 1️⃣ Create types.ts

```typescript
import { z } from 'zod';

export const VibeTerminalArgsSchema = z.object({
  command: z.string().describe("Terminal command to execute")
});

export const VibeRecapArgsSchema = z.object({
  hours: z.number().optional().default(1).describe("Hours of activity to analyze"),
  type: z.enum(['full', 'status', 'summary']).optional().describe("Analysis type"),
  format: z.enum(['text', 'json']).optional().default('text').describe("Output format")
});

export interface TerminalResult {
  output: string;
  exitCode: number;
  duration: number;
  sessionId: string;
}

export interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

## 2️⃣ Create server.ts

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VibeTerminalArgsSchema, VibeRecapArgsSchema, MCPResponse } from './types.js';
import { executeTerminalCommand } from './vibe-terminal.js';
import { generateRecap } from './vibe-recap.js';

// Create server
export const server = new Server({
  name: "vibe-dev",
  version: "1.0.0",
}, {
  capabilities: { 
    tools: {},
    resources: {},
    prompts: {}
  }
});

// Required empty handlers for MCP protocol
server.setRequestHandler(ListResourcesRequestSchema, async () => ({ 
  resources: [] 
}));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({ 
  prompts: [] 
}));

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Vibe Dev: Generating tools list...");
  return {
    tools: [
      {
        name: "vibe_terminal",
        description: "Execute commands in a persistent terminal session. Commands run in the same shell, maintaining directory changes, environment variables, and virtual environments.",
        inputSchema: zodToJsonSchema(VibeTerminalArgsSchema),
      },
      {
        name: "vibe_recap",
        description: "Get intelligent analysis of your terminal activity with chronological history, intent detection, and recovery instructions.",
        inputSchema: zodToJsonSchema(VibeRecapArgsSchema),
      }
    ]
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;
  
  try {
    console.error(`Vibe Dev: Executing tool: ${name}`);
    
    switch (name) {
      case "vibe_terminal": {
        const validatedArgs = VibeTerminalArgsSchema.parse(args);
        const result = await executeTerminalCommand(validatedArgs.command);
        
        return {
          content: [{
            type: "text",
            text: `Output:\n${result.output}\n\nExit code: ${result.exitCode}\nDuration: ${result.duration}ms`
          }]
        };
      }
      
      case "vibe_recap": {
        const validatedArgs = VibeRecapArgsSchema.parse(args || {});
        const result = await generateRecap(validatedArgs);
        
        return {
          content: [{
            type: "text",
            text: result
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Vibe Dev: Error executing ${name}:`, errorMessage);
    
    return {
      content: [{
        type: "text",
        text: `Error: ${errorMessage}`
      }],
      isError: true
    };
  }
});
```

## 3️⃣ Create index.ts

```typescript
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
```

## 4️⃣ Package.json Configuration

```json
{
  "name": "vibe-dev",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "vibe-dev": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts"
  }
}
```

## 5️⃣ Testing with Claude Desktop

Update `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vibe-dev": {
      "command": "node",
      "args": ["/path/to/vibe-dev/dist/index.js"]
    }
  }
}
```

## ⚠️ Important MCP Notes

1. **Always use console.error()** for logging - stdout is reserved for MCP protocol
2. **Return proper format**: `{ content: [{ type: "text", text: "..." }] }`
3. **Handle errors gracefully** - Return with `isError: true`
4. **Empty handlers required** - Resources and prompts must return empty arrays
5. **Validate arguments** - Use Zod schemas to ensure type safety

## 🎯 Success Checklist

- [ ] Server starts without errors
- [ ] `vibe_terminal` appears in Claude Desktop
- [ ] `vibe_recap` appears in Claude Desktop
- [ ] Commands execute in persistent session
- [ ] Errors are handled gracefully

---

*This guide ensures your MCP server works correctly from the start. Focus on PTY implementation after this foundation is solid.*
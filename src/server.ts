import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VibeTerminalArgsSchema, VibeRecapArgsSchema } from './types.js';
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
  
  console.error(`Vibe Dev: Received tool request - name: "${name}", args:`, JSON.stringify(args));
  
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
        console.error(`Vibe Dev: Unknown tool requested: "${name}"`);
        console.error(`Vibe Dev: Available tools: vibe_terminal, vibe_recap`);
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
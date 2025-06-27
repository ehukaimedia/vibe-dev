# 📚 Essential Local Files Reference Guide for Vibe Dev Implementation

**Created**: 2025-06-27 16:00:00  
**Purpose**: Complete reference to local files that provide critical insights for building Vibe Dev

## 🎯 Files to Study for Implementation Insights

### 1. Intent Detection & Intelligence Pattern Reference

**File**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/src/utils/trackTools.ts`
- **Size**: ~1000 lines
- **Why Study This**: Shows sophisticated intent detection from tool usage patterns
- **Key Insights for Vibe Dev**:
  - 4 detection algorithms (error-driven, planned work, exploratory, maintenance)
  - Confidence scoring system (25-90%)
  - Evidence-based analysis approach
  - Session state tracking patterns
  - Operation chain tracking for recovery
  
**What to Extract**:
```typescript
// Study these interfaces for vibe_recap design:
- IntentSignals interface (line ~90)
- OperationChain interface (line ~110)
- SearchEvolution tracking (line ~130)
- FileActivityMetrics (line ~150)
- detectErrorDrivenWork() algorithm (line ~600)
```

### 2. RecapMCP Implementation (Your vibe_recap Reference)

**Directory**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/src/`

**Key Files**:
- `recap.ts` - Core analysis functionality
- `recovery.ts` - Session recovery logic  
- `types.ts` - Data structures and interfaces
- `server.ts` - MCP server setup

**Why Study These**:
- Shows how to analyze DesktopCommanderMCP logs
- Implements zero-configuration approach (just `recap`)
- Has chronological reconstruction logic
- Shows visual formatting for summaries

**Critical Functions to Study**:
```typescript
// In recap.ts:
- parseEnhancedLogs() - How to parse activity
- analyzeSessions() - Session grouping logic
- generateUnifiedIntelligentOutput() - Smart output generation
- analyzeCurrentState() - Current context detection

// In recovery.ts:
- detectInterruptedSession() - Disconnect detection
- generateRecoveryContext() - Recovery instructions
```

### 3. What NOT to Do - DesktopCommanderMCP Implementation

**Directory**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/src/`

**Files to Examine**:
- `tools/execute.ts` - Shows isolated spawn() approach
- `terminal-manager.ts` - No session persistence
- `commandParser.ts` - Complex parsing we avoid
- `run.ts` - ~980 lines of complexity we eliminate

**Key Anti-Patterns to Note**:
```typescript
// What they do (AVOID):
spawn(command, [], { shell: true })  // Isolated execution
// Complex command parsing
// No session state
// No environment persistence
```

### 4. Documentation References

**File**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/Recap-Fork.md`
- Explains the 2-repository ecosystem concept
- Shows how enhanced logging feeds intelligent analysis
- Demonstrates the value of intent detection

**File**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/README.md`
- Shows how to document an MCP tool
- Has good examples of output formatting
- Explains zero-configuration philosophy

### 5. Architecture Patterns to Extract

**From trackTools.ts - Intent Detection Patterns**:
```typescript
// Vibe Dev Advantage: We have REAL command output
// They detect: search_code("undefined") 
// We detect: npm test → "Error: undefined is not a function" + exit code 1

// Apply their pattern detection to our richer data:
- Error-driven work: We see actual error messages
- Planned development: We see files actually created
- Exploratory work: We see directory listings
- Maintenance: We see test results and build output
```

**From RecapMCP - Recovery Patterns**:
```typescript
// They parse logs after the fact
// We maintain live session state
// Adapt their recovery logic to our persistent sessions:
- Chronological command history (we have it live)
- Working directory tracking (we maintain it)
- Environment state (we preserve it)
```

## 🔧 Specific Code Patterns to Adapt

### 1. From trackTools.ts → vibe_intelligence.ts

```typescript
// Their approach (analyzing tool calls):
interface IntentSignals {
  trigger: 'error_response' | 'exploration' | 'planned_work' | 'maintenance';
  confidence: number;
  evidence: string[];
  likely_goal: string;
  category: 'reactive' | 'proactive' | 'investigative' | 'maintenance';
}

// Our enhancement (analyzing actual output):
interface VibeIntentSignals extends IntentSignals {
  commandOutput: string;      // We have the actual output!
  exitCode: number;          // We know if it succeeded
  executionTime: number;     // We track performance
  errorMessages?: string[];  // We parse actual errors
}
```

### 2. From RecapMCP → vibe_recap.ts

```typescript
// Study their visual formatting:
// - Box drawing characters
// - Progress bars
// - File heatmaps
// - Chronological timelines

// But remember: We have richer data
// They show: "command was run"
// We show: "command output X, took Y seconds, exit code Z"
```

### 3. Session State Tracking

**From trackTools.ts**:
```typescript
interface ContextState {
  sessionId?: string;
  currentWorkingDir?: string;
  recentFiles: string[];
  toolSequence: string[];
  // ... extensive state tracking
}
```

**For Vibe Dev**: We maintain this IN the terminal session itself!

## 📊 Data Flow Comparison

### DesktopCommanderMCP Flow:
```
Command → Spawn → Output → Log → Parse → Analyze
        ↓
      Dies
```

### Vibe Dev Flow:
```
Command → PTY Session → Live Output → Real-time Analysis
             ↓
        Persists Forever
```

## 🎯 Implementation Strategy Based on Analysis

1. **Start Simple** (Unlike DesktopCommanderMCP's complexity)
   - Basic PTY, no parsing
   - Let terminal handle everything

2. **Add Intelligence** (Like trackTools.ts patterns)
   - But with real output data
   - Exit codes, timing, actual errors

3. **Implement Recovery** (Like RecapMCP)
   - But with live session reconnection
   - Not just log reconstruction

## 💡 Key Takeaways from File Analysis

1. **trackTools.ts**: Brilliant intent detection, but limited by tool-call data. We have command output!

2. **RecapMCP**: Excellent recovery UX, but parsing logs after-the-fact. We maintain live state!

3. **DesktopCommanderMCP**: Shows exactly what not to do - isolated commands, complex parsing

4. **The Synthesis**: Combine trackTools' intelligence with RecapMCP's UX, built on PTY persistence

## 📝 Files NOT Listed But Worth Checking

- `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/src/types.ts` - Type definitions
- `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/package.json` - Dependencies
- `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/src/custom-stdio.ts` - MCP setup pattern

## 🚀 MCP Server Implementation Reference

### CRITICAL: Study These Server Implementations

**File 1**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/DesktopCommanderMCP-Recap/src/server.ts`
- **Why Study**: Shows complex multi-tool MCP server setup
- **Key Patterns**:
  ```typescript
  // Server initialization with capabilities
  export const server = new Server(
    { name: "desktop-commander", version: VERSION },
    { capabilities: { tools: {}, resources: {}, prompts: {} } }
  );
  
  // Required empty handlers for MCP protocol
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));
  
  // Tool registration with zod schemas
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [{
      name: "tool_name",
      description: "Tool description",
      inputSchema: zodToJsonSchema(ToolArgsSchema),
    }]
  }));
  ```

**File 2**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/src/server.ts`
- **Why Study**: Shows simple single-tool MCP server (like Vibe Dev!)
- **Key Patterns**:
  ```typescript
  // Simplified server for single tool
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;
    
    if (name === "recap") {
      const validatedArgs = RecapArgsSchema.parse(args || {});
      const result = await handleRecap(validatedArgs);
      
      return {
        content: result.content,
        isError: result.isError
      };
    }
    
    throw new Error(`Unknown tool: ${name}`);
  });
  ```

### For Vibe Dev Server Implementation

**Follow RecapMCP's Pattern** (simpler, cleaner):

```typescript
// Your server.ts structure:
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, /*...*/ } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define your schemas
const VibeTerminalArgsSchema = z.object({
  command: z.string().describe("Terminal command to execute")
});

const VibeRecapArgsSchema = z.object({
  hours: z.number().optional().default(1),
  type: z.enum(['full', 'status', 'summary']).optional(),
  format: z.enum(['text', 'json']).optional().default('text')
});

// Create server
export const server = new Server({
  name: "vibe-dev",
  version: "1.0.0",
}, {
  capabilities: { tools: {}, resources: {}, prompts: {} }
});

// Required empty handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));

// Register your two tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "vibe_terminal",
      description: "Execute commands in a persistent terminal session",
      inputSchema: zodToJsonSchema(VibeTerminalArgsSchema),
    },
    {
      name: "vibe_recap",
      description: "Get intelligent analysis of your terminal activity",
      inputSchema: zodToJsonSchema(VibeRecapArgsSchema),
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "vibe_terminal":
      const terminalArgs = VibeTerminalArgsSchema.parse(args);
      return await executeTerminalCommand(terminalArgs);
      
    case "vibe_recap":
      const recapArgs = VibeRecapArgsSchema.parse(args || {});
      return await generateRecap(recapArgs);
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### MCP Protocol Requirements

1. **Must Have These Handlers**:
   - `ListToolsRequestSchema` - Returns available tools
   - `CallToolRequestSchema` - Executes tools
   - `ListResourcesRequestSchema` - Return empty array
   - `ListPromptsRequestSchema` - Return empty array

2. **Response Format**:
   ```typescript
   return {
     content: [{ type: "text", text: "Your output here" }],
     isError?: boolean  // Optional error flag
   };
   ```

3. **Error Handling Pattern**:
   ```typescript
   try {
     // Tool execution
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : String(error);
     return {
       content: [{ type: "text", text: `Error: ${errorMessage}` }],
       isError: true
     };
   }
   ```

### Package Dependencies for MCP

From both projects' package.json:
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "zod": "^3.22.4",
    "zod-to-json-schema": "^3.22.5",
    "node-pty": "^1.0.0"  // For Vibe Dev
  }
}
```

### Entry Point Setup (index.ts)

**Study**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/src/index.ts`
**Also See**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/Recap/src/custom-stdio.ts`

**Pattern for Vibe Dev**:
```typescript
#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from './server.js';

async function runServer() {
  console.error("Vibe Dev: Starting server...");
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Vibe Dev: Server running");
}

runServer().catch((error) => {
  console.error("Vibe Dev: Fatal error:", error);
  process.exit(1);
});
```

**Important Notes**:
- Use `console.error()` for logging (stdout is for MCP protocol)
- Handle errors gracefully
- RecapMCP uses FilteredStdioServerTransport to prevent JSON parse errors
- Consider adding process event handlers for cleanup

---

**Remember**: These files show what's possible with limited data. You have FULL terminal access. Make it revolutionary.
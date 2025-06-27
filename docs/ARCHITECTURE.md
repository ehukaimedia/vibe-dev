# Vibe Dev Architecture

> Simple by design. Powerful by nature.

## Core Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  vibe_terminal  │     │   vibe_recap    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────┴──────┐
              │   Session   │
              │   Manager   │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │  Real PTY   │
              │  Terminal   │
              └─────────────┘
```

## Design Principles

### 1. Two Tools Only
- No feature creep
- Every capability fits in these tools
- Complexity goes inside, not outside

### 2. Real Terminal Sessions
- Not command wrappers
- Actual PTY (pseudo-terminal) sessions
- Full state preservation

### 3. Instant Response
- Performance is a feature
- <1s is the law
- Optimize everything

### 4. Intelligent Analysis
- Pattern recognition over rules
- Learn from output, not just commands
- Suggest, don't prescribe

## Key Components

### Session Manager
- Maintains terminal state between calls
- Handles process lifecycle
- Manages environment persistence
- Tracks command metadata (output, exit codes, timing)

### Intelligence Engine
- Embedded in vibe_recap
- Analyzes command patterns
- Recognizes developer workflows
- Suggests contextual next actions
- Tracks intent across sessions

### Performance Layer
- Aggressive caching
- Lazy initialization
- Stream processing
- Minimal dependencies
- Efficient PTY communication

## Technical Decisions

### Why PTY?
- Real terminal emulation
- Supports interactive commands
- Preserves ANSI colors
- Handles special characters
- Complete session state

### Why TypeScript?
- Type safety for tool contracts
- Better IDE support
- Self-documenting code
- Compile-time optimization
- MCP protocol alignment

### Why Two Tools?
- Clarity of purpose
- Easy to understand
- Hard to misuse
- Infinitely composable
- Focused optimization

## Data Flow

1. **vibe_terminal** receives command
2. Session Manager finds/creates session
3. Command executes in real PTY
4. Output captured with timing
5. Metadata tracked (pwd, exit code, duration)
6. State preserved for next call
7. **vibe_recap** analyzes history
8. Intelligence engine finds patterns
9. Contextual suggestions generated

## Session State Management

### What We Track
```typescript
interface SessionState {
  // Core PTY state
  pty: IPty;              // Active terminal
  pid: number;            // Process ID
  
  // Command history
  commands: Command[];    // All executed commands
  
  // Current state
  workingDirectory: string;
  environment: Record<string, string>;
  lastExitCode: number;
  sessionStartTime: Date;
}

interface Command {
  input: string;
  output: string;
  exitCode: number;
  workingDirectory: string;
  timestamp: Date;
  duration: number;
}
```

### State Persistence Strategy
- In-memory during session
- PTY maintains actual state
- Metadata synced on each command
- Graceful recovery on reconnect

## Performance Strategy

### Startup (<100ms)
- Lazy load dependencies
- Pre-warmed session pool
- Minimal initialization
- Async module loading

### Execution (<1s)
- Direct PTY communication
- No intermediate parsing
- Stream output immediately
- Efficient buffer management

### Analysis (<500ms)
- Incremental pattern matching
- Cached workflow detection
- Parallel insight generation
- Smart data windowing

## Security Model

- No command injection
- Sandboxed execution
- Environment isolation
- Safe path handling
- Controlled PTY access

## Error Handling Philosophy

### Graceful Degradation
```typescript
// Always return something useful
try {
  return await executePTY(command);
} catch (error) {
  return {
    output: '',
    exitCode: 1,
    error: error.message
  };
}
```

### Recovery Over Failure
- Session dies? Create new one
- PTY hangs? Timeout and restart
- Network drops? Session continues
- Always provide actionable info

## Extension Points

While keeping two tools, we allow:
- Custom shell configurations
- Workflow pattern plugins
- Performance monitoring hooks
- Output transformation
- Intelligence customization

## Anti-Patterns

What we explicitly avoid:
- ❌ Adding a third tool
- ❌ Complex configuration
- ❌ Synchronous blocking
- ❌ State in global scope
- ❌ Breaking changes to API
- ❌ Feature creep
- ❌ Over-engineering

## Implementation Guidelines

### Code Organization
```
src/
├── index.ts              # MCP server entry
├── vibe-terminal.ts      # Terminal tool
├── vibe-recap.ts         # Recap tool
├── session-manager.ts    # Session handling
├── intelligence.ts       # Pattern analysis
└── types.ts             # Shared types
```

### Key Interfaces
```typescript
// Tool contract (MCP compliant)
interface Tool {
  name: string;
  description: string;
  inputSchema: Schema;
  execute: (args: any) => Promise<any>;
}

// Terminal result
interface TerminalResult {
  output: string;
  exitCode: number;
  duration?: number;
  error?: string;
}

// Recap options
interface RecapOptions {
  hours?: number;
  type?: 'full' | 'status' | 'summary';
  format?: 'text' | 'json';
}
```

## Future Architecture

The architecture supports future capabilities without new tools:
- Multi-session management
- Distributed execution
- Real-time collaboration
- AI-powered suggestions
- Advanced pattern learning

All through the same two tools.

## Performance Benchmarks

Target metrics we maintain:
- Tool startup: <100ms
- Simple command: <200ms
- Complex command: <1s
- Recap analysis: <500ms
- Memory per session: <50MB

---

*Architecture serves the vision: Two tools, infinite capability, instant response.*
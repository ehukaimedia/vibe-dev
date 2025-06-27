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

### Intelligence Engine
- Embedded in vibe_recap
- Analyzes command patterns
- Recognizes developer workflows
- Suggests contextual next actions

### Performance Layer
- Aggressive caching
- Lazy initialization
- Stream processing
- Minimal dependencies

## Technical Decisions

### Why PTY?
- Real terminal emulation
- Supports interactive commands
- Preserves ANSI colors
- Handles special characters

### Why TypeScript?
- Type safety for tool contracts
- Better IDE support
- Self-documenting code
- Compile-time optimization

### Why Two Tools?
- Clarity of purpose
- Easy to understand
- Hard to misuse
- Infinitely composable

## Data Flow

1. **vibe_terminal** receives command
2. Session Manager finds/creates session
3. Command executes in real PTY
4. Output captured with timing
5. State preserved for next call
6. **vibe_recap** analyzes history
7. Intelligence engine finds patterns
8. Contextual suggestions generated

## Performance Strategy

### Startup (<100ms)
- Lazy load dependencies
- Pre-warmed session pool
- Minimal initialization

### Execution (<1s)
- Direct PTY communication
- No intermediate parsing
- Stream output immediately

### Analysis (<500ms)
- Incremental pattern matching
- Cached workflow detection
- Parallel insight generation

## Security Model

- No command injection
- Sandboxed execution
- Environment isolation
- Safe path handling

## Extension Points

While keeping two tools, we allow:
- Custom shell configurations
- Workflow pattern plugins
- Performance monitoring hooks
- Output transformation

## Anti-Patterns

What we explicitly avoid:
- ❌ Adding a third tool
- ❌ Complex configuration
- ❌ Synchronous blocking
- ❌ State in global scope
- ❌ Breaking changes to API

## Future Architecture

The architecture supports future capabilities without new tools:
- Multi-session management
- Distributed execution
- Real-time collaboration
- AI-powered suggestions

All through the same two tools.

---

*Architecture serves the vision: Two tools, infinite capability, instant response.*

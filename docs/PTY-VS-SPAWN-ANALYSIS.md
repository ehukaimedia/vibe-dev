# PTY vs Spawn: Understanding the gh CLI Issue

## The Problem
vibe-dev uses `node-pty` to create a pseudo-terminal, while Desktop Commander uses Node's `spawn`. This fundamental difference explains why `gh` works with execute_command but fails with vibe_terminal.

## Technical Analysis

### vibe-dev Approach (PTY)
```typescript
// From vibe-terminal.ts
this.pty = pty.spawn(defaultShell, [], {
  name: 'xterm-256color',    // Declares terminal type
  cols: 80,
  rows: 24,
  cwd: this.currentWorkingDirectory,
  env: { ...process.env }
});
```

**Pros:**
- Full terminal emulation
- Supports interactive programs (vim, nano, etc.)
- Maintains shell state (cd, environment variables)
- Proper handling of ANSI colors and formatting

**Cons:**
- Triggers terminal capability queries from smart CLIs
- More complex to handle all terminal protocols
- Can cause issues with tools expecting simple pipes

### Desktop Commander Approach (spawn)
```typescript
// From terminal-manager.ts
const process = spawn(command, [], { 
  shell: shellToUse    // Just runs in a shell, no terminal emulation
});
```

**Pros:**
- Simple process execution
- No terminal protocol overhead
- Works with all CLI tools
- Easier to implement

**Cons:**
- No terminal features (colors might not work)
- Can't run interactive programs properly
- Each command is isolated (no persistent state)

## Why gh Fails with PTY

When `gh` detects it's running in a terminal (via PTY), it sends:
1. `]11;?` - "What's your background color?"
2. `[6n` - "Where's the cursor?"

These are standard terminal queries that vibe-dev's PTY implementation doesn't respond to, causing gh to wait for responses that never come.

## Proposed Solutions

### 1. Hybrid Approach (Recommended)
```typescript
class VibeTerminal {
  // Use PTY for interactive commands
  async executeInteractive(command: string) {
    return this.executePty(command);
  }
  
  // Use spawn for tool commands
  async executeTool(command: string) {
    return this.executeSpawn(command);
  }
  
  // Auto-detect based on command
  async executeTerminalCommand(command: string) {
    const toolCommands = ['gh', 'aws', 'gcloud', 'az'];
    const baseCmd = command.split(' ')[0];
    
    if (toolCommands.includes(baseCmd)) {
      return this.executeSpawn(command);
    }
    return this.executePty(command);
  }
}
```

### 2. Handle Terminal Queries
```typescript
// Respond to terminal capability queries
this.pty.onData((data) => {
  if (data.includes('\x1b]11;?')) {
    // Respond with background color
    this.pty.write('\x1b]11;rgb:0000/0000/0000\x07');
  }
  if (data.includes('\x1b[6n')) {
    // Respond with cursor position
    this.pty.write('\x1b[1;1R');
  }
});
```

### 3. Force Non-Interactive Mode
```typescript
env: {
  ...process.env,
  GH_FORCE_TTY: '0',          // Force gh to not use TTY features
  CI: 'true',                 // Many tools check this
  TERM: 'dumb',              // Declare minimal terminal capabilities
}
```

## Recommendation

Implement the hybrid approach. It maintains vibe-dev's advantages for interactive use while ensuring compatibility with all CLI tools. This gives users the best of both worlds:

- Full terminal features when needed (vim, interactive prompts)
- Reliable execution for automation tools (gh, CI/CD tools)
- Maintains the session persistence that makes vibe-dev unique

## Testing Strategy

```typescript
// Test both modes
const tests = [
  // PTY mode tests
  { cmd: 'cd /tmp && pwd', expected: '/tmp', mode: 'pty' },
  { cmd: 'export FOO=bar && echo $FOO', expected: 'bar', mode: 'pty' },
  
  // Spawn mode tests  
  { cmd: 'gh --version', expected: /gh version \d+/, mode: 'spawn' },
  { cmd: 'git --version', expected: /git version/, mode: 'spawn' },
  
  // Auto-detection tests
  { cmd: 'gh auth status', shouldUseSpawn: true },
  { cmd: 'vim test.txt', shouldUsePty: true },
];
```

This approach preserves vibe-dev's core value (intelligent terminal with persistence) while fixing the compatibility issues that prevent real-world usage.
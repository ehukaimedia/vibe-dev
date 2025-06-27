# Vibe Dev API Reference

> Two tools. Complete documentation.

## Overview

Vibe Dev provides two MCP tools for intelligent terminal operations:

```typescript
import { vibe_terminal, vibe_recap } from 'vibe-dev';
```

## vibe_terminal

Execute commands with persistent session state.

### Signature

```typescript
async function vibe_terminal(
  command: string,
  options?: TerminalOptions
): Promise<TerminalResult>
```

### Parameters

#### `command` (string, required)
The shell command to execute. Supports:
- Simple commands: `ls`, `pwd`, `echo "hello"`
- Complex commands: `find . -name "*.js" | grep test`
- Interactive commands: `vim`, `top`, `npm init`
- Multi-line commands with `\` continuation

#### `options` (TerminalOptions, optional)
```typescript
interface TerminalOptions {
  timeout?: number;      // Max execution time in ms (default: 30000)
  env?: Record<string, string>;  // Additional env vars
  shell?: string;        // Shell to use (default: system shell)
  cwd?: string;         // Working directory (overrides session)
}
```

### Returns

```typescript
interface TerminalResult {
  output: string;      // Command output (ANSI stripped)
  exitCode: number;    // Exit code (0 = success)
  duration?: number;   // Execution time in ms
  error?: string;      // Error message if failed
}
```

### Examples

#### Basic Usage
```typescript
// Simple command
const result = await vibe_terminal('ls -la');
console.log(result.output);

// Check exit code
const test = await vibe_terminal('npm test');
if (test.exitCode !== 0) {
  console.error('Tests failed!');
}
```

#### Session Persistence
```typescript
// Working directory persists
await vibe_terminal('cd /tmp');
const pwd = await vibe_terminal('pwd');
console.log(pwd.output); // "/tmp\n"

// Environment persists
await vibe_terminal('export API_KEY=secret123');
const key = await vibe_terminal('echo $API_KEY');
console.log(key.output); // "secret123\n"

// Virtual environments persist
await vibe_terminal('python -m venv myenv');
await vibe_terminal('source myenv/bin/activate');
await vibe_terminal('pip install requests'); // Installs in venv
```

#### Advanced Usage
```typescript
// With timeout
const slow = await vibe_terminal('sleep 60', { 
  timeout: 5000 
});
console.log(slow.error); // "Command timed out"

// With environment
const custom = await vibe_terminal('echo $NODE_ENV', {
  env: { NODE_ENV: 'production' }
});

// Complex commands
const pipeline = await vibe_terminal(
  'cat package.json | jq .dependencies | grep "^"'
);
```

### Error Handling

Commands that fail return with non-zero exit codes:
```typescript
const fail = await vibe_terminal('exit 1');
console.log(fail.exitCode); // 1
console.log(fail.output);   // "" (empty)

const notFound = await vibe_terminal('nonexistent-command');
console.log(notFound.exitCode); // 127
console.log(notFound.output);   // "bash: nonexistent-command: command not found\n"
```

## vibe_recap

Get intelligent analysis of recent terminal activity.

### Signature

```typescript
async function vibe_recap(
  options?: RecapOptions
): Promise<RecapResult>
```

### Parameters

```typescript
interface RecapOptions {
  hours?: number;    // Hours of history (default: 1, max: 24)
  type?: RecapType;  // Analysis type (default: 'full')
  format?: Format;   // Output format (default: 'text')
}

type RecapType = 'full' | 'status' | 'summary';
type Format = 'text' | 'json';
```

### Returns

```typescript
interface RecapResult {
  // For text format
  summary: string;          // Natural language summary
  insights?: string[];      // Key observations
  nextActions?: string[];   // Suggested commands
  
  // For JSON format (includes above plus)
  metrics?: {
    commandCount: number;
    errorCount: number;
    duration: number;     // Total time in ms
    successRate: number;  // Percentage
  };
  
  workflow?: {
    type: string;         // e.g., "Node.js Development"
    confidence: number;   // 0-100
    phase: string;        // e.g., "Testing"
  };
  
  recovery?: {
    lastCommand: string;
    workingDirectory: string;
    environment: string[];
    resumeCommands: string[];
  };
}
```

### Recap Types

#### `full` - Comprehensive Analysis
Provides complete workflow analysis with:
- Chronological command history
- Pattern recognition
- Intent detection
- Next action suggestions
- Recovery information

#### `status` - Quick Status Check
Focused on current state:
- What you're working on
- Recent errors or issues
- Immediate next steps
- Current environment

#### `summary` - Brief Overview
High-level summary:
- Main activity
- Key metrics
- Overall progress

### Examples

#### Basic Usage
```typescript
// Last hour of activity
const recap = await vibe_recap();
console.log(recap.summary);
// "You've been debugging a Node.js API, focusing on auth endpoints"

// Quick status
const status = await vibe_recap({ type: 'status' });
console.log(status.nextActions);
// ["git add -A", "git commit -m 'fix: auth middleware'", "npm test"]
```

#### Disconnect Recovery
```typescript
// After disconnection
const recovery = await vibe_recap({ 
  hours: 4, 
  type: 'full' 
});

console.log(recovery.summary);
// "Disconnection detected. You were implementing JWT auth..."

console.log(recovery.recovery.resumeCommands);
// ["cd ~/project/api", "source venv/bin/activate", "npm test auth.spec.js"]
```

#### JSON Format for Automation
```typescript
const data = await vibe_recap({ 
  format: 'json',
  hours: 8 
});

if (data.metrics.errorCount > 5) {
  console.warn('High error rate detected');
}

if (data.workflow.type === 'Python Development') {
  console.log('Python workflow detected');
}
```

### Intelligence Features

#### Workflow Recognition
Recognizes common development patterns:
- Node.js/npm workflows
- Python/pip workflows
- Git operations
- Docker workflows
- Testing patterns
- Debugging sessions

#### Intent Detection
Understands what you're trying to accomplish:
- Feature implementation
- Bug fixing
- Testing
- Deployment
- Environment setup

#### Smart Suggestions
Provides contextual next actions based on:
- Current state
- Recent patterns
- Common workflows
- Error recovery

## Session Management

### How Sessions Work

1. **Automatic Creation**: First command creates a session
2. **Persistence**: Session maintains state between commands
3. **Isolation**: Each Claude conversation has its own session
4. **Cleanup**: Sessions timeout after 30 minutes of inactivity

### Session State Includes

- Working directory
- Environment variables
- Shell aliases and functions
- Command history
- Active virtual environments
- Background processes

### Session Limits

- Max session duration: 24 hours
- Max idle time: 30 minutes
- Max output per command: 1MB
- Max concurrent sessions: 10

## Performance Characteristics

### Expected Performance

| Operation | Target Time | Max Time |
|-----------|------------|----------|
| Simple command (`echo`) | <100ms | 200ms |
| File operation (`ls`) | <200ms | 500ms |
| Network command (`curl`) | <1s | 5s |
| Recap analysis | <500ms | 1s |

### Performance Tips

1. **Use specific time ranges** for recap
2. **Set appropriate timeouts** for long commands
3. **Avoid unnecessary session creation**
4. **Use `status` type for quick checks**

## Best Practices

### Command Execution

```typescript
// ✅ Good: Let session handle state
await vibe_terminal('cd project');
await vibe_terminal('npm install');

// ❌ Bad: Fighting session state
await vibe_terminal('cd project && npm install && cd ..');
```

### Error Handling

```typescript
// ✅ Good: Check exit codes
const result = await vibe_terminal('npm test');
if (result.exitCode !== 0) {
  const recap = await vibe_recap({ type: 'status' });
  console.log('Test failed. Recent context:', recap.summary);
}

// ❌ Bad: Ignoring failures
await vibe_terminal('npm test');
await vibe_terminal('npm run deploy'); // Might deploy broken code!
```

### Performance

```typescript
// ✅ Good: Appropriate analysis window
const recent = await vibe_recap({ hours: 2 });

// ❌ Bad: Analyzing too much history
const everything = await vibe_recap({ hours: 24 }); // Slow!
```

## Common Patterns

### Development Workflow
```typescript
// Start development
await vibe_terminal('cd ~/projects/myapp');
await vibe_terminal('git pull');
await vibe_terminal('npm install');
await vibe_terminal('npm run dev');

// Make changes and test
await vibe_terminal('npm test');

// Check what you've done
const recap = await vibe_recap({ hours: 1 });
console.log(recap.summary);
```

### Debugging Session
```typescript
// Reproduce issue
await vibe_terminal('npm run test:specific');

// Check details
await vibe_terminal('cat test.log | grep ERROR');

// Get analysis
const debug = await vibe_recap({ type: 'full' });
console.log('Debugging insights:', debug.insights);
```

### Recovery Pattern
```typescript
try {
  // Your work...
  await vibe_terminal('complex-operation');
} catch (error) {
  // Disconnected? Recover:
  const recovery = await vibe_recap({ hours: 4 });
  console.log('To resume:', recovery.recovery.resumeCommands);
}
```

---

*Two tools. Complete capability. Instant intelligence.*
# Vibe Dev API Reference

> Two tools. Complete documentation.

## Overview

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

- `command` (string) - The command to execute
- `options` (optional) - Configuration options
  - `shell` - Shell to use (default: system shell)
  - `cwd` - Working directory (default: previous cwd)
  - `env` - Environment variables (merged with session)
  - `timeout` - Max execution time in ms (default: 30000)

### Returns

```typescript
interface TerminalResult {
  stdout: string;      // Command output
  stderr: string;      // Error output
  exitCode: number;    // Exit code
  duration: number;    // Execution time in ms
}
```

### Examples

```typescript
// Simple command
const result = await vibe_terminal('ls -la');
console.log(result.stdout);

// Change directory (persists!)
await vibe_terminal('cd /project');
await vibe_terminal('pwd'); // Still in /project

// Python virtual environment (persists!)
await vibe_terminal('python -m venv env');
await vibe_terminal('source env/bin/activate');
await vibe_terminal('pip install requests'); // Installs in venv

// With options
const result = await vibe_terminal('npm install', {
  timeout: 60000,
  cwd: '/app'
});
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

- `options` (optional) - Configuration
  - `hours` - Hours of history to analyze (default: 1)
  - `format` - Output format: 'text' | 'json' (default: 'text')
  - `type` - Analysis type: 'full' | 'status' | 'summary' (default: 'full')

### Returns

```typescript
interface RecapResult {
  summary: string;          // Natural language summary
  insights?: string[];      // Key observations
  nextActions?: string[];   // Suggested next commands
  metrics?: {
    commandCount: number;   // Total commands run
    errorCount: number;     // Failed commands
    duration: number;       // Total time spent
  };
}
```

### Examples

```typescript
// Get last hour's activity
const recap = await vibe_recap();
console.log(recap.summary);
// "You've been setting up a React project with TypeScript"

// Get specific analysis
const status = await vibe_recap({ 
  type: 'status',
  hours: 0.5 
});
console.log(status.nextActions);
// ["npm start", "git add -A", "npm test"]

// JSON format for processing
const data = await vibe_recap({ 
  format: 'json',
  hours: 24 
});
```

## Session Persistence

Vibe Dev maintains a real terminal session. This means:

1. **Working Directory**: `cd` commands persist
2. **Environment**: Variables and activation persist  
3. **Shell State**: Aliases, functions persist
4. **History**: Previous commands affect behavior

## Performance Targets

- `vibe_terminal`: <1s response time
- `vibe_recap`: <500ms analysis time
- Session startup: <100ms
- Memory usage: <50MB per session

## Error Handling

Both tools throw typed errors:

```typescript
try {
  await vibe_terminal('false');
} catch (error) {
  if (error.exitCode === 1) {
    console.log('Command failed');
  }
}
```

## Best Practices

1. **Let sessions persist**: Don't reset unless needed
2. **Use recap for context**: Check what you were doing
3. **Trust the intelligence**: Follow suggested actions
4. **Keep commands simple**: One action per call

---

*Two tools. Complete capability. Instant response.*

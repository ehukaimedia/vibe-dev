# Vibe Dev Development Guide

> How to build the intelligent choice for developers.

## Getting Started

### Prerequisites
- Node.js 18+
- TypeScript 5+
- Git

### Setup
```bash
git clone https://github.com/ehukaimedia/vibe-dev-mvp.git
cd vibe-dev-mvp
npm install
npm run build
npm test
```

## Development Principles

### 1. Two Tools Only
Everything fits in:
- `vibe_terminal` - Command execution
- `vibe_recap` - Intelligent analysis

No third tool. Ever.

### 2. Performance First
- Every feature must maintain <1s response
- Measure before and after
- If it's slower, it doesn't ship

### 3. Real Intelligence
- Analyze output, not commands
- Understand workflows, not syntax
- Suggest actions, not rules

## Project Structure

```
vibe-dev-mvp/
├── src/
│   ├── index.ts          # Exports both tools
│   ├── vibe-terminal.ts  # Terminal execution
│   └── vibe-recap.ts     # Intelligence engine
├── test/
│   └── index.test.ts     # Test suite
├── docs/                 # Eight Sacred Documents
└── dist/                 # Compiled output
```

## Building Features

### Step 1: Define Success
What makes this better for developers?
- Faster? By how much?
- Smarter? What patterns?
- More reliable? Which edge cases?

### Step 2: Write Tests First
See [TDD-WORKFLOW.md](TDD-WORKFLOW.md)

### Step 3: Implement Minimally
Simplest code that passes tests.

### Step 4: Optimize Performance
Make it fast. Then make it faster.

### Step 5: Measure Impact
Document the improvement in STATUS.md

## Code Standards

### TypeScript
```typescript
// Always explicit return types
export async function vibe_terminal(
  command: string,
  options?: TerminalOptions
): Promise<TerminalResult> {
  // Implementation
}

// No any without comment
const data: any; // TODO: Type after parsing
```

### Performance
```typescript
// Always measure
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
if (duration > 100) {
  console.warn(`Slow operation: ${duration}ms`);
}
```

### Error Handling
```typescript
// Graceful failures
try {
  return await executeCommand(cmd);
} catch (error) {
  return {
    stdout: '',
    stderr: error.message,
    exitCode: 1,
    duration: 0
  };
}
```

## Common Tasks

### Add a Feature
1. Update STATUS.md with the plan
2. Write failing tests
3. Implement minimally
4. Optimize for <1s
5. Update docs if needed
6. Commit with metrics

### Fix a Bug
1. Write test that reproduces it
2. Fix the bug
3. Ensure all tests pass
4. Add edge case tests
5. Update STATUS.md

### Improve Performance
1. Benchmark current state
2. Identify bottleneck
3. Optimize
4. Benchmark again
5. Document improvement

## Debugging

### Terminal Issues
```bash
# Enable debug logging
DEBUG=vibe:* npm test

# Test specific command
node -e "import('./dist/index.js').then(m => m.vibe_terminal('ls').then(console.log))"
```

### Performance Issues
```typescript
// Add timing logs
console.time('operation');
// ... code ...
console.timeEnd('operation');
```

## Testing

### Run Tests
```bash
npm test              # All tests
npm run test:watch    # Watch mode
npm run test:perf     # Performance only
```

### Write Tests
- Every feature needs tests
- Every test needs performance assertions
- Test real workflows, not units

## Commit Guidelines

### Format
```
[type]: [description]

[Detailed explanation]
[Performance metrics]

HANDOFF: [What's next]
```

### Types
- `perf`: Performance improvement
- `feat`: New capability
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Test addition/improvement

### Example
```
perf: reduce vibe_terminal response by 60%

Changed sync parsing to streaming
Before: 2.5s average
After: 1.0s average
Tested on: Mac M1, Windows 11

HANDOFF: Optimize vibe_recap next
```

## Resources

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [API.md](API.md) - Tool specifications
- [WORKFLOW.md](WORKFLOW.md) - Session workflow
- [STATUS.md](STATUS.md) - Current progress

---

*Build fast. Build smart. Build simple.*

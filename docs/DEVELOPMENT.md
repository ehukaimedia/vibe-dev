# Vibe Dev Development Guide

> How to build the intelligent choice for developers.

## Getting Started

### Prerequisites
- Node.js 20+
- TypeScript 5+
- Git
- Claude Desktop (for testing)

### Setup
```bash
git clone https://github.com/ehukaimedia/vibe-dev.git
cd vibe-dev
npm install
npm run build
npm test
```

### Configure Claude Desktop
Add to `claude_desktop_config.json`:
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

### 4. Simplicity Wins
- Less code is better code
- Clear over clever
- Maintain over create

## Project Structure

```
vibe-dev/
├── src/
│   ├── index.ts             # MCP server entry
│   ├── vibe-terminal.ts     # Terminal tool
│   ├── vibe-recap.ts        # Recap tool
│   ├── session-manager.ts   # Session handling
│   ├── intelligence.ts      # Pattern analysis
│   └── types.ts            # TypeScript types
├── test/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── performance/        # Performance tests
├── docs/                   # Eight Sacred Documents
│   └── claude-handoffs/    # Handoff documents
├── test-env/              # Test file system
├── test-venv/             # Python test env
└── dist/                  # Compiled output
```

## Development Workflow

### For Claude Desktop (Testing)

1. **Never edit source directly**
2. **Test thoroughly with vibe tools**
3. **Create detailed handoffs**
4. **Update STATUS.md**

### For Claude Code (Implementation)

1. **Read handoffs carefully**
2. **Write tests first (TDD)**
3. **Implement minimally**
4. **Optimize for performance**
5. **Create response handoff**
6. **NEVER git push/pull without explicit authorization**

## Code Standards

### TypeScript Guidelines

```typescript
// Always explicit return types
export async function vibe_terminal(
  command: string,
  options?: TerminalOptions
): Promise<TerminalResult> {
  // Implementation
}

// Use interfaces for contracts
interface TerminalResult {
  output: string;
  exitCode: number;
  duration?: number;
  error?: string;
}

// No any without comment
let data: any; // TODO: Type after parsing JSON

// Prefer const
const SESSION_TIMEOUT = 30000;

// Use early returns
if (!command) {
  return { output: '', exitCode: 1, error: 'No command provided' };
}
```

### Performance Standards

```typescript
// Always measure critical paths
const start = performance.now();
const result = await executeCommand(cmd);
const duration = performance.now() - start;

if (duration > 1000) {
  console.warn(`Slow execution: ${duration}ms for ${cmd}`);
}

// Include duration in results
return { ...result, duration };
```

### Error Handling

```typescript
// Graceful failures with useful info
try {
  return await executePTY(command);
} catch (error) {
  // Don't throw - return error result
  return {
    output: '',
    exitCode: 1,
    error: error.message,
    duration: 0
  };
}

// Always provide recovery path
if (!session.isAlive()) {
  session = await createNewSession();
}
```

## Building Features

### Step 1: Define Success
What makes this better for developers?
- **Faster?** Measure current vs target time
- **Smarter?** Define patterns to recognize
- **More reliable?** Identify edge cases to handle
- **Simpler?** Count lines to remove

### Step 2: Write Tests First
See [TDD-WORKFLOW.md](TDD-WORKFLOW.md) for details

### Step 3: Implement Minimally
```typescript
// Start with the simplest thing that could work
export async function newFeature(input: string): Promise<string> {
  return `TODO: Process ${input}`;
}
```

### Step 4: Make It Real
```typescript
// Now implement properly
export async function newFeature(input: string): Promise<string> {
  const processed = await processInput(input);
  return formatOutput(processed);
}
```

### Step 5: Optimize Performance
```typescript
// Measure and improve
const cached = cache.get(input);
if (cached) return cached;

const result = await processInput(input);
cache.set(input, result);
return result;
```

### Step 6: Document Impact
Update STATUS.md with measurable improvement

## Common Tasks

### Fix Output Isolation Bug
```bash
# 1. Write failing test
echo "test('output isolation', async () => {
  const r1 = await vibe_terminal('echo first');
  const r2 = await vibe_terminal('echo second');
  expect(r2.output).toBe('second\n');
});" >> test/unit/vibe-terminal.test.ts

# 2. Run test (should fail)
npm test -- test/unit/vibe-terminal.test.ts

# 3. Fix the code
# Edit src/vibe-terminal.ts to return only current output

# 4. Run test (should pass)
npm test -- test/unit/vibe-terminal.test.ts

# 5. Run all tests
npm test

# 6. Update STATUS.md
```

### Add Intelligence Pattern
```typescript
// 1. Define the pattern in src/intelligence.ts
const PATTERNS = {
  nodejs: {
    indicators: ['package.json', 'npm install', 'node_modules'],
    confidence: (matches: number) => matches / 3,
    insights: ['Node.js project detected']
  }
};

// 2. Test pattern recognition
test('recognizes Node.js workflow', async () => {
  await vibe_terminal('npm init -y');
  const recap = await vibe_recap();
  expect(recap.insights).toContain('Node.js project detected');
});
```

### Improve Performance
```typescript
// 1. Benchmark current state
const baseline = await benchmark('vibe_terminal', 100);
console.log(`Baseline: ${baseline}ms average`);

// 2. Profile to find bottleneck
console.profile('vibe_terminal');
await vibe_terminal('echo test');
console.profileEnd();

// 3. Optimize hotspot
// Example: Replace sync with async
// Before: fs.readFileSync()
// After: await fs.promises.readFile()

// 4. Benchmark again
const improved = await benchmark('vibe_terminal', 100);
console.log(`Improved: ${improved}ms average`);
console.log(`Speedup: ${((baseline - improved) / baseline * 100).toFixed(1)}%`);
```

## Debugging

### Enable Debug Logging
```bash
# Set debug environment variable
DEBUG=vibe:* npm test

# Or in code
if (process.env.DEBUG?.includes('vibe')) {
  console.log('[vibe:terminal]', command, result);
}
```

### Test Specific Commands
```javascript
// Quick test without full build
node -e "
  import('./dist/index.js').then(m => 
    m.vibe_terminal('ls -la').then(console.log)
  )
"
```

### Profile Performance
```typescript
// Add profiling to slow operations
console.time('pty-creation');
const pty = await createPTY();
console.timeEnd('pty-creation');
```

## Commit Guidelines

### Format
```
[type]: [specific, measurable improvement]

[What changed]
[Why it matters]
[Performance impact]

HANDOFF: [Next action for next developer]
```

### Types
- `perf`: Performance improvement
- `feat`: New capability
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Test improvements
- `refactor`: Code improvement (no behavior change)

### Examples
```
perf: reduce vibe_terminal response by 60%

- Changed sync file reads to async
- Removed unnecessary buffer copies
- Before: 2.5s average
- After: 1.0s average
- Tested on: Mac M1, Windows 11

HANDOFF: vibe_recap still slow, needs similar optimization
```

```
fix: isolate command output properly

- Fixed accumulation bug in command history
- Each command now returns only its output
- Added regression test
- Closes #issue-from-handoff

HANDOFF: Exit codes still bleeding between commands
```

## Quality Checklist

Before committing:
- [ ] Tests pass (`npm test`)
- [ ] Performance maintained (`npm run test:performance`)
- [ ] Types check (`npm run type-check`)
- [ ] Linting clean (`npm run lint`)
- [ ] STATUS.md updated
- [ ] Measurable improvement documented

## Resources

### Internal Docs
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [WORKFLOW.md](WORKFLOW.md) - Development flow
- [TDD-WORKFLOW.md](TDD-WORKFLOW.md) - Test approach
- [API.md](API.md) - Tool specifications

### External References
- [MCP Protocol](https://github.com/anthropics/mcp) - Tool protocol
- [node-pty](https://github.com/microsoft/node-pty) - PTY library
- Study patterns in reference projects (don't copy)

## The Developer Experience

Remember: We're building for developers who:
- Value speed over features
- Need reliability over promises
- Want simplicity over complexity
- Prefer intelligence over configuration

Every line of code should make their life better.

---

*Build fast. Build smart. Build simple. Ship excellence.*
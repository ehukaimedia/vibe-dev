# TDD Workflow for Vibe Dev

> Test-Driven Development: Prove it works before you build it.

## The TDD Philosophy

**For Claude Desktop**: Write tests that demonstrate issues
**For Claude Code**: Write tests before implementing fixes

## Test Environment Setup

We have dedicated test environments:
- `test-env/` - For test environment files
- `test-venv/` - For Python virtual environment testing

## The TDD Cycle

### 1. Red: Write a Failing Test
```typescript
// Start with the behavior you want
test('vibe_terminal returns only its own output', async () => {
  const result1 = await vibe_terminal('echo first');
  const result2 = await vibe_terminal('echo second');
  
  // This should fail initially
  expect(result2.output).toBe('second\n');
  expect(result2.output).not.toContain('first');
});
```

### 2. Green: Make It Pass (Minimal)
```typescript
// Simplest code that makes the test pass
export async function vibe_terminal(command: string): Promise<TerminalResult> {
  const result = await executeInPTY(command);
  // Fix: Return only current command output
  return {
    output: result.currentOutput,  // Not accumulated
    exitCode: result.exitCode,
    duration: result.duration
  };
}
```

### 3. Refactor: Make It Right
```typescript
// Now make it clean and efficient
export async function vibe_terminal(command: string): Promise<TerminalResult> {
  const session = await sessionManager.getOrCreate();
  const result = await session.execute(command);
  
  // Track but don't accumulate
  session.addToHistory({
    command,
    output: result.output,
    exitCode: result.exitCode,
    timestamp: new Date()
  });
  
  return result;
}
```

## Core Test Categories

### 1. Functionality Tests
```typescript
describe('Core vibe_terminal', () => {
  test('executes basic commands', async () => {
    const result = await vibe_terminal('echo "Hello Vibe"');
    expect(result.output).toContain('Hello Vibe');
    expect(result.exitCode).toBe(0);
  });

  test('handles command errors gracefully', async () => {
    const result = await vibe_terminal('false');
    expect(result.exitCode).toBe(1);
    expect(result.error).toBeUndefined();
  });

  test('maintains session between commands', async () => {
    await vibe_terminal('cd /tmp');
    const result = await vibe_terminal('pwd');
    expect(result.output.trim()).toBe('/tmp');
  });
});
```

### 2. Performance Tests (Critical!)
```typescript
describe('Performance Requirements', () => {
  test('responds in under 1 second', async () => {
    const start = Date.now();
    await vibe_terminal('echo test');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
    console.log(`Response time: ${duration}ms`);
  });

  test('handles rapid commands efficiently', async () => {
    const times = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await vibe_terminal(`echo test${i}`);
      times.push(Date.now() - start);
    }
    const avg = times.reduce((a, b) => a + b) / times.length;
    expect(avg).toBeLessThan(200);
  });
});
```

### 3. Session State Tests
```typescript
describe('Session Persistence', () => {
  test('preserves working directory', async () => {
    const original = await vibe_terminal('pwd');
    await vibe_terminal('cd /tmp');
    const changed = await vibe_terminal('pwd');
    await vibe_terminal('cd -');
    const restored = await vibe_terminal('pwd');
    
    expect(changed.output.trim()).toBe('/tmp');
    expect(restored.output.trim()).toBe(original.output.trim());
  });

  test('preserves environment variables', async () => {
    await vibe_terminal('export TEST_VAR=vibe123');
    const result = await vibe_terminal('echo $TEST_VAR');
    expect(result.output.trim()).toBe('vibe123');
  });

  test('preserves aliases and functions', async () => {
    await vibe_terminal('alias ll="ls -la"');
    const result = await vibe_terminal('ll');
    expect(result.exitCode).toBe(0);
    expect(result.output).toMatch(/total/);
  });
});
```

### 4. Intelligence Tests (vibe_recap)
```typescript
describe('vibe_recap Intelligence', () => {
  test('recognizes Node.js workflow', async () => {
    // Setup Node.js project
    await vibe_terminal('cd test-env && mkdir node-test');
    await vibe_terminal('cd node-test');
    await vibe_terminal('npm init -y');
    await vibe_terminal('npm install express');
    
    // Test recognition
    const recap = await vibe_recap({ hours: 0.1 });
    expect(recap.summary).toContain('Node.js');
    expect(recap.insights).toContainEqual(
      expect.stringContaining('Express')
    );
  });

  test('recognizes Python workflow', async () => {
    // Setup Python project
    await vibe_terminal('cd test-env && mkdir py-test');
    await vibe_terminal('cd py-test');
    await vibe_terminal('python -m venv venv');
    await vibe_terminal('source venv/bin/activate');
    await vibe_terminal('pip install django');
    
    // Test recognition
    const recap = await vibe_recap({ hours: 0.1 });
    expect(recap.summary).toContain('Python');
    expect(recap.insights).toContainEqual(
      expect.stringContaining('Django')
    );
  });
});
```

### 5. Error Recovery Tests
```typescript
describe('Error Recovery', () => {
  test('recovers from command timeout', async () => {
    const result = await vibe_terminal('sleep 60', { timeout: 1000 });
    expect(result.error).toContain('timeout');
    
    // Should still work after timeout
    const next = await vibe_terminal('echo recovered');
    expect(next.output).toContain('recovered');
  });

  test('handles disconnection gracefully', async () => {
    // Simulate work
    await vibe_terminal('cd /tmp');
    await vibe_terminal('export MY_VAR=test');
    
    // Force new session (simulates disconnect)
    sessionManager.clearSession();
    
    // Recap should show recovery info
    const recap = await vibe_recap({ type: 'status' });
    expect(recap.summary).toContain('recovery');
    expect(recap.nextActions).toBeDefined();
  });
});
```

## Writing Tests for Issues

When Claude Desktop finds an issue:

### 1. Write a Failing Test First
```typescript
// Found: Output accumulation bug
test('output isolation bug', async () => {
  const r1 = await vibe_terminal('echo first');
  const r2 = await vibe_terminal('echo second');
  
  // This will fail, proving the bug exists
  expect(r2.output).toBe('second\n');
  expect(r2.output).not.toContain('first');
});
```

### 2. Document in Handoff
```markdown
## Test Case for Issue

```typescript
// Add this test to verify the fix
test('commands show only their own output', async () => {
  const commands = ['echo one', 'echo two', 'echo three'];
  const results = [];
  
  for (const cmd of commands) {
    results.push(await vibe_terminal(cmd));
  }
  
  expect(results[0].output).toBe('one\n');
  expect(results[1].output).toBe('two\n');
  expect(results[2].output).toBe('three\n');
});
```
```

### 3. Claude Code Makes It Pass
The implementation should make the test green without breaking others.

## Test Organization

```
test/
├── unit/
│   ├── vibe-terminal.test.ts    # Core terminal tests
│   ├── vibe-recap.test.ts       # Core recap tests
│   └── session.test.ts          # Session management
├── integration/
│   ├── workflows.test.ts        # Real workflow tests
│   └── recovery.test.ts         # Disconnect recovery
├── performance/
│   └── benchmarks.test.ts       # Speed requirements
└── fixtures/
    └── test-data.ts            # Shared test data
```

## Running Tests

```bash
# All tests
npm test

# Watch mode during development
npm run test:watch

# Specific category
npm run test:unit
npm run test:integration
npm run test:performance

# Single file
npm test -- test/unit/vibe-terminal.test.ts

# With coverage
npm run test:coverage
```

## Test Quality Standards

### Every Test Must:
1. **Be Fast** - No test over 5 seconds
2. **Be Isolated** - No dependencies between tests
3. **Be Clear** - Name describes exactly what's tested
4. **Be Valuable** - Tests real behavior, not internals

### Coverage Requirements
- **Minimum**: 80% overall coverage
- **Critical paths**: 100% coverage
- **New features**: Must include tests
- **Bug fixes**: Must include regression test

## Performance Testing Guidelines

```typescript
// Always include performance assertions
test('feature X maintains performance', async () => {
  const baseline = await measureBaseline();
  
  // Add new feature
  const withFeature = await measureWithFeature();
  
  // Must not degrade performance
  expect(withFeature).toBeLessThan(baseline * 1.1); // Max 10% slower
});
```

## TDD for Bug Fixes

1. **Reproduce** - Write test that fails
2. **Fix** - Make test pass
3. **Verify** - All tests still pass
4. **Prevent** - Add edge case tests

## The First Test

For any new feature, start here:
```typescript
test('feature exists and is callable', () => {
  expect(typeof myFeature).toBe('function');
});
```

Then build up:
1. Basic functionality
2. Error cases
3. Performance
4. Edge cases

---

*Test first. Build second. Ship excellence.*
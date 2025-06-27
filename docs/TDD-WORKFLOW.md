# TDD Workflow for Vibe Dev

> Test-Driven Development: Prove it works before you build it.

## Test Environment Setup

We have dedicated test environments:
- `test-env/` - For test environment files
- `test-venv/` - For Python virtual environment testing

## The TDD Cycle

### 1. Red: Write a Failing Test
```typescript
// Start with the behavior you want
test('vibe_terminal executes commands in under 1 second', async () => {
  const start = Date.now();
  const result = await vibe_terminal('echo test');
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(1000);
  expect(result.stdout).toBe('test\n');
  expect(result.exitCode).toBe(0);
});
```

### 2. Green: Make It Pass (Minimal)
```typescript
// Simplest code that makes the test pass
export async function vibe_terminal(command: string): Promise<TerminalResult> {
  const start = Date.now();
  // Minimal implementation
  const result = {
    stdout: 'test\n',
    stderr: '',
    exitCode: 0,
    duration: Date.now() - start
  };
  return result;
}
```

### 3. Refactor: Make It Real
```typescript
// Now make it actually work
export async function vibe_terminal(command: string): Promise<TerminalResult> {
  const start = Date.now();
  const result = await executeInPTY(command);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    console.warn(`Slow execution: ${duration}ms`);
  }
  
  return { ...result, duration };
}
```

## MVP Test Categories

### 1. Core Functionality Tests
```typescript
describe('Core vibe_terminal', () => {
  test('executes basic commands', async () => {
    const result = await vibe_terminal('echo "Hello Vibe"');
    expect(result.stdout).toContain('Hello Vibe');
    expect(result.exitCode).toBe(0);
  });

  test('handles command errors gracefully', async () => {
    const result = await vibe_terminal('false');
    expect(result.exitCode).toBe(1);
  });
});
```

### 2. Performance Tests (Critical!)
```typescript
describe('Performance Requirements', () => {
  test('responds in under 1 second for simple commands', async () => {
    const times = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await vibe_terminal('echo test');
      times.push(Date.now() - start);
    }
    const avg = times.reduce((a, b) => a + b) / times.length;
    expect(avg).toBeLessThan(1000);
    console.log(`Average response time: ${avg}ms`);
  });
});
```

### 3. Session Persistence Tests
```typescript
describe('Session State', () => {
  test('maintains working directory', async () => {
    await vibe_terminal('cd /tmp');
    const result = await vibe_terminal('pwd');
    expect(result.stdout.trim()).toBe('/tmp');
  });

  test('preserves environment variables', async () => {
    await vibe_terminal('export TEST_VAR=vibe');
    const result = await vibe_terminal('echo $TEST_VAR');
    expect(result.stdout.trim()).toBe('vibe');
  });
});
```

### 4. Intelligence Tests (vibe_recap)
```typescript
describe('vibe_recap Intelligence', () => {
  test('recognizes basic workflows', async () => {
    // Setup: Run some commands
    await vibe_terminal('npm init -y');
    await vibe_terminal('npm install express');
    
    // Test: Recap understands
    const recap = await vibe_recap({ hours: 0.1 });
    expect(recap.summary).toContain('Node.js project');
    expect(recap.insights).toContain('Express installed');
  });
});
```

## Test File Structure

```
test/
├── unit/
│   ├── vibe-terminal.test.ts    # Core terminal tests
│   └── vibe-recap.test.ts       # Core recap tests
├── integration/
│   ├── session.test.ts          # Session persistence
│   └── workflows.test.ts        # Real workflow tests
└── performance/
    └── benchmarks.test.ts       # Performance requirements

test-env/                        # Test environment files
test-venv/                       # Python venv for testing
```

## Running Tests

```bash
# All tests
npm test

# Watch mode during development
npm run test:watch

# Performance tests only
npm run test:perf

# Specific test file
npm test -- test/unit/vibe-terminal.test.ts
```

## Writing Your First Test

1. **Start with the simplest behavior**
```typescript
// test/unit/vibe-terminal.test.ts
import { vibe_terminal } from '../../src/vibe-terminal';

describe('vibe_terminal basics', () => {
  test('exists and is a function', () => {
    expect(typeof vibe_terminal).toBe('function');
  });

  test('returns a promise', () => {
    const result = vibe_terminal('echo test');
    expect(result).toBeInstanceOf(Promise);
  });
});
```

2. **Add performance requirements early**
```typescript
test('meets performance target', async () => {
  const start = performance.now();
  await vibe_terminal('echo test');
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(1000);
});
```

3. **Test real scenarios**
```typescript
test('handles real developer workflow', async () => {
  // Create a test project in test-env
  await vibe_terminal('cd test-env && mkdir test-project');
  await vibe_terminal('cd test-project && git init');
  const result = await vibe_terminal('git status');
  expect(result.stdout).toContain('On branch');
});
```

## TDD Principles for Vibe Dev

1. **Test behavior, not implementation**
   - ❌ Don't test internal state
   - ✅ Test what users experience

2. **Performance is a requirement, not a nice-to-have**
   - Every test should consider speed
   - <1s is non-negotiable

3. **Test real workflows**
   - Use test-env/ for file operations
   - Use test-venv/ for Python testing
   - Test what developers actually do

4. **Start simple, iterate fast**
   - First test: Does it exist?
   - Second test: Does it work at all?
   - Third test: Is it fast enough?
   - Then: Real functionality

## Coverage Requirements

- **Minimum**: 80% code coverage
- **Critical paths**: 100% coverage
- **Performance tests**: Required for every feature

## The First Test to Write

```typescript
// This is your starting point
test('vibe_terminal stub throws not implemented', async () => {
  await expect(vibe_terminal('echo test')).rejects.toThrow('not implemented');
});
```

Make this test pass by ensuring the stub throws correctly, then write the next test for real functionality.

---

*Test first. Build second. Ship excellence.*

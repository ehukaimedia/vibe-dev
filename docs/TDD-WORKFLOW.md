# TDD Workflow for Vibe Dev

> Test-Driven Development: Prove it works before you build it.

## The TDD Philosophy

**For Claude Desktop**: Write tests that demonstrate issues
**For Claude Code**: Write tests before implementing fixes

## Cross-Platform TDD (NEW!)

### PC as Test Writer, Mac as Implementer

**The Perfect TDD Split**:
- **Windows PC**: Writes failing tests that prove bugs exist
- **Mac/Linux**: Implements code to make tests pass

### PC Workflow - Write the Test
```bash
# 1. Discover issue through testing
vibe_terminal("npm test")

# 2. Write a failing test that proves the bug
desktop-commander:write_file path="test/unit/bug-proof.test.ts"

# 3. Run test to confirm it fails
vibe_terminal("npm test test/unit/bug-proof.test.ts")

# 4. Create handoff explaining the issue
desktop-commander:write_file path="docs/claude-handoffs/YYYY-MM-DD_test-and-issue.md"

# 5. Push BOTH test and handoff (ALLOWED!)
vibe_terminal("git add test/**/*.test.ts docs/claude-handoffs/*.md")
vibe_terminal("git commit -m 'test: failing test for [issue]'")
vibe_terminal("git push")  # Safe - only tests and handoffs
```

### Mac Workflow - Make it Pass
```bash
# 1. Pull tests and handoffs from PC
git pull

# 2. Run the new test - confirm it fails
npm test test/unit/bug-proof.test.ts

# 3. Implement fix in src/
# Edit production code to make test pass

# 4. Run test again - confirm it passes
npm test test/unit/bug-proof.test.ts

# 5. Run all tests - ensure no regression
npm test

# 6. Push implementation
git add -A
git commit -m "fix: [issue] - makes test pass"
git push
```

### What PC Can Push
- ✅ `test/**/*.test.ts` - All test files
- ✅ `test/**/*.spec.ts` - All spec files  
- ✅ `docs/claude-handoffs/*.md` - Handoff documents
- ❌ `src/*` - NEVER production code
- ❌ `dist/*` - NEVER build output

### Example Cross-Platform TDD Session

**On PC - Find and Prove Bug**:
```typescript
// test/unit/output-isolation.test.ts
test('commands should return only their own output', async () => {
  const result1 = await vibe_terminal('echo first');
  const result2 = await vibe_terminal('echo second');
  
  // This will fail, proving the bug
  expect(result2.output).toBe('second\n');
  expect(result2.output).not.toContain('first');
});
```

**PC Handoff**:
```markdown
# Output Isolation Bug

## Test Created
`test/unit/output-isolation.test.ts`

## What It Proves
Commands are accumulating output instead of returning only their own.

## Expected Behavior
Each command should return only its output, not previous commands.

## Run Test
npm test test/unit/output-isolation.test.ts
```

**On Mac - Implementation**:
Claude Code pulls, sees failing test, implements fix in `src/vibe-terminal.ts` to make it pass.

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

## CI/CD GitHub Actions

### Main Workflow (.github/workflows/test.yml)

```yaml
name: Test & Quality Gates

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [20.x, 22.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Run tests
      run: npm test
      
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results-${{ matrix.os }}-${{ matrix.node-version }}
        path: test-results/

  performance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0  # Need full history for baseline
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      
    - name: Checkout base branch
      run: |
        git checkout ${{ github.base_ref }}
        npm ci
        npm run build
    
    - name: Capture baseline performance
      run: |
        npm run test:performance -- --json > baseline.json
        echo "::set-output name=baseline::$(cat baseline.json)"
    
    - name: Checkout PR branch
      run: |
        git checkout ${{ github.head_ref }}
        npm ci
        npm run build
    
    - name: Run performance tests
      run: npm run test:performance -- --json > current.json
    
    - name: Compare performance
      run: |
        node scripts/compare-performance.js baseline.json current.json
        # Fails if any metric degrades >10%

  coverage:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Run tests with coverage
      run: npm run test:coverage
    
    - name: Check coverage thresholds
      run: |
        npm run coverage:check
        # Fails if coverage < 80% lines, < 70% branches
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  quality:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Check test organization
      run: |
        # Ensure no test files in src/
        if find src -name "*.test.ts" -o -name "*.spec.ts" | grep .; then
          echo "❌ Test files found in src/ directory!"
          exit 1
        fi
        echo "✅ No test files in src/"
```

### Performance Comparison Script (scripts/compare-performance.js)

```javascript
#!/usr/bin/env node
import { readFileSync } from 'fs';

const baseline = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const current = JSON.parse(readFileSync(process.argv[3], 'utf8'));

const MAX_DEGRADATION = 1.1; // 10% slower allowed

let failed = false;

for (const [test, baselineTime] of Object.entries(baseline.times)) {
  const currentTime = current.times[test];
  
  if (!currentTime) {
    console.warn(`⚠️  Test ${test} missing in current results`);
    continue;
  }
  
  const ratio = currentTime / baselineTime;
  
  if (ratio > MAX_DEGRADATION) {
    console.error(`❌ Performance regression in ${test}:`);
    console.error(`   Baseline: ${baselineTime}ms`);
    console.error(`   Current:  ${currentTime}ms`);
    console.error(`   Degradation: ${((ratio - 1) * 100).toFixed(1)}%`);
    failed = true;
  } else if (ratio < 0.9) {
    console.log(`✅ Performance improved in ${test}: ${((1 - ratio) * 100).toFixed(1)}% faster`);
  }
}

if (failed) {
  console.error('\n❌ Performance regression detected!');
  process.exit(1);
} else {
  console.log('\n✅ No performance regressions');
}
```

### Branch Protection Rules

Configure in GitHub repository settings:

1. **Require status checks to pass**:
   - test (ubuntu-latest, 20.x)
   - test (macos-latest, 20.x)
   - test (windows-latest, 20.x)
   - performance
   - coverage
   - quality

2. **Require branches to be up to date**

3. **Require code review** from at least 1 reviewer

4. **Dismiss stale reviews** when new commits pushed

5. **Restrict who can push** to main branch

### Coverage Enforcement (package.json)

```json
{
  "scripts": {
    "test:coverage": "jest --coverage",
    "coverage:check": "jest --coverage --coverageThreshold='{\"global\":{\"lines\":80,\"branches\":70,\"functions\":80,\"statements\":80}}'",
    "test:performance": "jest test/performance --testTimeout=30000"
  }
}
```

### Pre-commit Hooks (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests
npm test || exit 1

# Check for test files in src/
if find src -name "*.test.ts" -o -name "*.spec.ts" | grep -q .; then
  echo "❌ Error: Test files found in src/ directory"
  echo "Move all test files to test/ directory"
  exit 1
fi

# Run quick performance check
npm run test:performance -- --testNamePattern="simple echo" || exit 1
```

### Regression Prevention Metrics

Track these in every CI run:
1. **Test Count**: Must never decrease
2. **Coverage**: Must never decrease
3. **Performance**: Max 10% degradation allowed
4. **Build Size**: Monitor for unexpected growth
5. **Type Coverage**: Maintain 100% type safety

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
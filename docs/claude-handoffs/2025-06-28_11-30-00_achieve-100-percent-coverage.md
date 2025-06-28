# Achieve 100% Test Coverage - Vibe Dev

## For You (Human Coordinator)
- Current coverage: ~60% (59.75% statements, 47.08% branches, 63.23% functions, 60.64% lines)
- Goal: Achieve 100% test coverage across all metrics
- Priority: Critical - Required for production readiness and regression prevention
- Windows mocks: Remove all Windows-specific mocks, maintain cross-compatibility

## Current State Analysis

### Coverage Gaps by File
1. **0% Coverage Files** (Critical):
   - `index.ts` - Entry point, needs integration tests
   - `server.ts` - MCP server, needs protocol tests
   - `types.ts` - Type definitions, needs type validation tests
   - `vibe-intelligence.ts` - AI integration, needs behavior tests

2. **Partial Coverage Files**:
   - `vibe-terminal.ts` - 50% coverage, missing error cases and edge conditions
   - `vibe-recap.ts` - 85.79% coverage, missing error paths and formatters

### Test Suite Issues
- 13 of 17 test suites failing after reorganization
- Many tests have improper setup/teardown
- Some tests running code outside of test blocks
- Windows mock tests need removal

## For Claude Code - TDD Implementation Plan

### Phase 1: Fix Failing Tests (Follow TDD Cycle)
```bash
cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev

# 1. Identify failing tests
npm test 2>&1 | grep "FAIL" | sort | uniq

# 2. For each failing test:
#    a. Read the test to understand intent
#    b. Fix imports/setup issues
#    c. Remove Windows-specific mocks
#    d. Ensure proper async handling
#    e. Run test in isolation to verify fix
```

### Phase 2: Remove Windows Mocks
1. **Files to modify**:
   - `test/unit/windows.test.ts` - Remove or simplify to cross-platform tests
   - Any test using `@lydell/node-pty` - Switch to standard `node-pty`
   - Remove Windows-specific path handling tests

2. **Maintain cross-compatibility**:
   ```typescript
   // Instead of Windows-specific tests, use:
   const isWindows = process.platform === 'win32';
   const testPath = isWindows ? 'C:\\test' : '/test';
   ```

### Phase 3: Add Missing Test Coverage

#### 1. Index.ts Tests (0% → 100%)
```typescript
// test/integration/cli.test.ts
describe('CLI Entry Point', () => {
  test('starts server with correct arguments', async () => {
    // Test main entry point
  });
  
  test('handles invalid commands gracefully', async () => {
    // Test error handling
  });
});
```

#### 2. Server.ts Tests (0% → 100%)
```typescript
// test/unit/server.test.ts
describe('MCP Server', () => {
  test('initializes with correct tools', async () => {
    // Test server initialization
  });
  
  test('handles tool requests correctly', async () => {
    // Test each MCP tool
  });
  
  test('manages sessions properly', async () => {
    // Test session lifecycle
  });
});
```

#### 3. Types.ts Tests (0% → 100%)
```typescript
// test/unit/types.test.ts
describe('Type Definitions', () => {
  test('TerminalResult has required fields', () => {
    // Validate type structure
  });
  
  test('RecapResult formats match schemas', () => {
    // Test all recap formats
  });
});
```

#### 4. Vibe-Intelligence.ts Tests (0% → 100%)
```typescript
// test/unit/intelligence.test.ts
describe('Vibe Intelligence', () => {
  test('analyzes patterns correctly', async () => {
    // Test pattern analysis
  });
  
  test('generates appropriate suggestions', async () => {
    // Test AI suggestions
  });
});
```

#### 5. Vibe-Terminal.ts Coverage (50% → 100%)
Focus on uncovered lines:
- Error handling paths (lines 191-196, 214-226)
- Session management edge cases (lines 240-316)
- Timeout scenarios (lines 403-407)
- Cleanup procedures (lines 444-454)

#### 6. Vibe-Recap.ts Coverage (85.79% → 100%)
Focus on uncovered lines:
- Error conditions (lines 48-49, 131-132)
- Edge cases in formatting (lines 179-184)
- Rare code paths (lines 284-286)

### Phase 4: TDD Workflow Implementation

For each new test, follow the sacred TDD cycle:

1. **RED Phase**:
   ```typescript
   // Write test that fails
   test('handles connection timeout gracefully', async () => {
     const result = await vibe_terminal('sleep 100', { timeout: 10 });
     expect(result.exitCode).toBe(-1);
     expect(result.output).toContain('timeout');
   });
   ```

2. **GREEN Phase**:
   ```typescript
   // Minimal implementation to pass
   if (duration > timeout) {
     return { exitCode: -1, output: 'Command timeout', duration };
   }
   ```

3. **REFACTOR Phase**:
   ```typescript
   // Clean implementation with proper error handling
   private handleTimeout(command: string): TerminalResult {
     this.logger.warn(`Command timeout: ${command}`);
     return {
       exitCode: -1,
       output: `Command exceeded timeout of ${this.timeout}ms`,
       duration: this.timeout,
       timedOut: true
     };
   }
   ```

### Phase 5: Regression Prevention

1. **Create Performance Baselines**:
   ```typescript
   // test/fixtures/coverage-baseline.json
   {
     "minimum": {
       "statements": 100,
       "branches": 100,
       "functions": 100,
       "lines": 100
     }
   }
   ```

2. **Add Pre-commit Hook**:
   ```bash
   # .git/hooks/pre-commit
   npm test
   npm run test:coverage
   # Fail if coverage drops below 100%
   ```

3. **Update package.json Scripts**:
   ```json
   {
     "test:coverage:check": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":100,\"functions\":100,\"lines\":100,\"statements\":100}}'",
     "test:watch:coverage": "jest --watch --coverage"
   }
   ```

### Verification Commands
```bash
# After each phase, verify progress
npm run test:coverage

# Check specific file coverage
npx jest --coverage --collectCoverageFrom="src/vibe-terminal.ts"

# Run tests in watch mode during development
npm run test:watch:coverage

# Validate no tests in src
npm run test:validate

# Final verification
npm run test:coverage:check
```

### Expected Outcome
- **Coverage**: 100% across all metrics
- **Tests**: All 23+ tests passing (no Windows mocks)
- **Files**: Every source file has corresponding test file
- **Quality**: No untested error paths or edge cases
- **Regression**: Automated prevention via coverage thresholds

### Key Principles
1. **Write test first** - Never write code without a failing test
2. **One assertion per test** - Keep tests focused
3. **Test behavior, not implementation** - Tests should survive refactoring
4. **No Windows mocks** - Use cross-platform approaches
5. **100% or nothing** - Every line of code must be tested

### Session Completion Criteria
- [ ] All test suites passing (0 failures)
- [ ] 100% statement coverage
- [ ] 100% branch coverage  
- [ ] 100% function coverage
- [ ] 100% line coverage
- [ ] No Windows-specific mocks
- [ ] Coverage thresholds enforced
- [ ] All files have tests
- [ ] TDD workflow documented for each change
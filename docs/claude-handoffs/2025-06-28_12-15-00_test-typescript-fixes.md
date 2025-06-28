# Test TypeScript Fixes Required - Vibe Dev

## For You (Human Coordinator)
- Current issue: Test suite reorganization complete but TypeScript errors preventing tests from running
- Impact: Cannot measure test coverage or verify functionality
- Priority: CRITICAL - Must fix before achieving 100% coverage goal
- Expected outcome: All tests passing with no TypeScript errors

## Issue Details

### Current Behavior:
- 4 test suites failing with TypeScript compilation errors
- Tests were successfully moved to test/ directory but have type issues
- Jest configuration appears correct but type checking is catching errors

### Test Files with Errors:
1. **recap-coverage.test.ts** - Missing required `format` parameter
2. **index.test.ts** - Mock type incompatibilities  
3. **server.test.ts** - Mock implementation issues
4. **vibe-terminal-coverage.test.ts** - Type assertion error

### Root Cause Analysis:
1. The `generateRecap` function signature changed to require `format` parameter
2. Jest mock typing is stricter than expected
3. Some tests have incorrect async/await usage

## For Claude Code - COPY THIS ENTIRE SECTION

### Step 1: Pull Latest Changes
```bash
cd /Users/$(whoami)/Desktop/AI-Applications/Node/vibe-dev
git pull
git status
```

### Step 2: Fix recap-coverage.test.ts
The generateRecap function requires a `format` parameter. Update all calls:
```bash
# Fix all generateRecap calls to include format
# Change from: generateRecap({ hours: 1, type: 'full' })
# To: generateRecap({ hours: 1, type: 'full', format: 'text' })

# Also fix async/await issues on lines 227 and 249
```

### Step 3: Fix index.test.ts Mock Issues
```bash
# Fix console.error mock - needs empty function
# Line 34: .mockImplementation(() => {})

# Fix mockResolvedValue type issues
# Use proper typing for jest.fn()
```

### Step 4: Fix server.test.ts Mock Issues
```bash
# Similar to index.test.ts
# Fix console.error mock implementation
# Fix mock type assertions for executeTerminalCommand and generateRecap
```

### Step 5: Fix vibe-terminal-coverage.test.ts
```bash
# Line 107 has a type assertion issue with dataCallback
# Remove the non-null assertion or properly type the variable
```

### Step 6: Add Missing tsconfig Settings
```bash
# Edit tsconfig.json to add:
# "isolatedModules": true
# This will fix the ts-jest warnings
```

### Step 7: Run Tests Incrementally
```bash
# Test each file individually after fixing
npm test test/unit/recap-coverage.test.ts
npm test test/unit/index.test.ts
npm test test/unit/server.test.ts
npm test test/unit/vibe-terminal-coverage.test.ts

# Once all individual tests pass, run full suite
npm test

# Check coverage
npm run test:coverage
```

### Step 8: Create Response Handoff
After fixing all TypeScript errors and getting tests to pass, create:
`docs/claude-handoffs/2025-06-28_HH-MM-SS_code-to-desktop.md`

Include:
- Number of tests now passing
- Current test coverage percentages
- Any remaining issues
- Next steps for achieving 100% coverage

## Verification Commands
```bash
# To verify all TypeScript errors are fixed
npx tsc --noEmit

# To see detailed test output
npm test -- --verbose

# To check coverage after fixes
npm run test:coverage
```

## Expected Outcome
- All TypeScript compilation errors resolved
- All test suites running without errors
- Ability to measure actual test coverage
- Clear path to achieving 100% coverage goal
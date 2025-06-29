# Mac Terminal Implementation Handoff - Fix Failing Tests

## ✅ Current TDD Status: Tests Written and Failing (Good!)

**Existing failing tests**: `test/mac/command-echo-bug.test.ts`
- 2 tests failing, 1 passing
- This is CORRECT TDD - tests exist and fail first

## 🔍 Actual Bug (From Test Output)

The bug is NOT "ppwd" - the actual issue is the full prompt is included in output:

```
Expected: /^\/[a-zA-Z]/
Received: "ehukaimedia@Arsenios-Mac-Studio vibe-dev % pwd
/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev"
```

The `cleanOutput` method isn't properly removing the prompt from the output.

## 🎯 OBJECTIVE: Make Existing Tests Pass

### Step 1: Analyze Why Tests Fail

**Test 1**: `commands should not echo with duplicated first character`
- Expects output to start with path (`/Users/...`)
- Actually includes full prompt before output

**Test 2**: `echo command should not show duplicated first letter`
- Expects just `hello world`
- Actually includes prompt + command + output

**Test 3**: `cleanOutput should remove command echo properly` - PASSES
- This suggests the unit test doesn't match real behavior

### Step 2: Fix the cleanOutput Method

The issue is in `vibe-terminal-mac.ts` cleanOutput method. It needs to:

1. Better detect where the actual output starts
2. Remove the prompt and command echo more reliably
3. Handle the zsh prompt format correctly

### Step 3: Ensure Platform Separation

While fixing the bug, ensure:
- Generic prompt detection logic → base class
- Mac-specific prompt patterns → Mac class
- No mixing of cross-platform and Mac-specific code

## 📋 Implementation Tasks

1. **Debug cleanOutput**:
   - Add logging to see raw output
   - Identify exact prompt pattern
   - Fix prompt removal logic

2. **Refactor if needed**:
   - Move generic ANSI cleaning to base
   - Keep Mac prompt patterns in Mac class

3. **Verify tests pass**:
   - Run `npm test test/mac/command-echo-bug.test.ts`
   - All 3 tests should pass

## ✅ Success Criteria

1. **All Mac tests pass** (especially command-echo-bug.test.ts)
2. **Output is clean** - no prompts, just command results
3. **Platform code separated** - Mac-specific in Mac, generic in base
4. **No regression** - all other tests still pass

## 🚨 Jest Config Issue to Note

**TDD-WORKFLOW.md** describes dynamic platform test matching:
```javascript
testMatch: [
  ...(process.platform === 'darwin' ? ['<rootDir>/test/mac/**/*.test.ts'] : []),
  ...(process.platform === 'win32' ? ['<rootDir>/test/pc/**/*.test.ts'] : []),
]
```

**Actual jest.config.js** just ignores Windows tests:
```javascript
testPathIgnorePatterns: [
  'windows.test.ts',
  'win32.test.ts',
  // etc
]
```

This works but isn't as elegant as the documented approach. Consider updating jest.config.js to match TDD-WORKFLOW.md.

## 🔧 Debugging Tips

1. **See raw output**: Temporarily log in cleanOutput:
   ```typescript
   console.log('RAW:', JSON.stringify(rawOutput));
   console.log('COMMAND:', command);
   ```

2. **Test incrementally**: Fix one test at a time

3. **Check zsh prompt format**: The `%` at line start is zsh-specific

## 📝 This IS Proper TDD

- ✅ Tests written first (they exist)
- ✅ Tests fail (2 of 3 failing)
- ✅ Now implement to make them pass
- ✅ Platform-specific tests in correct directory
- ✅ Regression prevention built-in

The workflow is correct - just need to fix the implementation!
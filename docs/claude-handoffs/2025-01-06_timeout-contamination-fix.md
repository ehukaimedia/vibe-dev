# Timeout Contamination Fix Needed

## From: PC Developer
## To: Mac Developer
## Date: 2025-01-06
## Priority: HIGH - Blocking Windows tests

## The Problem

When commands timeout in `vibe-terminal-base.ts`, the code sends Ctrl+C (`\x03`) to interrupt them. This contaminates the terminal session and affects subsequent commands.

## Location of Bug

In `src/vibe-terminal-base.ts` around line 155 in the timeout handler:
```typescript
// Current problematic code:
this.ptyProcess?.write('\x03');  // This contaminates the session!
```

## Test That Proves It

See: `test/pc/timeout-contamination-bug.test.ts`

The test demonstrates:
1. Commands after timeout contain Ctrl+C characters
2. Output gets contaminated with `^C` or `\x03`
3. Exit codes may be affected

## Fix Needed

In the timeout handler of `src/vibe-terminal-base.ts`:
```typescript
// Instead of:
this.ptyProcess?.write('\x03');

// Just return with timeout indicator:
resolve({
  output: this._cleanOutput(commandOutput, command),
  exitCode: -1, // Timeout indicator
  // ... rest of result
});
```

## Also Needed

1. **Update working directory after each command**
   - After successful command execution, check if `workingDirectory` changed
   - Update `sessionState.workingDirectory` accordingly

2. **Fix TypeScript build errors**
   - 3 errors in `src/vibe-recap.ts`
   - 2 errors in `src/vibe-terminal-base.ts`
   - 1 error in `src/vibe-terminal.ts`

## Testing

After Mac fixes the timeout issue:
1. PC will run: `npm test test/pc/timeout-contamination-bug.test.ts`
2. All tests should pass
3. No Ctrl+C contamination in output
4. Exit code should be -1 for timeouts

## Why This Matters

The contamination affects all subsequent commands in the session, making the terminal unreliable. This is especially problematic on Windows where PowerShell and CMD handle Ctrl+C differently than Unix shells.

## Windows Implementation Complete

I've already implemented the full Windows terminal in `src/vibe-terminal-pc.ts` with:
- PowerShell/CMD prompt detection
- Windows path normalization
- Command echo cleanup
- Proper output filtering

Once you fix the timeout issue in the base class, Windows tests should pass.
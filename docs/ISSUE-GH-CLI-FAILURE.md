# Critical Issue: vibe_terminal fails with GitHub CLI (gh)

## Problem Description
vibe_terminal cannot properly handle GitHub CLI (`gh`) commands, while Desktop Commander's execute_command works fine.

## Symptoms
```bash
# vibe_terminal attempt:
vibe_terminal("gh run list --repo ehukaimedia/vibe-dev")
# Result: ]11;?\[6n followed by timeout (-1 exit code)

# execute_command works:
execute_command("gh run list --repo ehukaimedia/vibe-dev")
# Result: Proper JSON output
```

## Root Cause Analysis
The `]11;?\[6n` sequence is an ANSI escape sequence for terminal capability detection:
- `]11;?` - Request terminal background color
- `[6n` - Request cursor position

This suggests `gh` is trying to interact with the terminal in a way that vibe_terminal's PTY isn't handling properly.

## Impact
- Can't use vibe_terminal for GitHub CLI operations
- Defeats the purpose of "intelligent terminal" if it can't handle common developer tools
- Forces users to fall back to basic execute_command

## Potential Fixes
1. **PTY Configuration**: May need to set proper terminal type (TERM env var)
2. **Input Handling**: Need to respond to terminal capability queries
3. **Interactive Mode Detection**: gh might need --non-interactive flag
4. **Buffer Processing**: May need to filter/handle ANSI sequences better

## Test Cases to Add
```typescript
// Test gh commands
await executeTerminalCommand('gh --version');
await executeTerminalCommand('gh auth status');
await executeTerminalCommand('gh run list --repo test/repo --json status');

// Test other interactive CLIs
await executeTerminalCommand('npm init -y');
await executeTerminalCommand('git log --oneline -5');
```

## Workaround
For now, users must use execute_command for gh operations:
```typescript
// Don't use: vibe_terminal("gh run list")
// Use instead: execute_command("gh run list", timeout_ms=10000)
```

## Priority: HIGH
This undermines vibe-dev's core value proposition.
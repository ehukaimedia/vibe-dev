# CRITICAL: Second Factory Fix Required - getTerminal() Function

## Date: 2025-06-29 13:20 PST
**From**: PC Analysis  
**To**: Mac Developer  
**Priority**: CRITICAL - Still blocking Windows functionality

---

## 🚨 Root Cause Found (Part 2)!

We fixed the factory, but there's ANOTHER hardcoded Mac reference! The `getTerminal()` function creates `new VibeTerminal()` which is hardcoded to extend `VibeTerminalMac`.

### Current Code (BROKEN):
```typescript
// In vibe-terminal.ts

// Line 5-10: VibeTerminal is hardcoded to Mac!
export class VibeTerminal extends VibeTerminalMac {
  constructor(config?: TerminalConfig) {
    super(config);
  }
}

// Line 41-45: getTerminal creates hardcoded Mac instance!
export function getTerminal(): VibeTerminal {
  if (!terminalInstance) {
    terminalInstance = new VibeTerminal();  // ❌ This creates Mac on Windows!
  }
  return terminalInstance;
}

// Line 55-58: This is what MCP server uses!
export async function executeCommand(command: string): Promise<TerminalResult> {
  const terminal = getTerminal();  // ❌ Gets Mac instance on Windows!
  return terminal.execute(command);
}
```

---

## ✅ The Fix

Replace `getTerminal()` to use the factory:

```typescript
export function getTerminal(): VibeTerminal {
  if (!terminalInstance) {
    terminalInstance = createVibeTerminal();  // ✅ Use factory instead!
  }
  return terminalInstance;
}
```

That's it! One line change in the `getTerminal()` function.

---

## 📊 Evidence

1. The factory `createVibeTerminal()` is correct ✅
2. But `getTerminal()` doesn't use the factory ❌
3. The MCP server calls `executeCommand()` → `getTerminal()` → `new VibeTerminal()` → Mac instance on Windows!

---

## 🧪 After You Fix

1. Change `new VibeTerminal()` to `createVibeTerminal()` in getTerminal()
2. Build: `npm run build`
3. Restart Claude (IMPORTANT!)
4. Test: `vibe_terminal("echo test")`
5. Should work immediately!

---

**This is the final blocker. The factory was only half the fix!** 🚀
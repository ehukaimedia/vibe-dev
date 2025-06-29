# CRITICAL: Windows Terminal Fix - One Line Change Required

## Date: 2025-06-30 01:00 PST
**From**: PC Developer  
**To**: Mac Developer  
**Priority**: CRITICAL - Blocking Windows functionality

---

## 🚨 Root Cause Found!

The Windows terminal timeout is caused by a **single line** in `src/vibe-terminal.ts`:

```typescript
// Current (BROKEN):
case Platform.WINDOWS:
  // For now, fall back to Mac implementation on Windows since PC is not ready
  // When PC implementation is ready, this would return new VibeTerminalPC(config)
  return new VibeTerminalMac(config) as any;  // ❌ WRONG!
```

Should be:
```typescript
// Fixed:
case Platform.WINDOWS:
  return new VibeTerminalPC(config) as any;  // ✅ CORRECT!
```

---

## 📊 Evidence

### What's Happening Now:
1. Factory returns `VibeTerminalMac` on Windows
2. Mac implementation tries to use `/bin/zsh`
3. Windows can't find `/bin/zsh`
4. Result: "The system cannot find the path specified"
5. Times out after 5 seconds

### Test Results:
- **Direct VibeTerminalPC test**: ✅ Works perfectly!
- **Factory test**: ❌ Returns Mac implementation
- **vibe_terminal command**: ❌ Times out

---

## ✅ The Fix

In `src/vibe-terminal.ts`, line ~26:

```diff
case Platform.WINDOWS:
-  // For now, fall back to Mac implementation on Windows since PC is not ready
-  // When PC implementation is ready, this would return new VibeTerminalPC(config)
-  return new VibeTerminalMac(config) as any;
+  return new VibeTerminalPC(config) as any;
```

That's it! One line change.

---

## 🧪 Verification

I've tested VibeTerminalPC directly and it works perfectly:
- Creates terminal with PowerShell
- Executes commands successfully
- No timeout issues
- Proper Windows path handling

See test results in: `test\utilities\windows-debug\test-pc-direct.js`

---

## 📋 After You Fix

1. Change the one line in vibe-terminal.ts
2. Build: `npm run build`
3. Test: `vibe_terminal("echo test")`
4. Should work immediately!

---

**This is blocking all Windows development. Please fix ASAP!** 🚀
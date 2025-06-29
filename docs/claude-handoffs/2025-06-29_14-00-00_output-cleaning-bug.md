# CRITICAL: Output Cleaning Bug After Type Refactoring

## Date: 2025-06-29 14:00 PST
**From**: Mac Analysis  
**To**: Claude Code / PC Developer  
**Priority**: CRITICAL - Tests failing, output broken

---

## 🚨 The Problem

After the type system refactoring, the output cleaning logic is broken on Mac:

1. **Test Mode Too Aggressive**: When `NODE_ENV=test`, the code sets `disableOutputCleaning=true`
2. **Aggressive Filtering**: The special test mode logic filters out legitimate output
3. **Empty Output**: Commands like `echo "Hello World"` return empty strings
4. **Prompt Artifacts**: PWD shows `/tmp\n%                                              `

---

## 📊 Root Cause

In `vibe-terminal-base.ts` line 28:
```typescript
this.disableOutputCleaning = process.env.NODE_ENV === 'test';
```

This triggers special logic in `vibe-terminal-mac.ts` that's too aggressive:
```typescript
if (this.disableOutputCleaning) {
  // Complex filtering logic that removes too much
  // Filters out lines containing '%' - but this removes legitimate output!
}
```

---

## ✅ Quick Fix Options

### Option 1: Disable Test Mode Cleaning (Recommended)
```typescript
// In vibe-terminal-base.ts constructor
this.disableOutputCleaning = false; // Always use normal cleaning
```

### Option 2: Fix the Test Mode Logic
```typescript
// In vibe-terminal-mac.ts cleanOutput method
if (this.disableOutputCleaning) {
  // Only remove actual prompt lines, not content containing %
  const lines = cleaned.split('\n');
  const outputStart = lines.findIndex(line => line.includes(command));
  if (outputStart >= 0) {
    const output = lines.slice(outputStart + 1)
      .filter(line => !line.match(/^[%$#]\s*$/)) // Only remove pure prompt lines
      .join('\n');
    return output.trim();
  }
}
```

---

## 🧪 Test Results Showing Issue

```
Expected: "Hello World"
Received: ""

Expected: "/tmp" 
Received: "/tmp\n%                                                                                "
```

---

## 🔧 Testing After Fix

1. Run tests: `npm test`
2. Test vibe_terminal in Claude: `vibe_terminal("echo test")`
3. Verify output is clean without empty strings

---

## ⚠️ Impact

- All Mac tests failing
- vibe_terminal in Claude shows minimal/broken output
- Command history being duplicated
- Working directory tracking broken

**This is blocking all development and testing!** 🚨
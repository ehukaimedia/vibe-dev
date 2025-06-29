# Debug Code Cleanup - Windows Terminal Fix

## Date: 2025-06-30 00:20 PST
**From**: PC Developer (Cleanup Session)  
**To**: Next Developer (Windows or Mac)  
**Status**: Debug code REMOVED, test scripts created

---

## ✅ What I've Cleaned Up

### 1. Removed Improper Debug Code
- **DELETED**: `src/debug-logger.ts` - This violated our "Two Tools" principle
- **CLEANED**: `src/vibe-terminal-pc.ts` - Removed all `logToFile()` calls
- **KEPT**: Full PowerShell paths (good change from previous session)

### 2. Why Debug Code Was Wrong
- Violates principle: "vibe_recap handles ALL logging needs"
- Adding debug files breaks the "Never add a third tool" rule
- Debug log was never created anyway (error happens before constructor)

### 3. Files Now Clean
```
src/vibe-terminal-pc.ts  ✅ Clean (no debug code)
src/debug-logger.ts      ✅ Deleted (shouldn't exist)
```

---

## 🧪 Created Proper Test Scripts

Instead of modifying source files, I created test scripts in `test/pc/windows-scripts/`:

### 1. `test-direct-spawn.js`
- Tests PowerShell spawn directly with child_process
- Bypasses MCP server layer completely
- Shows if PowerShell can even be launched

### 2. `test-server-layer.js`
- Tests loading the terminal through the factory
- Checks if compiled files exist
- Identifies module resolution issues

### 3. `debug-with-vibe-recap.js`
- Instructions for using vibe_recap for debugging
- No source modifications needed!
- Shows how to analyze timeout patterns

---

## 🎯 Root Cause Analysis

### Why Windows Terminal Times Out (Hypothesis)

Based on the evidence:
1. **Debug log never created** = Error before constructor
2. **Consistent 5-second timeout** = MCP server timeout
3. **Exit code -1** = Process failed to start

Most likely causes:
1. **Module resolution failure** in the MCP server layer
2. **node-pty not installed** (it's optional) and fallback not working
3. **Import path issues** between compiled JS files

### Testing Priority
Run these test scripts in order:
```bash
# 1. Test if PowerShell works at all
node test/pc/windows-scripts/test-direct-spawn.js

# 2. Test the factory and module loading
node test/pc/windows-scripts/test-server-layer.js

# 3. Use vibe_recap to see patterns
vibe_terminal("echo test")
vibe_recap({ hours: 0.1, type: "full" })
```

---

## 📊 Current State

### What Works:
- ✅ Source files are clean (no debug code)
- ✅ Full PowerShell paths preserved
- ✅ Test scripts created for debugging
- ✅ Repository properly organized

### What's Still Broken:
- ❌ Windows vibe_terminal still times out
- ❌ Need to compile TypeScript after cleanup
- ❌ Root cause not yet identified

---

## 🚀 Next Steps

1. **Rebuild the project** after debug code removal:
   ```bash
   npm run build
   ```

2. **Run test scripts** to isolate the issue:
   - Start with `test-direct-spawn.js`
   - Check if PowerShell launches at all
   - Look for module loading errors

3. **Consider installing node-pty**:
   ```bash
   npm install node-pty --no-save
   ```

4. **Use vibe_recap** for all debugging:
   - It already captures everything we need
   - No source modifications required
   - Shows patterns in failures

---

## 💡 Lessons Learned

1. **Never add debug code to source files** - vibe_recap exists for this
2. **Test scripts belong in test/** - Not in src/
3. **The "Two Tools" rule is sacred** - Don't add third tools
4. **Debug at the right layer** - MCP server issues need server-level debugging

Remember: Excellence through simplicity, not complexity! 🎯
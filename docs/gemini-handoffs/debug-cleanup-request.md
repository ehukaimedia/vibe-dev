# Gemini Analysis: Debug Code Cleanup & Windows Terminal Fix

## Date: 2025-06-29
## Priority: URGENT - Cleanup needed before proceeding

## Current Situation

I've found debug logging code improperly added to source files:
1. **NEW FILE**: `src/debug-logger.ts` - Shouldn't exist!
2. **MODIFIED**: `src/vibe-terminal-pc.ts` - Has logToFile() calls throughout
3. **PROBLEM**: This violates "vibe_recap handles all logging" principle
4. **SYMPTOM**: Windows terminal times out after 5 seconds
5. **CRITICAL**: Debug log file is NEVER created - error happens BEFORE constructor

## Files That Need Cleanup

```
src/debug-logger.ts         # DELETE THIS
src/vibe-terminal-pc.ts     # REMOVE all logToFile() calls
dist/src/debug-logger.js    # DELETE THIS
dist/src/vibe-terminal-pc.js # Rebuild after cleanup
```

## Questions for Analysis

### 1. Safe Cleanup Process
How do we remove debug code while preserving good changes like full PowerShell paths?
- Option A: Use git to revert specific files?
- Option B: Manually edit to remove only debug lines?
- Option C: Create clean version from scratch?

### 2. Proper Debugging Without Source Modifications
The Windows terminal timeout needs debugging WITHOUT touching src/ files:
- How can we use vibe_recap effectively for this?
- What test scripts should go in test/pc/windows-scripts/?
- How do we test if the error is in MCP server layer?

### 3. Root Cause Analysis
Given that the debug log is never created:
- Is the error in server.js before terminal creation?
- Is it a module resolution/import issue?
- Could it be the node-pty optional dependency?

## Requested Output

Please provide:
1. **Step-by-step cleanup commands** (safe for Windows)
2. **Test script examples** for test/pc/windows-scripts/
3. **Debugging strategy** using only vibe_recap
4. **Root cause hypothesis** for the 5-second timeout

## Remember Our Principles
- Only TWO tools: vibe_terminal and vibe_recap
- No debug code in src/ files
- Tests go in test/ directory
- vibe_recap handles ALL logging needs

# Gemini CLI Commands for Windows Timeout Fix

## Date: 2025-06-29
**Purpose**: Ready-to-use Gemini commands for fixing Windows terminal timeout  
**Priority**: URGENT - Windows vibe_terminal not working

---

## 🚀 Quick Diagnosis Commands (Run These First!)

### 1. Root Cause Analysis
```bash
gemini --model gemini-2.5-pro "URGENT: Windows vibe_terminal times out after exactly 5 seconds with no output. The timeout handler in vibe-terminal-base.ts waits for promptDetected to be true. Review vibe-terminal-pc.ts isAtPrompt() method that checks for PowerShell prompts with regex /^PS [A-Z]:\\.*>\s*$/. Why might this never match? Consider: 1) PowerShell prompt formats, 2) Line ending differences (CRLF vs LF), 3) Output buffering. Provide specific fix."
```

### 2. PowerShell Path Issue
```bash
gemini --model gemini-2.5-pro "In vibe-terminal-pc.ts, getDefaultShell() returns 'powershell.exe'. Should this be an absolute path? What about systems with only PowerShell 7 (pwsh.exe)? How to detect which PowerShell is available? Show code that tries multiple options."
```

### 3. Compare with Working Mac
```bash
gemini --model gemini-2.5-pro "Compare prompt detection between Mac and Windows. Mac uses /\$\s*$/ for bash/zsh prompts in vibe-terminal-mac.ts. Windows uses /^PS [A-Z]:\\.*>\s*$/ for PowerShell. Why might Mac work but Windows timeout? Show exact differences and fixes."
```

---

## 🔧 Implementation Commands

### 4. Add Debug Logging
```bash
gemini --model gemini-2.5-pro "Show me exactly where and how to add console.error() logging in vibe-terminal-pc.ts to debug the timeout. Include: 1) Log raw output in isAtPrompt(), 2) Log when PTY starts, 3) Log shell detection. Format as copy-paste ready code."
```

### 5. Minimal Fix First
```bash
gemini --model gemini-2.5-pro "Provide the absolute minimal change to vibe-terminal-pc.ts that might fix the timeout. Maybe just change the prompt regex? Or add a fallback? One-line fix preferred. Must not break existing functionality."
```

### 6. Test Script
```bash
gemini --model gemini-2.5-pro "Write a standalone Node.js script to test if PowerShell PTY works on Windows. Should: 1) Create PTY with powershell.exe, 2) Send 'echo test' command, 3) Read output, 4) Check for prompts. Make it simple to run."
```

---

## 🛡️ Regression Prevention Commands

### 7. Safety Check
```bash
gemini --model gemini-2.5-pro "If I change the isAtPrompt() regex in vibe-terminal-pc.ts from /^PS [A-Z]:\\.*>\s*$/ to something else, will it affect: 1) Mac functionality? 2) The timeout fix? 3) Command echo handling? Explain why it's safe or not."
```

### 8. Test Cases
```bash
gemini --model gemini-2.5-pro "Write Jest test cases that prove the Windows timeout is fixed. Include: 1) Basic echo command works, 2) Prompt detected within 5 seconds, 3) No timeout errors. Use the existing test structure from timeout-contamination-bug.test.ts."
```

---

## 📝 Documentation Commands

### 9. Create Fix Summary
```bash
gemini --model gemini-2.5-pro "I fixed the Windows timeout by [describe fix]. Write a concise summary for STATUS.md that explains: 1) What was wrong, 2) What changed, 3) Why it's safe. Format as markdown bullet points."
```

### 10. Handoff Creation
```bash
gemini --model gemini-2.5-pro "Create a handoff document explaining the Windows timeout fix. Include: 1) Root cause, 2) Solution implemented, 3) Tests that verify it works, 4) No regression confirmation. Format for docs/gemini-handoffs/windows-timeout-fixed.md"
```

---

## 💡 Pro Tips for Using Gemini

1. **Run commands 1-3 first** for analysis
2. **Save Gemini output** to `docs/gemini-handoffs/`
3. **Implement one fix at a time**
4. **Test after each change**
5. **Use command 7** before any major change

---

## 🎯 Expected Outcome

After running these Gemini commands, you should have:
- ✅ Clear understanding of why timeout occurs
- ✅ Minimal fix to implement
- ✅ Test to verify it works
- ✅ Confidence it won't break Mac

**Start with command #1 and work your way down!**
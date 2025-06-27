# Vibe Dev Workflow

> How we build excellence, one session at a time.

## The Two-Claude Workflow

### Claude Desktop (Testing & Analysis)
1. Tests and identifies issues
2. Creates detailed handoffs
3. Updates documentation
4. Never touches source code

### Claude Code (Implementation)
1. Reads handoffs carefully
2. Implements fixes
3. Runs comprehensive tests
4. Creates response handoffs

## Session Workflow

Every development session follows this exact pattern:

### ⚠️ CRITICAL: Git Authorization Required
**NEVER execute `git push` or `git pull` without explicit user authorization**
- All local git operations (status, add, commit, branch) are allowed
- Remote operations (push, pull, fetch) require explicit permission
- If a handoff suggests git push/pull, wait for authorization

### 1. Understand Reality (5 minutes)
```bash
cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev
git status
npm test
cat docs/STATUS.md | grep -A 10 "Current Issues"
```
**Why**: Build on truth, not assumptions.

### 2. Choose Your Impact (2 minutes)
Pick ONE issue from STATUS.md. Total focus.
**Why**: Excellence comes from depth, not breadth.

### 3. Test Thoroughly (15 minutes)

**For Performance Issues**:
```bash
# Measure current state
echo "=== PERFORMANCE BASELINE ==="
time vibe_terminal("echo test")
time vibe_terminal("ls -la")

# Test edge cases
vibe_terminal("sleep 2")  # Long running
vibe_terminal("find / -name '*.txt' | head -10")  # Complex output
```

**For Intelligence Issues**:
```bash
# Test pattern recognition
echo "=== INTELLIGENCE TEST ==="
vibe_terminal("cd /tmp && mkdir test-project")
vibe_terminal("npm init -y")
vibe_terminal("npm install express")
vibe_recap({ hours: 0.1 })  # Should recognize Node.js workflow
```

**For Reliability Issues**:
```bash
# Test error handling
echo "=== RELIABILITY TEST ==="
vibe_terminal("false")  # Should handle exit code 1
vibe_terminal("cd /nonexistent")  # Should handle errors
vibe_terminal("echo $?")  # Should show correct exit code
```

### 4. Identify Root Cause (10 minutes)

Use Desktop Commander to investigate:
```bash
# Read relevant source
desktop-commander:read_file path="/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/src/vibe-terminal.ts"

# Search for patterns
desktop-commander:search_code path="/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/src" pattern="exitCode"

# Check test cases
desktop-commander:read_file path="/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/test/vibe-terminal.test.ts"
```

### 5. Create Detailed Handoff (10 minutes)

**Location**: `/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/docs/claude-handoffs/`
**Filename**: `YYYY-MM-DD_HH-MM-SS_desktop-to-code.md`

**Template**:
```markdown
# Vibe Dev Session Handoff

## For You (Human Coordinator)

**Issue**: Output Isolation Problem
**Impact**: Commands show accumulated output instead of just their own
**Priority**: High - affects core functionality

## Issue Details

**Current Behavior**:
- Running multiple commands accumulates all outputs
- Exit codes bleed between commands
- Working directory always shows "/"

**Expected Behavior**:
- Each command shows only its own output
- Exit codes are isolated per command
- Working directory tracks actual pwd

**Root Cause Hypothesis**:
The commandHistory array is being displayed in full instead of just the current command's output.

## For Claude Code - COPY THIS ENTIRE SECTION

```bash
cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev
git status
npm test

# Reproduce the issue
npm run build
node dist/index.js

# In another terminal, test:
# vibe_terminal("echo first")
# vibe_terminal("echo second")
# Second command will show both outputs

# After fixing, verify:
# Each command shows only its output
# Exit codes are isolated
# pwd tracking works
```
```

### 6. Update STATUS.md (5 minutes)

Record exactly what was done:
```markdown
### ✅ Completed This Session

1. **Issue Investigation**
   - Tested output isolation problem
   - Identified root cause in command history display
   - Created detailed handoff for fix

2. **Testing Results**
   - Confirmed: Commands accumulate output
   - Confirmed: Exit codes bleed between commands
   - Confirmed: pwd tracking broken

### 🎯 Next Priority

**For Claude Code**: Fix output isolation as described in handoff
**Expected Result**: Each command shows only its own output
```

### 7. Send to Claude Code

Message template:
```
There's a new handoff for you in the Vibe Dev project.

Location: /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev/docs/claude-handoffs/2025-06-27_23-30-00_desktop-to-code.md

Please:
1. Read the handoff file first
2. Copy and run the commands in the "For Claude Code" section
3. Fix the issue described
4. Test your fix thoroughly
5. Create your own handoff when done: 2025-06-27_HH-MM-SS_code-to-desktop.md

IMPORTANT: Do NOT execute git push or git pull. Only local git operations (add, commit, status) are allowed. If you need to push changes, include that in your response handoff for manual execution.

The issue is output isolation - commands are showing accumulated output instead of just their own.

Let me know when you're done or if you need clarification.
```

## Git Operations Protocol

### Allowed Without Authorization:
- `git status` - Check current state
- `git add` - Stage changes
- `git commit` - Commit locally
- `git branch` - Create/switch branches
- `git log` - View history
- `git diff` - Compare changes

### REQUIRES Explicit Authorization:
- `git push` - ⚠️ NEVER without permission
- `git pull` - ⚠️ NEVER without permission
- `git fetch` - ⚠️ Ask first
- Any operation affecting remote repos

### Example Handoff with Git:
```markdown
## For Claude Code - COPY THIS ENTIRE SECTION
```bash
cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev
git status
# Make fixes...
npm test
git add -A
git commit -m "fix: output isolation for commands"
git status

# DO NOT RUN - Request authorization:
# git push origin main
```
```

## Task Types

### Performance Tasks
- Reduce response time
- Optimize memory usage
- Improve startup speed
- Streamline execution

### Intelligence Tasks
- Recognize new patterns
- Improve suggestions
- Understand workflows
- Enhance analysis

### Reliability Tasks
- Fix edge cases
- Improve error handling
- Add resilience
- Ensure consistency

### Simplicity Tasks
- Reduce code complexity
- Improve readability
- Remove redundancy
- Enhance maintainability

## Success Metrics

After EVERY session, you must improve ONE:
1. **Speed**: Response time decreased by X%
2. **Intelligence**: New workflow pattern recognized
3. **Reliability**: Edge case handled gracefully
4. **Simplicity**: Lines of code reduced by Y

## Quality Checklist

Before creating handoff, ensure:
- [ ] Issue is reproducible
- [ ] Root cause is identified
- [ ] Fix approach is clear
- [ ] Test cases are defined
- [ ] Success metrics are measurable

## The Only Question

**"After this session, why would a developer choose Vibe Dev?"**

Your answer must be specific and measurable:
- "Because it now responds 60% faster"
- "Because it now understands Python workflows"
- "Because it now recovers from disconnections"
- "Because it now has 30% less code"

## Anti-Patterns to Avoid

- ❌ Working on multiple issues at once
- ❌ Making changes without tests
- ❌ Skipping STATUS.md updates
- ❌ Creating vague handoffs
- ❌ Implementing without measuring
- ❌ **Executing git push/pull without explicit authorization**
- ❌ **Any remote repository modifications without permission**

## The Cycle of Excellence

1. **Claude Desktop** tests and documents
2. **Human** reviews and coordinates
3. **Claude Code** implements and tests
4. **Human** verifies improvement
5. **Repeat** with next priority

Every cycle makes Vibe Dev measurably better.

---

*Every session ships measurable improvement or it failed.*
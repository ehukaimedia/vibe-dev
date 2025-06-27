# 🚀 CLAUDE CODE: START HERE

**Quick Start Guide for Vibe Dev MVP Implementation**

## 📖 Read These Files In Order:

1. **`/docs/production/MVP_PLAN.md`** ⭐⭐⭐⭐⭐
   - Your complete implementation guide
   - Has EVERYTHING you need to know
   - Technical details, code examples, success criteria

2. **`/docs/production/LOCAL_FILES_REFERENCE.md`** ⭐⭐⭐⭐⭐
   - Critical local files to study
   - Shows intent detection patterns from trackTools.ts
   - RecapMCP implementation insights
   - What NOT to do from DesktopCommanderMCP

3. **`/docs/claude-handoffs/2025-06-27_15-45-00_desktop-to-code.md`** ⭐⭐⭐⭐
   - Context from today's architecture session
   - Key insights and decisions explained
   - Quick summary of what we're building

3. **`README.md`** ⭐⭐⭐
   - Vision and user-facing promises
   - Shows what the end result should feel like
   - Good to understand the "why"

4. **`/src/vibe-intelligence.ts`** ⭐⭐
   - I created the interfaces for you
   - Shows the data structures we'll use
   - Don't implement this yet - just review

5. **`/docs/ARCHITECTURE.md`** (If you have time)
   - Detailed system design
   - More context on decisions

## 🎯 Your Mission in One Sentence:

**Build a PTY-based terminal emulator that maintains persistent sessions across commands, wrapped in an MCP server with two tools: vibe_terminal and vibe_recap.**

## 💡 The Core Innovation:

```typescript
// Everyone else does this (WRONG):
spawn('cd /project')  // Process dies, directory change lost

// We do this (RIGHT):
terminal.write('cd /project\n')  // Terminal remembers!
```

## ⚡ Quick Test to Verify It's Working:

```typescript
await vibe_terminal("cd /tmp")
await vibe_terminal("pwd")  // MUST output: /tmp
```

If that works, you're on the right track!

## 🔧 First Steps:

1. `npm init -y`
2. `npm install node-pty @modelcontextprotocol/sdk zod zod-to-json-schema`
3. Create a simple PTY test
4. Get prompt detection working
5. Build MCP server following patterns in LOCAL_FILES_REFERENCE.md

**IMPORTANT**: The MCP server setup is documented with complete examples. Follow the RecapMCP pattern - it's simpler and perfect for our two-tool approach.

Remember: **Simple > Complex**. Get basics working first.

Good luck! 🚀
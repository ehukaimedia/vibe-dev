# Vibe Dev MVP Implementation Plan

**Generated**: June 27, 2025  
**Purpose**: Complete implementation guide for Claude Code to build the Vibe Dev MVP  
**Context**: This document captures all critical decisions, insights, and technical approaches discussed during the architecture phase

## 🎯 Core Vision & Philosophy

### What Vibe Dev IS

Vibe Dev is a **revolutionary** MCP server that provides what no other tool currently offers:
- **True persistent shell sessions** via PTY (Pseudo-Terminal) technology
- **First-hand intelligence** from direct command output analysis
- **Bulletproof disconnect recovery** with chronological reconstruction
- **100% terminal compatibility** - if it works in your terminal, it works in Vibe Dev

### What Vibe Dev IS NOT

- Not another command executor that spawns isolated processes
- Not a tool that parses commands and tries to handle complexity
- Not limited by artificial constraints of traditional approaches
- Not trying to simulate a terminal - it IS a terminal

### The Fundamental Innovation

**Traditional tools** (like DesktopCommanderMCP):
```javascript
// Each command is isolated
spawn('cd /project', { shell: true })      // Dies immediately
spawn('npm install', { shell: true })      // New shell, wrong directory
spawn('python script.py', { shell: true }) // No virtual env
```

**Vibe Dev**:
```javascript
// One living terminal session
terminal.write('cd /project\n')           // Session persists
terminal.write('npm install\n')           // Same session, correct directory  
terminal.write('python script.py\n')      // Virtual env active!
```

## 🏗️ Technical Architecture

### Core Technology Stack

1. **PTY (Pseudo-Terminal)**
   - Use `node-pty` package - battle-tested, cross-platform
   - Same technology as VS Code, iTerm2, SSH
   - Provides true terminal emulation, not approximation

2. **MCP Server Framework**
   - Two tools only: `vibe_terminal` and `vibe_recap`
   - Minimal surface area, maximum capability
   - Follow MCP protocol for Claude Desktop integration

3. **Session Management**
   - One PTY instance per workspace/project
   - Sessions survive disconnections
   - State serialization for recovery

### File Structure (Already Created)
```
vibe-dev/
├── src/
│   ├── index.ts             # MCP server entry point
│   ├── vibe-intelligence.ts # Intelligence engine (stub exists)
│   ├── vibe-terminal.ts     # PTY implementation (to build)
│   └── vibe-recap.ts        # Analysis tool (to build)
```

## 🔑 Critical Implementation Details

### 1. Terminal Emulator Implementation

**Key Requirements:**
- Must use PTY, not `child_process.spawn()`
- Must maintain persistent session across all commands
- Must handle ANSI escape sequences properly
- Must detect command completion (prompt detection)

**Example Implementation Approach:**
```typescript
import * as pty from 'node-pty';

class VibeTerminal {
  private pty: pty.IPty;
  private output: string = '';
  private sessionId: string;
  
  constructor() {
    this.sessionId = generateSessionId();
    this.pty = pty.spawn(defaultShell(), [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });
  }
  
  async execute(command: string): Promise<TerminalResult> {
    return new Promise((resolve) => {
      let output = '';
      const startTime = Date.now();
      
      const onData = (data: string) => {
        output += data;
        this.output += data; // Keep full session history
        
        if (this.isAtPrompt(output)) {
          this.pty.off('data', onData);
          
          // Extract exit code from prompt if possible
          const exitCode = this.extractExitCode(output);
          
          resolve({
            output: this.cleanOutput(output),
            exitCode,
            duration: Date.now() - startTime,
            sessionId: this.sessionId
          });
        }
      };
      
      this.pty.on('data', onData);
      this.pty.write(command + '\r');
    });
  }
  
  // Critical: Prompt detection is KEY to making this work
  private isAtPrompt(output: string): boolean {
    // This needs careful implementation and testing
    // Look for common prompt patterns:
    // - '$ ' or '# ' at line end
    // - PS1 patterns
    // - Custom prompt detection
    const lines = output.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // Basic detection - needs enhancement
    return /\$\s*$/.test(lastLine) || 
           /#\s*$/.test(lastLine) ||
           />\s*$/.test(lastLine);
  }
}
```

### 2. Critical PTY Considerations

**Must Handle:**
1. **Prompt Detection** - Most critical piece
   - Different shells have different prompts
   - Must handle custom PS1 configurations
   - Consider timeout fallback

2. **ANSI Escape Sequences**
   - Don't strip them during capture
   - Strip them for display in Claude
   - Preserve for color/formatting analysis

3. **Interactive Commands**
   - Detect when command is waiting for input
   - Handle vim, less, top, etc.
   - Provide mechanism to send additional input

4. **Signal Handling**
   - Ctrl+C (SIGINT)
   - Ctrl+Z (SIGTSTP)  
   - Proper cleanup on exit

### 3. Session Persistence & Recovery

**Requirements:**
- Sessions must survive Claude Desktop disconnections
- Must be able to list active sessions
- Must be able to reattach to existing session
- Must track chronological command history

**Implementation Approach:**
```typescript
interface SessionState {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  workingDirectory: string;
  environmentVariables: Record<string, string>;
  commandHistory: CommandRecord[];
  currentPrompt: string;
  ptyState?: any; // Platform specific
}

interface CommandRecord {
  timestamp: Date;
  command: string;
  output: string;
  exitCode: number;
  duration: number;
  workingDirectory: string;
  intent?: string; // From intelligence analysis
}
```

### 4. Intelligence Integration

**Data We Can Capture (that others can't):**
- Real-time output with timing
- Actual exit codes from commands
- ANSI color codes (build failures in red!)
- Progress indicators and spinners
- Interactive command sequences
- Exact error messages with context

**What This Enables:**
- Understand WHY commands failed
- Track test results in detail
- Monitor build progress
- Detect hanging processes
- Provide contextual suggestions

### 5. vibe_recap Implementation

**Core Responsibilities:**
- Analyze session history chronologically
- Detect work patterns and intent
- Provide disconnect recovery instructions
- Generate intelligent suggestions

**Must Include:**
- Chronological activity timeline
- Intent detection (what were they trying to do)
- Current state summary
- Resume instructions
- Intelligent next-step suggestions

## 📋 MVP Feature Checklist

### Phase 1: Core Terminal (Week 1)
- [ ] Basic PTY implementation with node-pty
- [ ] Simple prompt detection (bash/zsh)
- [ ] Command execution and output capture
- [ ] Session persistence across commands
- [ ] Basic error handling

### Phase 2: Session Management (Week 1-2)
- [ ] Session state serialization
- [ ] Multiple session support
- [ ] Reattach to existing sessions
- [ ] Chronological command history
- [ ] Working directory tracking

### Phase 3: MCP Integration (Week 2)
- [ ] MCP server setup
- [ ] vibe_terminal tool implementation
- [ ] Basic vibe_recap tool
- [ ] Claude Desktop configuration
- [ ] Error responses per MCP spec

### Phase 4: Intelligence Features (Week 2-3)
- [ ] Exit code tracking
- [ ] Execution timing
- [ ] Error detection and categorization
- [ ] Basic intent detection
- [ ] Smart suggestions

### Phase 5: Recovery & Reliability (Week 3)
- [ ] Disconnect recovery
- [ ] Session cleanup
- [ ] Resource limits
- [ ] Timeout handling
- [ ] Crash recovery

## 🚨 Critical Success Factors

### 1. Prompt Detection MUST Work
This is the make-or-break feature. Without reliable prompt detection:
- Commands appear to hang
- Output gets mixed up
- Session state becomes confused

**Strategies:**
- Start with common prompts
- Add configuration for custom prompts
- Implement timeout fallback
- Consider prompt injection technique

### 2. Real Session Persistence
The promise is that `cd /project` persists. This must work:
```bash
vibe_terminal("cd /project")
vibe_terminal("pwd")  # MUST output: /project
```

### 3. Perfect Compatibility
These must all work without special handling:
```bash
vibe_terminal("ls -la | grep -v node_modules | wc -l")
vibe_terminal("echo 'hello' > file.txt && cat file.txt")
vibe_terminal("python -c \"print('test')\"")
vibe_terminal("npm init -y")  # Interactive!
```

## 🎭 What Makes Vibe Dev Different

### We're Not Building Another Command Executor

**They do this:**
```javascript
// 1000+ lines of code trying to parse and handle commands
parseCommand(cmd)
handleQuotes(cmd)  
detectPipes(cmd)
manageRedirects(cmd)
// Still breaks on edge cases
```

**We do this:**
```javascript
// ~200 lines total
terminal.write(cmd + '\n')
waitForPrompt()
// Terminal handles EVERYTHING correctly
```

### Intelligence From First-Hand Data

**They see:**
- "npm test" was run
- Process exited

**We see:**
- Every test name and result
- Exact timing for each suite
- Which specific assertion failed
- The error stack trace
- Terminal colors indicating failure
- The actual exit code

This depth of information enables revolutionary intelligence features.

## 🔧 Development Approach

### 1. Start Simple
- Get basic PTY working with simple commands
- Focus on prompt detection first
- Test with common commands (ls, cd, echo)

### 2. Iterate on Prompt Detection
- This will take the most time
- Test with different shells
- Handle edge cases gradually

### 3. Add Intelligence Incrementally  
- Start with basic output capture
- Add timing, then exit codes
- Build intelligence features on solid foundation

### 4. Test Real Workflows
```bash
# This entire flow must work
vibe_terminal("mkdir test-project")
vibe_terminal("cd test-project")
vibe_terminal("npm init -y")
vibe_terminal("npm install express")
vibe_terminal("echo 'console.log(\"Hello\")' > index.js")
vibe_terminal("node index.js")
```

## 📊 Architecture Decisions & Rationale

### Why PTY?
- **Correctness**: Terminal handles all complexity correctly
- **Compatibility**: 100% command compatibility
- **Features**: History, completion, colors all free
- **Simplicity**: ~90% less code than parsing approach

### Why Two Tools?
- **Minimal Surface**: Easy to understand and use
- **Clear Separation**: Execution vs Analysis
- **Future Proof**: Can enhance either without breaking other

### Why Session Persistence?
- **Developer Reality**: Real work uses persistent sessions
- **Context Preservation**: cd, export, source must persist
- **Recovery**: Disconnections shouldn't lose work

## 🎯 Definition of MVP Success

The MVP is successful when:

1. **Basic Flow Works**
   ```bash
   vibe_terminal("cd /tmp")
   vibe_terminal("pwd")  # Shows: /tmp
   vibe_terminal("echo $USER")  # Shows actual user
   ```

2. **Virtual Environments Work**
   ```bash
   vibe_terminal("python -m venv myenv")
   vibe_terminal("source myenv/bin/activate")
   vibe_terminal("which python")  # Shows: myenv/bin/python
   ```

3. **Complex Commands Work**
   ```bash
   vibe_terminal("git log --oneline | head -5")
   vibe_terminal("find . -name '*.js' | xargs grep TODO")
   ```

4. **Recovery Works**
   - Disconnect from Claude
   - Run vibe_recap()
   - Get accurate chronological history
   - Can resume where left off

## 🚀 Implementation Notes from Analysis

### Learned from DesktopCommanderMCP-Recap

We analyzed their `execute.ts` and `terminal-manager.ts`. Key findings:

1. **They use spawn()** - Isolated commands, no persistence
2. **No session continuity** - Each command starts fresh  
3. **Limited to simple commands** - Complex pipes/redirects fragile
4. **No interactive support** - Commands requiring input fail

This validates our PTY approach will provide massive advantages.

### Insights from trackTools.ts Analysis

Their sophisticated intent detection system shows what's possible when you have good data. With our first-hand terminal access, we can do even better:

- Track actual command success/failure
- Understand error contexts
- Provide suggestions based on real output
- Detect patterns from actual results

### Critical Difference

They analyze what commands were run.
We analyze what actually happened.

This is the foundation of Vibe Dev's superiority.

## 📝 Final Notes for Claude Code

### Your Mission

Build an MVP that proves terminal emulation is the right approach. Don't get distracted by features - focus on:

1. **Reliable PTY implementation**
2. **Solid prompt detection**  
3. **Real session persistence**
4. **Basic recovery capability**

Everything else can be enhanced later. The core must be rock solid.

### Remember the Philosophy

- We're building a real terminal, not a command runner
- Every command flows through one persistent session
- The terminal handles complexity, we provide intelligence
- Simple implementation, powerful capabilities

### Success Metric

When a developer can use Vibe Dev for an entire development session without once thinking "I wish this worked like my regular terminal" - we've succeeded.

Because it IS a regular terminal. Just one with intelligence.

---

*Good luck! You're building something revolutionary. The code elimination analysis showed ~88% reduction is possible. Make it happen.*
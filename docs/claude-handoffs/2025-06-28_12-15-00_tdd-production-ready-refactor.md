# TDD Production-Ready Test Refactor - Vibe Dev

## For You (Human Coordinator)
- Current coverage: 72.13% overall (achieved through test-after approach)
- Goal: Achieve production-ready coverage using STRICT TDD methodology
- Priority: Critical - Current tests were written after code (violates TDD)
- Approach: Red-Green-Refactor cycle for EVERY change

## TDD Violations in Current Approach

### What Went Wrong
1. **Tests written AFTER code** - All current tests violate TDD principles
2. **Coverage-driven testing** - Focused on metrics instead of behavior
3. **No failing tests first** - Jumped straight to making tests pass
4. **Missing refactor phase** - Code wasn't improved after tests passed

### The Sacred TDD Cycle (From TDD-WORKFLOW.md)
```
1. RED: Write a failing test for the behavior you want
2. GREEN: Write minimal code to make the test pass
3. REFACTOR: Improve the code while keeping tests green
```

## For Claude Code - TRUE TDD Implementation

### Phase 1: Index.ts Refactor Using TDD

#### Step 1: RED - Write Failing Test First
```typescript
// test/unit/index.test.ts
describe('Vibe Dev Entry Point', () => {
  it('should export a startServer function', () => {
    // This test MUST fail first!
    const { startServer } = require('../../src/index.js');
    expect(startServer).toBeDefined();
    expect(typeof startServer).toBe('function');
  });
});
```

Run test: `npm test index.test.ts`
Expected: ❌ FAIL - startServer is not exported

#### Step 2: GREEN - Minimal Code to Pass
```typescript
// src/index.ts
export async function startServer() {
  // Minimal implementation
}

// Keep existing code but wrapped in function
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
```

Run test: `npm test index.test.ts`
Expected: ✅ PASS

#### Step 3: REFACTOR - Improve Design
```typescript
// src/index.ts
export interface ServerConfig {
  onError?: (error: Error) => void;
  onShutdown?: () => void;
}

export async function startServer(config: ServerConfig = {}) {
  const { onError, onShutdown } = config;
  
  process.on('SIGINT', () => {
    console.error("Vibe Dev: Received SIGINT, shutting down...");
    onShutdown?.();
    process.exit(0);
  });
  
  // Rest of implementation...
}
```

### Phase 2: Session Persistence Using TDD

#### Step 1: RED - Test Disconnect Recovery First
```typescript
// test/integration/disconnect-recovery.test.ts
describe('Disconnect Recovery', () => {
  it('should preserve session ID across disconnects', async () => {
    // Write this test BEFORE implementing the feature!
    const session1 = new VibeTerminal();
    const sessionId = session1.getSessionState().sessionId;
    
    // Simulate disconnect
    session1.disconnect(); // This method doesn't exist yet!
    
    // Reconnect
    const session2 = VibeTerminal.reconnect(sessionId); // This doesn't exist!
    
    expect(session2.getSessionState().sessionId).toBe(sessionId);
  });
});
```

Run test: ❌ FAIL - Methods don't exist

#### Step 2: GREEN - Implement Minimal Solution
```typescript
// src/vibe-terminal.ts
export class VibeTerminal {
  private static sessions = new Map<string, VibeTerminal>();
  
  disconnect() {
    // Store session for reconnection
    VibeTerminal.sessions.set(this.sessionId, this);
  }
  
  static reconnect(sessionId: string): VibeTerminal {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    return session;
  }
}
```

Run test: ✅ PASS

#### Step 3: REFACTOR - Add Robustness
```typescript
// src/vibe-terminal.ts
export class VibeTerminal {
  private static sessions = new Map<string, SessionData>();
  private static readonly MAX_SESSIONS = 100;
  private static readonly SESSION_TIMEOUT = 3600000; // 1 hour
  
  disconnect() {
    // Clean old sessions
    this.cleanExpiredSessions();
    
    // Store session data, not instance
    const sessionData = {
      id: this.sessionId,
      state: this.getSessionState(),
      timestamp: Date.now()
    };
    
    VibeTerminal.sessions.set(this.sessionId, sessionData);
  }
  
  private cleanExpiredSessions() {
    const now = Date.now();
    for (const [id, data] of VibeTerminal.sessions) {
      if (now - data.timestamp > VibeTerminal.SESSION_TIMEOUT) {
        VibeTerminal.sessions.delete(id);
      }
    }
  }
}
```

### Phase 3: Enterprise Features Using TDD

#### Step 1: RED - Test Resource Limits First
```typescript
// test/unit/resource-limits.test.ts
describe('Resource Management', () => {
  it('should enforce maximum concurrent sessions', () => {
    // Configure limit that doesn't exist yet
    VibeTerminal.setMaxConcurrentSessions(3);
    
    // Create max sessions
    const terminals = [];
    for (let i = 0; i < 3; i++) {
      terminals.push(new VibeTerminal());
    }
    
    // Fourth should fail
    expect(() => new VibeTerminal()).toThrow('Maximum concurrent sessions reached');
  });
});
```

Run test: ❌ FAIL - setMaxConcurrentSessions doesn't exist

#### Step 2: GREEN - Implement Limit
```typescript
// src/vibe-terminal.ts
export class VibeTerminal {
  private static activeSessions = 0;
  private static maxSessions = 10;
  
  static setMaxConcurrentSessions(max: number) {
    this.maxSessions = max;
  }
  
  constructor(config?: TerminalConfig) {
    if (VibeTerminal.activeSessions >= VibeTerminal.maxSessions) {
      throw new Error('Maximum concurrent sessions reached');
    }
    VibeTerminal.activeSessions++;
    // ... rest of constructor
  }
}
```

Run test: ✅ PASS

### Phase 4: Performance Benchmarks Using TDD

#### Step 1: RED - Define Performance Requirements
```typescript
// test/performance/latency.test.ts
describe('Command Execution Latency', () => {
  it('should execute echo command in under 50ms', async () => {
    const terminal = new VibeTerminal();
    
    const start = performance.now();
    await terminal.execute('echo "test"');
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
  });
});
```

Run test: ❌ FAIL - Current implementation too slow

#### Step 2: GREEN - Optimize for Speed
```typescript
// src/vibe-terminal.ts
export class VibeTerminal {
  private outputBuffer: string = '';
  private promptDetected: boolean = false;
  
  async execute(command: string): Promise<TerminalResult> {
    // Add performance optimizations
    this.outputBuffer = '';
    this.promptDetected = false;
    
    return new Promise((resolve) => {
      // Use more efficient prompt detection
      const fastPromptDetection = (data: string) => {
        this.outputBuffer += data;
        if (this.isPromptReady(data)) {
          resolve(this.createResult());
        }
      };
      
      this.pty.onData(fastPromptDetection);
      this.pty.write(command + '\r');
    });
  }
  
  private isPromptReady(data: string): boolean {
    // Optimized prompt detection
    return /[$#>]\s*$/.test(data);
  }
}
```

Run test: ✅ PASS

### TDD Workflow for Each Feature

#### Example: Adding Audit Trail Feature

**1. RED Phase - Start with behavior test:**
```typescript
// test/unit/audit-trail.test.ts
describe('Audit Trail', () => {
  it('should emit audit event for each command', async () => {
    const terminal = new VibeTerminal();
    const auditSpy = jest.fn();
    
    // This API doesn't exist yet!
    terminal.on('audit', auditSpy);
    
    await terminal.execute('sensitive-command');
    
    expect(auditSpy).toHaveBeenCalledWith({
      command: 'sensitive-command',
      timestamp: expect.any(Date),
      sessionId: expect.any(String)
    });
  });
});
```

**2. GREEN Phase - Make it work:**
```typescript
// src/vibe-terminal.ts
import { EventEmitter } from 'events';

export class VibeTerminal extends EventEmitter {
  async execute(command: string): Promise<TerminalResult> {
    // Emit audit event
    this.emit('audit', {
      command,
      timestamp: new Date(),
      sessionId: this.sessionId
    });
    
    // ... rest of execution
  }
}
```

**3. REFACTOR Phase - Make it right:**
```typescript
// src/vibe-terminal.ts
export interface AuditEvent {
  command: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  outcome?: 'success' | 'failure';
  duration?: number;
}

export class VibeTerminal extends EventEmitter {
  async execute(command: string): Promise<TerminalResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.executeInternal(command);
      
      this.emitAuditEvent({
        command,
        timestamp: new Date(),
        sessionId: this.sessionId,
        outcome: 'success',
        duration: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      this.emitAuditEvent({
        command,
        timestamp: new Date(),
        sessionId: this.sessionId,
        outcome: 'failure',
        duration: Date.now() - startTime
      });
      throw error;
    }
  }
  
  private emitAuditEvent(event: AuditEvent) {
    this.emit('audit', event);
  }
}
```

### Daily TDD Checklist

#### Before Writing ANY Code:
- [ ] Write a FAILING test first
- [ ] Run test and see RED
- [ ] Commit the failing test

#### Making Test Pass:
- [ ] Write MINIMAL code to pass
- [ ] No extra features
- [ ] Run test and see GREEN
- [ ] Commit the passing code

#### Refactoring:
- [ ] Improve code design
- [ ] Keep tests GREEN
- [ ] Extract methods/classes
- [ ] Commit improvements

### TDD Principles for This Project

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad: Testing implementation
   expect(terminal.pty).toBeDefined();
   
   // ✅ Good: Testing behavior
   expect(await terminal.execute('pwd')).toHaveProperty('output');
   ```

2. **One Assertion Per Test**
   ```typescript
   // ❌ Bad: Multiple assertions
   it('should execute command', async () => {
     const result = await terminal.execute('echo test');
     expect(result.output).toBe('test');
     expect(result.exitCode).toBe(0);
     expect(result.duration).toBeLessThan(100);
   });
   
   // ✅ Good: Focused tests
   it('should return command output', async () => {
     const result = await terminal.execute('echo test');
     expect(result.output).toBe('test');
   });
   
   it('should return zero exit code for successful commands', async () => {
     const result = await terminal.execute('echo test');
     expect(result.exitCode).toBe(0);
   });
   ```

3. **Test Names Describe Behavior**
   ```typescript
   // ❌ Bad: Technical names
   it('should call pty.write')
   
   // ✅ Good: Behavior names
   it('should preserve environment variables across commands')
   ```

### Success Metrics

- [ ] Every feature has tests written FIRST
- [ ] No code without failing test
- [ ] All tests describe user behavior
- [ ] Refactoring happens after GREEN
- [ ] Coverage is a byproduct, not a goal

### Remember

> "TDD is not about testing, it's about design. The tests force you to design your code to be testable, which makes it better designed." - Kent Beck

Write the test you wish you had, then make it pass.
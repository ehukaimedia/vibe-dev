# Production-Ready Test Refactor - Vibe Dev

## For You (Human Coordinator)
- Current coverage: 72.13% overall (types.ts and vibe-intelligence.ts at 100%, others incomplete)
- Goal: Achieve production-ready test coverage that validates README claims
- Priority: High - README promises "bulletproof" and "enterprise-grade" reliability
- Approach: Incremental improvements focusing on highest-impact areas first

## Current State vs README Claims

### Coverage Reality Check
| Module | Current | Required | Gap | Priority |
|--------|---------|----------|-----|----------|
| index.ts | 0% | 95%+ | Critical | P1 - Entry point |
| server.ts | 0% | 95%+ | Critical | P1 - Core functionality |
| vibe-terminal.ts | 68.75% | 100% | High | P1 - Main feature |
| vibe-recap.ts | 91.47% | 100% | Medium | P2 - Nearly complete |
| types.ts | 100% | 100% | ✓ | Complete |
| vibe-intelligence.ts | 100% | 100% | ✓ | Complete |

### README Claims Requiring Validation
1. **"Bulletproof Design"** - Needs error handling and edge case tests
2. **"Persistent Sessions"** - Needs session state preservation tests
3. **"Disconnect Recovery"** - Completely untested major feature
4. **"Enterprise-Grade"** - Needs resource management and audit tests
5. **"Modern Developer Experience"** - Needs real-world workflow tests

## For Claude Code - Incremental Test Strategy

### Phase 1: Fix Foundation (Days 1-2)
**Goal**: Get index.ts and server.ts to 80%+ coverage

#### 1.1 Refactor for Testability
```typescript
// src/index.ts - Extract testable functions
export async function setupSignalHandlers(process: NodeJS.Process) {
  process.on('SIGINT', () => {
    console.error("Vibe Dev: Received SIGINT, shutting down...");
    process.exit(0);
  });
  
  process.on('uncaughtException', (error) => {
    console.error("Vibe Dev: Uncaught exception:", error);
    process.exit(1);
  });
}

export async function createAndConnectServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Vibe Dev: Server running and connected");
  return { transport, server };
}

// Make the main function testable
export async function main() {
  console.error("Vibe Dev: Starting MCP server...");
  setupSignalHandlers(process);
  
  try {
    await createAndConnectServer();
  } catch (error) {
    console.error("Vibe Dev: Failed to start server:", error);
    process.exit(1);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Vibe Dev: Fatal error:", error);
    process.exit(1);
  });
}
```

#### 1.2 Test the Extracted Functions
```typescript
// test/unit/index.test.ts
describe('Index Entry Point', () => {
  describe('setupSignalHandlers', () => {
    it('should handle SIGINT gracefully', () => {
      const mockProcess = new EventEmitter() as any;
      mockProcess.exit = jest.fn();
      
      setupSignalHandlers(mockProcess);
      mockProcess.emit('SIGINT');
      
      expect(mockProcess.exit).toHaveBeenCalledWith(0);
    });
  });
  
  describe('createAndConnectServer', () => {
    it('should create server and connect transport', async () => {
      // Test server creation logic
    });
  });
});
```

### Phase 2: Critical Features (Days 3-4)
**Goal**: Test disconnect recovery and session persistence

#### 2.1 Session Persistence Tests
```typescript
// test/integration/session-persistence.test.ts
describe('Session Persistence', () => {
  it('should maintain state across multiple commands', async () => {
    const terminal = new VibeTerminal();
    
    // Change directory
    await terminal.execute('cd /tmp');
    expect(terminal.getSessionState().workingDirectory).toBe('/tmp');
    
    // Set environment variable
    await terminal.execute('export TEST_VAR=persistent');
    
    // Verify persistence
    const result = await terminal.execute('echo $TEST_VAR');
    expect(result.output).toContain('persistent');
  });
  
  it('should preserve virtual environment activation', async () => {
    const terminal = new VibeTerminal();
    
    await terminal.execute('python -m venv test_env');
    await terminal.execute('source test_env/bin/activate');
    
    const result = await terminal.execute('which python');
    expect(result.output).toContain('test_env');
  });
});
```

#### 2.2 Disconnect Recovery Tests
```typescript
// test/integration/disconnect-recovery.test.ts
describe('Disconnect Recovery', () => {
  it('should reconstruct session state after disconnect', async () => {
    const terminal = new VibeTerminal();
    
    // Simulate work session
    await terminal.execute('cd /project');
    await terminal.execute('git checkout -b feature/test');
    await terminal.execute('npm install');
    
    // Get state before "disconnect"
    const stateBeforeDisconnect = terminal.getSessionState();
    
    // Simulate disconnect by creating new terminal
    const newTerminal = new VibeTerminal();
    
    // Use recap to recover context
    const recap = await generateRecap({ 
      hours: 1, 
      type: 'full',
      sessionId: stateBeforeDisconnect.sessionId 
    });
    
    expect(recap).toContain('cd /project');
    expect(recap).toContain('feature/test');
    expect(recap).toContain('RESUME EXACTLY WHERE YOU LEFT OFF');
  });
});
```

### Phase 3: Enterprise Features (Days 5-6)
**Goal**: Validate production-ready claims

#### 3.1 Resource Management Tests
```typescript
// test/unit/resource-management.test.ts
describe('Resource Management', () => {
  it('should enforce command timeout limits', async () => {
    const terminal = new VibeTerminal({ promptTimeout: 1000 });
    
    const result = await terminal.execute('sleep 10');
    expect(result.exitCode).toBe(-1);
    expect(result.output).toContain('Command timed out');
  });
  
  it('should clean up orphaned processes', async () => {
    const terminal = new VibeTerminal();
    const spy = jest.spyOn(terminal, 'kill');
    
    // Force cleanup
    terminal.kill();
    
    expect(spy).toHaveBeenCalled();
    // Verify no zombie processes
  });
  
  it('should limit concurrent sessions', async () => {
    const terminals = [];
    const maxSessions = 10;
    
    for (let i = 0; i < maxSessions; i++) {
      terminals.push(new VibeTerminal());
    }
    
    // Should throw or handle gracefully
    expect(() => new VibeTerminal()).toThrow('Maximum sessions reached');
  });
});
```

#### 3.2 Audit Trail Tests
```typescript
// test/unit/audit-trail.test.ts
describe('Audit Trail', () => {
  it('should log all commands with context', async () => {
    const terminal = new VibeTerminal();
    const auditSpy = jest.spyOn(terminal, 'logCommand');
    
    await terminal.execute('sensitive-command --api-key=xxx');
    
    expect(auditSpy).toHaveBeenCalledWith(expect.objectContaining({
      command: 'sensitive-command --api-key=xxx',
      timestamp: expect.any(Date),
      sessionId: expect.any(String),
      userId: expect.any(String)
    }));
  });
});
```

### Phase 4: Real-World Workflows (Days 7-8)
**Goal**: Test modern developer workflows

#### 4.1 Complex Command Tests
```typescript
// test/integration/complex-workflows.test.ts
describe('Modern Developer Workflows', () => {
  it('should handle Docker workflows', async () => {
    const terminal = new VibeTerminal();
    
    // Docker compose workflow
    await terminal.execute('docker compose up -d');
    const psResult = await terminal.execute('docker ps');
    expect(psResult.output).toContain('Up');
    
    // Cleanup
    await terminal.execute('docker compose down');
  });
  
  it('should handle complex pipes and redirects', async () => {
    const terminal = new VibeTerminal();
    
    const result = await terminal.execute(
      "find . -name '*.ts' | grep -v node_modules | wc -l"
    );
    
    expect(result.exitCode).toBe(0);
    expect(parseInt(result.output)).toBeGreaterThan(0);
  });
  
  it('should support interactive commands', async () => {
    const terminal = new VibeTerminal();
    
    // Test with a simple interactive command
    const gitResult = await terminal.execute('git config --global user.name');
    expect(gitResult.exitCode).toBe(0);
  });
});
```

### Phase 5: Performance Validation (Day 9)
**Goal**: Verify "zero parsing overhead" claims

#### 5.1 Performance Benchmarks
```typescript
// test/performance/benchmark.test.ts
describe('Performance Benchmarks', () => {
  it('should execute commands with minimal overhead', async () => {
    const terminal = new VibeTerminal();
    const iterations = 100;
    
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      await terminal.execute('echo "test"');
    }
    const duration = Date.now() - start;
    
    const avgTime = duration / iterations;
    expect(avgTime).toBeLessThan(50); // 50ms per command max
  });
  
  it('should handle large outputs efficiently', async () => {
    const terminal = new VibeTerminal();
    
    const start = Date.now();
    const result = await terminal.execute('cat /usr/share/dict/words | head -1000');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // 1 second max
    expect(result.output.split('\n').length).toBeGreaterThan(900);
  });
});
```

### Implementation Checklist

#### Week 1 Goals
- [ ] Refactor index.ts and server.ts for testability
- [ ] Achieve 80%+ coverage on entry points
- [ ] Implement session persistence tests
- [ ] Create disconnect recovery test suite

#### Week 2 Goals
- [ ] Add resource management tests
- [ ] Implement audit trail functionality and tests
- [ ] Test modern developer workflows
- [ ] Add performance benchmarks

#### Success Metrics
- [ ] Overall coverage > 95%
- [ ] All README claims have corresponding tests
- [ ] Zero failing tests in CI/CD
- [ ] Performance benchmarks pass
- [ ] Integration tests cover real workflows

### Testing Best Practices

1. **Use Test Doubles Wisely**
   ```typescript
   // Good: Test behavior, not implementation
   const mockPty = {
     write: jest.fn(),
     onData: jest.fn((cb) => {
       // Simulate realistic terminal behavior
       setTimeout(() => cb('$ '), 10);
     })
   };
   ```

2. **Test Real Scenarios**
   ```typescript
   // Good: Test actual developer workflows
   it('should support git workflow', async () => {
     await terminal.execute('git init');
     await terminal.execute('git add .');
     await terminal.execute('git commit -m "test"');
     // Verify the workflow completed successfully
   });
   ```

3. **Validate Edge Cases**
   ```typescript
   // Good: Test failure modes
   it('should handle network disconnects gracefully', async () => {
     // Simulate network failure
     // Verify graceful degradation
   });
   ```

### Next Steps

1. **Start with Phase 1** - Foundation fixes are critical
2. **Document test patterns** - Create test helpers for common scenarios
3. **Run coverage frequently** - `npm run test:coverage` after each change
4. **Focus on behavior** - Test what users experience, not implementation
5. **Iterate quickly** - Small, focused PRs are better than large changes

### Resources

- Jest Documentation: https://jestjs.io/docs/getting-started
- Testing Best Practices: https://kentcdodds.com/blog/write-tests
- MCP SDK Testing Guide: [Check MCP documentation]

Remember: The goal isn't just 100% coverage - it's validating that Vibe Dev delivers on its promises of being "bulletproof" and "enterprise-grade". Every test should strengthen user confidence in the product.
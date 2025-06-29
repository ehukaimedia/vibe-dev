import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VibeTerminal } from '../../src/vibe-terminal.js';
import { generateRecap } from '../../src/vibe-recap.js';

describe('README Feature Verification', () => {
  let terminal: VibeTerminal;

  beforeEach(() => {
    terminal = new VibeTerminal();
  });

  afterEach(() => {
    if (terminal) {
      terminal.kill();
    }
  });

  describe('Persistent Terminal Sessions', () => {
    it('should maintain session state across multiple commands', async () => {
      // README claim: cd, export, source commands persist across calls
      
      // Test directory persistence
      const pwdBefore = await terminal.execute('pwd');
      await terminal.execute('cd /tmp');
      const pwdAfter = await terminal.execute('pwd');
      
      expect(pwdAfter.output.trim()).toBe('/tmp');
      expect(pwdAfter.output.trim()).not.toBe(pwdBefore.output.trim());
    });

    it('should persist environment variables', async () => {
      // Set an environment variable
      await terminal.execute('export TEST_VAR="vibe-dev-test"');
      
      // Verify it persists in the next command
      const result = await terminal.execute('echo $TEST_VAR');
      expect(result.output.trim()).toBe('vibe-dev-test');
    });

    it('should maintain command history', async () => {
      // Execute several commands
      await terminal.execute('echo "first command"');
      await terminal.execute('echo "second command"');
      await terminal.execute('echo "third command"');
      
      // Get session state
      const state = terminal.getSessionState();
      expect(state.commandHistory).toHaveLength(3);
      expect(state.commandHistory[0].command).toBe('echo "first command"');
      expect(state.commandHistory[2].command).toBe('echo "third command"');
    });
  });

  describe('Intelligent Analysis', () => {
    it('should provide recap of recent activity', async () => {
      // Execute some test commands
      await terminal.execute('cd /tmp');
      await terminal.execute('echo "test file" > test.txt');
      await terminal.execute('ls -la test.txt');
      
      // Get recap
      const recapText = await generateRecap({ hours: 0.1, format: 'json' });
      const recap = JSON.parse(recapText);
      
      // Verify recap contains command information
      expect(recap.commands).toBeDefined();
      expect(recap.commands.length).toBeGreaterThan(0);
      expect(recap.summary).toBeDefined();
      expect(recap.summary).toContain('commands executed');
    });

    it('should detect workflow patterns', async () => {
      // Simulate a git workflow
      await terminal.execute('git status');
      await terminal.execute('git branch');
      
      const recapText = await generateRecap({ hours: 0.1, format: 'json' });
      const recap = JSON.parse(recapText);
      
      // Should detect git-related activity
      expect(recap.insights).toBeDefined();
      expect(recap.insights.some((insight: string) => 
        insight.toLowerCase().includes('git') || 
        insight.toLowerCase().includes('version control')
      )).toBe(true);
    });
  });

  describe('Modern Terminal Features', () => {
    it('should handle complex commands with pipes', async () => {
      // README example: Complex pipes and redirects work
      const result = await terminal.execute('echo "line1\\nline2\\nline3" | grep "line2" | wc -l');
      expect(result.exitCode).toBe(0);
      expect(result.output.trim()).toBe('1');
    });

    it('should support command chaining', async () => {
      // Test && operator
      const result = await terminal.execute('echo "first" && echo "second"');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('first');
      expect(result.output).toContain('second');
    });
  });

  describe('Session State Recovery', () => {
    it('should track working directory changes', async () => {
      const initialPwd = await terminal.execute('pwd');
      await terminal.execute('cd /tmp');
      await terminal.execute('mkdir -p test-dir');
      await terminal.execute('cd test-dir');
      
      const state = terminal.getSessionState();
      expect(state.workingDirectory).toContain('/tmp/test-dir');
      
      // Clean up
      await terminal.execute('cd /tmp && rm -rf test-dir');
    });

    it('should provide actionable recovery information', async () => {
      // Simulate some work
      await terminal.execute('cd /tmp');
      await terminal.execute('export PROJECT_ENV=development');
      
      const recapText = await generateRecap({ hours: 0.1, type: 'status', format: 'json' });
      const recap = JSON.parse(recapText);
      
      // Should provide current state information
      expect(recap.currentDirectory).toBeDefined();
      expect(recap.sessionInfo).toBeDefined();
      expect(recap.nextActions).toBeDefined();
      expect(Array.isArray(recap.nextActions)).toBe(true);
    });
  });
});
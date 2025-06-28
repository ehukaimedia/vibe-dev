import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { executeTerminalCommand, getTerminal } from '../../src/vibe-terminal.js';
import { generateRecap } from '../../src/vibe-recap.js';

describe('Recap Types', () => {
  afterAll(() => {
    getTerminal().kill();
  });

  describe('Distinct outputs for different recap types', () => {
    beforeAll(async () => {
      // Execute some commands to create history
      await executeTerminalCommand('pwd');
      await executeTerminalCommand('echo "Testing recap types"');
      await executeTerminalCommand('ls -la');
      await executeTerminalCommand('git status');
      await executeTerminalCommand('nonexistentcommand'); // Intentional error
    });

    it('should produce different outputs for summary, status, and full recaps', async () => {
      const summaryRecap = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
      const statusRecap = await generateRecap({ hours: 1, type: 'status', format: 'text' });
      const fullRecap = await generateRecap({ hours: 1, type: 'full', format: 'text' });
      
      // Verify they are different
      expect(summaryRecap).not.toBe(statusRecap);
      expect(summaryRecap).not.toBe(fullRecap);
      expect(statusRecap).not.toBe(fullRecap);
    });

    it('should include correct content in summary recap', async () => {
      const summaryRecap = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
      
      expect(summaryRecap).toContain('SESSION SUMMARY');
      expect(summaryRecap).toContain('Activity Overview');
      expect(summaryRecap).toContain('Top Commands');
      expect(summaryRecap).toContain('Key Activities');
    });

    it('should include correct content in status recap', async () => {
      const statusRecap = await generateRecap({ hours: 1, type: 'status', format: 'text' });
      
      expect(statusRecap).toContain('CURRENT STATUS');
      expect(statusRecap).toContain('Working Directory');
      expect(statusRecap).toContain('Session Active');
      expect(statusRecap).toContain('Recent Errors');
      expect(statusRecap).toContain('Suggested Next Steps');
    });

    it('should include correct content in full recap', async () => {
      const fullRecap = await generateRecap({ hours: 1, type: 'full', format: 'text' });
      
      expect(fullRecap).toContain('VIBE DEV SESSION RECAP');
      expect(fullRecap).toContain('COMMAND HISTORY');
      expect(fullRecap).toContain('Output preview');
    });
  });

  describe('Pattern analysis in summary recap', () => {
    beforeAll(async () => {
      // Clear history by creating new commands
      await executeTerminalCommand('cd /tmp');
      await executeTerminalCommand('git status');
      await executeTerminalCommand('git diff');
      await executeTerminalCommand('npm test');
      await executeTerminalCommand('npm run build');
    });

    it('should analyze command patterns correctly', async () => {
      const summary = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
      
      // Check pattern detection - be flexible since other tests may have run git/npm commands
      expect(summary).toMatch(/git:\s*\d+\s*times/);
      expect(summary).toMatch(/npm:\s*\d+\s*times/);
      
      const hasGitActivity = summary.includes('Made git commits');
      const hasNpmActivity = summary.includes('Ran npm scripts');
      const hasGeneralActivity = summary.includes('General terminal usage');
      
      expect(hasGitActivity || hasNpmActivity || hasGeneralActivity).toBe(true);
    });
  });

  describe('Actionable suggestions in status recap', () => {
    beforeAll(async () => {
      // Create a failed command
      await executeTerminalCommand('thisdoesnotexist');
    });

    it('should provide actionable next steps for errors', async () => {
      const status = await generateRecap({ hours: 1, type: 'status', format: 'text' });
      
      const hasInstallSuggestion = status.includes('Install missing command');
      const hasDebugSuggestion = status.includes('Debug the previous error');
      
      expect(hasInstallSuggestion || hasDebugSuggestion).toBe(true);
    });
  });

  describe('JSON format support', () => {
    it('should produce valid JSON for all recap types', async () => {
      const jsonRecap = await generateRecap({ hours: 1, format: 'json' });
      
      // Should be valid JSON
      let parsed: any;
      expect(() => {
        parsed = JSON.parse(jsonRecap);
      }).not.toThrow();
      
      expect(typeof parsed.sessionId).toBe('string');
      expect(Array.isArray(parsed.commands)).toBe(true);
      expect(typeof parsed.commandCount).toBe('number');
    });
  });
});
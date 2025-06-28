import { describe, it, expect, beforeEach } from '@jest/globals';
import { VibeIntelligence, IntelligenceContext, intelligence } from '../../src/vibe-intelligence.js';

describe('VibeIntelligence', () => {
  let vibeIntelligence: VibeIntelligence;

  beforeEach(() => {
    vibeIntelligence = new VibeIntelligence();
  });

  describe('IntelligenceContext interface', () => {
    it('should accept valid intelligence context', () => {
      const context: IntelligenceContext = {
        workflow: 'testing',
        recentCommands: ['npm test', 'npm run coverage'],
        currentProject: '/home/user/project',
        suggestions: ['Run linter', 'Commit changes']
      };

      expect(context.workflow).toBe('testing');
      expect(context.recentCommands).toHaveLength(2);
      expect(context.currentProject).toBe('/home/user/project');
      expect(context.suggestions).toContain('Run linter');
    });

    it('should allow null currentProject', () => {
      const context: IntelligenceContext = {
        workflow: 'unknown',
        recentCommands: [],
        currentProject: null,
        suggestions: []
      };

      expect(context.currentProject).toBeNull();
    });
  });

  describe('VibeIntelligence class', () => {
    it('should initialize with default context', () => {
      const suggestions = vibeIntelligence.getSuggestions();
      const workflow = vibeIntelligence.detectWorkflow();

      expect(suggestions).toEqual([]);
      expect(workflow).toBe('unknown');
    });

    it('should have updateContext method', () => {
      expect(vibeIntelligence.updateContext).toBeDefined();
      expect(typeof vibeIntelligence.updateContext).toBe('function');
      
      // Should not throw when called
      expect(() => {
        vibeIntelligence.updateContext('git status', 'On branch main');
      }).not.toThrow();
    });

    it('should have getSuggestions method that returns array', () => {
      const suggestions = vibeIntelligence.getSuggestions();
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions).toEqual([]);
    });

    it('should have detectWorkflow method that returns string', () => {
      const workflow = vibeIntelligence.detectWorkflow();
      
      expect(typeof workflow).toBe('string');
      expect(workflow).toBe('unknown');
    });

    it('should handle multiple updateContext calls', () => {
      // Multiple calls should not throw
      vibeIntelligence.updateContext('npm install', 'added 100 packages');
      vibeIntelligence.updateContext('npm test', '10 passing');
      vibeIntelligence.updateContext('git add .', '');
      
      // Methods should still work after updates
      expect(vibeIntelligence.getSuggestions()).toEqual([]);
      expect(vibeIntelligence.detectWorkflow()).toBe('unknown');
    });

    it('should handle empty command and output', () => {
      expect(() => {
        vibeIntelligence.updateContext('', '');
      }).not.toThrow();
    });

    it('should handle special characters in command and output', () => {
      expect(() => {
        vibeIntelligence.updateContext(
          'echo "test with $pecial ch@rs!"',
          'test with $pecial ch@rs!\n\t\r'
        );
      }).not.toThrow();
    });
  });

  describe('Singleton intelligence export', () => {
    it('should export singleton instance', () => {
      expect(intelligence).toBeDefined();
      expect(intelligence).toBeInstanceOf(VibeIntelligence);
    });

    it('should have all required methods', () => {
      expect(intelligence.updateContext).toBeDefined();
      expect(intelligence.getSuggestions).toBeDefined();
      expect(intelligence.detectWorkflow).toBeDefined();
    });

    it('should maintain state across calls', () => {
      // Initial state
      expect(intelligence.getSuggestions()).toEqual([]);
      expect(intelligence.detectWorkflow()).toBe('unknown');
      
      // Update context
      intelligence.updateContext('test command', 'test output');
      
      // State should be accessible
      expect(intelligence.getSuggestions()).toEqual([]);
      expect(intelligence.detectWorkflow()).toBe('unknown');
    });
  });

  describe('Edge cases', () => {
    it('should handle very long commands', () => {
      const longCommand = 'x'.repeat(10000);
      const longOutput = 'y'.repeat(50000);
      
      expect(() => {
        vibeIntelligence.updateContext(longCommand, longOutput);
      }).not.toThrow();
    });

    it('should handle unicode in commands and output', () => {
      expect(() => {
        vibeIntelligence.updateContext(
          'echo "Hello 世界 🌍"',
          'Hello 世界 🌍'
        );
      }).not.toThrow();
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => {
        vibeIntelligence.updateContext(null as any, undefined as any);
      }).not.toThrow();
    });
  });
});
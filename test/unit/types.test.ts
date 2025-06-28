import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  VibeTerminalArgsSchema,
  VibeRecapArgsSchema,
  TerminalResult,
  CommandRecord,
  SessionState,
  MCPResponse,
  VibeIntentSignals,
  TerminalConfig
} from '../../src/types.js';

describe('Type Definitions and Schemas', () => {
  describe('VibeTerminalArgsSchema', () => {
    it('should validate correct terminal arguments', () => {
      const validArgs = { command: 'ls -la' };
      const result = VibeTerminalArgsSchema.parse(validArgs);
      expect(result).toEqual(validArgs);
    });

    it('should reject missing command', () => {
      expect(() => VibeTerminalArgsSchema.parse({})).toThrow();
    });

    it('should reject non-string command', () => {
      expect(() => VibeTerminalArgsSchema.parse({ command: 123 })).toThrow();
    });

    it('should have correct field descriptions', () => {
      const schema = VibeTerminalArgsSchema.shape.command;
      expect(schema.description).toBe('Terminal command to execute');
    });
  });

  describe('VibeRecapArgsSchema', () => {
    it('should validate with all fields', () => {
      const validArgs = {
        hours: 2,
        type: 'full' as const,
        format: 'json' as const
      };
      const result = VibeRecapArgsSchema.parse(validArgs);
      expect(result).toEqual(validArgs);
    });

    it('should provide default values', () => {
      const result = VibeRecapArgsSchema.parse({});
      expect(result).toEqual({
        hours: 1,
        format: 'text'
      });
    });

    it('should validate type enum values', () => {
      expect(() => VibeRecapArgsSchema.parse({ type: 'full' })).not.toThrow();
      expect(() => VibeRecapArgsSchema.parse({ type: 'status' })).not.toThrow();
      expect(() => VibeRecapArgsSchema.parse({ type: 'summary' })).not.toThrow();
      expect(() => VibeRecapArgsSchema.parse({ type: 'invalid' })).toThrow();
    });

    it('should validate format enum values', () => {
      expect(() => VibeRecapArgsSchema.parse({ format: 'text' })).not.toThrow();
      expect(() => VibeRecapArgsSchema.parse({ format: 'json' })).not.toThrow();
      expect(() => VibeRecapArgsSchema.parse({ format: 'xml' })).toThrow();
    });

    it('should have correct field descriptions', () => {
      const shape = VibeRecapArgsSchema.shape;
      expect(shape.hours.description).toBe('Hours of activity to analyze');
      expect(shape.type.description).toBe('Analysis type');
      expect(shape.format.description).toBe('Output format');
    });
  });

  describe('TerminalResult interface', () => {
    it('should accept valid terminal result', () => {
      const result: TerminalResult = {
        output: 'Hello World',
        exitCode: 0,
        duration: 123,
        sessionId: 'abc-123',
        timestamp: new Date(),
        command: 'echo "Hello World"',
        workingDirectory: '/home/user'
      };
      
      expect(result.output).toBe('Hello World');
      expect(result.exitCode).toBe(0);
      expect(result.workingDirectory).toBe('/home/user');
    });

    it('should allow optional workingDirectory', () => {
      const result: TerminalResult = {
        output: 'output',
        exitCode: 0,
        duration: 100,
        sessionId: 'test',
        timestamp: new Date(),
        command: 'test'
      };
      
      expect(result.workingDirectory).toBeUndefined();
    });
  });

  describe('CommandRecord interface', () => {
    it('should accept valid command record', () => {
      const record: CommandRecord = {
        timestamp: new Date(),
        command: 'git status',
        output: 'On branch main',
        exitCode: 0,
        duration: 50,
        workingDirectory: '/project',
        intent: 'Check git repository status'
      };
      
      expect(record.command).toBe('git status');
      expect(record.intent).toBe('Check git repository status');
    });

    it('should allow optional intent', () => {
      const record: CommandRecord = {
        timestamp: new Date(),
        command: 'pwd',
        output: '/home',
        exitCode: 0,
        duration: 10,
        workingDirectory: '/home'
      };
      
      expect(record.intent).toBeUndefined();
    });
  });

  describe('SessionState interface', () => {
    it('should accept valid session state', () => {
      const state: SessionState = {
        sessionId: 'session-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/home/user',
        environmentVariables: { PATH: '/usr/bin' },
        commandHistory: [],
        currentPrompt: '$ ',
        shellType: 'bash'
      };
      
      expect(state.sessionId).toBe('session-123');
      expect(state.shellType).toBe('bash');
    });

    it('should validate shell type values', () => {
      const validShellTypes: SessionState['shellType'][] = ['bash', 'zsh', 'fish', 'sh', 'unknown'];
      
      validShellTypes.forEach(shellType => {
        const state: SessionState = {
          sessionId: 'test',
          startTime: new Date(),
          lastActivity: new Date(),
          workingDirectory: '/',
          environmentVariables: {},
          commandHistory: [],
          currentPrompt: '',
          shellType
        };
        expect(state.shellType).toBe(shellType);
      });
    });
  });

  describe('MCPResponse interface', () => {
    it('should accept valid MCP response', () => {
      const response: MCPResponse = {
        content: [{ type: 'text', text: 'Response content' }],
        isError: false
      };
      
      expect(response.content).toHaveLength(1);
      expect(response.isError).toBe(false);
    });

    it('should allow optional isError', () => {
      const response: MCPResponse = {
        content: [{ type: 'text', text: 'Success' }]
      };
      
      expect(response.isError).toBeUndefined();
    });
  });

  describe('VibeIntentSignals interface', () => {
    it('should accept valid intent signals', () => {
      const signals: VibeIntentSignals = {
        trigger: 'error_response',
        confidence: 0.85,
        evidence: ['Command not found', 'Exit code 127'],
        likely_goal: 'Install missing tool',
        category: 'reactive',
        commandOutput: 'bash: npm: command not found',
        exitCode: 127,
        executionTime: 15,
        errorMessages: ['npm: command not found']
      };
      
      expect(signals.trigger).toBe('error_response');
      expect(signals.confidence).toBe(0.85);
      expect(signals.errorMessages).toContain('npm: command not found');
    });

    it('should validate trigger enum values', () => {
      const validTriggers: VibeIntentSignals['trigger'][] = [
        'error_response', 'exploration', 'planned_work', 'maintenance'
      ];
      
      validTriggers.forEach(trigger => {
        const signals: VibeIntentSignals = {
          trigger,
          confidence: 1,
          evidence: [],
          likely_goal: 'test',
          category: 'reactive',
          commandOutput: '',
          exitCode: 0,
          executionTime: 0
        };
        expect(signals.trigger).toBe(trigger);
      });
    });

    it('should validate category enum values', () => {
      const validCategories: VibeIntentSignals['category'][] = [
        'reactive', 'proactive', 'investigative', 'maintenance'
      ];
      
      validCategories.forEach(category => {
        const signals: VibeIntentSignals = {
          trigger: 'exploration',
          confidence: 1,
          evidence: [],
          likely_goal: 'test',
          category,
          commandOutput: '',
          exitCode: 0,
          executionTime: 0
        };
        expect(signals.category).toBe(category);
      });
    });

    it('should allow optional errorMessages', () => {
      const signals: VibeIntentSignals = {
        trigger: 'planned_work',
        confidence: 0.9,
        evidence: ['Running build script'],
        likely_goal: 'Build project',
        category: 'proactive',
        commandOutput: 'Build successful',
        exitCode: 0,
        executionTime: 5000
      };
      
      expect(signals.errorMessages).toBeUndefined();
    });
  });

  describe('TerminalConfig interface', () => {
    it('should accept valid terminal configuration', () => {
      const config: TerminalConfig = {
        shell: '/bin/bash',
        cwd: '/home/user',
        env: { TERM: 'xterm-256color' },
        cols: 80,
        rows: 24,
        promptTimeout: 3000
      };
      
      expect(config.shell).toBe('/bin/bash');
      expect(config.promptTimeout).toBe(3000);
    });

    it('should allow all fields to be optional', () => {
      const config: TerminalConfig = {};
      
      expect(config.shell).toBeUndefined();
      expect(config.cwd).toBeUndefined();
      expect(config.env).toBeUndefined();
      expect(config.cols).toBeUndefined();
      expect(config.rows).toBeUndefined();
      expect(config.promptTimeout).toBeUndefined();
    });
  });
});
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateRecap } from './vibe-recap.js';
import { getTerminal } from './vibe-terminal.js';
import { CommandRecord, SessionState } from './types.js';

// Mock the terminal module
jest.mock('./vibe-terminal');

describe('Recap Generation', () => {
  const mockGetTerminal = getTerminal as jest.MockedFunction<typeof getTerminal>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate recap for empty history', async () => {
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: [],
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue([])
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 24, format: 'text' });
    expect(recap).toContain('No commands executed');
  });

  it('should summarize command history', async () => {
    const now = new Date();
    const history: CommandRecord[] = [
      { 
        command: 'git status', 
        output: 'nothing to commit', 
        timestamp: now,
        exitCode: 0,
        duration: 100,
        workingDirectory: '/project'
      },
      { 
        command: 'npm test', 
        output: 'all tests passed', 
        timestamp: now,
        exitCode: 0,
        duration: 5000,
        workingDirectory: '/project'
      }
    ];
    
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: history,
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue(history)
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 24, format: 'text', type: 'summary' });
    expect(recap).toContain('git');
    expect(recap).toContain('npm');
  });

  it('should detect command patterns', async () => {
    const now = new Date();
    const history: CommandRecord[] = [
      { 
        command: 'git add .', 
        output: '', 
        timestamp: now,
        exitCode: 0,
        duration: 50,
        workingDirectory: '/project'
      },
      { 
        command: 'git commit -m "test"', 
        output: '', 
        timestamp: now,
        exitCode: 0,
        duration: 100,
        workingDirectory: '/project'
      },
      { 
        command: 'git push', 
        output: '', 
        timestamp: now,
        exitCode: 0,
        duration: 2000,
        workingDirectory: '/project'
      }
    ];
    
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: history,
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue(history)
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 24, format: 'text', type: 'summary' });
    expect(recap.toLowerCase()).toContain('git');
    expect(recap).toContain('3'); // Should show count of git commands
  });

  it('should respect time filtering', async () => {
    const now = new Date();
    const oldTime = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago
    
    const history: CommandRecord[] = [
      { 
        command: 'old command', 
        output: '', 
        timestamp: oldTime,
        exitCode: 0,
        duration: 50,
        workingDirectory: '/project'
      },
      { 
        command: 'recent command', 
        output: '', 
        timestamp: now,
        exitCode: 0,
        duration: 50,
        workingDirectory: '/project'
      }
    ];
    
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: oldTime,
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: history,
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue(history)
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 1, format: 'text' });
    expect(recap).toContain('recent command');
    expect(recap).not.toContain('old command');
  });

  it('should generate JSON format when requested', async () => {
    const history: CommandRecord[] = [
      { 
        command: 'test', 
        output: 'output', 
        timestamp: new Date(),
        exitCode: 0,
        duration: 100,
        workingDirectory: '/project'
      }
    ];
    
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: history,
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue(history)
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 24, format: 'json' });
    const parsed = JSON.parse(recap);
    expect(parsed.sessionId).toBe('test-123');
    expect(parsed.commandCount).toBe(1);
    expect(parsed.commands).toHaveLength(1);
  });

  it('should generate status recap type', async () => {
    const history: CommandRecord[] = [
      { 
        command: 'npm test', 
        output: 'failed', 
        timestamp: new Date(),
        exitCode: 1,
        duration: 1000,
        workingDirectory: '/project'
      }
    ];
    
    const mockTerminal = {
      getSessionState: jest.fn().mockReturnValue({
        sessionId: 'test-123',
        startTime: new Date(),
        lastActivity: new Date(),
        workingDirectory: '/project',
        environmentVariables: {},
        commandHistory: history,
        currentPrompt: '$ ',
        shellType: 'bash' as const
      } as SessionState),
      getHistory: jest.fn().mockReturnValue(history)
    };
    mockGetTerminal.mockReturnValue(mockTerminal as any);

    const recap = await generateRecap({ hours: 24, format: 'text', type: 'status' });
    expect(recap).toContain('STATUS');
    expect(recap).toContain('/project'); // Should show current directory
  });
});
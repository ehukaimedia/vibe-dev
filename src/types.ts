import { z } from 'zod';

// Zod schemas for MCP tool arguments
export const VibeTerminalArgsSchema = z.object({
  command: z.string().describe("Terminal command to execute")
});

export const VibeRecapArgsSchema = z.object({
  hours: z.number().optional().default(1).describe("Hours of activity to analyze"),
  type: z.enum(['full', 'status', 'summary']).optional().describe("Analysis type"),
  format: z.enum(['text', 'json']).optional().default('text').describe("Output format")
});

// Terminal execution result
export interface TerminalResult {
  output: string;
  exitCode: number;
  duration: number;
  sessionId: string;
  timestamp: Date;
  command: string;
  workingDirectory?: string;
}

// Command history record
export interface CommandRecord {
  timestamp: Date;
  command: string;
  output: string;
  exitCode: number;
  duration: number;
  workingDirectory: string;
  intent?: string; // From intelligence analysis
}

// Session state for persistence
export interface SessionState {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  workingDirectory: string;
  environmentVariables: Record<string, string>;
  commandHistory: CommandRecord[];
  currentPrompt: string;
  shellType: 'bash' | 'zsh' | 'fish' | 'sh' | 'powershell' | 'unknown';
}

// MCP response format
export interface MCPResponse {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

// Intelligence signals (adapted from trackTools.ts insights)
export interface VibeIntentSignals {
  trigger: 'error_response' | 'exploration' | 'planned_work' | 'maintenance';
  confidence: number;
  evidence: string[];
  likely_goal: string;
  category: 'reactive' | 'proactive' | 'investigative' | 'maintenance';
  commandOutput: string;      // We have the actual output!
  exitCode: number;          // We know if it succeeded
  executionTime: number;     // We track performance
  errorMessages?: string[];  // We parse actual errors
}

// Terminal manager configuration
export interface TerminalConfig {
  shell?: string;
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
  promptTimeout?: number; // Milliseconds to wait for prompt detection
}
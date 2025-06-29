import { VibeTerminalMac } from './vibe-terminal-mac.js';
import { VibeTerminalPC } from './vibe-terminal-pc.js';
import { detectPlatform, Platform } from './os-detector.js';
import { 
  TerminalConfig,
  TerminalResult, 
  CommandRecord, 
  SessionState 
} from './types.js';

// VibeTerminal is now a type union of the platform-specific implementations
export type VibeTerminal = VibeTerminalMac | VibeTerminalPC;

// Also export the factory function for those who want to use it directly
export function createVibeTerminal(config?: TerminalConfig): VibeTerminal {
  const platform = detectPlatform();
  
  switch (platform) {
    case Platform.WINDOWS:
      return new VibeTerminalPC(config);
    case Platform.MAC:
      return new VibeTerminalMac(config);
    default:
      // This should never happen as detectPlatform() throws for unsupported platforms
      throw new Error(`Unexpected platform: ${platform}`);
  }
}

// Re-export types to maintain compatibility
export type { TerminalResult, CommandRecord, SessionState };

// Singleton management
let terminalInstance: VibeTerminal | null = null;

export function getTerminal(): VibeTerminal {
  if (!terminalInstance) {
    terminalInstance = createVibeTerminal();
  }
  return terminalInstance;
}

export function resetTerminal(): void {
  if (terminalInstance) {
    terminalInstance.kill();
    terminalInstance = null;
  }
}

// Export convenience function that matches the MCP tool interface
export async function executeCommand(command: string): Promise<TerminalResult> {
  const terminal = getTerminal();
  return terminal.execute(command);
}

// Alias for backward compatibility
export const executeTerminalCommand = executeCommand;
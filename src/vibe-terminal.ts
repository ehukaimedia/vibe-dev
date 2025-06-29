import { VibeTerminalMac } from './vibe-terminal-mac.js';
import { VibeTerminalPC } from './vibe-terminal-pc.js';
import { detectPlatform, Platform } from './os-detector.js';
import { 
  TerminalConfig,
  TerminalResult, 
  CommandRecord, 
  SessionState 
} from './types.js';

// For backward compatibility, VibeTerminal extends the appropriate platform implementation
export class VibeTerminal extends VibeTerminalMac {
  constructor(config?: TerminalConfig) {
    // On non-Mac platforms, this would need to be different
    // But for now on Mac, we just use the Mac implementation
    super(config);
  }
}

// Also export the factory function for those who want to use it directly
export function createVibeTerminal(config?: TerminalConfig): VibeTerminal {
  const platform = detectPlatform();
  
  switch (platform) {
    case Platform.WINDOWS:
      return new VibeTerminalPC(config) as any;
    case Platform.MAC:
      return new VibeTerminalMac(config) as any;
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
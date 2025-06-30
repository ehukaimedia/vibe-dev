import type { SessionState } from './types.js';

/**
 * Intelligent output parser that adapts to different shell outputs
 * without hardcoding specific patterns
 */
export class IntelligentOutputParser {
  private shellType: SessionState['shellType'];
  private platform: 'mac' | 'windows';
  private promptPattern: RegExp | null = null;
  private commandHistory: Set<string> = new Set();
  
  constructor(shellType: SessionState['shellType'], platform: 'mac' | 'windows') {
    this.shellType = shellType;
    this.platform = platform;
  }
  
  /**
   * Parse terminal output intelligently
   */
  parse(rawOutput: string, command: string): string {
    // Step 1: Clean control characters while preserving structure
    const cleaned = this.cleanControlCharacters(rawOutput);
    
    // Step 2: Split into lines
    const lines = cleaned.split(/\r?\n/);
    
    // Step 3: Learn prompt pattern if not known
    if (!this.promptPattern) {
      this.learnPromptPattern(lines);
    }
    
    // Step 4: Find command execution point
    const commandIndex = this.findCommandExecution(lines, command);
    
    // Step 5: Extract output after command
    let outputLines: string[] = [];
    if (commandIndex >= 0) {
      outputLines = lines.slice(commandIndex + 1);
    } else {
      // Fallback: try to identify and remove prompt lines
      outputLines = this.removePromptLines(lines);
    }
    
    // Step 6: Remove trailing prompts
    outputLines = this.removeTrailingPrompts(outputLines);
    
    // Step 7: Remove any remaining lines that look like prompts
    outputLines = outputLines.filter(line => !this.isPromptLine(line));
    
    // Step 8: Also remove lines that contain the command with a prompt
    outputLines = outputLines.filter(line => {
      // If line contains the command and looks like a prompt line, remove it
      if (line.includes(command) && this.looksLikePrompt(line)) {
        return false;
      }
      return true;
    });
    
    // Step 9: Remove empty lines at start and end
    outputLines = this.trimEmptyLines(outputLines);
    
    return outputLines.join('\n');
  }
  
  private cleanControlCharacters(text: string): string {
    // Remove ANSI escape sequences more comprehensively
    let cleaned = text
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // CSI sequences (colors, cursor movement)
      .replace(/\x1B\].*?(?:\x07|\x1B\\)/g, '') // OSC sequences (window title, etc.)
      .replace(/\x1B[PX^_].*?\x1B\\/g, '') // Other escape sequences
      .replace(/\x1B\[.*?[a-zA-Z]/g, '') // More CSI sequences
      .replace(/\x1B\([AB]/g, '') // Character set selection
      .replace(/\x1B\]/g, '') // Incomplete OSC sequences
      .replace(/\x1B./g, ''); // Single char sequences
    
    // Remove specific problematic sequences common in zsh
    cleaned = cleaned
      .replace(/\x1B\[.*?[JKm]/g, '') // Clear screen/line, colors
      .replace(/\x1B\[\?.*?[hl]/g, '') // Mode setting/resetting
      .replace(/\x1B\[.*?[ABCD]/g, '') // Cursor movement
      .replace(/\x1B\[.*?[HfJ]/g, '') // Cursor positioning and clear
      .replace(/\x1B\[0m/g, '') // Reset formatting
      .replace(/\x1B\[m/g, ''); // Short reset formatting
    
    // Convert carriage returns to newlines when appropriate
    // Handle \r\n (Windows) and \r alone (Mac classic)
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');
    
    // Remove other control characters except newline and tab
    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
    
    // Remove bracketed paste mode markers
    cleaned = cleaned.replace(/\[?\?2004[hl]/g, '');
    
    // Remove any remaining escape sequences that might have been missed
    cleaned = cleaned.replace(/\x1B/g, '');
    
    // Clean up extra whitespace that might be left from removed sequences
    cleaned = cleaned.replace(/  +/g, ' '); // Multiple spaces to single space
    
    return cleaned;
  }
  
  private learnPromptPattern(lines: string[]): void {
    // Find lines that look like prompts
    const promptCandidates: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Common prompt indicators
      const promptIndicators = ['$', '#', '%', '>', '❯', '➜', '→'];
      const hasIndicator = promptIndicators.some(ind => trimmed.includes(ind));
      
      if (hasIndicator && trimmed.length < 200) {
        promptCandidates.push(trimmed);
      }
    }
    
    // Try to identify common patterns
    if (promptCandidates.length > 0) {
      // For now, use a simple pattern that matches lines ending with prompt chars
      this.promptPattern = /[$#%>❯➜→]\s*$/;
    }
  }
  
  private findCommandExecution(lines: string[], command: string): number {
    const cleanCommand = command.trim();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Clean line of control characters for better matching
      const cleanLine = line.replace(/[^\x20-\x7E\s]/g, '');
      
      // Direct match - line is just the command
      if (trimmed === cleanCommand) {
        return i;
      }
      
      // Line ends with the command (common pattern: "prompt$ command")
      if (trimmed.endsWith(cleanCommand)) {
        const beforeCommand = trimmed.substring(0, trimmed.indexOf(cleanCommand));
        if (this.looksLikePrompt(beforeCommand)) {
          return i;
        }
      }
      
      // Line contains command - check if it's a command execution
      if (line.includes(cleanCommand)) {
        // Get the part before the command
        const beforeCommand = line.substring(0, line.indexOf(cleanCommand));
        
        // If what's before looks like a prompt, this is our command line
        if (this.looksLikePrompt(beforeCommand)) {
          return i;
        }
        
        // Check if the command appears with minimal trailing content
        const afterCommand = line.substring(line.indexOf(cleanCommand) + cleanCommand.length);
        if (afterCommand.trim().length <= 2) { // Allow for small trailing chars
          return i;
        }
      }
      
      // Check cleaned line too
      if (cleanLine.includes(cleanCommand)) {
        const beforeCommand = cleanLine.substring(0, cleanLine.indexOf(cleanCommand));
        if (this.looksLikePrompt(beforeCommand)) {
          return i;
        }
      }
      
      // Special case: handle command that might have been corrupted by terminal
      // Look for patterns like "eecho" instead of "echo"
      if (cleanCommand.length > 2) {
        const duplicateFirstChar = cleanCommand[0] + cleanCommand;
        if (line.includes(duplicateFirstChar)) {
          const beforeCommand = line.substring(0, line.indexOf(duplicateFirstChar));
          if (this.looksLikePrompt(beforeCommand)) {
            return i;
          }
        }
      }
    }
    
    return -1;
  }
  
  private looksLikePrompt(text: string): boolean {
    // Check for common prompt patterns
    const promptIndicators = ['$', '#', '%', '>', '❯', '➜', '→', 'PS'];
    return promptIndicators.some(ind => text.includes(ind));
  }
  
  private removeTrailingPrompts(lines: string[]): string[] {
    const result = [...lines];
    
    // Remove from the end
    while (result.length > 0) {
      const lastLine = result[result.length - 1];
      if (this.isPromptLine(lastLine)) {
        result.pop();
      } else {
        break;
      }
    }
    
    return result;
  }
  
  private isPromptLine(line: string): boolean {
    const trimmed = line.trim();
    
    // Empty line
    if (!trimmed) return false;
    
    // Use learned pattern if available
    if (this.promptPattern && this.promptPattern.test(trimmed)) {
      return true;
    }
    
    // Check if this line appears to be a prompt by structure
    // A prompt typically has: optional user@host, optional path, and a prompt character
    const promptChars = ['$', '#', '%', '>', '❯', '➜', '→'];
    
    // Does it end with a prompt character?
    const endsWithPrompt = promptChars.some(char => 
      trimmed.endsWith(char) || trimmed.endsWith(char + ' ')
    );
    
    if (!endsWithPrompt) return false;
    
    // Additional validation - prompts usually have certain patterns
    // But we don't hardcode specific usernames or hosts
    
    // Check if it has typical prompt structure markers
    const hasStructureMarkers = (
      trimmed.includes('@') ||  // user@host pattern
      trimmed.includes(':') ||  // path separator
      trimmed.includes('/') ||  // unix path
      trimmed.includes('\\') || // windows path
      trimmed.includes('~') ||  // home directory
      /^[A-Z]:/i.test(trimmed) || // windows drive
      trimmed.length < 5  // very short prompt like "$ " or "% "
    );
    
    return hasStructureMarkers;
  }
  
  private removePromptLines(lines: string[]): string[] {
    // Remove lines that appear to be prompts
    return lines.filter(line => !this.isPromptLine(line));
  }
  
  private trimEmptyLines(lines: string[]): string[] {
    const result = [...lines];
    
    // Trim from start
    while (result.length > 0 && !result[0].trim()) {
      result.shift();
    }
    
    // Trim from end
    while (result.length > 0 && !result[result.length - 1].trim()) {
      result.pop();
    }
    
    return result;
  }
  
  /**
   * Update the parser with new information
   */
  updateContext(info: { promptPattern?: string }) {
    if (info.promptPattern) {
      try {
        this.promptPattern = new RegExp(info.promptPattern);
      } catch (e) {
        // Invalid pattern, ignore
      }
    }
  }
}
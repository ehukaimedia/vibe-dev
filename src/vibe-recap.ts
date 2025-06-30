import { getTerminal } from './vibe-terminal.js';
import { VibeRecapArgsSchema } from './types.js';
import type { SessionState, CommandRecord } from './types.js';
import { z } from 'zod';

type RecapArgs = z.infer<typeof VibeRecapArgsSchema>;

export async function generateRecap(args: RecapArgs): Promise<string> {
  const terminal = getTerminal();
  const sessionState = terminal.getSessionState();
  const history = terminal.getHistory();
  
  // Filter history by time if requested
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - args.hours);
  
  const relevantHistory = history.filter(cmd => cmd.timestamp >= cutoffTime);
  
  if (args.format === 'json') {
    // For status type, include additional fields
    if (args.type === 'status') {
      const suggestions = generateNextSteps(relevantHistory, sessionState);
      return JSON.stringify({
        sessionId: sessionState.sessionId,
        startTime: sessionState.startTime,
        commandCount: relevantHistory.length,
        commands: relevantHistory,
        currentDirectory: sessionState.workingDirectory,
        sessionInfo: {
          shellType: sessionState.shellType,
          lastActivity: sessionState.lastActivity,
          commandCount: relevantHistory.length
        },
        nextActions: suggestions,
        summary: `${relevantHistory.length} commands executed in current session`,
        insights: detectKeyActivities(relevantHistory)
      }, null, 2);
    }
    
    // Default JSON format
    return JSON.stringify({
      sessionId: sessionState.sessionId,
      startTime: sessionState.startTime,
      commandCount: relevantHistory.length,
      commands: relevantHistory,
      summary: `${relevantHistory.length} commands executed in current session`,
      insights: detectKeyActivities(relevantHistory)
    }, null, 2);
  }
  
  // Default to 'full' if no type specified
  const recapType = args.type || 'full';
  
  // Generate different output based on type
  switch (recapType) {
    case 'summary':
      return generateSummaryRecap(sessionState, relevantHistory, args.hours);
    case 'status':
      return generateStatusRecap(sessionState, relevantHistory);
    case 'full':
    default:
      return generateFullRecap(sessionState, relevantHistory, args.hours);
  }
}

// Summary: Show overview, patterns, key activities
function generateSummaryRecap(sessionState: SessionState, history: CommandRecord[], hours: number): string {
  let output = `📋 SESSION SUMMARY (Last ${hours}h)\n`;
  output += `${'─'.repeat(40)}\n\n`;
  
  if (history.length === 0) {
    output += `No activity in the specified timeframe.\n`;
    return output;
  }
  
  // Analyze patterns
  const commandTypes = new Map<string, number>();
  const directories = new Set<string>();
  let errorCount = 0;
  let totalDuration = 0;
  
  history.forEach(cmd => {
    const baseCommand = cmd.command.split(' ')[0];
    commandTypes.set(baseCommand, (commandTypes.get(baseCommand) || 0) + 1);
    if (cmd.workingDirectory) {
      directories.add(cmd.workingDirectory);
    }
    if (cmd.exitCode !== 0) errorCount++;
    totalDuration += cmd.duration;
  });
  
  // Key metrics
  output += `📊 Activity Overview:\n`;
  output += `• Total commands: ${history.length}\n`;
  output += `• Unique directories: ${directories.size}\n`;
  output += `• Failed commands: ${errorCount}\n`;
  output += `• Avg execution time: ${Math.round(totalDuration / history.length)}ms\n\n`;
  
  // Most used commands
  output += `🔧 Top Commands:\n`;
  const sortedCommands = Array.from(commandTypes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  sortedCommands.forEach(([cmd, count]) => {
    output += `• ${cmd}: ${count} time${count > 1 ? 's' : ''}\n`;
  });
  
  // Key activities detected
  output += `\n🎯 Key Activities:\n`;
  const activities = detectKeyActivities(history);
  activities.forEach(activity => {
    output += `• ${activity}\n`;
  });
  
  output += `\n💡 Current: ${sessionState.workingDirectory}\n`;
  
  return output;
}

// Status: Show current state, errors, next steps
function generateStatusRecap(sessionState: SessionState, history: CommandRecord[]): string {
  let output = `🚦 CURRENT STATUS\n`;
  output += `${'─'.repeat(40)}\n\n`;
  
  output += `📍 Working Directory: ${sessionState.workingDirectory}\n`;
  output += `🕒 Session Active: ${getTimeDiff(sessionState.startTime, new Date())}\n`;
  output += `⏱️ Last Command: ${getTimeDiff(sessionState.lastActivity, new Date())} ago\n\n`;
  
  // Recent errors
  const recentErrors = history
    .filter(cmd => cmd.exitCode !== 0)
    .slice(-3);
  
  output += `⚠️ Recent Errors:\n`;
  if (recentErrors.length > 0) {
    recentErrors.forEach(cmd => {
      output += `• ${cmd.command}\n`;
      const errorLine = cmd.output.split('\n').find(line => 
        line.toLowerCase().includes('error') || 
        line.toLowerCase().includes('fatal') ||
        line.toLowerCase().includes('failed')
      );
      if (errorLine) {
        output += `  → ${errorLine.trim()}\n`;
      }
    });
  } else {
    output += `• No errors in recent history\n`;
  }
  output += `\n`;
  
  // Last successful command
  const lastSuccess = history
    .filter(cmd => cmd.exitCode === 0)
    .slice(-1)[0];
  
  if (lastSuccess) {
    output += `✅ Last Success: ${lastSuccess.command}\n`;
    output += `   ${getTimeDiff(lastSuccess.timestamp, new Date())} ago\n\n`;
  }
  
  // Suggested next steps based on context
  output += `💡 Suggested Next Steps:\n`;
  const suggestions = generateNextSteps(history, sessionState);
  suggestions.forEach(step => {
    output += `• ${step}\n`;
  });
  
  output += `\n🔄 Session is active and ready for commands.\n`;
  
  return output;
}

// Full: Complete history with all details (current behavior)
function generateFullRecap(sessionState: SessionState, history: CommandRecord[], hours: number): string {
  let output = `╔════════════════════════════════════════════════════════════╗\n`;
  output += `║                    VIBE DEV SESSION RECAP                   ║\n`;
  output += `╚════════════════════════════════════════════════════════════╝\n\n`;
  
  output += `Session ID: ${sessionState.sessionId}\n`;
  output += `Started: ${sessionState.startTime.toLocaleString()}\n`;
  output += `Shell: ${sessionState.shellType}\n`;
  output += `Commands in last ${hours} hour(s): ${history.length}\n\n`;
  
  if (history.length === 0) {
    output += `No commands executed in the specified timeframe.\n`;
    return output;
  }
  
  output += `📊 COMMAND HISTORY\n`;
  output += `${'─'.repeat(60)}\n`;
  
  history.forEach((cmd, index) => {
    output += `\n[${index + 1}] ${cmd.timestamp.toLocaleTimeString()} - ${cmd.command}\n`;
    output += `    Working Dir: ${cmd.workingDirectory}\n`;
    output += `    Exit Code: ${cmd.exitCode}\n`;
    output += `    Duration: ${cmd.duration}ms\n`;
    
    if (cmd.exitCode !== 0) {
      output += `    ⚠️ Command failed\n`;
    }
    
    // Show first few lines of output for context
    const outputLines = cmd.output.split('\n').slice(0, 3);
    if (outputLines.length > 0 && cmd.output.trim()) {
      output += `    Output preview:\n`;
      outputLines.forEach(line => {
        output += `    │ ${line}\n`;
      });
      if (cmd.output.split('\n').length > 3) {
        output += `    │ ... (${cmd.output.split('\n').length - 3} more lines)\n`;
      }
    }
  });
  
  output += `\n${'─'.repeat(60)}\n`;
  output += `\n💡 CURRENT STATE\n`;
  output += `Current Directory: ${sessionState.workingDirectory}\n`;
  output += `Last Activity: ${sessionState.lastActivity.toLocaleString()}\n`;
  
  output += `\n🔄 TO RESUME YOUR WORK:\n`;
  output += `The terminal session is still active. Your environment is preserved.\n`;
  output += `Continue with your next command and all state will be maintained.\n`;
  
  return output;
}

// Helper function to get time difference as string
function getTimeDiff(start: Date, end: Date): string {
  const diff = end.getTime() - start.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Helper function to detect key activities from command history
function detectKeyActivities(history: CommandRecord[]): string[] {
  const activities: string[] = [];
  
  // Check for git operations
  const gitCommands = history.filter(cmd => cmd.command.startsWith('git'));
  if (gitCommands.length > 0) {
    activities.push('Git version control activity');
    const hasCommit = gitCommands.some(cmd => cmd.command.includes('commit'));
    const hasPush = gitCommands.some(cmd => cmd.command.includes('push'));
    if (hasCommit) activities.push('Made git commits');
    if (hasPush) activities.push('Pushed changes to remote');
  }
  
  // Check for file operations
  const fileOps = history.filter(cmd => 
    cmd.command.match(/^(touch|mkdir|rm|mv|cp|cat|echo.*>|vim|nano|code)/));
  if (fileOps.length > 0) {
    activities.push(`File operations (${fileOps.length} commands)`);
  }
  
  // Check for package management
  const npmCommands = history.filter(cmd => cmd.command.startsWith('npm'));
  if (npmCommands.length > 0) {
    const hasInstall = npmCommands.some(cmd => cmd.command.includes('install'));
    const hasRun = npmCommands.some(cmd => cmd.command.includes('run'));
    if (hasInstall) activities.push('Installed npm packages');
    if (hasRun) activities.push('Ran npm scripts');
  }
  
  // Check for testing
  const testCommands = history.filter(cmd => 
    cmd.command.includes('test') || cmd.command.includes('jest') || 
    cmd.command.includes('mocha') || cmd.command.includes('vitest'));
  if (testCommands.length > 0) {
    activities.push('Ran tests');
  }
  
  // Directory navigation
  const cdCommands = history.filter(cmd => cmd.command.startsWith('cd '));
  if (cdCommands.length > 2) {
    activities.push(`Navigated ${cdCommands.length} directories`);
  }
  
  return activities.length > 0 ? activities : ['General terminal usage'];
}

// Helper function to generate next step suggestions
function generateNextSteps(history: CommandRecord[], sessionState: SessionState): string[] {
  const suggestions: string[] = [];
  
  // Check last few commands for context
  const recent = history.slice(-5);
  const lastCommand = recent[recent.length - 1] as CommandRecord | undefined;
  
  // If last command failed, suggest fix
  if (lastCommand && lastCommand.exitCode !== 0) {
    const lowerOutput = lastCommand.output.toLowerCase();
    const lowerCommand = lastCommand.command.toLowerCase();
    
    if (lowerOutput.includes('command not found') || 
        lowerOutput.includes('not found') && !lowerOutput.includes('file')) {
      suggestions.push('Install missing command or check PATH');
    } else if (lowerOutput.includes('permission denied')) {
      suggestions.push('Check file permissions or use sudo if appropriate');
    } else if (lowerOutput.includes('no such file') || lowerOutput.includes('cannot find')) {
      suggestions.push('Verify file path and working directory');
    } else {
      suggestions.push('Debug the previous error before continuing');
    }
  }
  
  // Look for incomplete workflows
  const hasUncommittedChanges = recent.some(cmd => 
    cmd.command === 'git status' && 
    (cmd.output.includes('modified:') || cmd.output.includes('new file:')));
  
  if (hasUncommittedChanges) {
    suggestions.push('Commit your changes with git add and git commit');
  }
  
  // Check if in a project directory
  if (sessionState.workingDirectory.includes('node_modules')) {
    suggestions.push('Navigate back to project root (cd ..)');
  }
  
  // If no specific suggestions, give general ones
  if (suggestions.length === 0) {
    suggestions.push('Continue with your development workflow');
    suggestions.push('Run tests to verify functionality');
    suggestions.push('Check git status for uncommitted changes');
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}


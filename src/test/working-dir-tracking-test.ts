#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';
import { generateRecap } from '../vibe-recap.js';

console.log('Testing Working Directory Tracking in Recap...\n');

async function testWorkingDirTracking() {
  try {
    // Test sequence showing the bug
    console.log('1. Starting in current directory...');
    const pwd1 = await executeTerminalCommand('pwd');
    console.log(`   PWD output: ${pwd1.output}`);
    console.log(`   Working dir in result: ${pwd1.workingDirectory}\n`);
    
    console.log('2. Changing to /tmp...');
    const cd1 = await executeTerminalCommand('cd /tmp');
    console.log(`   CD output: ${cd1.output}`);
    console.log(`   Working dir in result: ${cd1.workingDirectory}\n`);
    
    console.log('3. Verifying we are in /tmp...');
    const pwd2 = await executeTerminalCommand('pwd');
    console.log(`   PWD output: ${pwd2.output}`);
    console.log(`   Working dir in result: ${pwd2.workingDirectory}\n`);
    
    console.log('4. Changing to vibe-dev directory...');
    const cd2 = await executeTerminalCommand('cd /Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev');
    console.log(`   CD output: ${cd2.output}`);
    console.log(`   Working dir in result: ${cd2.workingDirectory}\n`);
    
    console.log('5. Verifying we are in vibe-dev...');
    const pwd3 = await executeTerminalCommand('pwd');
    console.log(`   PWD output: ${pwd3.output}`);
    console.log(`   Working dir in result: ${pwd3.workingDirectory}\n`);
    
    console.log('6. Running git status to prove we are in the right directory...');
    const gitStatus = await executeTerminalCommand('git status');
    console.log(`   Git status output (first line): ${gitStatus.output.split('\n')[0]}`);
    console.log(`   Working dir in result: ${gitStatus.workingDirectory}\n`);
    
    // Get recap in JSON format to check working directories
    console.log('7. Getting recap in JSON format...\n');
    const recapJson = await generateRecap({ hours: 1, format: 'json' });
    const recapData = JSON.parse(recapJson);
    
    console.log('Commands in recap:');
    recapData.commands.forEach((cmd: any, index: number) => {
      console.log(`   [${index + 1}] ${cmd.command}`);
      console.log(`       Working Dir: ${cmd.workingDirectory}`);
      console.log(`       Output: ${cmd.output.split('\n')[0]}...`);
      console.log('');
    });
    
    // Check if working directories are correct
    console.log('🔍 Issue Analysis:');
    const lastPwdCommand = recapData.commands.find((cmd: any) => cmd.command === 'pwd' && cmd.output === '/Users/ehukaimedia/Desktop/AI-Applications/Node/vibe-dev');
    const gitStatusCommand = recapData.commands.find((cmd: any) => cmd.command === 'git status');
    
    if (lastPwdCommand) {
      console.log(`   - PWD shows we're in: ${lastPwdCommand.output}`);
      console.log(`   - But workingDirectory shows: ${lastPwdCommand.workingDirectory}`);
      console.log(`   - Match: ${lastPwdCommand.output === lastPwdCommand.workingDirectory ? '✅' : '❌'}`);
    }
    
    if (gitStatusCommand) {
      console.log(`\n   - Git status succeeded (proving we're in vibe-dev)`);
      console.log(`   - But workingDirectory shows: ${gitStatusCommand.workingDirectory}`);
      console.log(`   - Correct: ${gitStatusCommand.workingDirectory.includes('vibe-dev') ? '✅' : '❌'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testWorkingDirTracking();
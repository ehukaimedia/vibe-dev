#!/usr/bin/env node
import { executeTerminalCommand } from '../vibe-terminal.js';
import { generateRecap } from '../vibe-recap.js';

console.log('Demonstrating Distinct Recap Types...\n');

async function demonstrateRecapTypes() {
  try {
    // Execute some varied commands
    console.log('Executing sample commands...');
    await executeTerminalCommand('pwd');
    await executeTerminalCommand('echo "Testing recap types"');
    await executeTerminalCommand('ls -la');
    await executeTerminalCommand('git status');
    await executeTerminalCommand('npm --version');
    await executeTerminalCommand('nonexistentcommand'); // Intentional error
    
    console.log('\n=== SUMMARY RECAP ===');
    const summary = await generateRecap({ hours: 1, type: 'summary', format: 'text' });
    console.log(summary);
    
    console.log('\n=== STATUS RECAP ===');
    const status = await generateRecap({ hours: 1, type: 'status', format: 'text' });
    console.log(status);
    
    console.log('\n=== FULL RECAP ===');
    const full = await generateRecap({ hours: 1, type: 'full', format: 'text' });
    console.log(full);
    
    process.exit(0);
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

demonstrateRecapTypes();
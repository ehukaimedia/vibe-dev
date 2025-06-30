#!/usr/bin/env node

import { IntelligentOutputParser } from '../dist/intelligent-output-parser.js';

console.log('🧪 Testing Windows Output Parser Fix...\n');

// Test cases for VIBE_EXIT_CODE stripping
const testCases = [
  {
    name: 'PowerShell echo with exit code',
    platform: 'windows',
    shellType: 'powershell',
    command: 'echo "Hello World"',
    rawOutput: 'PS C:\\Users\\test> echo "Hello World"\nHello World\nVIBE_EXIT_CODE:0\nPS C:\\Users\\test>',
    expected: 'Hello World'
  },
  {
    name: 'CMD echo with exit code',
    platform: 'windows', 
    shellType: 'bash', // CMD is treated as bash
    command: 'echo Hello',
    rawOutput: 'C:\\Users\\test>echo Hello\nHello\nVIBE_EXIT_CODE:1\nC:\\Users\\test>',
    expected: 'Hello'
  },
  {
    name: 'Output on same line as exit code',
    platform: 'windows',
    shellType: 'powershell',
    command: 'echo %cd%',
    rawOutput: 'PS C:\\Users\\test> echo %cd%\nC:\\Users\\testVIBE_EXIT_CODE:0\nPS C:\\Users\\test>',
    expected: 'C:\\Users\\test'
  },
  {
    name: 'Error message with EXITCODE substring',
    platform: 'windows',
    shellType: 'powershell', 
    command: 'Get-ChildItem NonExistent',
    rawOutput: 'PS C:\\Users\\test> Get-ChildItem NonExistent\nGet-ChildItem : Cannot find path \'C:\\Users\\test\\NonExistent\' because it does not exist.\nAt line:1 char:1\n+ Get-ChildItem NonExistent\n+ ~~~~~~~~~~~~~~~~~~~~~~~~~\n    + CategoryInfo          : ObjectNotFound: (C:\\Users\\test\\NonExistent:String) [Get-ChildItem], ItemNotFoundException\n    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand\nVIBE_EXIT_CODE:1\nPS C:\\Users\\test>',
    expected: 'Get-ChildItem : Cannot find path \'C:\\Users\\test\\NonExistent\' because it does not exist.\nAt line:1 char:1\n+ Get-ChildItem NonExistent\n+ ~~~~~~~~~~~~~~~~~~~~~~~~~\n    + CategoryInfo          : ObjectNotFound: (C:\\Users\\test\\NonExistent:String) [Get-ChildItem], ItemNotFoundException\n    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand'
  },
  {
    name: 'Empty output with exit code only',
    platform: 'windows',
    shellType: 'powershell',
    command: 'Set-Variable test 123',
    rawOutput: 'PS C:\\Users\\test> Set-Variable test 123\nVIBE_EXIT_CODE:0\nPS C:\\Users\\test>',
    expected: ''
  }
];

// Run tests
let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const parser = new IntelligentOutputParser(test.shellType, test.platform);
  const result = parser.parse(test.rawOutput, test.command);
  
  if (result === test.expected) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got:      "${result}"`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
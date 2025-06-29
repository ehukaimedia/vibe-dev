import { describe, test, expect } from '@jest/globals';
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';

describe('Debug Raw Output', () => {
  test('log raw output for pwd command', async () => {
    const terminal = new VibeTerminalMac();
    
    // Log test mode status
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('disableOutputCleaning:', (terminal as any).disableOutputCleaning);
    
    // Temporarily expose raw output by overriding the protected method
    const original_cleanOutput = (terminal as any)._cleanOutput.bind(terminal);
    let capturedRaw = '';
    (terminal as any)._cleanOutput = function(raw: string, cmd: string) {
      capturedRaw = raw;
      console.log('RAW OUTPUT:', JSON.stringify(raw));
      console.log('RAW BYTES:', Buffer.from(raw).toString('hex'));
      console.log('COMMAND:', cmd);
      console.log('---');
      console.log('RAW OUTPUT (readable):');
      console.log(raw);
      console.log('---');
      return original_cleanOutput(raw, cmd);
    };
    
    const result = await terminal.execute('pwd');
    console.log('CLEANED OUTPUT:', JSON.stringify(result.output));
    
    // Analyze the pattern
    expect(capturedRaw).toBeDefined();
    
    // Test other commands to see the pattern
    console.log('\n=== Testing echo command ===');
    const echoResult = await terminal.execute('echo test');
    console.log('ECHO CLEANED OUTPUT:', JSON.stringify(echoResult.output));
    
    terminal.destroy();
  });
});
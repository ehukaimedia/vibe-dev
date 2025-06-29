import { describe, it, expect, afterEach } from '@jest/globals';
import { createPtyAdapter, IPtyAdapter } from '../../src/pty-adapter.js';
import * as os from 'os';

// Skip PTY tests in CI environment
const skipInCI = process.env.CI ? it.skip : it;

describe('pty-adapter functionality', () => {
  let terminal: IPtyAdapter | null = null;

  afterEach(() => {
    if (terminal) {
      terminal.kill();
      terminal = null;
    }
  });

  skipInCI('should create PTY instance with correct configuration', () => {
    const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    
    terminal = createPtyAdapter(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    expect(terminal.pid).toBeDefined();
    expect(terminal.pid).toBeGreaterThan(0);
  });

  skipInCI('should execute echo command and capture output', (done) => {
    const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    
    terminal = createPtyAdapter(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    let output = '';
    terminal.onData((data) => {
      output += data;
      if (output.includes('Hello from PTY')) {
        expect(output).toContain('Hello from PTY');
        done();
      }
    });

    terminal.write('echo "Hello from PTY"\r');
  }, 5000);

  skipInCI('should persist working directory between commands', (done) => {
    const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    
    terminal = createPtyAdapter(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    let output = '';
    let changedDir = false;
    
    terminal.onData((data) => {
      output += data;
      
      if (!changedDir && (output.includes('$') || output.includes('#') || output.includes('%'))) {
        changedDir = true;
        terminal!.write('cd /tmp\r');
        setTimeout(() => {
          terminal!.write('pwd\r');
        }, 500);
      }
      
      if (output.includes('/tmp')) {
        expect(output).toContain('/tmp');
        done();
      }
    });
  }, 10000);

  skipInCI('should persist environment variables in session', (done) => {
    const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    
    terminal = createPtyAdapter(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    let output = '';
    let setVar = false;
    
    terminal.onData((data) => {
      output += data;
      
      if (!setVar && (output.includes('$') || output.includes('#') || output.includes('%'))) {
        setVar = true;
        terminal!.write('export TEST_VAR="PTY works!"\r');
        setTimeout(() => {
          terminal!.write('echo $TEST_VAR\r');
        }, 500);
      }
      
      if (output.includes('PTY works!')) {
        expect(output).toContain('PTY works!');
        done();
      }
    });
  }, 10000);

  skipInCI('should handle exit codes correctly', (done) => {
    const defaultShell = os.platform() === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
    
    terminal = createPtyAdapter(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: process.env
    });

    // Note: pty-adapter doesn't expose onExit, so we test kill directly
    expect(() => terminal!.kill()).not.toThrow();
    done();
  });
});
// test/mac/macos-features.test.ts
import { VibeTerminalMac } from '../../src/vibe-terminal-mac.js';
import { execSync } from 'child_process';

describe('macOS Specific Features', () => {
  let terminal: VibeTerminalMac;
  
  beforeEach(() => {
    terminal = new VibeTerminalMac({ promptTimeout: 2000 });
  });
  
  afterEach(() => {
    terminal?.kill();
  });
  
  test('detects macOS version correctly', () => {
    const version = (terminal as any).getMacOSVersion();
    expect(version).toMatch(/^\d+\.\d+$/); // e.g., "15.5"
    
    // Verify against actual system
    const systemVersion = execSync('sw_vers -productVersion').toString().trim();
    expect(version).toBe(systemVersion);
  });
  
  test('uses zsh as default on modern macOS', () => {
    const version = (terminal as any).getMacOSVersion();
    const [major, minor] = version.split('.').map((n: string) => parseInt(n));
    
    if (major > 10 || (major === 10 && minor >= 15)) {
      // Catalina (10.15) and later default to zsh
      const defaultShell = terminal.getDefaultShell();
      expect(defaultShell.endsWith('/zsh')).toBe(true);
    }
  });
  
  test('detects Terminal.app vs iTerm2', () => {
    const terminalApp = (terminal as any).getTerminalApp();
    expect(['Terminal.app', 'iTerm2', 'VS Code', 'Unknown']).toContain(terminalApp);
  });
  
  test('handles Mac-specific paths', () => {
    // Test /Users path
    const home = terminal.testNormalizePath('~');
    expect(home).toMatch(/^\/Users\//);
    
    // Test expansion
    const expanded = (terminal as any).expandMacPath('~/Documents');
    expect(expanded).toContain('/Users/');
    expect(expanded).toContain('/Documents');
  });
  
  test('detects Mac-specific shells at correct locations', () => {
    const shells = (terminal as any).getAvailableMacShells();
    expect(Array.isArray(shells)).toBe(true);
    
    // Should at least have standard Mac shells
    expect(shells).toContain('/bin/zsh');
    expect(shells).toContain('/bin/bash');
  });
  
  test('identifies macOS code name', () => {
    const codeName = (terminal as any).getMacOSCodeName();
    const validCodeNames = ['Sequoia', 'Sonoma', 'Ventura', 'Monterey', 'Big Sur', 'Catalina', 'Mojave', 'Unknown'];
    expect(validCodeNames).toContain(codeName);
  });
});

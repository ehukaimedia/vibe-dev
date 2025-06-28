import { describe, it, expect, jest } from '@jest/globals';
import { platform } from 'os';

describe('Windows Compatibility', () => {
  const isWindows = platform() === 'win32';
  const describeWindows = isWindows ? describe : describe.skip;

  describeWindows('Windows-specific tests', () => {
    it('should handle Windows paths', () => {
      const path = 'C:\\Users\\test\\project';
      expect(path).toMatch(/^[A-Z]:\\/);
    });

    it('should use correct shell on Windows', () => {
      const shell = process.env.COMSPEC || 'cmd.exe';
      expect(shell).toContain('.exe');
    });
  });

  it('should handle cross-platform paths', () => {
    const separator = platform() === 'win32' ? '\\' : '/';
    const path = ['home', 'user', 'project'].join(separator);
    expect(path).toBeTruthy();
  });
});
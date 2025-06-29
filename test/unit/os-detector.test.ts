import { describe, test, expect } from '@jest/globals';
import { detectPlatform, isWindows, isMac, Platform } from '../../src/os-detector.js';

describe('OS Detection - Mac/PC Only', () => {
  test('detects current platform', () => {
    const platform = detectPlatform();
    expect(['mac', 'windows']).toContain(platform);
  });

  test('platform detection functions work', () => {
    if (process.platform === 'darwin') {
      expect(isMac()).toBe(true);
      expect(isWindows()).toBe(false);
    } else if (process.platform === 'win32') {
      expect(isMac()).toBe(false);
      expect(isWindows()).toBe(true);
    }
  });

  test('Platform enum values', () => {
    expect(Platform.MAC).toBe('mac');
    expect(Platform.WINDOWS).toBe('windows');
    // Verify Linux is removed
    expect(Platform).not.toHaveProperty('LINUX');
  });

  test('throws error for unsupported platforms', () => {
    // Mock unsupported platform
    const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    });

    expect(() => detectPlatform()).toThrow('Unsupported platform: linux');

    // Restore
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform);
    }
  });
});
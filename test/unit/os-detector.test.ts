import { detectPlatform, isWindows, isMac, isLinux, Platform } from '../../src/os-detector.js';

describe('OS Detection', () => {
  test('detects current platform correctly', () => {
    const platform = detectPlatform();
    expect(['mac', 'windows', 'linux']).toContain(platform);
  });
  
  test('helper functions work correctly', () => {
    if (process.platform === 'darwin') {
      expect(isMac()).toBe(true);
      expect(isWindows()).toBe(false);
      expect(isLinux()).toBe(false);
    } else if (process.platform === 'win32') {
      expect(isMac()).toBe(false);
      expect(isWindows()).toBe(true);
      expect(isLinux()).toBe(false);
    } else if (process.platform === 'linux') {
      expect(isMac()).toBe(false);
      expect(isWindows()).toBe(false);
      expect(isLinux()).toBe(true);
    }
  });
  
  test('platform enum values are correct', () => {
    expect(Platform.MAC).toBe('mac');
    expect(Platform.WINDOWS).toBe('windows');
    expect(Platform.LINUX).toBe('linux');
  });
  
  test('detectPlatform returns correct enum value for current platform', () => {
    const platform = detectPlatform();
    if (process.platform === 'darwin') {
      expect(platform).toBe(Platform.MAC);
    } else if (process.platform === 'win32') {
      expect(platform).toBe(Platform.WINDOWS);
    } else if (process.platform === 'linux') {
      expect(platform).toBe(Platform.LINUX);
    }
  });
});
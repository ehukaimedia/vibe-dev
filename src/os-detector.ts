export enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows'
  // REMOVED: LINUX = 'linux'
}

export function detectPlatform(): Platform {
  switch (process.platform) {
    case 'darwin': return Platform.MAC;
    case 'win32': return Platform.WINDOWS;
    default: 
      throw new Error(`Unsupported platform: ${process.platform}. Vibe Dev only supports Mac and Windows.`);
  }
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMac(): boolean {
  return process.platform === 'darwin';
}

// REMOVED: isLinux() function
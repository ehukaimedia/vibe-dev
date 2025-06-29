export enum Platform {
  MAC = 'mac',
  WINDOWS = 'windows',
  LINUX = 'linux'
}

export function detectPlatform(): Platform {
  switch (process.platform) {
    case 'darwin': return Platform.MAC;
    case 'win32': return Platform.WINDOWS;
    case 'linux': return Platform.LINUX;
    default: return Platform.LINUX;
  }
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMac(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}
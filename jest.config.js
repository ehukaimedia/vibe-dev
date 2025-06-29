/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  rootDir: '.',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  // Dynamic platform-based test matching
  testMatch: [
    // Always run cross-platform tests
    '<rootDir>/test/unit/**/*.test.ts',
    '<rootDir>/test/integration/**/*.test.ts',
    '<rootDir>/test/performance/**/*.test.ts',
    '<rootDir>/test/fixtures/**/*.test.ts',
    
    // Platform-specific tests based on current OS
    ...(process.platform === 'darwin' ? ['<rootDir>/test/mac/**/*.test.ts'] : []),
    ...(process.platform === 'win32' ? ['<rootDir>/test/pc/**/*.test.ts'] : []),
  ],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/test/**/*',
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Remove testPathIgnorePatterns - using testMatch instead
};
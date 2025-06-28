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
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.spec.ts'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/test/**/*',
  ],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    // Ignore Windows-specific test files
    'windows.test.ts',
    'win32.test.ts',
    'powershell.test.ts',
    'windows-compatibility.test.ts'
  ],
};
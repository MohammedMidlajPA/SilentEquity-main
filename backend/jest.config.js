/**
 * Jest Configuration
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 15000,
  // Don't exit on unhandled promise rejections in tests
  detectOpenHandles: false,
  forceExit: true,
};


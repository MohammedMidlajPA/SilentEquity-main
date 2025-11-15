/**
 * Jest Configuration
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};


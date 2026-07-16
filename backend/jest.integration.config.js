const base = require('./package.json').jest;

module.exports = {
  ...base,
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js',
    '<rootDir>/tests/integration/env.js',
  ],
};

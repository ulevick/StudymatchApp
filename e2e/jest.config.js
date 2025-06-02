module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  testTimeout: 300_000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  reporters: [
    'default',
    [ 'jest-html-reporter', {
      pageTitle:       'E2E Test Report',
      outputPath:      'e2e-report/index.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
    }
    ],
    'detox/runners/jest/reporter',
  ],
};

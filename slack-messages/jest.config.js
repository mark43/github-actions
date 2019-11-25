module.exports = {
    clearMocks: true,
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
            diagnostics: true,
          },
    },
    moduleFileExtensions: ['js', 'ts'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    testRunner: 'jest-circus/runner',
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    verbose: true
  }
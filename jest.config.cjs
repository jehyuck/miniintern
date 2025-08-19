/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testMatch: ['**/test/**/*.spec.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>\\test\\setting\\load-env.ts'],
  setupFilesAfterEnv: ['<rootDir>\\test\\setting\\jest.setup.ts'],
};

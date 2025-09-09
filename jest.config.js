module.exports = {
  testMatch: ['**/?(*.)(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  testEnvironment: 'jsdom',
  rootDir: '',
  transform: {
    '.(ts|tsx)': '@swc/jest',
  },
  moduleNameMapper: {
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@pages(.*)$': '<rootDir>/src/pages$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@types(.*)$': '<rootDir>/src/types$1',
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@connections(.*)$': '<rootDir>/src/connections$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1',
    '^@layouts(.*)$': '<rootDir>/src/layouts$1',
    '\\.css$': 'identity-obj-proxy',
  },
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  watchAll: false,
  collectCoverage: true,
  coverageDirectory: './docs/jest-coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
};

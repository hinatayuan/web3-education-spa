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
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/*.spec.{ts,tsx,js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts', // 通常index文件只做导出
    '!src/types/ethers-contracts/**', // 自动生成的合约类型文件
  ],
  coverageDirectory: './docs/jest-coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover',
    'json',
    'json-summary'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/docs/',
    '\\.d\\.ts$'
  ],
  coverageThreshold: {
    global: {
      branches: 10,     
      functions: 20,    
      lines: 20,       
      statements: 20,   
    },
  },
  watchAll: false,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'],
};

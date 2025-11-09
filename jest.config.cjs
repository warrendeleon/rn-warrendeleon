module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-aria|@react-native-aria|@expo|@gluestack-ui|@gluestack-style|@gluestack|@legendapp|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-worklets|react-native-css-interop|nativewind)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^react-dom$': '<rootDir>/__mocks__/react-dom.js',
    '^react-dom/(.*)$': '<rootDir>/__mocks__/react-dom.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
  coverageReporters: ['text', 'text-summary', 'html'],
  verbose: true,
  silent: false,
};

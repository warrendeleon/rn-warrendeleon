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
  testMatch: ['**/__tests__/**/*.rntl.[jt]s?(x)'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^react-dom$': '<rootDir>/__mocks__/react-dom.js',
    '^react-dom/(.*)$': '<rootDir>/__mocks__/react-dom.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '.*\\.feature$',        // Exclude Cucumber feature files
    '.*\\.cucumber\\.tsx$', // Exclude Cucumber step definitions
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/config/reactotron.ts', // Dev-only debugging tool
    '!src/**/*Screen.tsx', // Exclude screen components (tested via integration/E2E)
    '!src/navigation/**/*.tsx', // Exclude navigation config
    '!src/store/configureStore.ts', // Store config (has dev/prod branches)
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 45,
      lines: 55,
    },
    // Business logic must have 100% coverage
    './src/**/store/**/*.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    // Config files must have 100% coverage (except dev tools)
    './src/config/**/*.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  coverageReporters: ['text', 'text-summary', 'html'],
  verbose: true,
  silent: false,
};

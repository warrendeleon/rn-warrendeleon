module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'json', 'node'],
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-aria|@react-native-aria|@expo|@gluestack-ui|@gluestack-style|@gluestack|@legendapp|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-worklets|react-native-css-interop|react-native-vector-icons|react-native-blob-util|react-native-pdf|react-native-share|react-native-webview|react-native-launch-arguments|nativewind|msw|until-async|rettime|@mswjs|@open-draft|@bundled-es-modules|headers-polyfill|strict-event-emitter|outvariant)/)',
  ],
  testMatch: ['**/__tests__/**/*.rntl.[jt]s?(x)'],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '\\.css$': '<rootDir>/src/test-utils/mocks/styleMock.js',
    '^react-dom$': '<rootDir>/src/test-utils/mocks/react-dom.js',
    '^react-dom/(.*)$': '<rootDir>/src/test-utils/mocks/react-dom.js',
    // Mock Storybook to avoid ESM parsing issues in Jest
    '^\\.\\./\\.\\./\\.rnstorybook$': '<rootDir>/src/test-utils/mocks/storybookMock.ts',
    // Mock TFLite model assets
    '\\.tflite$': '<rootDir>/src/test-utils/mocks/tfliteMock.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '.*\\.feature$', // Exclude Cucumber feature files
    '.*\\.cucumber\\.tsx$', // Exclude Cucumber step definitions
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/test-utils/**', // Exclude test utilities (test infrastructure, not application code)
    '!src/config/reactotron.ts', // Dev-only debugging tool
    '!src/**/*Screen.tsx', // Exclude screen components (tested via integration/E2E)
    '!src/navigation/**/*.tsx', // Exclude navigation config
    '!src/store/configureStore.ts', // Store config (has dev/prod branches)
    '!src/**/*.stories.tsx', // Exclude Storybook stories (interactive visual testing, not Jest)
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 78,
      functions: 65,
      lines: 85,
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

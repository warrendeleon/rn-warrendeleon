module.exports = {
  cacheDirectory: '.jest/cache',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['detox', 'e2e'],
  preset: 'react-native',
  setupFiles: [
    './node_modules/react-native/jest/setup.js',
    './src/testUtils/Mocks.ts',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
    '\\.e2e\\.tsx$',
    '\\.mock\\.ts$',
    '<rootDir>/src/typescript',
  ],
  testRegex: '(/__tests__/.*|\\.(unit|rntl|snapshot))\\.(ts|tsx|js)$',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)',
  ],
};

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  // Global ignores - must be in a separate object
  {
    ignores: [
      'node_modules/**',
      'android/**',
      'ios/**',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.config.ts',
      '**/babel.config.js',
      '**/jest.config.js',
      '**/metro.config.js',
      '**/.eslintrc.*',
      '**/.prettierrc.*',
      '**/.jest/**',
      '.yarn/**',
      '.claude/**',
      // E2E config files
      '.detoxrc.js',
      '.cucumber.js',
      // Storybook auto-generated files
      '.rnstorybook/storybook.requires.ts',
      '.rnstorybook/stories/**',
      // NOTE: no '__tests__/**' here so tests are linted
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        // React Native globals
        require: 'readonly',
        process: 'readonly',
        // Detox globals
        device: 'readonly',
        element: 'readonly',
        expect: 'readonly',
        waitFor: 'readonly',
        by: 'readonly',
        // Cucumber globals
        Given: 'readonly',
        When: 'readonly',
        Then: 'readonly',
        Before: 'readonly',
        After: 'readonly',
        BeforeAll: 'readonly',
        AfterAll: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'prettier/prettier': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'], // side effect imports
            ['^react', '^@?\\w'], // external packages
            ['^@app(/.*|$)'], // internal aliases starting with @app
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // parent imports
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'], // relative imports
            ['^.+\\.s?css$'], // style imports
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  // 👇 Test-only override: don't auto-fix imports in tests
  {
    files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
      'import/no-relative-parent-imports': 'off',
    },
  },
  // 👇 JS files: allow require() and CommonJS/Jest globals since it's valid in React Native
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        module: 'readonly',
        exports: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // 👇 App.tsx: allow conditional require for Storybook
  {
    files: ['src/app/App.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // 👇 Test files: allow jest.requireActual() and jest.requireMock() patterns
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.rntl.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // 👇 CJS files: Node.js CommonJS modules with proper globals
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        global: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
      sourceType: 'commonjs',
    },
    rules: {
      // CommonJS modules use require() by design - this is the correct syntax for .cjs files
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

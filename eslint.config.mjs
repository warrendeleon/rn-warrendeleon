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
      // Enforce using logger utility instead of console.* for PII masking
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='console'][callee.property.name=/^(log|warn|error|info|debug)$/]",
          message:
            'Use logError/logWarning/logDebug from @app/utils/logger instead of console.* for automatic PII masking.',
        },
      ],
      // Keep feature boundaries honest: import another feature only through its
      // public index (@app/features/X). Reaching into its internals is private.
      // Within a feature, use relative imports. Tests are exempt (override below).
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/features/*/*', '@app/features/*/*/**'],
              message:
                'Import another feature through its public index (@app/features/X), not its internals. Within a feature, use relative imports.',
            },
          ],
        },
      ],
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
  // 👇 The root store wires reducers only, and must not pull a feature's screens
  // in with them. Importing the barrel closes a require cycle (barrel -> screen
  // -> @app/store -> configureStore) that leaves a reducer undefined at
  // combineReducers time, so this one file reaches the store submodule directly.
  {
    files: ['src/store/configureStore.ts'],
    rules: {
      'no-restricted-imports': 'off',
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
  {
    files: ['src/utils/logger.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: [
      'jest.setup.ts',
      'scripts/**/*.js',
      'src/test-utils/**/*.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];

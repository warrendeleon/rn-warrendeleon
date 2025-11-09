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
      // NOTE: no '__tests__/**' here so tests are linted
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
];

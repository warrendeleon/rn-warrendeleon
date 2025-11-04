import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

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
      '__tests__/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
];

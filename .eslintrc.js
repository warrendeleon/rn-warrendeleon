module.exports = {
  extends: '@react-native',
  globals: {
    jest: true,
    JSX: true,
    React: true,
  },
  overrides: [
    // override "simple-import-sort" config
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Packages `react` related packages come first.
              ['^react', '^[a-z]'],
              // Packages starting with `@`
              ['^@'],
              // Internal packages.
              ['^@app', '@rn-storybook'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ],
          },
        ],
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'sort-keys-fix',
    'simple-import-sort',
    'jest',
  ],
  root: true,
  rules: {
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'sort-keys-fix/sort-keys-fix': [
      'error',
      'asc',
      {caseSensitive: false, natural: true},
    ],
    'sort-vars': 'error',
  },
};

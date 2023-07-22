/* eslint-disable sort-keys-fix/sort-keys-fix */
module.exports = {
  plugins: [
    ['babel-plugin-react-docgen-typescript', {exclude: 'node_modules'}],
    [
      'module-resolver',
      {
        alias: {
          '@app/atoms': './src/components/atoms',
          '@app/i18n': './src/i18n',
          '@app/models': './src/models',
          '@app/modules': './src/modules',
          '@app/molecules': './src/components/molecules',
          '@app/redux': './src/redux',
          '@app/screens': './src/screens',
          '@app/theme': './src/theme',
          '@app/httpClients': './src/httpClients',
          '@rn-storybook': './.ondevice',
          '@app': './src',
          '*': '.',
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
        ],
        root: ['.'],
      },
    ],
  ],
  presets: ['module:metro-react-native-babel-preset'],
};

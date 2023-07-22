module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['babel-plugin-react-docgen-typescript', {exclude: 'node_modules'}],
    [
      'module-resolver',
      {
        root: ['.'],
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
        alias: {
          '@app/theme': './src/theme',
          '@app/i18n': './src/i18n',
          '@app/redux': './src/redux',
          '@app/modules': './src/modules',
          '@app/atoms': './src/components/atoms',
          '@app/molecules': './src/components/molecules',
          '@app': './src',
          '*': '.',
          '@rn-storybook': './.ondevice',
        },
      },
    ],
  ],
};

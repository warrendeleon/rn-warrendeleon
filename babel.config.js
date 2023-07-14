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
          '*': '.',
          '@app': './src',
          '@app/atoms': './src/components/atoms',
          '@rn-storybook': './.ondevice',
        },
      },
    ],
  ],
};

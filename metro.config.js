const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [...assetExts.filter(ext => ext !== 'svg'), 'tflite'],
    resolverMainFields: ['sbmodern', 'react-native', 'browser', 'main'],
    sourceExts: [...sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

// First merge config, then wrap with NativeWind, then wrap with Storybook
const mergedConfig = mergeConfig(defaultConfig, config);
const nativeWindConfig = withNativeWind(mergedConfig, {
  input: './global.css',
});

module.exports = withStorybook(nativeWindConfig, {
  enabled: true,
  configPath: path.resolve(__dirname, './.rnstorybook'),
});

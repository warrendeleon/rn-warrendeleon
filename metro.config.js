// eslint-disable-next-line @typescript-eslint/no-var-requires
const {getDefaultConfig} = require('metro-config');

module.exports = (async () => {
  const {
    resolver: {sourceExts, assetExts},
  } = await getDefaultConfig();

  return {
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: process.env.RN_SRC_EXT
        ? process.env.RN_SRC_EXT.split(',').concat([...sourceExts, 'svg'])
        : [...sourceExts, 'svg'],
    },
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
  };
})();

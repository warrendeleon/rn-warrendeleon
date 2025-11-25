/**
 * @format
 */
import 'react-native-reanimated';
import './src/utils/polyfills';

// Initialize Reactotron first in development
if (__DEV__) {
  import('./src/config/reactotron');
}

import { AppRegistry, LogBox } from 'react-native';

import { App } from './src/app';
import { name as appName } from './app.json';

// Suppress known third-party library warnings that we cannot fix
// - SafeAreaView: From GlueStack UI internal component (we use SafeAreaProvider from react-native-safe-area-context)
// - onAnimatedValueUpdate: From React Navigation/GlueStack animation cleanup timing
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Toggle Storybook via STORYBOOK environment variable
// Run with: STORYBOOK=true yarn ios
const SHOW_STORYBOOK = process.env.STORYBOOK === 'true';

let AppEntryPoint = App;

if (SHOW_STORYBOOK && __DEV__) {
  AppEntryPoint = require('./.rnstorybook').default;
}

AppRegistry.registerComponent(appName, () => AppEntryPoint);

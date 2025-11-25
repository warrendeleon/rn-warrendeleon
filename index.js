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

import { name as appName } from './app.json';

// Suppress known third-party library warnings that we cannot fix
// - SafeAreaView: From GlueStack UI internal component (we use SafeAreaProvider from react-native-safe-area-context)
// - onAnimatedValueUpdate: From React Navigation/GlueStack animation cleanup timing
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);

// Storybook toggle wrapper - checks AsyncStorage for preference and provides dev menu toggle
let AppEntryPoint;

if (__DEV__) {
  // In dev mode, use the Storybook toggle wrapper
  AppEntryPoint = require('./src/app/StorybookToggle').default;
} else {
  // In production, always use the main app
  const { App } = require('./src/app');
  AppEntryPoint = App;
}

AppRegistry.registerComponent(appName, () => AppEntryPoint);

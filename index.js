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

// Suppress SafeAreaView deprecation warning from Gluestack UI
// We use SafeAreaProvider from react-native-safe-area-context (see App.tsx)
// This warning comes from Gluestack UI's internal SafeAreaView component that we don't use
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);

// Toggle Storybook via STORYBOOK environment variable
// Run with: STORYBOOK=true yarn ios
const SHOW_STORYBOOK = process.env.STORYBOOK === 'true';

let AppEntryPoint = App;

if (SHOW_STORYBOOK && __DEV__) {
  AppEntryPoint = require('./.rnstorybook').default;
}

AppRegistry.registerComponent(appName, () => AppEntryPoint);

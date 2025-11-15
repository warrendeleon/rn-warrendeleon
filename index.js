/**
 * @format
 */
import 'react-native-reanimated';
import './src/utils/polyfills';

// Initialize Reactotron first in development
if (__DEV__) {
  import('./src/config/reactotron');
}

import { AppRegistry } from 'react-native';

import { App } from './src/app';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

/**
 * Polyfills for third-party libraries with New Architecture compatibility issues
 */

import { NativeModules } from 'react-native';

// Polyfill for react-native-blob-util NativeEventEmitter issue
// See: https://github.com/RonRadtke/react-native-blob-util/issues/462
if (!NativeModules.ReactNativeBlobUtil) {
  NativeModules.ReactNativeBlobUtil = {
    addListener: () => {},
    removeListeners: () => {},
  };
}

export {};

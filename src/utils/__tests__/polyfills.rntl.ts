/**
 * Tests for polyfills
 *
 * Verifies that polyfills are correctly applied for third-party library compatibility.
 */

import { NativeModules } from 'react-native';

describe('polyfills', () => {
  describe('ReactNativeBlobUtil polyfill', () => {
    it('should have ReactNativeBlobUtil in NativeModules after polyfill import', () => {
      // Import the polyfills module to trigger the polyfill
      require('../polyfills');

      expect(NativeModules.ReactNativeBlobUtil).toBeDefined();
    });

    it('should have addListener method', () => {
      require('../polyfills');

      expect(typeof NativeModules.ReactNativeBlobUtil.addListener).toBe('function');
    });

    it('should have removeListeners method', () => {
      require('../polyfills');

      expect(typeof NativeModules.ReactNativeBlobUtil.removeListeners).toBe('function');
    });

    it('addListener should be callable without error', () => {
      require('../polyfills');

      expect(() => {
        NativeModules.ReactNativeBlobUtil.addListener();
      }).not.toThrow();
    });

    it('removeListeners should be callable without error', () => {
      require('../polyfills');

      expect(() => {
        NativeModules.ReactNativeBlobUtil.removeListeners();
      }).not.toThrow();
    });
  });
});

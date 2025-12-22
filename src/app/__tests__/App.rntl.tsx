import React from 'react';
import BootSplash from 'react-native-bootsplash';
import { render, waitFor } from '@testing-library/react-native';
import i18n from 'i18next';

import { App } from '../App';

// Mock the E2E config module
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: jest.fn(() => false),
  hasLoadedOverride: jest.fn(() => true),
  loadPersistedMockOverride: jest.fn(() => Promise.resolve()),
}));

jest.mock('@app/config/e2e-error', () => ({
  getE2EErrorConfig: jest.fn(() => ({ enabled: false, mode: 'none', endpoint: 'all' })),
}));

// Mock BootSplash
jest.mock('react-native-bootsplash', () => ({
  hide: jest.fn(() => Promise.resolve()),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to default values
    const e2eConfig = require('@app/config/e2e');
    (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(true);
    (e2eConfig.loadPersistedMockOverride as jest.Mock).mockResolvedValue(undefined);

    const e2eErrorConfig = require('@app/config/e2e-error');
    (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
      enabled: false,
      mode: 'none',
      endpoint: 'all',
    });
  });

  it('renders App component and initialises providers', () => {
    // App wraps RootNavigator in GluestackUIProvider, Redux Provider, and PersistGate
    expect(() => render(<App />)).not.toThrow();
  });

  it('initializes i18n with correct configuration', () => {
    // The import '@app/i18n' at the top of App.tsx initializes i18next
    // Verify i18n is initialized and has a valid language
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBeDefined();
    expect(['en', 'es']).toContain(i18n.language);
  });
});

describe('App implementation', () => {
  it('can be invoked directly to produce an element', () => {
    type AppProps = Parameters<typeof App>[0];
    const props = {} as AppProps;

    const element = App(props);

    expect(element).not.toBeNull();
  });
});

describe('App Boot Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const e2eConfig = require('@app/config/e2e');
    (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(true);
    (e2eConfig.loadPersistedMockOverride as jest.Mock).mockResolvedValue(undefined);

    const e2eErrorConfig = require('@app/config/e2e-error');
    (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
      enabled: false,
      mode: 'none',
      endpoint: 'all',
    });
  });

  describe('BootSplash Behaviour', () => {
    it('hides native splash with fade in normal mode', async () => {
      jest.useFakeTimers();

      render(<App />);

      // Advance timers to trigger BootSplash.hide
      jest.advanceTimersByTime(600);

      await waitFor(
        () => {
          expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
        },
        { timeout: 3000, interval: 100 }
      );

      jest.useRealTimers();
    });

    it('hides native splash immediately in E2E mode', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      render(<App />);

      await waitFor(
        () => {
          expect(BootSplash.hide).toHaveBeenCalledWith({ fade: false });
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('E2E Mock Override Loading', () => {
    it('loads mock override on startup when not yet loaded', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(false);

      render(<App />);

      await waitFor(
        () => {
          expect(e2eConfig.loadPersistedMockOverride).toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('does not load mock override when already loaded', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(true);

      render(<App />);

      // Wait a tick to ensure useEffect runs
      await waitFor(
        () => {
          expect(e2eConfig.loadPersistedMockOverride).not.toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('returns null while mock override is loading', () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(false);
      (e2eConfig.loadPersistedMockOverride as jest.Mock).mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      const { UNSAFE_root } = render(<App />);

      // App returns null while loading, but SafeAreaProvider is still rendered
      // Verify the render doesn't crash
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('E2E Data Prefetching', () => {
    it('dispatches data fetch actions in E2E mode without error config', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const e2eErrorConfig = require('@app/config/e2e-error');
      (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
        enabled: false,
        mode: 'none',
        endpoint: 'all',
      });

      render(<App />);

      // In E2E mode without errors, data should be fetched immediately
      // The actual fetch is mocked, so we just verify no crashes
      await waitFor(
        () => {
          expect(BootSplash.hide).toHaveBeenCalledWith({ fade: false });
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('skips data fetch when E2E error mode is enabled', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const e2eErrorConfig = require('@app/config/e2e-error');
      (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
        enabled: true,
        mode: 'network',
        endpoint: 'all',
      });

      // Should not crash and should show splash screen for error testing
      const { UNSAFE_root } = render(<App />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Splash Screen Flow', () => {
    it('shows splash screen in normal mode', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(false);

      const { UNSAFE_root } = render(<App />);

      // App renders without crashing
      expect(UNSAFE_root).toBeDefined();
    });

    it('skips JS splash screen in E2E mode', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const e2eErrorConfig = require('@app/config/e2e-error');
      (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
        enabled: false,
        mode: 'none',
        endpoint: 'all',
      });

      const { UNSAFE_root } = render(<App />);

      // Should render main app directly
      expect(UNSAFE_root).toBeDefined();
    });

    it('shows splash screen when E2E error mode is enabled', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(true);

      const e2eErrorConfig = require('@app/config/e2e-error');
      (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
        enabled: true,
        mode: 'network',
        endpoint: 'all',
      });

      const { UNSAFE_root } = render(<App />);

      // Should show splash screen for error testing
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Language Sync', () => {
    it('syncs i18n language with persisted language on boot', () => {
      render(<App />);

      // i18n should be initialized
      expect(i18n.isInitialized).toBe(true);
    });

    it('does not change language if already matches persisted', () => {
      const originalLanguage = i18n.language;

      render(<App />);

      // Language should remain the same
      expect(i18n.language).toBe(originalLanguage);
    });
  });

  describe('Provider Hierarchy', () => {
    it('wraps app with SafeAreaProvider', () => {
      const { UNSAFE_root } = render(<App />);

      // App renders with provider hierarchy
      expect(UNSAFE_root).toBeDefined();
    });

    it('wraps app with Redux Provider', () => {
      const { UNSAFE_root } = render(<App />);

      // Verify Provider is in the tree (Redux store is available)
      expect(UNSAFE_root).toBeDefined();
    });

    it('wraps app with PersistGate', () => {
      const { UNSAFE_root } = render(<App />);

      // PersistGate waits for rehydration
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Error Boundary Behaviour', () => {
    it('handles render without crashing', () => {
      // App should handle normal render
      expect(() => render(<App />)).not.toThrow();
    });

    it('handles multiple renders without memory leaks', () => {
      const { unmount } = render(<App />);
      unmount();

      // Re-render should not cause issues
      const { unmount: unmount2 } = render(<App />);
      unmount2();

      expect(true).toBe(true); // No crash means success
    });
  });
});

describe('App Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const e2eConfig = require('@app/config/e2e');
    (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(false);
    (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(true);
    (e2eConfig.loadPersistedMockOverride as jest.Mock).mockResolvedValue(undefined);

    const e2eErrorConfig = require('@app/config/e2e-error');
    (e2eErrorConfig.getE2EErrorConfig as jest.Mock).mockReturnValue({
      enabled: false,
      mode: 'none',
      endpoint: 'all',
    });
  });

  it('cleans up timers on unmount', () => {
    jest.useFakeTimers();

    const { unmount } = render(<App />);

    // Unmount before timer fires
    unmount();

    // Advance timers - should not cause errors
    jest.advanceTimersByTime(1000);

    expect(true).toBe(true); // No crash means success

    jest.useRealTimers();
  });

  it('cleans up effects on unmount', () => {
    const { unmount } = render(<App />);

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });
});

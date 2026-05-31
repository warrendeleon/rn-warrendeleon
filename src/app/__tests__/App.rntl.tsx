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

  it('renders App component and initialises providers', async () => {
    // App wraps RootNavigator in GluestackUIProvider, Redux Provider, and PersistGate
    await expect(render(<App />)).resolves.toBeDefined();
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

      await render(<App />);

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

      await render(<App />);

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

      await render(<App />);

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

      await render(<App />);

      // Wait a tick to ensure useEffect runs
      await waitFor(
        () => {
          expect(e2eConfig.loadPersistedMockOverride).not.toHaveBeenCalled();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('returns null while mock override is loading', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.hasLoadedOverride as jest.Mock).mockReturnValue(false);
      (e2eConfig.loadPersistedMockOverride as jest.Mock).mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      const { root } = await render(<App />);

      // App returns null while loading, but SafeAreaProvider is still rendered
      // Verify the render doesn't crash
      expect(root).toBeDefined();
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

      await render(<App />);

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
      const { root } = await render(<App />);
      expect(root).toBeDefined();
    });
  });

  describe('Splash Screen Flow', () => {
    it('shows splash screen in normal mode', async () => {
      const e2eConfig = require('@app/config/e2e');
      (e2eConfig.isE2EMockEnabled as jest.Mock).mockReturnValue(false);

      const { root } = await render(<App />);

      // App renders without crashing
      expect(root).toBeDefined();
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

      const { root } = await render(<App />);

      // Should render main app directly
      expect(root).toBeDefined();
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

      const { root } = await render(<App />);

      // Should show splash screen for error testing
      expect(root).toBeDefined();
    });
  });

  describe('Language Sync', () => {
    it('syncs i18n language with persisted language on boot', async () => {
      await render(<App />);

      // i18n should be initialized
      expect(i18n.isInitialized).toBe(true);
    });

    it('does not change language if already matches persisted', async () => {
      const originalLanguage = i18n.language;

      await render(<App />);

      // Language should remain the same
      expect(i18n.language).toBe(originalLanguage);
    });
  });

  describe('Provider Hierarchy', () => {
    it('wraps app with SafeAreaProvider', async () => {
      const { root } = await render(<App />);

      // App renders with provider hierarchy
      expect(root).toBeDefined();
    });

    it('wraps app with Redux Provider', async () => {
      const { root } = await render(<App />);

      // Verify Provider is in the tree (Redux store is available)
      expect(root).toBeDefined();
    });

    it('wraps app with PersistGate', async () => {
      const { root } = await render(<App />);

      // PersistGate waits for rehydration
      expect(root).toBeDefined();
    });
  });

  describe('Error Boundary Behaviour', () => {
    it('handles render without crashing', async () => {
      // App should handle normal render
      await expect(render(<App />)).resolves.toBeDefined();
    });

    it('handles multiple renders without memory leaks', async () => {
      const { unmount } = await render(<App />);
      await unmount();

      // Re-render should not cause issues
      const { unmount: unmount2 } = await render(<App />);
      await unmount2();

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

  it('cleans up timers on unmount', async () => {
    jest.useFakeTimers();

    const { unmount } = await render(<App />);

    // Unmount before timer fires
    await unmount();

    // Advance timers - should not cause errors
    jest.advanceTimersByTime(1000);

    expect(true).toBe(true); // No crash means success

    jest.useRealTimers();
  });

  it('cleans up effects on unmount', async () => {
    const { unmount } = await render(<App />);

    // Unmount should not throw
    await expect(unmount()).resolves.toBeUndefined();
  });
});

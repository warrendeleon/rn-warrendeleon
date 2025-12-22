/**
 * Toast Snapshot Tests
 *
 * Verifies visual consistency of the ToastProvider component across all types.
 * Snapshots capture the component structure to detect unintended changes.
 *
 * Note: These tests focus on the ToastIcon component and style configurations
 * since the full ToastProvider requires complex setup with animations.
 */

import React from 'react';
import * as ReactNative from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { render, waitFor } from '@testing-library/react-native';

import { store } from '@app/store';
import { cleanSnapshotProps, expectMatchesSnapshot } from '@app/test-utils/snapshot';

import { ToastProvider, ToastType, useToast } from '../ToastProvider';

// Mock lucide-react-native icons for consistent snapshots
jest.mock('lucide-react-native', () => ({
  CheckCircle: 'CheckCircle',
  AlertCircle: 'AlertCircle',
  Info: 'Info',
  AlertTriangle: 'AlertTriangle',
  X: 'X',
}));

// Test component that triggers toast
const ToastTrigger: React.FC<{ type: ToastType; title?: string; message: string }> = ({
  type,
  title,
  message,
}) => {
  const { showToast } = useToast();

  React.useEffect(() => {
    showToast({ type, title, message, testID: 'test-toast' });
  }, [showToast, type, title, message]);

  return null;
};

// Helper to render toast with provider
const renderToastWithProvider = (
  type: ToastType,
  message: string,
  options?: { title?: string }
) => {
  return render(
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ToastProvider>
          <ToastTrigger type={type} message={message} title={options?.title} />
        </ToastProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

describe('Toast Type Snapshots', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Light Mode Toast Types', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders success toast in light mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('success', 'Operation completed!');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Success Light Mode' });
    });

    it('renders error toast in light mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('error', 'Something went wrong');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Error Light Mode' });
    });

    it('renders info toast in light mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('info', 'Here is some information');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Info Light Mode' });
    });

    it('renders warning toast in light mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('warning', 'Please be careful');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Warning Light Mode' });
    });
  });

  describe('Dark Mode Toast Types', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('renders success toast in dark mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('success', 'Operation completed!');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Success Dark Mode' });
    });

    it('renders error toast in dark mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('error', 'Something went wrong');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Error Dark Mode' });
    });

    it('renders info toast in dark mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('info', 'Here is some information');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Info Dark Mode' });
    });

    it('renders warning toast in dark mode', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('warning', 'Please be careful');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Warning Dark Mode' });
    });
  });

  describe('Toast with Title', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders toast with title and message', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider(
        'success',
        'Your changes have been saved',
        {
          title: 'Success!',
        }
      );

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - With Title' });
    });

    it('renders error toast with title', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('error', 'Please try again later', {
        title: 'Error',
      });

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Error With Title' });
    });
  });

  describe('Toast Content Variants', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('renders toast with short message', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider('info', 'Done');

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Short Message' });
    });

    it('renders toast with long message', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider(
        'warning',
        'This is a very long message that might wrap to multiple lines on smaller screen sizes to ensure proper text handling'
      );

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Long Message' });
    });

    it('renders toast with special characters', async () => {
      const { getByTestId, toJSON } = renderToastWithProvider(
        'info',
        'Operación completada con éxito 🎉'
      );

      await waitFor(
        () => {
          expect(getByTestId('test-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expectMatchesSnapshot(toJSON(), { snapshotName: 'Toast - Special Characters' });
    });
  });
});

describe('Toast Snapshot Consistency', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('produces consistent output for same toast type', async () => {
    const { getByTestId: getByTestId1, toJSON: toJSON1 } = renderToastWithProvider(
      'success',
      'Test message'
    );

    await waitFor(
      () => {
        expect(getByTestId1('test-toast')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    const cleaned1 = cleanSnapshotProps(toJSON1());

    // Unmount and re-render
    const { getByTestId: getByTestId2, toJSON: toJSON2 } = renderToastWithProvider(
      'success',
      'Test message'
    );

    await waitFor(
      () => {
        expect(getByTestId2('test-toast')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    const cleaned2 = cleanSnapshotProps(toJSON2());

    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(cleaned1)).toBe(JSON.stringify(cleaned2));
  });

  it('different toast types produce different outputs', async () => {
    const { getByTestId: getByTestId1, toJSON: toJSON1 } = renderToastWithProvider(
      'success',
      'Test message'
    );

    await waitFor(
      () => {
        expect(getByTestId1('test-toast')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    const { getByTestId: getByTestId2, toJSON: toJSON2 } = renderToastWithProvider(
      'error',
      'Test message'
    );

    await waitFor(
      () => {
        expect(getByTestId2('test-toast')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    // Different toast types should have different styling
    // Stringify for comparison (function refs differ between renders)
    expect(JSON.stringify(toJSON1())).not.toBe(JSON.stringify(toJSON2()));
  });
});

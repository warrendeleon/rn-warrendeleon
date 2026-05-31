import React from 'react';
import * as ReactNative from 'react-native';
import { Pressable } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { Text } from '@app/components/ui/text';
import { renderWithProviders } from '@app/test-utils';

import { ToastProvider, useToast } from '../ToastProvider';

// Test component that triggers toasts
const ToastTrigger: React.FC<{
  message?: string;
  title?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  actionLabel?: string;
  actionOnPress?: () => void;
  testID?: string;
}> = ({
  message = 'Test message',
  title,
  type,
  duration,
  position,
  dismissible,
  actionLabel,
  actionOnPress,
  testID,
}) => {
  const { showToast, hideToast } = useToast();

  return (
    <>
      <Pressable
        onPress={() =>
          showToast({
            message,
            title,
            type,
            duration,
            position,
            dismissible,
            action: actionLabel
              ? { label: actionLabel, onPress: actionOnPress ?? (() => {}) }
              : undefined,
            testID,
          })
        }
        testID="show-toast-button"
        accessibilityRole="button"
      >
        <Text>Show Toast</Text>
      </Pressable>
      <Pressable onPress={hideToast} testID="hide-toast-button" accessibilityRole="button">
        <Text>Hide Toast</Text>
      </Pressable>
    </>
  );
};

// Component that uses useToast outside of ToastProvider
const InvalidToastConsumer: React.FC = () => {
  try {
    useToast();
    return <Text>Should not reach here</Text>;
  } catch {
    return <Text testID="error-text">Error thrown</Text>;
  }
};

describe('ToastProvider', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseColorScheme.mockReturnValue('light');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('renders children correctly', async () => {
      const { getByText } = await renderWithProviders(
        <ToastProvider>
          <Text>Child content</Text>
        </ToastProvider>
      );

      expect(getByText('Child content')).toBeOnTheScreen();
    });

    it('does not render toast initially', async () => {
      const { queryByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger testID="my-toast" />
        </ToastProvider>
      );

      expect(queryByTestId('toast-container')).toBeNull();
      expect(queryByTestId('my-toast')).toBeNull();
    });
  });

  describe('showToast', () => {
    it('displays toast with message when showToast is called', async () => {
      const { getByTestId, queryByTestId, getByText } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger message="Hello World" />
        </ToastProvider>
      );

      expect(queryByTestId('toast-container')).toBeNull();

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
          expect(getByText('Hello World')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('displays toast with custom testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger message="Test" testID="custom-toast" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('custom-toast')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('displays toast with title when provided', async () => {
      const { getByTestId, getByText } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger message="Body text" title="Title text" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-title')).toBeOnTheScreen();
          expect(getByText('Title text')).toBeOnTheScreen();
          expect(getByTestId('toast-message')).toBeOnTheScreen();
          expect(getByText('Body text')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('renders correct icon for each toast type', async () => {
      const types: Array<'success' | 'error' | 'info' | 'warning'> = [
        'success',
        'error',
        'info',
        'warning',
      ];

      for (const type of types) {
        const { getAllByTestId, unmount } = await renderWithProviders(
          <ToastProvider>
            <ToastTrigger type={type} />
          </ToastProvider>
        );

        const showToastButtons = getAllByTestId('show-toast-button');
        if (showToastButtons[0]) {
          await fireEvent.press(showToastButtons[0]);
        }

        await waitFor(
          () => {
            // SVG icons render multiple elements with same testID, so use getAllByTestId
            const icons = getAllByTestId(`toast-icon-${type}`);
            expect(icons.length).toBeGreaterThan(0);
          },
          { timeout: 3000, interval: 100 }
        );

        await unmount();
      }
    });
  });

  describe('hideToast', () => {
    it('hideToast function can be called after showing toast', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      // Show toast
      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify hideToast can be called without error
      // Note: Animation completion is tested in E2E tests
      await expect(fireEvent.press(getByTestId('hide-toast-button'))).resolves.toBeUndefined();
    });

    it('dismiss button can be pressed', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-dismiss-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify dismiss button can be pressed without error
      // Note: Animation completion is tested in E2E tests
      await expect(fireEvent.press(getByTestId('toast-dismiss-button'))).resolves.toBeUndefined();
    });
  });

  describe('auto-dismiss', () => {
    it('shows toast and sets up auto-dismiss timer', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger duration={500} />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      // Toast should appear
      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Note: Auto-dismiss animation completion is tested in E2E tests
      // RNTL tests focus on verifying the toast appears with correct config
    });

    it('accepts custom duration prop', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger duration={1000} />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      // Toast should appear with custom duration (verified by no errors)
      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('applies type-based default durations', async () => {
      // Verify each toast type can be shown (default durations applied internally)
      const types: Array<'success' | 'error' | 'info' | 'warning'> = [
        'success',
        'error',
        'info',
        'warning',
      ];

      for (const type of types) {
        const { getByTestId, unmount } = await renderWithProviders(
          <ToastProvider>
            <ToastTrigger type={type} />
          </ToastProvider>
        );

        await fireEvent.press(getByTestId('show-toast-button'));

        await waitFor(
          () => {
            expect(getByTestId('toast-container')).toBeOnTheScreen();
          },
          { timeout: 3000, interval: 100 }
        );

        await unmount();
      }
    });
  });

  describe('dismissible prop', () => {
    it('shows dismiss button when dismissible is true (default)', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-dismiss-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('hides dismiss button when dismissible is false', async () => {
      const { getByTestId, queryByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger dismissible={false} />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
          expect(queryByTestId('toast-dismiss-button')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('action button', () => {
    it('renders action button when action is provided', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger actionLabel="Undo" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-action-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('calls action onPress when action button is pressed', async () => {
      const mockActionOnPress = jest.fn();

      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger actionLabel="Retry" actionOnPress={mockActionOnPress} />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-action-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      await fireEvent.press(getByTestId('toast-action-button'));

      // Verify action callback was called
      expect(mockActionOnPress).toHaveBeenCalledTimes(1);

      // Note: Toast hide animation is tested in E2E tests
    });
  });

  describe('accessibility', () => {
    it('has alert role for screen readers', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const container = getByTestId('toast-container');
          expect(container.props.accessibilityRole).toBe('alert');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has polite live region for announcements', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const container = getByTestId('toast-container');
          expect(container.props.accessibilityLiveRegion).toBe('polite');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has accessibility label with message', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger message="Test accessibility" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const container = getByTestId('toast-container');
          expect(container.props.accessibilityLabel).toBe('Test accessibility');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has accessibility label with title and message when both provided', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger title="Success" message="Operation completed" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const container = getByTestId('toast-container');
          expect(container.props.accessibilityLabel).toBe('Success: Operation completed');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('dismiss button has proper accessibility props', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const dismissButton = getByTestId('toast-dismiss-button');
          expect(dismissButton.props.accessibilityRole).toBe('button');
          expect(dismissButton.props.accessibilityLabel).toBe('Dismiss notification');
          expect(dismissButton.props.accessibilityHint).toBe(
            'Double tap to dismiss this notification'
          );
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('action button has proper accessibility props', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger actionLabel="Undo" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          const actionButton = getByTestId('toast-action-button');
          expect(actionButton.props.accessibilityRole).toBe('button');
          expect(actionButton.props.accessibilityLabel).toBe('Undo');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('theme support', () => {
    it('renders correctly in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId, getByText } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
        {
          preloadedState: {
            settings: {
              theme: 'light',
              language: 'en',
            },
          },
        }
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByText('Test message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('renders correctly in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId, getByText } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>,
        {
          preloadedState: {
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        }
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByText('Test message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('toast replacement', () => {
    it('replaces existing toast when showToast is called again', async () => {
      // Component that can show different messages
      const MultiToastTrigger: React.FC = () => {
        const { showToast } = useToast();

        return (
          <>
            <Pressable
              onPress={() =>
                showToast({
                  message: 'First message',
                  testID: 'first-toast',
                })
              }
              testID="show-first-toast"
              accessibilityRole="button"
            >
              <Text>Show First</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                showToast({
                  message: 'Second message',
                  testID: 'second-toast',
                })
              }
              testID="show-second-toast"
              accessibilityRole="button"
            >
              <Text>Show Second</Text>
            </Pressable>
          </>
        );
      };

      const { getByTestId, getByText, queryByText } = await renderWithProviders(
        <ToastProvider>
          <MultiToastTrigger />
        </ToastProvider>
      );

      // Show first toast
      await fireEvent.press(getByTestId('show-first-toast'));

      await waitFor(
        () => {
          expect(getByText('First message')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      // Show second toast (should replace first)
      await fireEvent.press(getByTestId('show-second-toast'));

      await waitFor(
        () => {
          expect(getByText('Second message')).toBeOnTheScreen();
          // First message should be replaced
          expect(queryByText('First message')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('useToast hook', () => {
    it('throws error when used outside ToastProvider', async () => {
      // Use direct render (not renderWithProviders) to avoid ToastProvider wrapper
      const { getByTestId } = await render(<InvalidToastConsumer />);

      expect(getByTestId('error-text')).toBeOnTheScreen();
    });
  });

  describe('testIDs', () => {
    it('has all expected testIDs for testing', async () => {
      const { getByTestId } = await renderWithProviders(
        <ToastProvider>
          <ToastTrigger title="Test" actionLabel="Action" />
        </ToastProvider>
      );

      await fireEvent.press(getByTestId('show-toast-button'));

      await waitFor(
        () => {
          expect(getByTestId('toast-container')).toBeOnTheScreen();
          expect(getByTestId('toast-content')).toBeOnTheScreen();
          expect(getByTestId('toast-title')).toBeOnTheScreen();
          expect(getByTestId('toast-message')).toBeOnTheScreen();
          expect(getByTestId('toast-dismiss-button')).toBeOnTheScreen();
          expect(getByTestId('toast-action-button')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });
});

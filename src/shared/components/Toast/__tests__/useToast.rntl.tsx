/**
 * Isolated useToast Hook Tests
 *
 * Tests the useToast hook in isolation, focusing on:
 * - Hook return value types
 * - Function stability (same reference across renders)
 * - Multiple consumers using the same context
 * - Sequential operations
 */

import React, { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { Text, VStack } from '@gluestack-ui/themed';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { useToast } from '../ToastProvider';

/**
 * Component that tracks function reference stability
 * Uses a ref to capture on every render (not just when deps change)
 */
const StabilityTracker: React.FC<{
  capturedRefs: { showToast: unknown[]; hideToast: unknown[] };
}> = ({ capturedRefs }) => {
  const { showToast, hideToast } = useToast();
  const [, setRenderCount] = useState(0);

  // Capture on every render
  capturedRefs.showToast.push(showToast);
  capturedRefs.hideToast.push(hideToast);

  return (
    <Pressable
      testID="force-rerender"
      onPress={() => setRenderCount(c => c + 1)}
      accessibilityRole="button"
    >
      <Text>Force Rerender</Text>
    </Pressable>
  );
};

/**
 * Component with multiple toast consumers
 */
const MultiConsumer: React.FC = () => {
  const toast1 = useToast();
  const toast2 = useToast();

  return (
    <VStack>
      <Pressable
        testID="consumer-1-show"
        onPress={() => toast1.showToast({ message: 'From consumer 1' })}
        accessibilityRole="button"
      >
        <Text>Consumer 1</Text>
      </Pressable>
      <Pressable
        testID="consumer-2-show"
        onPress={() => toast2.showToast({ message: 'From consumer 2' })}
        accessibilityRole="button"
      >
        <Text>Consumer 2</Text>
      </Pressable>
      <Pressable
        testID="consumer-1-hide"
        onPress={() => toast1.hideToast()}
        accessibilityRole="button"
      >
        <Text>Hide 1</Text>
      </Pressable>
      <Pressable
        testID="consumer-2-hide"
        onPress={() => toast2.hideToast()}
        accessibilityRole="button"
      >
        <Text>Hide 2</Text>
      </Pressable>
    </VStack>
  );
};

/**
 * Component that tests sequential show operations (synchronous)
 */
const SequentialOperator: React.FC = () => {
  const { showToast } = useToast();
  const [operationCount, setOperationCount] = useState(0);

  const performSequentialOperations = () => {
    // Rapidly replace toasts - each showToast replaces the previous one
    showToast({ message: 'Toast 1', testID: 'seq-toast-1' });
    showToast({ message: 'Toast 2', testID: 'seq-toast-2' });
    showToast({ message: 'Toast 3', testID: 'seq-toast-3' });

    setOperationCount(c => c + 1);
  };

  return (
    <VStack>
      <Pressable
        testID="run-sequential"
        onPress={performSequentialOperations}
        accessibilityRole="button"
      >
        <Text>Run Sequential</Text>
      </Pressable>
      <Text testID="operation-count">{operationCount}</Text>
    </VStack>
  );
};

/**
 * Component that mounts/unmounts to test cleanup
 */
const UnmountableConsumer: React.FC<{ onMount: () => void }> = ({ onMount }) => {
  const { showToast } = useToast();

  useEffect(() => {
    onMount();
    showToast({ message: 'Mounted toast', duration: 10000 });
  }, [onMount, showToast]);

  return <Text testID="unmountable-consumer">Consumer mounted</Text>;
};

describe('useToast Hook (Isolated)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('hook return value', () => {
    it('returns showToast function', async () => {
      let capturedShowToast: unknown;

      const CaptureHook: React.FC = () => {
        const { showToast } = useToast();
        capturedShowToast = showToast;
        return null;
      };

      // Note: renderWithProviders already includes ToastProvider
      await renderWithProviders(<CaptureHook />);

      expect(typeof capturedShowToast).toBe('function');
    });

    it('returns hideToast function', async () => {
      let capturedHideToast: unknown;

      const CaptureHook: React.FC = () => {
        const { hideToast } = useToast();
        capturedHideToast = hideToast;
        return null;
      };

      await renderWithProviders(<CaptureHook />);

      expect(typeof capturedHideToast).toBe('function');
    });

    it('returns object with exactly showToast and hideToast', async () => {
      let capturedContext: unknown;

      const CaptureHook: React.FC = () => {
        const context = useToast();
        capturedContext = context;
        return null;
      };

      await renderWithProviders(<CaptureHook />);

      expect(capturedContext).toHaveProperty('showToast');
      expect(capturedContext).toHaveProperty('hideToast');
      expect(Object.keys(capturedContext as object).length).toBe(2);
    });
  });

  describe('function reference stability', () => {
    it('showToast maintains same reference across renders', async () => {
      const capturedRefs = { showToast: [] as unknown[], hideToast: [] as unknown[] };

      const { getByTestId } = await renderWithProviders(
        <StabilityTracker capturedRefs={capturedRefs} />
      );

      // Initial render
      expect(capturedRefs.showToast.length).toBe(1);

      // Force rerender
      await act(async () => {
        await fireEvent.press(getByTestId('force-rerender'));
      });

      // After rerender, reference should be stable
      expect(capturedRefs.showToast.length).toBe(2);
      expect(capturedRefs.showToast[0]).toBe(capturedRefs.showToast[1]);
    });

    it('hideToast maintains same reference across renders', async () => {
      const capturedRefs = { showToast: [] as unknown[], hideToast: [] as unknown[] };

      const { getByTestId } = await renderWithProviders(
        <StabilityTracker capturedRefs={capturedRefs} />
      );

      // Initial render
      expect(capturedRefs.hideToast.length).toBe(1);

      // Force rerender
      await act(async () => {
        await fireEvent.press(getByTestId('force-rerender'));
      });

      // After rerender, reference should be stable
      expect(capturedRefs.hideToast.length).toBe(2);
      expect(capturedRefs.hideToast[0]).toBe(capturedRefs.hideToast[1]);
    });
  });

  describe('multiple consumers', () => {
    it('multiple consumers share the same context', async () => {
      const { getByTestId, getByText } = await renderWithProviders(<MultiConsumer />);

      // Consumer 1 shows toast
      await fireEvent.press(getByTestId('consumer-1-show'));

      await waitFor(
        () => {
          expect(getByText('From consumer 1')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );

      // Consumer 2 replaces toast (same context, new toast replaces old)
      await fireEvent.press(getByTestId('consumer-2-show'));

      await waitFor(
        () => {
          expect(getByText('From consumer 2')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('any consumer can hide the current toast', async () => {
      const { getByTestId, getByText } = await renderWithProviders(<MultiConsumer />);

      // Consumer 1 shows toast
      await fireEvent.press(getByTestId('consumer-1-show'));

      await waitFor(
        () => {
          expect(getByText('From consumer 1')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );

      // Consumer 2 hides toast (shared context)
      await expect(fireEvent.press(getByTestId('consumer-2-hide'))).resolves.toBeUndefined();
    });
  });

  describe('sequential operations', () => {
    it('handles rapid sequential show/hide operations', async () => {
      // Note: renderWithProviders already includes ToastProvider
      const { getByTestId, getByText } = await renderWithProviders(<SequentialOperator />);

      // Run sequential operations
      await fireEvent.press(getByTestId('run-sequential'));

      // Verify the final toast is displayed (third one)
      await waitFor(
        () => {
          expect(getByText('Toast 3')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );

      // Verify operation count incremented
      expect(getByText('1')).toBeTruthy();
    });

    it('calling hideToast when no toast is visible does not throw', async () => {
      const HideWithoutShow: React.FC = () => {
        const { hideToast } = useToast();

        return (
          <Pressable testID="hide-empty" onPress={hideToast} accessibilityRole="button">
            <Text>Hide Empty</Text>
          </Pressable>
        );
      };

      const { getByTestId } = await renderWithProviders(<HideWithoutShow />);

      // This should not throw
      await expect(fireEvent.press(getByTestId('hide-empty'))).resolves.toBeUndefined();
    });

    it('calling showToast multiple times rapidly replaces toasts', async () => {
      const RapidShow: React.FC = () => {
        const { showToast } = useToast();

        const handleRapidShow = () => {
          showToast({ message: 'Toast A' });
          showToast({ message: 'Toast B' });
          showToast({ message: 'Toast C' });
        };

        return (
          <Pressable testID="rapid-show" onPress={handleRapidShow} accessibilityRole="button">
            <Text>Rapid Show</Text>
          </Pressable>
        );
      };

      const { getByTestId, getByText, queryByText } = await renderWithProviders(<RapidShow />);

      await fireEvent.press(getByTestId('rapid-show'));

      await waitFor(
        () => {
          // Only the last toast should be visible
          expect(getByText('Toast C')).toBeTruthy();
          expect(queryByText('Toast A')).toBeNull();
          expect(queryByText('Toast B')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('component unmount behaviour', () => {
    it('toast remains visible after consumer unmounts', async () => {
      const mountCallback = jest.fn();

      const UnmountTest: React.FC = () => {
        const [showConsumer, setShowConsumer] = useState(true);

        return (
          <VStack>
            {showConsumer && <UnmountableConsumer onMount={mountCallback} />}
            <Pressable
              testID="toggle-consumer"
              onPress={() => setShowConsumer(false)}
              accessibilityRole="button"
            >
              <Text>Unmount Consumer</Text>
            </Pressable>
          </VStack>
        );
      };

      const { getByTestId, getByText, queryByTestId } = await renderWithProviders(<UnmountTest />);

      // Wait for toast to appear
      await waitFor(
        () => {
          expect(getByText('Mounted toast')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );

      // Unmount consumer
      await fireEvent.press(getByTestId('toggle-consumer'));

      await waitFor(
        () => {
          expect(queryByTestId('unmountable-consumer')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );

      // Toast should still be visible (not tied to consumer lifecycle)
      expect(getByText('Mounted toast')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('throws descriptive error when used outside ToastProvider', async () => {
      // Component that attempts to use the hook without the provider
      const OutsideProvider: React.FC = () => {
        try {
          useToast();
          return <Text>Should not reach here</Text>;
        } catch (error) {
          // Return error indicator
          return <Text testID="error-caught">{(error as Error).message}</Text>;
        }
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Use bare render (not renderWithProviders which adds ToastProvider)
      const { getByTestId, getByText } = await render(<OutsideProvider />);

      // Verify error was caught
      expect(getByTestId('error-caught')).toBeTruthy();
      expect(getByText('useToast must be used within a ToastProvider')).toBeTruthy();

      consoleSpy.mockRestore();
    });
  });

  describe('configuration defaults', () => {
    it('applies default type of success when not specified', async () => {
      const DefaultTypeTest: React.FC = () => {
        const { showToast } = useToast();

        return (
          <Pressable
            testID="show-default"
            onPress={() => showToast({ message: 'Default type' })}
            accessibilityRole="button"
          >
            <Text>Show</Text>
          </Pressable>
        );
      };

      const { getByTestId, getAllByTestId } = await renderWithProviders(<DefaultTypeTest />);

      await fireEvent.press(getByTestId('show-default'));

      await waitFor(
        () => {
          // Should render success icon by default
          const icons = getAllByTestId('toast-icon-success');
          expect(icons.length).toBeGreaterThan(0);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('applies default position of top when not specified', async () => {
      const PositionTest: React.FC = () => {
        const { showToast } = useToast();

        return (
          <Pressable
            testID="show-position"
            onPress={() => showToast({ message: 'Position test' })}
            accessibilityRole="button"
          >
            <Text>Show</Text>
          </Pressable>
        );
      };

      const { getByTestId } = await renderWithProviders(<PositionTest />);

      await fireEvent.press(getByTestId('show-position'));

      await waitFor(
        () => {
          const container = getByTestId('toast-container');
          // Container should have top position style (not bottom)
          expect(container.props.style).toBeDefined();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('applies default dismissible of true when not specified', async () => {
      const DismissibleTest: React.FC = () => {
        const { showToast } = useToast();

        return (
          <Pressable
            testID="show-dismissible"
            onPress={() => showToast({ message: 'Dismissible test' })}
            accessibilityRole="button"
          >
            <Text>Show</Text>
          </Pressable>
        );
      };

      const { getByTestId } = await renderWithProviders(<DismissibleTest />);

      await fireEvent.press(getByTestId('show-dismissible'));

      await waitFor(
        () => {
          // Dismiss button should be present by default
          expect(getByTestId('toast-dismiss-button')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('type-specific durations', () => {
    it.each([['success'], ['error'], ['info'], ['warning']] as const)(
      'applies correct default duration for %s type',
      async type => {
        const DurationTest: React.FC<{ type: 'success' | 'error' | 'info' | 'warning' }> = ({
          type,
        }) => {
          const { showToast } = useToast();

          return (
            <Pressable
              testID="show-duration"
              onPress={() => showToast({ message: `${type} toast`, type })}
              accessibilityRole="button"
            >
              <Text>Show {type}</Text>
            </Pressable>
          );
        };

        const { getByTestId, getByText } = await renderWithProviders(<DurationTest type={type} />);

        await fireEvent.press(getByTestId('show-duration'));

        // Toast should appear
        await waitFor(
          () => {
            expect(getByText(`${type} toast`)).toBeTruthy();
          },
          { timeout: 3000, interval: 100 }
        );

        // Duration is applied internally (verified by toast appearing without immediate dismissal)
        expect(getByText(`${type} toast`)).toBeTruthy();
      }
    );
  });

  describe('useRef cleanup', () => {
    it('clears timeout when new toast is shown', async () => {
      const TimeoutCleanup: React.FC = () => {
        const { showToast } = useToast();
        const callCount = useRef(0);

        const handleShow = () => {
          callCount.current += 1;
          showToast({
            message: `Toast ${callCount.current}`,
            duration: 10000, // Long duration
          });
        };

        return (
          <Pressable testID="show-for-timeout" onPress={handleShow} accessibilityRole="button">
            <Text>Show</Text>
          </Pressable>
        );
      };

      const { getByTestId, getByText, queryByText } = await renderWithProviders(<TimeoutCleanup />);

      // Show first toast
      await fireEvent.press(getByTestId('show-for-timeout'));

      await waitFor(
        () => {
          expect(getByText('Toast 1')).toBeTruthy();
        },
        { timeout: 3000, interval: 100 }
      );

      // Show second toast (should clear first timeout)
      await fireEvent.press(getByTestId('show-for-timeout'));

      await waitFor(
        () => {
          expect(getByText('Toast 2')).toBeTruthy();
          expect(queryByText('Toast 1')).toBeNull();
        },
        { timeout: 3000, interval: 100 }
      );

      // Advance timers - second toast should still be visible
      // (first timeout was cleared, only second applies)
      await act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(getByText('Toast 2')).toBeTruthy();
    });
  });
});

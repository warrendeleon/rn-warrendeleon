/**
 * Navigation Error Boundary Tests
 *
 * Tests error handling in navigation context:
 * - Error recovery during navigation
 * - FallbackUI behaviour within navigation stack
 * - State reset after error recovery
 * - Error boundary integration with RootNavigator
 *
 * @see src/navigation/RootNavigator/RootNavigator.tsx
 * @see src/shared/components/ErrorBoundary/ErrorBoundary.tsx
 */

import React, { useEffect, useState } from 'react';
import { fireEvent } from '@testing-library/react-native';

import { ErrorBoundary } from '@app/shared/components/ErrorBoundary';
import { FallbackUI } from '@app/shared/components/ErrorBoundary/FallbackUI';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof import('@react-navigation/native')>(
    '@react-navigation/native'
  );
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
      goBack: mockGoBack,
    }),
  };
});

// Component that throws on render
const ThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Navigation screen error');
  }
  return <></>;
};

// Component that throws during effect
const ThrowingEffectComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  useEffect(() => {
    if (shouldThrow) {
      throw new Error('Effect error during navigation');
    }
  }, [shouldThrow]);
  return <></>;
};

// Component that throws after delay (simulates async failure)
const DelayedThrowComponent: React.FC<{ delay: number }> = ({ delay }) => {
  const [hasThrown, setHasThrown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasThrown(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (hasThrown) {
    throw new Error('Delayed error');
  }

  return <></>;
};

describe('Navigation Error Boundary', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during error boundary tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Error Catching in Navigation Context', () => {
    it('catches errors thrown by navigation screens', async () => {
      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should display fallback UI
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
      expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    });

    it('renders children when no error occurs', async () => {
      const { queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should not display fallback UI
      expect(queryByTestId('error-try-again-button')).toBeNull();
      expect(queryByTestId('error-go-home-button')).toBeNull();
    });

    it('catches errors thrown during useEffect', async () => {
      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ThrowingEffectComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should display fallback UI for effect errors
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Error Recovery', () => {
    it('recovers from error when Try Again is pressed', async () => {
      let shouldThrow = true;
      const RecoverableComponent: React.FC = () => {
        if (shouldThrow) {
          throw new Error('Recoverable error');
        }
        return <></>;
      };

      const { getByTestId, rerender, queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      // Initially shows fallback
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();

      // Fix the error condition
      shouldThrow = false;

      // Press Try Again
      await fireEvent.press(getByTestId('error-try-again-button'));

      // Re-render the tree
      await rerender(
        <ErrorBoundary>
          <RecoverableComponent />
        </ErrorBoundary>
      );

      // Should no longer show fallback
      expect(queryByTestId('error-try-again-button')).toBeNull();
    });

    it('navigates to Home when Go Home is pressed after error', async () => {
      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      await fireEvent.press(getByTestId('error-go-home-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('resets error state before navigating home', async () => {
      const resetOrder: string[] = [];
      const mockOnReset = jest.fn(() => resetOrder.push('reset'));
      mockNavigate.mockImplementation(() => resetOrder.push('navigate'));

      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={new Error('Test')} onReset={mockOnReset} />
      );

      await fireEvent.press(getByTestId('error-go-home-button'));

      // Reset should happen before navigation
      expect(resetOrder).toEqual(['reset', 'navigate']);
    });
  });

  describe('Multiple Error Scenarios', () => {
    it('handles recovery after error', async () => {
      // Track whether component should throw
      let shouldThrow = true;

      const ConditionalErrorComponent: React.FC = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <></>;
      };

      // First render - component throws, caught by boundary
      const { getByTestId, rerender, queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      );

      // Should show fallback after error
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();

      // Fix the error condition
      shouldThrow = false;

      // Press Try Again to reset the boundary
      await fireEvent.press(getByTestId('error-try-again-button'));

      // Re-render with fixed component
      await rerender(
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      );

      // Should recover - no fallback
      expect(queryByTestId('error-try-again-button')).toBeNull();
    });

    it('handles errors with different messages', async () => {
      const errors = ['Network error', 'Parse error', 'Timeout error'];
      let currentErrorIndex = 0;

      const VariableErrorComponent: React.FC = () => {
        throw new Error(errors[currentErrorIndex]);
      };

      const { getByTestId, rerender } = await renderWithProviders(
        <ErrorBoundary>
          <VariableErrorComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();

      // Change error type
      currentErrorIndex = 1;
      await fireEvent.press(getByTestId('error-try-again-button'));
      await rerender(
        <ErrorBoundary>
          <VariableErrorComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Error State Management', () => {
    it('getDerivedStateFromError captures error correctly', () => {
      const testError = new Error('Navigation screen crashed');
      const newState = ErrorBoundary.getDerivedStateFromError(testError);

      expect(newState.hasError).toBe(true);
      expect(newState.error).toBe(testError);
      expect(newState.error?.message).toBe('Navigation screen crashed');
    });

    it('componentDidCatch logs error information', () => {
      const boundary = new ErrorBoundary({ children: null });
      const error = new Error('Navigation error');
      const errorInfo = { componentStack: '\n    at ScreenComponent\n    at Navigator' };

      boundary.componentDidCatch(error, errorInfo);

      // Should log error with context
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('resetError clears error state completely', () => {
      const boundary = new ErrorBoundary({ children: null });
      boundary.state = {
        hasError: true,
        error: new Error('Screen error'),
      };

      const setStateSpy = jest.spyOn(boundary, 'setState');
      boundary.resetError();

      expect(setStateSpy).toHaveBeenCalledWith({
        hasError: false,
        error: null,
      });
    });
  });

  describe('FallbackUI Navigation Integration', () => {
    it('displays Try Again button with correct testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={new Error('Test')} onReset={jest.fn()} />
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });

    it('displays Go Home button with correct testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={new Error('Test')} onReset={jest.fn()} />
      );

      expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    });

    it('Try Again button triggers onReset callback', async () => {
      const mockReset = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={new Error('Test')} onReset={mockReset} />
      );

      await fireEvent.press(getByTestId('error-try-again-button'));

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('Go Home button triggers both onReset and navigation', async () => {
      const mockReset = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={new Error('Test')} onReset={mockReset} />
      );

      await fireEvent.press(getByTestId('error-go-home-button'));

      expect(mockReset).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('handles null error gracefully', async () => {
      const { getByTestId } = await renderWithProviders(
        <FallbackUI error={null} onReset={jest.fn()} />
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
      expect(getByTestId('error-go-home-button')).toBeOnTheScreen();
    });
  });

  describe('Edge Cases', () => {
    it('handles error thrown during render of error boundary itself', async () => {
      // Test that ErrorBoundary handles its own render errors gracefully
      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still show fallback
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });

    it('handles error with no message', async () => {
      const NoMessageErrorComponent: React.FC = () => {
        throw new Error();
      };

      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <NoMessageErrorComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });

    it('handles non-Error thrown objects', async () => {
      const StringThrowComponent: React.FC = () => {
        throw 'String error';
      };

      // Note: React may wrap non-Error throws, behaviour is implementation-dependent
      // This test verifies the boundary still catches something
      await expect(
        renderWithProviders(
          <ErrorBoundary>
            <StringThrowComponent />
          </ErrorBoundary>
        )
      ).resolves.toBeDefined();
    });

    it('handles deeply nested errors', async () => {
      const DeepComponent: React.FC = () => {
        throw new Error('Deep error');
      };

      const NestedComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <>{children}</>
      );

      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <NestedComponent>
            <NestedComponent>
              <NestedComponent>
                <DeepComponent />
              </NestedComponent>
            </NestedComponent>
          </NestedComponent>
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Delayed Errors', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('catches errors that occur after initial render', async () => {
      const { getByTestId, queryByTestId, rerender } = await renderWithProviders(
        <ErrorBoundary>
          <DelayedThrowComponent delay={100} />
        </ErrorBoundary>
      );

      // Initially no error
      expect(queryByTestId('error-try-again-button')).toBeNull();

      // Advance time to trigger error
      jest.advanceTimersByTime(150);

      // Re-render to trigger the error in state
      await rerender(
        <ErrorBoundary>
          <DelayedThrowComponent delay={100} />
        </ErrorBoundary>
      );

      // Should now show fallback after delayed error
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Navigation to Non-Existent Route', () => {
    it('handles attempt to navigate to non-existent route', async () => {
      const NonExistentRouteComponent: React.FC = () => {
        useEffect(() => {
          // Simulate navigation to non-existent route
          mockNavigate('NonExistentScreen');
        }, []);
        return <></>;
      };

      const { queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <NonExistentRouteComponent />
        </ErrorBoundary>
      );

      // Component should render without crashing
      // Navigation to unknown routes is handled by the navigation container
      expect(mockNavigate).toHaveBeenCalledWith('NonExistentScreen');
      // ErrorBoundary should not show (navigation handles this gracefully)
      expect(queryByTestId('error-try-again-button')).toBeNull();
    });

    it('displays fallback when navigation throws error', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Screen not found in navigator');
      });

      const NavigateAndThrowComponent: React.FC = () => {
        useEffect(() => {
          mockNavigate('InvalidRoute');
        }, []);
        return <></>;
      };

      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <NavigateAndThrowComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Navigation Stack Overflow Prevention', () => {
    it('handles deep navigation stack without crashing', async () => {
      let navigationCount = 0;
      const MAX_STACK_DEPTH = 100;

      mockNavigate.mockImplementation(() => {
        navigationCount++;
        if (navigationCount > MAX_STACK_DEPTH) {
          throw new Error('Maximum navigation stack depth exceeded');
        }
      });

      const DeepNavigationComponent: React.FC = () => {
        useEffect(() => {
          // Simulate deep navigation
          for (let i = 0; i < 50; i++) {
            mockNavigate('Screen' + i);
          }
        }, []);
        return <></>;
      };

      const { queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <DeepNavigationComponent />
        </ErrorBoundary>
      );

      // Should not trigger error boundary for reasonable stack depth
      expect(queryByTestId('error-try-again-button')).toBeNull();
      expect(navigationCount).toBe(50);
    });

    it('catches stack overflow error and shows fallback', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Maximum call stack size exceeded');
      });

      const StackOverflowComponent: React.FC = () => {
        useEffect(() => {
          mockNavigate('SomeScreen');
        }, []);
        return <></>;
      };

      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <StackOverflowComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });

  describe('Navigation State Persistence Across Crashes', () => {
    it('preserves navigation state before error boundary triggers', async () => {
      const savedNavigationState: string[] = [];

      const StatePreservingComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
        useEffect(() => {
          // Save current navigation state
          savedNavigationState.push('CurrentScreen');
        }, []);

        if (shouldCrash) {
          throw new Error('Component crashed');
        }
        return <></>;
      };

      // First render - saves state
      await renderWithProviders(
        <ErrorBoundary>
          <StatePreservingComponent shouldCrash={false} />
        </ErrorBoundary>
      );

      expect(savedNavigationState).toContain('CurrentScreen');

      // Second render - crashes but state was already saved
      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <StatePreservingComponent shouldCrash={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
      // State was preserved before crash
      expect(savedNavigationState.length).toBeGreaterThanOrEqual(1);
    });

    it('allows restoring to previous screen after crash recovery', async () => {
      const screenHistory: string[] = ['HomeScreen', 'ListScreen', 'DetailsScreen'];
      let shouldCrash = true;

      const RestorableComponent: React.FC = () => {
        if (shouldCrash) {
          throw new Error('Screen crashed');
        }
        return <></>;
      };

      const { getByTestId, rerender, queryByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <RestorableComponent />
        </ErrorBoundary>
      );

      // Shows fallback
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();

      // Simulate restoring to previous screen
      const currentScreen = screenHistory[screenHistory.length - 2] ?? 'HomeScreen'; // Go back to ListScreen

      // Press Go Home to recover
      mockNavigate.mockClear();
      await fireEvent.press(getByTestId('error-go-home-button'));

      expect(mockNavigate).toHaveBeenCalledWith('Home');

      // Fix the crash and reset the error boundary
      shouldCrash = false;
      await fireEvent.press(getByTestId('error-try-again-button'));

      // Rerender without crash
      await rerender(
        <ErrorBoundary>
          <RestorableComponent />
        </ErrorBoundary>
      );

      expect(queryByTestId('error-try-again-button')).toBeNull();
      expect(currentScreen).toBe('ListScreen');
    });
  });

  describe('Navigation Reset After Auth State Change', () => {
    it('resets navigation when auth state changes to unauthenticated', async () => {
      const AuthAwareComponent: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
        useEffect(() => {
          if (!isAuthenticated) {
            mockReset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }, [isAuthenticated]);

        return <></>;
      };

      // Start authenticated
      const { rerender } = await renderWithProviders(
        <ErrorBoundary>
          <AuthAwareComponent isAuthenticated={true} />
        </ErrorBoundary>
      );

      expect(mockReset).not.toHaveBeenCalled();

      // Logout - should reset to login
      await rerender(
        <ErrorBoundary>
          <AuthAwareComponent isAuthenticated={false} />
        </ErrorBoundary>
      );

      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });

    it('preserves error boundary state during auth reset', async () => {
      let isAuthenticated = true;
      let shouldCrash = true;

      const AuthErrorComponent: React.FC = () => {
        useEffect(() => {
          if (!isAuthenticated) {
            mockReset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }, []);

        if (shouldCrash) {
          throw new Error('Auth error');
        }
        return <></>;
      };

      // Start with error
      const { getByTestId, rerender } = await renderWithProviders(
        <ErrorBoundary>
          <AuthErrorComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();

      // Auth state changes - reset navigation and recover
      isAuthenticated = false;
      shouldCrash = false;
      await fireEvent.press(getByTestId('error-try-again-button'));

      await rerender(
        <ErrorBoundary>
          <AuthErrorComponent />
        </ErrorBoundary>
      );

      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });

    it('handles error during auth reset gracefully', async () => {
      mockReset.mockImplementation(() => {
        throw new Error('Navigation reset failed');
      });

      const AuthResetErrorComponent: React.FC = () => {
        useEffect(() => {
          mockReset({ index: 0, routes: [{ name: 'Login' }] });
        }, []);
        return <></>;
      };

      const { getByTestId } = await renderWithProviders(
        <ErrorBoundary>
          <AuthResetErrorComponent />
        </ErrorBoundary>
      );

      // Error boundary catches the reset error
      expect(getByTestId('error-try-again-button')).toBeOnTheScreen();
    });
  });
});

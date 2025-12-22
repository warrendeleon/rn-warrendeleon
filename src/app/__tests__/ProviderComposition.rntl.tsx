/**
 * Provider Composition Tests
 *
 * Tests for provider composition scenarios:
 * - Provider order matters verification
 * - Provider error boundary isolation
 * - Provider state sharing
 * - Provider hot reload (dev)
 * - Provider memory cleanup
 *
 * These tests verify that the app's provider hierarchy works correctly
 * and that providers interact as expected.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { Box, Text } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render, waitFor } from '@testing-library/react-native';

import { authReducer } from '@app/features/Auth';
import { educationReducer } from '@app/features/Education';
import { profileReducer } from '@app/features/Profile';
import { settingsReducer } from '@app/features/Settings';
import { workExperienceReducer } from '@app/features/WorkExperience';
import i18n from '@app/i18n';
import { renderWithProviders } from '@app/test-utils';

// Create a test store helper
const createTestStore = () => {
  return configureStore({
    reducer: combineReducers({
      settings: settingsReducer,
      auth: authReducer,
      profile: profileReducer,
      workExperience: workExperienceReducer,
      education: educationReducer,
    }),
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

// Test contexts for provider order verification
const OuterContext = createContext<string>('outer-default');
const MiddleContext = createContext<string>('middle-default');
const InnerContext = createContext<string>('inner-default');

// Test providers
const OuterProvider: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => <OuterContext.Provider value={value}>{children}</OuterContext.Provider>;

const MiddleProvider: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => <MiddleContext.Provider value={value}>{children}</MiddleContext.Provider>;

const InnerProvider: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => <InnerContext.Provider value={value}>{children}</InnerContext.Provider>;

// Error boundary for testing isolation
class TestErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component that throws an error
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <Text testID="no-error-text">No error</Text>;
};

// Component that reads from all contexts
const ContextReaderComponent: React.FC = () => {
  const outer = useContext(OuterContext);
  const middle = useContext(MiddleContext);
  const inner = useContext(InnerContext);

  return (
    <Box testID="context-reader">
      <Text testID="outer-value">{outer}</Text>
      <Text testID="middle-value">{middle}</Text>
      <Text testID="inner-value">{inner}</Text>
    </Box>
  );
};

// Component that tracks render count for memory/cleanup tests
const RenderCounterComponent: React.FC<{ onRender: () => void }> = ({ onRender }) => {
  useEffect(() => {
    onRender();
  });

  return <Text testID="render-counter">Rendered</Text>;
};

// Component that uses cleanup effect
const CleanupTrackingComponent: React.FC<{
  onMount: () => void;
  onUnmount: () => void;
}> = ({ onMount, onUnmount }) => {
  useEffect(() => {
    onMount();
    return () => {
      onUnmount();
    };
  }, [onMount, onUnmount]);

  return <Text testID="cleanup-tracker">Mounted</Text>;
};

// State sharing test component
const StateConsumerA: React.FC = () => {
  const [sharedState] = useState('shared-value-a');
  return <Text testID="consumer-a">{sharedState}</Text>;
};

const StateConsumerB: React.FC = () => {
  const [sharedState] = useState('shared-value-b');
  return <Text testID="consumer-b">{sharedState}</Text>;
};

// Context for shared state testing
const SharedStateContext = createContext<{
  value: string;
  setValue: (v: string) => void;
}>({ value: '', setValue: () => {} });

const SharedStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('initial');
  return (
    <SharedStateContext.Provider value={{ value, setValue }}>
      {children}
    </SharedStateContext.Provider>
  );
};

const SharedStateReader: React.FC<{ id: string }> = ({ id }) => {
  const { value } = useContext(SharedStateContext);
  return <Text testID={`shared-state-${id}`}>{value}</Text>;
};

const SharedStateWriter: React.FC = () => {
  const { setValue } = useContext(SharedStateContext);
  useEffect(() => {
    setValue('updated');
  }, [setValue]);
  return <Text testID="shared-state-writer">Writer</Text>;
};

describe('Provider Composition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('provider order matters verification', () => {
    it('should access nested context values correctly', () => {
      const { getByTestId } = render(
        <OuterProvider value="outer-provided">
          <MiddleProvider value="middle-provided">
            <InnerProvider value="inner-provided">
              <ContextReaderComponent />
            </InnerProvider>
          </MiddleProvider>
        </OuterProvider>
      );

      expect(getByTestId('outer-value')).toHaveTextContent('outer-provided');
      expect(getByTestId('middle-value')).toHaveTextContent('middle-provided');
      expect(getByTestId('inner-value')).toHaveTextContent('inner-provided');
    });

    it('should use default values when providers are missing', () => {
      const { getByTestId } = render(
        <OuterProvider value="only-outer">
          <ContextReaderComponent />
        </OuterProvider>
      );

      expect(getByTestId('outer-value')).toHaveTextContent('only-outer');
      expect(getByTestId('middle-value')).toHaveTextContent('middle-default');
      expect(getByTestId('inner-value')).toHaveTextContent('inner-default');
    });

    it('should override parent context when nested', () => {
      const { getByTestId } = render(
        <OuterProvider value="first-outer">
          <OuterProvider value="second-outer">
            <ContextReaderComponent />
          </OuterProvider>
        </OuterProvider>
      );

      // Inner provider should override outer
      expect(getByTestId('outer-value')).toHaveTextContent('second-outer');
    });

    it('should maintain correct order with Redux and I18n providers', () => {
      const store = createTestStore();

      const { getByTestId } = render(
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <GluestackUIProvider config={config}>
              <OuterProvider value="test-outer">
                <ContextReaderComponent />
              </OuterProvider>
            </GluestackUIProvider>
          </I18nextProvider>
        </Provider>
      );

      expect(getByTestId('outer-value')).toHaveTextContent('test-outer');
    });
  });

  describe('provider error boundary isolation', () => {
    it('should catch errors within error boundary', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId, queryByTestId } = render(
        <TestErrorBoundary fallback={<Text testID="error-fallback">Error occurred</Text>}>
          <ErrorThrowingComponent shouldThrow={true} />
        </TestErrorBoundary>
      );

      expect(getByTestId('error-fallback')).toHaveTextContent('Error occurred');
      expect(queryByTestId('no-error-text')).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should not affect sibling components outside boundary', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <Box testID="parent">
          <TestErrorBoundary fallback={<Text testID="error-fallback">Error</Text>}>
            <ErrorThrowingComponent shouldThrow={true} />
          </TestErrorBoundary>
          <Text testID="sibling-text">Sibling content</Text>
        </Box>
      );

      expect(getByTestId('error-fallback')).toBeOnTheScreen();
      expect(getByTestId('sibling-text')).toHaveTextContent('Sibling content');

      consoleSpy.mockRestore();
    });

    it('should render children when no error occurs', () => {
      const { getByTestId } = render(
        <TestErrorBoundary fallback={<Text testID="error-fallback">Error</Text>}>
          <ErrorThrowingComponent shouldThrow={false} />
        </TestErrorBoundary>
      );

      expect(getByTestId('no-error-text')).toHaveTextContent('No error');
    });

    it('should isolate provider-level errors', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <GluestackUIProvider config={config}>
          <Box testID="outer-container">
            <TestErrorBoundary fallback={<Text testID="inner-error">Inner Error</Text>}>
              <OuterProvider value="test">
                <ErrorThrowingComponent shouldThrow={true} />
              </OuterProvider>
            </TestErrorBoundary>
            <Text testID="outer-text">Outer survives</Text>
          </Box>
        </GluestackUIProvider>
      );

      expect(getByTestId('inner-error')).toBeOnTheScreen();
      expect(getByTestId('outer-text')).toHaveTextContent('Outer survives');

      consoleSpy.mockRestore();
    });
  });

  describe('provider state sharing', () => {
    it('should share state between sibling consumers', async () => {
      const { getByTestId } = render(
        <SharedStateProvider>
          <SharedStateReader id="1" />
          <SharedStateReader id="2" />
        </SharedStateProvider>
      );

      expect(getByTestId('shared-state-1')).toHaveTextContent('initial');
      expect(getByTestId('shared-state-2')).toHaveTextContent('initial');
    });

    it('should propagate state updates to all consumers', async () => {
      const { getByTestId } = render(
        <SharedStateProvider>
          <SharedStateReader id="before" />
          <SharedStateWriter />
          <SharedStateReader id="after" />
        </SharedStateProvider>
      );

      await waitFor(
        () => {
          expect(getByTestId('shared-state-before')).toHaveTextContent('updated');
          expect(getByTestId('shared-state-after')).toHaveTextContent('updated');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('should not share state across separate providers', () => {
      const { getByTestId } = render(
        <Box testID="container">
          <SharedStateProvider>
            <SharedStateReader id="provider-1" />
          </SharedStateProvider>
          <SharedStateProvider>
            <SharedStateReader id="provider-2" />
          </SharedStateProvider>
        </Box>
      );

      // Both should have initial state (separate instances)
      expect(getByTestId('shared-state-provider-1')).toHaveTextContent('initial');
      expect(getByTestId('shared-state-provider-2')).toHaveTextContent('initial');
    });

    it('should share Redux state across components', async () => {
      const { getByTestId, store } = renderWithProviders(
        <Box testID="redux-container">
          <StateConsumerA />
          <StateConsumerB />
        </Box>,
        {
          preloadedState: {
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        }
      );

      expect(store.getState().settings.theme).toBe('dark');
      expect(getByTestId('consumer-a')).toBeOnTheScreen();
      expect(getByTestId('consumer-b')).toBeOnTheScreen();
    });
  });

  describe('provider hot reload (dev)', () => {
    it('should maintain state during rerender', () => {
      const store = createTestStore();

      const { getByTestId, rerender } = render(
        <Provider store={store}>
          <GluestackUIProvider config={config}>
            <Text testID="hot-reload-text">Initial</Text>
          </GluestackUIProvider>
        </Provider>
      );

      expect(getByTestId('hot-reload-text')).toHaveTextContent('Initial');

      // Simulate hot reload by rerendering with same providers
      rerender(
        <Provider store={store}>
          <GluestackUIProvider config={config}>
            <Text testID="hot-reload-text">After Reload</Text>
          </GluestackUIProvider>
        </Provider>
      );

      expect(getByTestId('hot-reload-text')).toHaveTextContent('After Reload');
    });

    it('should preserve Redux state across rerenders', () => {
      const store = createTestStore();
      store.dispatch({ type: 'settings/setTheme', payload: 'dark' });

      const { rerender } = render(
        <Provider store={store}>
          <Text>First render</Text>
        </Provider>
      );

      // Rerender (simulating hot reload)
      rerender(
        <Provider store={store}>
          <Text>Second render</Text>
        </Provider>
      );

      // State should be preserved
      expect(store.getState().settings.theme).toBe('dark');
    });

    it('should handle provider prop changes', () => {
      // Component that reads context - defined outside render
      const ContextDisplay: React.FC = () => {
        const value = useContext(OuterContext);
        return <Text testID="context-display">{value}</Text>;
      };

      const { getByTestId, rerender } = render(
        <OuterProvider value="value-1">
          <ContextDisplay />
        </OuterProvider>
      );

      expect(getByTestId('context-display')).toHaveTextContent('value-1');

      rerender(
        <OuterProvider value="value-2">
          <ContextDisplay />
        </OuterProvider>
      );

      expect(getByTestId('context-display')).toHaveTextContent('value-2');
    });
  });

  describe('provider memory cleanup', () => {
    it('should call cleanup function on unmount', () => {
      const onMount = jest.fn();
      const onUnmount = jest.fn();

      const { unmount } = render(
        <CleanupTrackingComponent onMount={onMount} onUnmount={onUnmount} />
      );

      expect(onMount).toHaveBeenCalledTimes(1);
      expect(onUnmount).not.toHaveBeenCalled();

      unmount();

      expect(onUnmount).toHaveBeenCalledTimes(1);
    });

    it('should cleanup nested provider resources', () => {
      const outerCleanup = jest.fn();
      const innerCleanup = jest.fn();

      const CleanupProvider: React.FC<{
        onCleanup: () => void;
        children: React.ReactNode;
      }> = ({ onCleanup, children }) => {
        useEffect(() => {
          return () => onCleanup();
        }, [onCleanup]);
        return <>{children}</>;
      };

      const { unmount } = render(
        <CleanupProvider onCleanup={outerCleanup}>
          <CleanupProvider onCleanup={innerCleanup}>
            <Text>Content</Text>
          </CleanupProvider>
        </CleanupProvider>
      );

      expect(outerCleanup).not.toHaveBeenCalled();
      expect(innerCleanup).not.toHaveBeenCalled();

      unmount();

      expect(innerCleanup).toHaveBeenCalled();
      expect(outerCleanup).toHaveBeenCalled();
    });

    it('should not leak subscriptions', () => {
      const subscriptions: Set<number> = new Set();
      let subscriptionCounter = 0;

      const SubscriptionComponent: React.FC = () => {
        useEffect(() => {
          const id = ++subscriptionCounter;
          subscriptions.add(id);
          return () => {
            subscriptions.delete(id);
          };
        }, []);
        return <Text>Subscriber</Text>;
      };

      const { unmount, rerender } = render(
        <Box>
          <SubscriptionComponent />
          <SubscriptionComponent />
        </Box>
      );

      expect(subscriptions.size).toBe(2);

      // Rerender with one less subscriber
      rerender(
        <Box>
          <SubscriptionComponent />
        </Box>
      );

      // Original subscriptions should be cleaned up
      expect(subscriptions.size).toBe(1);

      unmount();

      expect(subscriptions.size).toBe(0);
    });

    it('should prevent excessive rerenders', () => {
      let renderCount = 0;
      const onRender = () => {
        renderCount++;
      };

      const { rerender } = render(
        <SharedStateProvider>
          <RenderCounterComponent onRender={onRender} />
        </SharedStateProvider>
      );

      const initialRenderCount = renderCount;

      // Rerender with same props should not cause additional renders
      rerender(
        <SharedStateProvider>
          <RenderCounterComponent onRender={onRender} />
        </SharedStateProvider>
      );

      // Should only have rendered once more (the rerender itself)
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });

  describe('integration with app providers', () => {
    it('should render correctly with all app providers', () => {
      const { getByTestId } = renderWithProviders(
        <Text testID="provider-test">Provider Test</Text>
      );

      expect(getByTestId('provider-test')).toHaveTextContent('Provider Test');
    });

    it('should access Redux store from any nested component', () => {
      const { store, getByTestId } = renderWithProviders(
        <Box testID="nested-container">
          <Box>
            <Box>
              <Text testID="deeply-nested">Nested</Text>
            </Box>
          </Box>
        </Box>
      );

      expect(getByTestId('deeply-nested')).toBeOnTheScreen();
      expect(store.getState()).toBeDefined();
      expect(store.getState().settings).toBeDefined();
    });

    it('should maintain provider hierarchy integrity', () => {
      const { getByTestId, store } = renderWithProviders(
        <OuterProvider value="custom-outer">
          <MiddleProvider value="custom-middle">
            <Box testID="hierarchy-test">
              <ContextReaderComponent />
            </Box>
          </MiddleProvider>
        </OuterProvider>
      );

      expect(getByTestId('outer-value')).toHaveTextContent('custom-outer');
      expect(getByTestId('middle-value')).toHaveTextContent('custom-middle');
      expect(store).toBeDefined();
    });
  });
});

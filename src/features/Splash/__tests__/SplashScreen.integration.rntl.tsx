/**
 * SplashScreen Integration Tests
 *
 * Tests the integration between SplashScreen and Redux store,
 * data fetching, error recovery, and app initialisation flow.
 */

import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { errorHandlers, offlineHandlers, renderWithProviders, server } from '@app/test-utils';

import { SplashScreen } from '../SplashScreen';

// Mock config functions
jest.mock('@app/config', () => ({
  incrementRetryAttempts: jest.fn(),
}));

// Mock Logo component
jest.mock('@app/shared/components', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const actual = jest.requireActual('@app/shared/components');
  return {
    ...actual,
    Logo: ({ darkMode, style }: { darkMode: boolean; style: Record<string, unknown> }) => {
      return React.createElement(
        RN.View,
        { testID: 'logo', style },
        React.createElement(RN.Text, { testID: 'logo-mode' }, darkMode ? 'dark' : 'light')
      );
    },
  };
});

// Mock useAppColorScheme hook
const mockUseAppColorScheme = jest.fn();
jest.mock('@app/shared/hooks', () => ({
  useAppColorScheme: () => mockUseAppColorScheme(),
}));

describe('SplashScreen Integration', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  describe('Redux Store Integration', () => {
    it('dispatches fetch actions for profile, education, and work experience', async () => {
      const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          const state = store.getState();
          expect(state.profile.loading).toBe(false);
          expect(state.education.loading).toBe(false);
          expect(state.workExperience.loading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      const state = store.getState();
      expect(state.profile.data).toBeDefined();
      expect(state.education.data).toBeDefined();
      expect(state.workExperience.data).toBeDefined();
    });

    it('populates store with mock data from MSW handlers', async () => {
      const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          const state = store.getState();
          return state.profile.data !== null;
        },
        { timeout: 3000, interval: 100 }
      );

      const state = store.getState();
      expect(state.profile.data).toMatchObject({
        email: expect.any(String),
        name: expect.any(String),
        lastName: expect.any(String),
      });
    });

    it('handles concurrent fetch operations correctly', async () => {
      const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      // Initially all should be loading
      const initialState = store.getState();
      expect(initialState.profile.loading || initialState.profile.data !== null).toBe(true);

      await waitFor(
        () => {
          const state = store.getState();
          return (
            state.profile.loading === false &&
            state.education.loading === false &&
            state.workExperience.loading === false
          );
        },
        { timeout: 3000, interval: 100 }
      );

      // All should be loaded now
      const finalState = store.getState();
      expect(finalState.profile.error).toBeNull();
      expect(finalState.education.error).toBeNull();
      expect(finalState.workExperience.error).toBeNull();
    });
  });

  describe('Timing Integration', () => {
    it('calls onComplete after minimum display time (1.5s)', async () => {
      renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      expect(mockOnComplete).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('does not complete before minimum time even if data loads early', async () => {
      renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      // Advance only 500ms (data might load but timer not complete)
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('cleans up timer on unmount to prevent memory leaks', async () => {
      const { unmount } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      unmount();

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should not be called after unmount
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery Integration', () => {
    beforeEach(() => {
      server.use(...errorHandlers);
    });

    it('displays error UI when API calls fail', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );
    });

    it('shows retry button on error', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-retry-button')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );
    });

    it('retries data fetch when retry button is pressed', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-retry-button')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );

      // Reset to success handlers
      server.resetHandlers();

      await act(async () => {
        fireEvent.press(getByTestId('splash-retry-button'));
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );
    });

    it('does not call onComplete when fetch fails', async () => {
      renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(mockOnComplete).not.toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Offline Integration', () => {
    beforeEach(() => {
      server.use(...offlineHandlers);
    });

    it('handles network offline gracefully', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );
    });

    it('allows retry after network restored', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-retry-button')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );

      // Restore network (reset handlers)
      server.resetHandlers();

      await act(async () => {
        fireEvent.press(getByTestId('splash-retry-button'));
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Theme Integration', () => {
    it('passes dark mode flag to Logo when scheme is dark', async () => {
      mockUseAppColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          expect(getByTestId('logo')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('logo-mode')).toHaveTextContent('dark');
    });

    it('passes light mode flag to Logo when scheme is light', async () => {
      mockUseAppColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          expect(getByTestId('logo')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      expect(getByTestId('logo-mode')).toHaveTextContent('light');
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('renders Logo during loading phase', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          expect(getByTestId('logo')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('returns null after loading complete (unmounts splash)', async () => {
      const { queryByTestId, rerender } = renderWithProviders(
        <SplashScreen onComplete={mockOnComplete} />
      );

      await waitFor(
        () => {
          expect(queryByTestId('logo')).toBeOnTheScreen();
        },
        { timeout: 3000, interval: 100 }
      );

      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      rerender(<SplashScreen onComplete={mockOnComplete} />);

      expect(queryByTestId('logo')).toBeNull();
    });
  });

  describe('Accessibility Integration', () => {
    it('splash screen has accessibility label', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          const splashScreen = getByTestId('splash-screen');
          expect(splashScreen.props.accessibilityLabel).toBe('Loading splash screen');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('error screen has accessibility label', async () => {
      server.use(...errorHandlers);

      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          const errorScreen = getByTestId('splash-error-screen');
          expect(errorScreen.props.accessibilityLabel).toBe('Error loading data screen');
        },
        { timeout: 3000 }
      );
    });

    it('retry button has proper accessibility props', async () => {
      server.use(...errorHandlers);

      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          const retryButton = getByTestId('splash-retry-button');
          expect(retryButton.props.accessibilityRole).toBe('button');
          expect(retryButton.props.accessibilityHint).toBe('Attempts to load data again');
        },
        { timeout: 3000, interval: 100 }
      );
    });
  });

  describe('Store State Persistence', () => {
    it('loaded data persists in store after splash completes', async () => {
      const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Data should still be in store
      const state = store.getState();
      expect(state.profile.data).toBeDefined();
      expect(state.education.data).toBeDefined();
      expect(state.workExperience.data).toBeDefined();
    });

    it('maintains store state isolation between splash renders', async () => {
      const { store: store1 } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          expect(store1.getState().profile.loading).toBe(false);
        },
        { timeout: 3000, interval: 100 }
      );

      const { store: store2 } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      // Each render should have its own isolated store instance
      expect(store1).not.toBe(store2);
    });
  });
});

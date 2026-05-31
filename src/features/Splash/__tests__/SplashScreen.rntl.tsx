import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { errorHandlers, renderWithProviders, server } from '@app/test-utils';

import { SplashScreen } from '../SplashScreen';

// Mock config functions
jest.mock('@app/config', () => ({
  incrementRetryAttempts: jest.fn(),
}));

// Mock Logo component - spread actual exports to preserve ToastProvider for renderWithProviders
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

describe('SplashScreen', () => {
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

  it('renders Logo component', async () => {
    const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        expect(getByTestId('logo')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );
  });

  it('renders with dark mode when colour scheme is dark', async () => {
    mockUseAppColorScheme.mockReturnValue('dark');

    const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        expect(getByTestId('logo')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    expect(getByTestId('logo-mode')).toHaveTextContent('dark');
  });

  it('renders with light mode when colour scheme is light', async () => {
    mockUseAppColorScheme.mockReturnValue('light');

    const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        expect(getByTestId('logo')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    expect(getByTestId('logo-mode')).toHaveTextContent('light');
  });

  it('dispatches all three fetch actions on mount', async () => {
    const { store } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        const state = store.getState();
        expect(state.profile.loading).toBe(false);
        expect(state.education.loading).toBe(false);
        expect(state.workExperience.loading).toBe(false);
      },
      { timeout: 3000, interval: 100 }
    );

    // Verify data was loaded successfully
    const state = store.getState();
    expect(state.profile.data).toBeDefined();
    expect(state.education.data).toBeDefined();
    expect(state.workExperience.data).toBeDefined();
  });

  it('calls onComplete after 1.5 seconds', async () => {
    await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

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

  it('does not call onComplete before 1.5 seconds', async () => {
    await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns null after loading is complete', async () => {
    const { queryByTestId, rerender } = await renderWithProviders(
      <SplashScreen onComplete={mockOnComplete} />
    );

    // Initially, should render the splash screen
    await waitFor(
      () => {
        expect(queryByTestId('logo')).toBeOnTheScreen();
      },
      { timeout: 3000, interval: 100 }
    );

    // Advance timer
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Force re-render to check the new state
    await rerender(<SplashScreen onComplete={mockOnComplete} />);

    // After loading is complete, component returns null
    expect(queryByTestId('logo')).toBeNull();
  });

  it('clears timeout on unmount', async () => {
    const { unmount } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await unmount();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // onComplete should not be called after unmount
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Use error handlers for these tests
      server.use(...errorHandlers);
    });

    it('displays error UI when fetch fails', async () => {
      const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );

      expect(getByTestId('splash-retry-button')).toBeOnTheScreen();
    });

    it('does not call onComplete when fetch fails', async () => {
      await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

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

    it('retries data fetch when retry button is pressed', async () => {
      const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );

      // Reset to success handlers
      server.resetHandlers();

      // Press retry button
      const retryButton = getByTestId('splash-retry-button');
      await act(async () => {
        await fireEvent.press(retryButton);
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
  });

  describe('Accessibility', () => {
    it('has accessible loading screen label', async () => {
      const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await waitFor(
        () => {
          const splashScreen = getByTestId('splash-screen');
          expect(splashScreen.props.accessibilityLabel).toBe('Loading splash screen');
        },
        { timeout: 3000, interval: 100 }
      );
    });

    it('has accessible error screen label when fetch fails', async () => {
      server.use(...errorHandlers);

      const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

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

      const { getByTestId } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

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

    it('retry button has accessible label', async () => {
      server.use(...errorHandlers);

      const { getByRole } = await renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByRole('button')).toBeOnTheScreen();
        },
        { timeout: 3000 }
      );
    });
  });
});

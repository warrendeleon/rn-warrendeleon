import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

import { errorHandlers, renderWithProviders, server } from '@app/test-utils';

import { SplashScreen } from '../SplashScreen';

// Mock config functions
jest.mock('@app/config', () => ({
  incrementRetryAttempts: jest.fn(),
}));

// Mock Logo component - spread actual exports to preserve ToastProvider for renderWithProviders
jest.mock('@app/components', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const actual = jest.requireActual('@app/components');
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
jest.mock('@app/hooks', () => ({
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
    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo')).toBeTruthy();
    });
  });

  it('renders with dark mode when colour scheme is dark', async () => {
    mockUseAppColorScheme.mockReturnValue('dark');

    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo')).toBeTruthy();
    });

    expect(getByTestId('logo-mode')).toHaveTextContent('dark');
  });

  it('renders with light mode when colour scheme is light', async () => {
    mockUseAppColorScheme.mockReturnValue('light');

    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo')).toBeTruthy();
    });

    expect(getByTestId('logo-mode')).toHaveTextContent('light');
  });

  it('dispatches all three fetch actions on mount', async () => {
    const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        const state = store.getState();
        expect(state.profile.loading).toBe(false);
        expect(state.education.loading).toBe(false);
        expect(state.workExperience.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Verify data was loaded successfully
    const state = store.getState();
    expect(state.profile.data).toBeDefined();
    expect(state.education.data).toBeDefined();
    expect(state.workExperience.data).toBeDefined();
  });

  it('calls onComplete after 1.5 seconds', async () => {
    renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onComplete before 1.5 seconds', async () => {
    renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns null after loading is complete', async () => {
    const { queryByTestId, rerender } = renderWithProviders(
      <SplashScreen onComplete={mockOnComplete} />
    );

    // Initially, should render the splash screen
    await waitFor(() => {
      expect(queryByTestId('logo')).toBeTruthy();
    });

    // Advance timer
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Force re-render to check the new state
    rerender(<SplashScreen onComplete={mockOnComplete} />);

    // After loading is complete, component returns null
    expect(queryByTestId('logo')).toBeNull();
  });

  it('clears timeout on unmount', async () => {
    const { unmount } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    unmount();

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
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      expect(getByTestId('splash-retry-button')).toBeTruthy();
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

    it('retries data fetch when retry button is pressed', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Reset to success handlers
      server.resetHandlers();

      // Press retry button
      const retryButton = getByTestId('splash-retry-button');
      await act(async () => {
        fireEvent.press(retryButton);
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
});

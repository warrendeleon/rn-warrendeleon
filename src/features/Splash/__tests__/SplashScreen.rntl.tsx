import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { fetchEducation, fetchProfile, fetchWorkExperience } from '@app/store';

import { SplashScreen } from '../SplashScreen';

// Mock config functions
jest.mock('@app/config', () => ({
  incrementRetryAttempts: jest.fn(),
}));

// Mock Logo component
jest.mock('@app/components', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logo: ({ darkMode, style }: { darkMode: boolean; style: any }) => {
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

// Mock Redux store with async dispatch and selectors
const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();

jest.mock('@app/store', () => ({
  fetchProfile: jest.fn(() => ({ type: 'profile/fetchProfile' })),
  fetchWorkExperience: jest.fn(() => ({ type: 'workExperience/fetchWorkExperience' })),
  fetchEducation: jest.fn(() => ({ type: 'education/fetchEducation' })),
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
  selectProfileError: jest.fn(),
  selectEducationError: jest.fn(),
  selectWorkExperienceError: jest.fn(),
}));

describe('SplashScreen', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');

    // Mock error selectors to return no errors by default
    mockUseAppSelector.mockReturnValue(null);

    // Mock dispatch to return successful thunk results
    mockDispatch.mockResolvedValue({
      type: 'mockAction/fulfilled',
      payload: {},
      meta: { requestStatus: 'fulfilled' },
    });

    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders Logo component', () => {
    const { getByTestId } = render(<SplashScreen onComplete={mockOnComplete} />);

    expect(getByTestId('logo')).toBeTruthy();
  });

  it('renders with dark mode when color scheme is dark', () => {
    mockUseAppColorScheme.mockReturnValue('dark');

    const { getByTestId } = render(<SplashScreen onComplete={mockOnComplete} />);

    expect(getByTestId('logo')).toBeTruthy();
    expect(getByTestId('logo-mode')).toHaveTextContent('dark');
  });

  it('renders with light mode when color scheme is light', () => {
    mockUseAppColorScheme.mockReturnValue('light');

    const { getByTestId } = render(<SplashScreen onComplete={mockOnComplete} />);

    expect(getByTestId('logo')).toBeTruthy();
    expect(getByTestId('logo-mode')).toHaveTextContent('light');
  });

  it('dispatches fetchProfile on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchProfile());
  });

  it('dispatches fetchWorkExperience on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchWorkExperience());
  });

  it('dispatches fetchEducation on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchEducation());
  });

  it('dispatches all three fetch actions on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith(fetchProfile());
    expect(mockDispatch).toHaveBeenCalledWith(fetchWorkExperience());
    expect(mockDispatch).toHaveBeenCalledWith(fetchEducation());
  });

  it('calls onComplete after 1.5 seconds', async () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete before 1.5 seconds', async () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns null after loading is complete', async () => {
    const { queryByTestId, rerender } = render(<SplashScreen onComplete={mockOnComplete} />);

    // Initially, should render the splash screen
    expect(queryByTestId('logo')).toBeTruthy();

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
    const { unmount } = render(<SplashScreen onComplete={mockOnComplete} />);

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // onComplete should not be called after unmount
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    it('displays error UI when fetch fails', async () => {
      // Mock dispatch to return rejected thunk result
      mockDispatch.mockResolvedValue({
        type: 'mockAction/rejected',
        error: { message: 'Network error' },
        meta: { requestStatus: 'rejected' },
      });

      const { getByTestId } = render(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(getByTestId('splash-error-screen')).toBeTruthy();
      expect(getByTestId('splash-retry-button')).toBeTruthy();
    });

    it('does not call onComplete when fetch fails', async () => {
      // Mock dispatch to return rejected thunk result
      mockDispatch.mockResolvedValue({
        type: 'mockAction/rejected',
        error: { message: 'Network error' },
        meta: { requestStatus: 'rejected' },
      });

      render(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('retries data fetch when retry button is pressed', async () => {
      // Mock dispatch to return rejected thunk result first
      mockDispatch.mockResolvedValueOnce({
        type: 'mockAction/rejected',
        error: { message: 'Network error' },
        meta: { requestStatus: 'rejected' },
      });

      const { getByTestId } = render(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(getByTestId('splash-error-screen')).toBeTruthy();

      // Reset mock to return success
      mockDispatch.mockResolvedValue({
        type: 'mockAction/fulfilled',
        payload: {},
        meta: { requestStatus: 'fulfilled' },
      });

      // Press retry button
      const retryButton = getByTestId('splash-retry-button');
      await act(async () => {
        fireEvent.press(retryButton);
      });

      await act(async () => {
        jest.runAllTimers();
      });

      // Should dispatch all three fetches again
      expect(mockDispatch).toHaveBeenCalledTimes(6); // 3 initial + 3 retry
    });
  });
});

import React from 'react';
import { act, render } from '@testing-library/react-native';

import { fetchEducation, fetchProfile, fetchWorkXP } from '@app/store';

import { SplashScreen } from '../SplashScreen';

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

// Mock Redux store
const mockDispatch = jest.fn();
jest.mock('@app/store', () => ({
  fetchProfile: jest.fn(),
  fetchWorkXP: jest.fn(),
  fetchEducation: jest.fn(),
  useAppDispatch: () => mockDispatch,
}));

describe('SplashScreen', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
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

  it('dispatches fetchWorkXP on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchWorkXP());
  });

  it('dispatches fetchEducation on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledWith(fetchEducation());
  });

  it('dispatches all three fetch actions on mount', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith(fetchProfile());
    expect(mockDispatch).toHaveBeenCalledWith(fetchWorkXP());
    expect(mockDispatch).toHaveBeenCalledWith(fetchEducation());
  });

  it('calls onComplete after 4.5 seconds', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(4500);
    });

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete before 4.5 seconds', () => {
    render(<SplashScreen onComplete={mockOnComplete} />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns null after loading is complete', () => {
    const { queryByTestId, rerender } = render(<SplashScreen onComplete={mockOnComplete} />);

    // Initially, should render the splash screen
    expect(queryByTestId('logo')).toBeTruthy();

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(4500);
    });

    // Force re-render to check the new state
    rerender(<SplashScreen onComplete={mockOnComplete} />);

    // After loading is complete, component returns null
    expect(queryByTestId('logo')).toBeNull();
  });

  it('clears timeout on unmount', () => {
    const { unmount } = render(<SplashScreen onComplete={mockOnComplete} />);

    unmount();

    act(() => {
      jest.advanceTimersByTime(4500);
    });

    // onComplete should not be called after unmount
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});

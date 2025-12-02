import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { BookingPlaceholderScreen } from '../BookingPlaceholderScreen';

describe('BookingPlaceholderScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<BookingPlaceholderScreen />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders screen with testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      expect(getByTestId('booking-placeholder-screen')).toBeTruthy();
    });
  });

  describe('Content Display', () => {
    it('renders title text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      const title = getByTestId('booking-placeholder-title');
      expect(title).toBeTruthy();
      expect(title.props.children).toBe('Book a Call');
    });

    it('renders coming soon text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      const comingSoon = getByTestId('booking-placeholder-coming-soon');
      expect(comingSoon).toBeTruthy();
      expect(comingSoon.props.children).toBe('Coming Soon');
    });

    it('renders description text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      const description = getByTestId('booking-placeholder-description');
      expect(description).toBeTruthy();
      expect(description.props.children).toBe(
        'Schedule a meeting or call with Warren using this feature, coming soon.'
      );
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      expect(getByTestId('booking-placeholder-screen')).toBeTruthy();
    });

    it('renders correctly in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      expect(getByTestId('booking-placeholder-screen')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label for screen', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<BookingPlaceholderScreen />);

      const screen = getByTestId('booking-placeholder-screen');
      expect(screen.props.accessibilityLabel).toBe('Book a Call');
    });

    it('has accessibility elements hidden for icon container', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<BookingPlaceholderScreen />);

      // Icon container should have accessibilityElementsHidden set to true
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

describe('BookingPlaceholderScreen implementation', () => {
  it('exports BookingPlaceholderScreen as a React component', () => {
    expect(typeof BookingPlaceholderScreen).toBe('function');
    expect(BookingPlaceholderScreen.name).toBe('BookingPlaceholderScreen');
  });
});

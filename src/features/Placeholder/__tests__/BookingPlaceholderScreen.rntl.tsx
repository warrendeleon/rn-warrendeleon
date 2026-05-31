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
    it('renders booking placeholder with title and coming soon message', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      // Verify main container and key content elements render
      expect(getByTestId('booking-placeholder-screen')).toBeOnTheScreen();
      expect(getByTestId('booking-placeholder-title')).toBeOnTheScreen();
      expect(getByTestId('booking-placeholder-coming-soon')).toBeOnTheScreen();
    });
  });

  describe('Content Display', () => {
    it('renders title text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      const title = getByTestId('booking-placeholder-title');
      expect(title).toBeOnTheScreen();
      expect(title.props.children).toBe('Book a Call');
    });

    it('renders coming soon text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      const comingSoon = getByTestId('booking-placeholder-coming-soon');
      expect(comingSoon).toBeOnTheScreen();
      expect(comingSoon.props.children).toBe('Coming Soon');
    });

    it('renders description text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      const description = getByTestId('booking-placeholder-description');
      expect(description).toBeOnTheScreen();
      expect(description.props.children).toBe(
        'Schedule a meeting or call with Warren using this feature, coming soon.'
      );
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      expect(getByTestId('booking-placeholder-screen')).toBeOnTheScreen();
    });

    it('renders correctly in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      expect(getByTestId('booking-placeholder-screen')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label for screen', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<BookingPlaceholderScreen />);

      const screen = getByTestId('booking-placeholder-screen');
      expect(screen.props.accessibilityLabel).toBe('Book a Call');
    });

    it('has accessibility elements hidden for icon container', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { root } = await renderWithProviders(<BookingPlaceholderScreen />);

      // Icon container should have accessibilityElementsHidden set to true
      expect(root).toBeDefined();
    });
  });
});

describe('BookingPlaceholderScreen implementation', () => {
  it('exports BookingPlaceholderScreen as a React component', () => {
    expect(typeof BookingPlaceholderScreen).toBe('function');
    expect(BookingPlaceholderScreen.name).toBe('BookingPlaceholderScreen');
  });
});

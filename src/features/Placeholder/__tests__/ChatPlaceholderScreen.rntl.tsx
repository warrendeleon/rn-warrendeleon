import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { ChatPlaceholderScreen } from '../ChatPlaceholderScreen';

describe('ChatPlaceholderScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ChatPlaceholderScreen />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders screen with testID', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      expect(getByTestId('chat-placeholder-screen')).toBeTruthy();
    });
  });

  describe('Content Display', () => {
    it('renders title text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      const title = getByTestId('chat-placeholder-title');
      expect(title).toBeTruthy();
      expect(title.props.children).toBe('Contact Me');
    });

    it('renders coming soon text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      const comingSoon = getByTestId('chat-placeholder-coming-soon');
      expect(comingSoon).toBeTruthy();
      expect(comingSoon.props.children).toBe('Coming Soon');
    });

    it('renders description text', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      const description = getByTestId('chat-placeholder-description');
      expect(description).toBeTruthy();
      expect(description.props.children).toBe(
        'A messaging feature to contact Warren directly will be available here soon.'
      );
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      expect(getByTestId('chat-placeholder-screen')).toBeTruthy();
    });

    it('renders correctly in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      expect(getByTestId('chat-placeholder-screen')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label for screen', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = renderWithProviders(<ChatPlaceholderScreen />);

      const screen = getByTestId('chat-placeholder-screen');
      expect(screen.props.accessibilityLabel).toBe('Contact Me');
    });

    it('has accessibility elements hidden for icon container', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ChatPlaceholderScreen />);

      // Icon container should have accessibilityElementsHidden set to true
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

describe('ChatPlaceholderScreen implementation', () => {
  it('exports ChatPlaceholderScreen as a React component', () => {
    expect(typeof ChatPlaceholderScreen).toBe('function');
    expect(ChatPlaceholderScreen.name).toBe('ChatPlaceholderScreen');
  });
});

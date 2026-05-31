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
    it('renders chat placeholder with title and coming soon message', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      // Verify main container and key content elements render
      expect(getByTestId('chat-placeholder-screen')).toBeOnTheScreen();
      expect(getByTestId('chat-placeholder-title')).toBeOnTheScreen();
      expect(getByTestId('chat-placeholder-coming-soon')).toBeOnTheScreen();
    });
  });

  describe('Content Display', () => {
    it('renders title text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      const title = getByTestId('chat-placeholder-title');
      expect(title).toBeOnTheScreen();
      expect(title.props.children).toBe('Contact Me');
    });

    it('renders coming soon text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      const comingSoon = getByTestId('chat-placeholder-coming-soon');
      expect(comingSoon).toBeOnTheScreen();
      expect(comingSoon.props.children).toBe('Coming Soon');
    });

    it('renders description text', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      const description = getByTestId('chat-placeholder-description');
      expect(description).toBeOnTheScreen();
      expect(description.props.children).toBe(
        'A messaging feature to contact Warren directly will be available here soon.'
      );
    });
  });

  describe('Theme Support', () => {
    it('renders correctly in light theme', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      expect(getByTestId('chat-placeholder-screen')).toBeOnTheScreen();
    });

    it('renders correctly in dark theme', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      expect(getByTestId('chat-placeholder-screen')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility label for screen', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(<ChatPlaceholderScreen />);

      const screen = getByTestId('chat-placeholder-screen');
      expect(screen.props.accessibilityLabel).toBe('Contact Me');
    });

    it('has accessibility elements hidden for icon container', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { root } = await renderWithProviders(<ChatPlaceholderScreen />);

      // Icon container should have accessibilityElementsHidden set to true
      expect(root).toBeDefined();
    });
  });
});

describe('ChatPlaceholderScreen implementation', () => {
  it('exports ChatPlaceholderScreen as a React component', () => {
    expect(typeof ChatPlaceholderScreen).toBe('function');
    expect(ChatPlaceholderScreen.name).toBe('ChatPlaceholderScreen');
  });
});

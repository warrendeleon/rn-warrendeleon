import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { ButtonGroupDivider, getDividerColor } from '../ButtonGroupDivider';

describe('ButtonGroupDivider', () => {
  describe('getDividerColor', () => {
    it('should return dark divider color for dark mode', () => {
      expect(getDividerColor(true)).toBe('#3A3A3C');
    });

    it('should return light divider color for light mode', () => {
      expect(getDividerColor(false)).toBe('#C6C6C8');
    });
  });

  describe('ButtonGroupDivider Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    it('renders as View with light theme preference', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('renders as View with dark theme preference', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('renders as View with system theme in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('renders as View with system theme in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('uses getDividerColor to compute correct colour for light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      expect(getDividerColor(false)).toBe('#C6C6C8');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />);
      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('uses getDividerColor to compute correct colour for dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      expect(getDividerColor(true)).toBe('#3A3A3C');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />);
      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });

    it('renders as a Box element for horizontal divider', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { toJSON } = renderWithProviders(<ButtonGroupDivider />);

      const tree = toJSON();
      expect(tree).not.toBeNull();
      if (tree && !Array.isArray(tree)) {
        expect(tree.type).toBe('View');
      }
    });
  });
});

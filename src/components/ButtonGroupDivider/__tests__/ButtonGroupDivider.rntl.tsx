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

    it('renders with light theme preference', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'light',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders with dark theme preference', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders with system theme preference in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { UNSAFE_root } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });

    it('renders with system theme preference in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { UNSAFE_root } = renderWithProviders(<ButtonGroupDivider />, {
        preloadedState: {
          settings: {
            theme: 'system',
            language: 'en',
          },
        },
      });

      expect(UNSAFE_root).toBeDefined();
    });
  });
});

import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { ChevronButtonGroup, getChevronButtonGroupVariant } from '../ChevronButtonGroup';

describe('ChevronButtonGroup', () => {
  describe('getChevronButtonGroupVariant', () => {
    it('should return single for a single item', () => {
      expect(getChevronButtonGroupVariant(0, 1)).toBe('single');
    });

    it('should return top for the first item of multiple', () => {
      expect(getChevronButtonGroupVariant(0, 2)).toBe('top');
      expect(getChevronButtonGroupVariant(0, 3)).toBe('top');
      expect(getChevronButtonGroupVariant(0, 10)).toBe('top');
    });

    it('should return bottom for the last item of multiple', () => {
      expect(getChevronButtonGroupVariant(1, 2)).toBe('bottom');
      expect(getChevronButtonGroupVariant(2, 3)).toBe('bottom');
      expect(getChevronButtonGroupVariant(9, 10)).toBe('bottom');
    });

    it('should return middle for middle items', () => {
      expect(getChevronButtonGroupVariant(1, 3)).toBe('middle');
      expect(getChevronButtonGroupVariant(1, 4)).toBe('middle');
      expect(getChevronButtonGroupVariant(2, 4)).toBe('middle');
      expect(getChevronButtonGroupVariant(5, 10)).toBe('middle');
    });
  });

  describe('ChevronButtonGroup Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    it('renders a single item without crashing in light mode', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        {
          label: 'Single Item',
          onPress: jest.fn(),
        },
      ];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders multiple items without crashing in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'First Item', onPress: jest.fn() },
        { label: 'Second Item', onPress: jest.fn() },
        { label: 'Third Item', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders items with all optional props without crashing', () => {
      mockUseColorScheme.mockReturnValue('light');

      const MockIcon = () => null;

      const items = [
        {
          label: 'Complex Item',
          onPress: jest.fn(),
          startIcon: MockIcon,
          startIconBgColor: '$blue500',
          endLabel: 'Detail',
          testID: 'complex-item',
        },
      ];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders with two items (exercises top and bottom variants)', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        { label: 'First', onPress: jest.fn() },
        { label: 'Last', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders with four items (exercises top, middle, middle, bottom)', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'Top Item', onPress: jest.fn() },
        { label: 'Middle 1', onPress: jest.fn() },
        { label: 'Middle 2', onPress: jest.fn() },
        { label: 'Bottom Item', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders in light mode without divider on single item', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [{ label: 'Only One', onPress: jest.fn() }];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });

    it('renders in dark mode without divider on single item', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [{ label: 'Singular', onPress: jest.fn() }];

      expect(() => renderWithProviders(<ChevronButtonGroup items={items} />)).not.toThrow();
    });
  });
});

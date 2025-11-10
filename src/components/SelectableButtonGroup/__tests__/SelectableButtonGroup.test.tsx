import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { getSelectableButtonGroupVariant, SelectableButtonGroup } from '../SelectableButtonGroup';

describe('SelectableButtonGroup', () => {
  describe('getSelectableButtonGroupVariant', () => {
    it('should return single for a single item', () => {
      expect(getSelectableButtonGroupVariant(0, 1)).toBe('single');
    });

    it('should return top for the first item of multiple', () => {
      expect(getSelectableButtonGroupVariant(0, 2)).toBe('top');
      expect(getSelectableButtonGroupVariant(0, 3)).toBe('top');
      expect(getSelectableButtonGroupVariant(0, 10)).toBe('top');
    });

    it('should return bottom for the last item of multiple', () => {
      expect(getSelectableButtonGroupVariant(1, 2)).toBe('bottom');
      expect(getSelectableButtonGroupVariant(2, 3)).toBe('bottom');
      expect(getSelectableButtonGroupVariant(9, 10)).toBe('bottom');
    });

    it('should return middle for middle items', () => {
      expect(getSelectableButtonGroupVariant(1, 3)).toBe('middle');
      expect(getSelectableButtonGroupVariant(1, 4)).toBe('middle');
      expect(getSelectableButtonGroupVariant(2, 4)).toBe('middle');
      expect(getSelectableButtonGroupVariant(5, 10)).toBe('middle');
    });
  });

  describe('SelectableButtonGroup Component', () => {
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

      expect(() => renderWithProviders(<SelectableButtonGroup items={items} />)).not.toThrow();
    });

    it('renders multiple items without crashing in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'First Item', onPress: jest.fn() },
        { label: 'Second Item', onPress: jest.fn() },
        { label: 'Third Item', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<SelectableButtonGroup items={items} />)).not.toThrow();
    });

    it('renders items with selection state', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        {
          label: 'Selected Item',
          onPress: jest.fn(),
          isSelected: true,
          testID: 'selected-item',
        },
        {
          label: 'Unselected Item',
          onPress: jest.fn(),
          isSelected: false,
          testID: 'unselected-item',
        },
      ];

      expect(() => renderWithProviders(<SelectableButtonGroup items={items} />)).not.toThrow();
    });

    it('renders with two items (exercises top and bottom variants)', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items = [
        { label: 'First', onPress: jest.fn() },
        { label: 'Last', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<SelectableButtonGroup items={items} />)).not.toThrow();
    });

    it('renders with four items (exercises top, middle, middle, bottom)', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items = [
        { label: 'Top Item', onPress: jest.fn() },
        { label: 'Middle 1', onPress: jest.fn() },
        { label: 'Middle 2', onPress: jest.fn() },
        { label: 'Bottom Item', onPress: jest.fn() },
      ];

      expect(() => renderWithProviders(<SelectableButtonGroup items={items} />)).not.toThrow();
    });
  });
});

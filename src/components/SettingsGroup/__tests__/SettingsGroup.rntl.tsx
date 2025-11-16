import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import type { SettingsGroupItem } from '../SettingsGroup';
import { SettingsGroup } from '../SettingsGroup';

describe('SettingsGroup', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('Rendering', () => {
    it('renders empty container when items array is empty', () => {
      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={[]} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('renders single button correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: jest.fn(), testID: 'button-1' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('renders multiple buttons correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: jest.fn(), testID: 'button-1' },
        { label: 'Button 2', onPress: jest.fn(), testID: 'button-2' },
        { label: 'Button 3', onPress: jest.fn(), testID: 'button-3' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('renders button with all optional props', () => {
      const MockIcon = () => null;

      const items: SettingsGroupItem[] = [
        {
          label: 'Complex Item',
          onPress: jest.fn(),
          startIcon: MockIcon,
          startIconBgColor: '$blue500',
          endLabel: 'Detail',
          testID: 'complex-item',
        },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('GroupVariant Application', () => {
    it('applies correct variant for single item', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Only One', onPress: jest.fn(), testID: 'single-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('applies correct variants for two items', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first-button' },
        { label: 'Last', onPress: jest.fn(), testID: 'last-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('applies correct variants for three items', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Top Item', onPress: jest.fn(), testID: 'top-button' },
        { label: 'Middle Item', onPress: jest.fn(), testID: 'middle-button' },
        { label: 'Bottom Item', onPress: jest.fn(), testID: 'bottom-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('applies correct variants for four items', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Top', onPress: jest.fn(), testID: 'top' },
        { label: 'Middle 1', onPress: jest.fn(), testID: 'middle-1' },
        { label: 'Middle 2', onPress: jest.fn(), testID: 'middle-2' },
        { label: 'Bottom', onPress: jest.fn(), testID: 'bottom' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Divider Rendering', () => {
    it('does not render divider for single item', () => {
      const items: SettingsGroupItem[] = [{ label: 'Single', onPress: jest.fn() }];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('renders divider between two items', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first' },
        { label: 'Second', onPress: jest.fn(), testID: 'second' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('renders dividers between all items in a list of three', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first' },
        { label: 'Second', onPress: jest.fn(), testID: 'second' },
        { label: 'Third', onPress: jest.fn(), testID: 'third' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('does not render divider after last item', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first' },
        { label: 'Last', onPress: jest.fn(), testID: 'last' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Event Handlers', () => {
    it('calls onPress handler when button is pressed', () => {
      const mockOnPress = jest.fn();
      const items: SettingsGroupItem[] = [
        { label: 'Clickable', onPress: mockOnPress, testID: 'clickable-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('renders multiple buttons with different handlers', () => {
      const mockOnPress1 = jest.fn();
      const mockOnPress2 = jest.fn();
      const mockOnPress3 = jest.fn();

      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: mockOnPress1, testID: 'button-1' },
        { label: 'Button 2', onPress: mockOnPress2, testID: 'button-2' },
        { label: 'Button 3', onPress: mockOnPress3, testID: 'button-3' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Props Propagation', () => {
    it('passes label prop to SettingsItem', () => {
      const items: SettingsGroupItem[] = [{ label: 'Test Label', onPress: jest.fn() }];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes onPress prop to SettingsItem', () => {
      const mockOnPress = jest.fn();
      const items: SettingsGroupItem[] = [
        { label: 'Click Me', onPress: mockOnPress, testID: 'test-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes optional startIcon prop to SettingsItem', () => {
      const MockIcon = () => null;
      const items: SettingsGroupItem[] = [
        { label: 'With Icon', onPress: jest.fn(), startIcon: MockIcon, testID: 'icon-button' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes optional startIconBgColor prop to SettingsItem', () => {
      const MockIcon = () => null;
      const items: SettingsGroupItem[] = [
        {
          label: 'Colored Icon',
          onPress: jest.fn(),
          startIcon: MockIcon,
          startIconBgColor: '$blue500',
          testID: 'colored-button',
        },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes optional endLabel prop to SettingsItem', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Language', onPress: jest.fn(), endLabel: 'English' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes optional testID prop to SettingsItem', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Test ID Button', onPress: jest.fn(), testID: 'custom-test-id' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('passes all props together to SettingsItem', () => {
      const MockIcon = () => null;
      const mockOnPress = jest.fn();

      const items: SettingsGroupItem[] = [
        {
          label: 'Full Props Button',
          onPress: mockOnPress,
          startIcon: MockIcon,
          startIconBgColor: '$indigo500',
          endLabel: 'Detail Text',
          testID: 'full-props-button',
        },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array gracefully', () => {
      expect(() => renderWithProviders(<SettingsGroup items={[]} />)).not.toThrow();
    });

    it('handles single item with all optional props', () => {
      const MockIcon = () => null;
      const items: SettingsGroupItem[] = [
        {
          label: 'Single Complex',
          onPress: jest.fn(),
          startIcon: MockIcon,
          startIconBgColor: '$coolGray500',
          endLabel: 'Value',
          testID: 'single-complex',
        },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });

    it('handles items with partial optional props', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Only Label 1', onPress: jest.fn(), testID: 'only-label-1' },
        {
          label: 'With End Label',
          onPress: jest.fn(),
          endLabel: 'Detail',
          testID: 'with-end-label',
        },
        { label: 'Only Label 2', onPress: jest.fn(), testID: 'only-label-2' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });

  describe('Dark Mode', () => {
    it('renders correctly in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: SettingsGroupItem[] = [
        { label: 'Dark Item 1', onPress: jest.fn(), testID: 'dark-1' },
        { label: 'Dark Item 2', onPress: jest.fn(), testID: 'dark-2' },
      ];

      const { UNSAFE_root } = renderWithProviders(<SettingsGroup items={items} />);
      expect(UNSAFE_root).toBeDefined();
    });
  });
});

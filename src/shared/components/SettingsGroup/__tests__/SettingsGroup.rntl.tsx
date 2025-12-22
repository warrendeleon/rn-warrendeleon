import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

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
      const { queryByText } = renderWithProviders(<SettingsGroup items={[]} />);

      expect(queryByText('Button')).not.toBeOnTheScreen();
    });

    it('renders single button with label', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: jest.fn(), testID: 'button-1' },
      ];

      const { getByText, getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Button 1')).toBeOnTheScreen();
      expect(getByTestId('button-1')).toBeOnTheScreen();
    });

    it('renders multiple buttons with labels', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: jest.fn(), testID: 'button-1' },
        { label: 'Button 2', onPress: jest.fn(), testID: 'button-2' },
        { label: 'Button 3', onPress: jest.fn(), testID: 'button-3' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Button 1')).toBeOnTheScreen();
      expect(getByText('Button 2')).toBeOnTheScreen();
      expect(getByText('Button 3')).toBeOnTheScreen();
    });

    it('renders button with endLabel', () => {
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

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Complex Item')).toBeOnTheScreen();
      expect(getByText('Detail')).toBeOnTheScreen();
    });
  });

  describe('GroupVariant Application', () => {
    it('renders single item correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Only One', onPress: jest.fn(), testID: 'single-button' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Only One')).toBeOnTheScreen();
    });

    it('renders two items correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first-button' },
        { label: 'Last', onPress: jest.fn(), testID: 'last-button' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Last')).toBeOnTheScreen();
    });

    it('renders three items correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Top Item', onPress: jest.fn(), testID: 'top-button' },
        { label: 'Middle Item', onPress: jest.fn(), testID: 'middle-button' },
        { label: 'Bottom Item', onPress: jest.fn(), testID: 'bottom-button' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Top Item')).toBeOnTheScreen();
      expect(getByText('Middle Item')).toBeOnTheScreen();
      expect(getByText('Bottom Item')).toBeOnTheScreen();
    });

    it('renders four items correctly', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Top', onPress: jest.fn(), testID: 'top' },
        { label: 'Middle 1', onPress: jest.fn(), testID: 'middle-1' },
        { label: 'Middle 2', onPress: jest.fn(), testID: 'middle-2' },
        { label: 'Bottom', onPress: jest.fn(), testID: 'bottom' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Top')).toBeOnTheScreen();
      expect(getByText('Middle 1')).toBeOnTheScreen();
      expect(getByText('Middle 2')).toBeOnTheScreen();
      expect(getByText('Bottom')).toBeOnTheScreen();
    });
  });

  describe('Divider Rendering', () => {
    it('renders single item correctly', () => {
      const items: SettingsGroupItem[] = [{ label: 'Single', onPress: jest.fn() }];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Single')).toBeOnTheScreen();
    });

    it('renders two items with labels', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first' },
        { label: 'Second', onPress: jest.fn(), testID: 'second' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
    });

    it('renders three items with labels', () => {
      const items: SettingsGroupItem[] = [
        { label: 'First', onPress: jest.fn(), testID: 'first' },
        { label: 'Second', onPress: jest.fn(), testID: 'second' },
        { label: 'Third', onPress: jest.fn(), testID: 'third' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('First')).toBeOnTheScreen();
      expect(getByText('Second')).toBeOnTheScreen();
      expect(getByText('Third')).toBeOnTheScreen();
    });
  });

  describe('Event Handlers', () => {
    it('calls onPress handler when button is pressed', () => {
      const mockOnPress = jest.fn();
      const items: SettingsGroupItem[] = [
        { label: 'Clickable', onPress: mockOnPress, testID: 'clickable-button' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      fireEvent.press(getByTestId('clickable-button'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('calls correct handler for each button', () => {
      const mockOnPress1 = jest.fn();
      const mockOnPress2 = jest.fn();
      const mockOnPress3 = jest.fn();

      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: mockOnPress1, testID: 'button-1' },
        { label: 'Button 2', onPress: mockOnPress2, testID: 'button-2' },
        { label: 'Button 3', onPress: mockOnPress3, testID: 'button-3' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      fireEvent.press(getByTestId('button-2'));

      expect(mockOnPress1).not.toHaveBeenCalled();
      expect(mockOnPress2).toHaveBeenCalledTimes(1);
      expect(mockOnPress3).not.toHaveBeenCalled();
    });
  });

  describe('Props Propagation', () => {
    it('renders label text', () => {
      const items: SettingsGroupItem[] = [{ label: 'Test Label', onPress: jest.fn() }];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Test Label')).toBeOnTheScreen();
    });

    it('renders endLabel text', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Language', onPress: jest.fn(), endLabel: 'English' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Language')).toBeOnTheScreen();
      expect(getByText('English')).toBeOnTheScreen();
    });

    it('renders with testID', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Test ID Button', onPress: jest.fn(), testID: 'custom-test-id' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByTestId('custom-test-id')).toBeOnTheScreen();
    });

    it('renders with all props', () => {
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

      const { getByText, getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Full Props Button')).toBeOnTheScreen();
      expect(getByText('Detail Text')).toBeOnTheScreen();
      expect(getByTestId('full-props-button')).toBeOnTheScreen();
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

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Single Complex')).toBeOnTheScreen();
      expect(getByText('Value')).toBeOnTheScreen();
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

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Only Label 1')).toBeOnTheScreen();
      expect(getByText('With End Label')).toBeOnTheScreen();
      expect(getByText('Detail')).toBeOnTheScreen();
      expect(getByText('Only Label 2')).toBeOnTheScreen();
    });
  });

  describe('Dark Mode', () => {
    it('renders correctly in dark mode', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: SettingsGroupItem[] = [
        { label: 'Dark Item 1', onPress: jest.fn(), testID: 'dark-1' },
        { label: 'Dark Item 2', onPress: jest.fn(), testID: 'dark-2' },
      ];

      const { getByText } = renderWithProviders(<SettingsGroup items={items} />);

      expect(getByText('Dark Item 1')).toBeOnTheScreen();
      expect(getByText('Dark Item 2')).toBeOnTheScreen();
    });
  });

  describe('Accessibility', () => {
    it('items are accessible via label text', () => {
      const items: SettingsGroupItem[] = [
        { label: 'Settings Item', onPress: jest.fn(), endLabel: 'English' },
      ];

      const { getByLabelText } = renderWithProviders(<SettingsGroup items={items} />);

      // SettingsItem uses accessibilityLabel with combined label and endLabel
      expect(getByLabelText('Settings Item, English')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    it('all items have accessible touch targets', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: SettingsGroupItem[] = [
        { label: 'Button 1', onPress: jest.fn(), testID: 'button-1' },
        { label: 'Button 2', onPress: jest.fn(), testID: 'button-2' },
        { label: 'Button 3', onPress: jest.fn(), testID: 'button-3' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expectMinTouchTarget(getByTestId('button-1'));
      expectMinTouchTarget(getByTestId('button-2'));
      expectMinTouchTarget(getByTestId('button-3'));
    });

    it('single item has accessible touch target', () => {
      mockUseColorScheme.mockReturnValue('light');

      const items: SettingsGroupItem[] = [
        { label: 'Single Item', onPress: jest.fn(), testID: 'single-item' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expectMinTouchTarget(getByTestId('single-item'));
    });

    it('items with icons have accessible touch targets', () => {
      mockUseColorScheme.mockReturnValue('light');
      const MockIcon = () => null;

      const items: SettingsGroupItem[] = [
        {
          label: 'Icon Item',
          onPress: jest.fn(),
          startIcon: MockIcon,
          startIconBgColor: '$blue500',
          testID: 'icon-item',
        },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expectMinTouchTarget(getByTestId('icon-item'));
    });

    it('items in dark mode have accessible touch targets', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const items: SettingsGroupItem[] = [
        { label: 'Dark Mode Item', onPress: jest.fn(), testID: 'dark-item' },
      ];

      const { getByTestId } = renderWithProviders(<SettingsGroup items={items} />);

      expectMinTouchTarget(getByTestId('dark-item'));
    });
  });
});

import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { expectMinTouchTarget, renderWithProviders } from '@app/test-utils';

import { getPickerItemStyles, PickerItem } from '../PickerItem';

describe('PickerItem', () => {
  describe('getPickerItemStyles', () => {
    it.each([
      ['light', 'single', '#FFFFFF', '#000000', 16, 16],
      ['light', 'top', '#FFFFFF', '#000000', 16, 0],
      ['light', 'middle', '#FFFFFF', '#000000', 0, 0],
      ['light', 'bottom', '#FFFFFF', '#000000', 0, 16],
      ['dark', 'single', '#262626', '#FFFFFF', 16, 16],
      ['dark', 'top', '#262626', '#FFFFFF', 16, 0],
      ['dark', 'middle', '#262626', '#FFFFFF', 0, 0],
      ['dark', 'bottom', '#262626', '#FFFFFF', 0, 16],
    ] as const)(
      'returns correct styles for %s theme with %s variant (bg=%s, label=%s, top=%s, bottom=%s)',
      (theme, variant, expectedBg, expectedLabel, expectedTop, expectedBottom) => {
        const styles = getPickerItemStyles(theme, variant);

        expect(styles.bg).toBe(expectedBg);
        expect(styles.labelColor).toBe(expectedLabel);
        expect(styles.top).toBe(expectedTop);
        expect(styles.bottom).toBe(expectedBottom);
      }
    );
  });

  describe('PickerItem Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    it('renders label text in light mode', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = await renderWithProviders(
        <PickerItem label="Test Button" testID="test-button" />
      );

      expect(getByText('Test Button')).toBeOnTheScreen();
    });

    it('renders label text in dark mode', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByText } = await renderWithProviders(
        <PickerItem label="Dark Mode Item" testID="dark-button" />
      );

      expect(getByText('Dark Mode Item')).toBeOnTheScreen();
    });

    it('shows check mark when selected', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = await renderWithProviders(
        <PickerItem label="Selected" isSelected={true} testID="selected-button" />
      );

      expect(getByText('Selected')).toBeOnTheScreen();
      expect(getByText('✓')).toBeOnTheScreen();
    });

    it('does not show check mark when not selected', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText, queryByText } = await renderWithProviders(
        <PickerItem label="Unselected" isSelected={false} testID="unselected-button" />
      );

      expect(getByText('Unselected')).toBeOnTheScreen();
      expect(queryByText('✓')).not.toBeOnTheScreen();
    });

    it('supports all groupVariant values', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByText } = await renderWithProviders(
        <>
          <PickerItem label="single" groupVariant="single" />
          <PickerItem label="top" groupVariant="top" />
          <PickerItem label="middle" groupVariant="middle" />
          <PickerItem label="bottom" groupVariant="bottom" />
        </>
      );

      expect(getByText('single')).toBeOnTheScreen();
      expect(getByText('top')).toBeOnTheScreen();
      expect(getByText('middle')).toBeOnTheScreen();
      expect(getByText('bottom')).toBeOnTheScreen();
    });

    it('calls onPress when pressed', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockOnPress = jest.fn();
      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Clickable" onPress={mockOnPress} testID="clickable-button" />
      );

      await fireEvent.press(getByTestId('clickable-button'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when pressed without onPress handler', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const { getByTestId } = await renderWithProviders(
        <PickerItem label="No Handler" testID="no-handler-button" />
      );

      // Should not throw
      await fireEvent.press(getByTestId('no-handler-button'));
    });
  });

  describe('Accessibility Props', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    // NOTE: GlueStack UI Pressable doesn't expose accessibilityRole/accessibilityState
    // in the test renderer tree. However, accessibilityLabel IS accessible via getByLabelText.
    // The props ARE correctly passed and WILL work at runtime with VoiceOver/TalkBack.

    it('has accessible label for unselected item', async () => {
      const { getByLabelText } = await renderWithProviders(
        <PickerItem label="English" isSelected={false} testID="english-button" />
      );

      // accessibilityLabel is set to "English" when not selected
      expect(getByLabelText('English')).toBeOnTheScreen();
    });

    it('has accessible label with selected suffix when selected', async () => {
      const { getByLabelText } = await renderWithProviders(
        <PickerItem label="English" isSelected={true} testID="english-selected" />
      );

      // accessibilityLabel is set to "English, selected" when selected
      expect(getByLabelText('English, selected')).toBeOnTheScreen();
    });

    it('renders multiple items with correct accessible labels', async () => {
      const { getByLabelText } = await renderWithProviders(
        <>
          <PickerItem label="Option 1" isSelected={false} />
          <PickerItem label="Option 2" isSelected={true} />
          <PickerItem label="Option 3" isSelected={false} />
        </>
      );

      expect(getByLabelText('Option 1')).toBeOnTheScreen();
      expect(getByLabelText('Option 2, selected')).toBeOnTheScreen();
      expect(getByLabelText('Option 3')).toBeOnTheScreen();
    });

    it('is accessible by testID', async () => {
      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Test Item" testID="test-item" />
      );

      expect(getByTestId('test-item')).toBeOnTheScreen();
    });
  });

  describe('EAA Accessibility Compliance', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('item has accessible touch target (44×44 minimum)', async () => {
      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Test Item" testID="picker-item" />
      );

      expectMinTouchTarget(getByTestId('picker-item'));
    });

    it('selected item has accessible touch target', async () => {
      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Selected Item" isSelected={true} testID="selected-item" />
      );

      expectMinTouchTarget(getByTestId('selected-item'));
    });

    it('item with onPress has accessible touch target', async () => {
      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Pressable Item" onPress={jest.fn()} testID="pressable-item" />
      );

      expectMinTouchTarget(getByTestId('pressable-item'));
    });

    it('item in dark mode has accessible touch target', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { getByTestId } = await renderWithProviders(
        <PickerItem label="Dark Item" testID="dark-item" />
      );

      expectMinTouchTarget(getByTestId('dark-item'));
    });
  });
});

import React from 'react';
import * as ReactNative from 'react-native';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '@app/test-utils';

import { getSelectableListButtonStyles, SelectableListButton } from '../SelectableListButton';

describe('SelectableListButton', () => {
  describe('getSelectableListButtonStyles', () => {
    it('returns light mode styles for single variant', () => {
      const styles = getSelectableListButtonStyles('light', 'single');

      expect(styles.bg).toBe('$white');
      expect(styles.labelColor).toBe('$black');
      expect(styles.top).toBe('$2xl');
      expect(styles.bottom).toBe('$2xl');
    });

    it('returns dark mode styles for bottom variant', () => {
      const styles = getSelectableListButtonStyles('dark', 'bottom');

      expect(styles.bg).toBe('$backgroundDark900');
      expect(styles.labelColor).toBe('$white');
      expect(styles.top).toBe('$none');
      expect(styles.bottom).toBe('$2xl');
    });

    it('returns correct radii for middle variant', () => {
      const styles = getSelectableListButtonStyles('light', 'middle');

      expect(styles.top).toBe('$none');
      expect(styles.bottom).toBe('$none');
    });

    it('returns correct radii for top variant', () => {
      const styles = getSelectableListButtonStyles('light', 'top');

      expect(styles.top).toBe('$2xl');
      expect(styles.bottom).toBe('$none');
    });
  });

  describe('SelectableListButton Component', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReset();
    });

    it('renders in light mode without selection', () => {
      mockUseColorScheme.mockReturnValue('light');

      expect(() =>
        renderWithProviders(<SelectableListButton label="Test Button" testID="test-button" />)
      ).not.toThrow();
    });

    it('renders in dark mode with selection', () => {
      mockUseColorScheme.mockReturnValue('dark');

      expect(() =>
        renderWithProviders(
          <SelectableListButton label="Selected" isSelected={true} testID="selected-button" />
        )
      ).not.toThrow();
    });

    it('supports all groupVariant values without crashing', () => {
      mockUseColorScheme.mockReturnValue('light');

      expect(() =>
        renderWithProviders(
          <>
            <SelectableListButton label="single" groupVariant="single" />
            <SelectableListButton label="top" groupVariant="top" />
            <SelectableListButton label="middle" groupVariant="middle" />
            <SelectableListButton label="bottom" groupVariant="bottom" />
          </>
        )
      ).not.toThrow();
    });

    it('renders with onPress handler', () => {
      mockUseColorScheme.mockReturnValue('light');

      const mockOnPress = jest.fn();

      expect(() =>
        renderWithProviders(
          <SelectableListButton label="Clickable" onPress={mockOnPress} testID="clickable-button" />
        )
      ).not.toThrow();
    });
  });

  describe('Accessibility Props', () => {
    const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('light');
    });

    it('has accessibilityRole set to "button"', () => {
      renderWithProviders(<SelectableListButton label="Test Button" testID="test-button" />);

      const button = screen.getByTestId('test-button');
      expect(button).toHaveProp('accessibilityRole', 'button');
    });

    it('has accessibilityLabel without selection state when not selected', () => {
      renderWithProviders(
        <SelectableListButton label="English" isSelected={false} testID="english-button" />
      );

      const button = screen.getByTestId('english-button');
      expect(button).toHaveProp('accessibilityLabel', 'English');
    });

    it('has accessibilityLabel with selection state when selected', () => {
      renderWithProviders(
        <SelectableListButton label="English" isSelected={true} testID="english-button" />
      );

      const button = screen.getByTestId('english-button');
      expect(button).toHaveProp('accessibilityLabel', 'English, selected');
    });

    it('has accessibilityState with selected: false when not selected', () => {
      renderWithProviders(
        <SelectableListButton label="Spanish" isSelected={false} testID="spanish-button" />
      );

      const button = screen.getByTestId('spanish-button');
      expect(button).toHaveProp('accessibilityState', { selected: false });
    });

    it('has accessibilityState with selected: true when selected', () => {
      renderWithProviders(
        <SelectableListButton label="Spanish" isSelected={true} testID="spanish-button" />
      );

      const button = screen.getByTestId('spanish-button');
      expect(button).toHaveProp('accessibilityState', { selected: true });
    });
  });
});

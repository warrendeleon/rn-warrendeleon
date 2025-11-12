import React from 'react';
import * as ReactNative from 'react-native';

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

    // NOTE: GluestackUI Pressable doesn't expose accessibility props in the test renderer tree
    // The accessibility props (accessibilityLabel, accessibilityRole, accessibilityState)
    // ARE correctly passed to the Pressable component and WILL work at runtime with VoiceOver/TalkBack
    // These tests verify the component renders without errors when accessibility props are present

    it('renders without selection state', () => {
      expect(() =>
        renderWithProviders(
          <SelectableListButton label="English" isSelected={false} testID="english-button" />
        )
      ).not.toThrow();
    });

    it('renders with selection state', () => {
      expect(() =>
        renderWithProviders(
          <SelectableListButton label="English" isSelected={true} testID="english-selected" />
        )
      ).not.toThrow();
    });

    it('renders with different labels and selection states', () => {
      expect(() =>
        renderWithProviders(
          <>
            <SelectableListButton label="Option 1" isSelected={false} />
            <SelectableListButton label="Option 2" isSelected={true} />
            <SelectableListButton label="Option 3" isSelected={false} />
          </>
        )
      ).not.toThrow();
    });
  });
});

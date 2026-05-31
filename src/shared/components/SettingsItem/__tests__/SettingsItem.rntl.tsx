import React from 'react';
import * as ReactNative from 'react-native';
import { userEvent } from '@testing-library/react-native';

import {
  expectAccessibilityComplete,
  expectMinTouchTarget,
  renderWithProviders,
} from '@app/test-utils';

import { getSettingsItemStyles, SettingsItem } from '../SettingsItem';

describe('SettingsItem', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('displays the label text', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { getByText } = await renderWithProviders(
      <SettingsItem label="Profile" testID="settings-item" />
    );

    expect(getByText('Profile')).toBeOnTheScreen();
  });

  it('does not render icon container when no startIcon provided', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { queryByTestId } = await renderWithProviders(
      <SettingsItem label="Profile" testID="settings-item" />
    );

    expect(queryByTestId('settings-item-icon')).toBeNull();
  });

  it('renders icon container when startIcon is provided', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const DummyIcon = () => null;

    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Settings" startIcon={DummyIcon} testID="settings-item" />
    );

    expect(getByTestId('settings-item-icon')).toBeOnTheScreen();
  });

  it('displays endLabel text when provided', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByText } = await renderWithProviders(
      <SettingsItem label="Language" endLabel="English" testID="settings-item" />
    );

    expect(getByText('Language')).toBeOnTheScreen();
    expect(getByText('English')).toBeOnTheScreen();
  });

  it('displays all group variant items with correct labels', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { getByText } = await renderWithProviders(
      <>
        <SettingsItem label="Single Item" groupVariant="single" />
        <SettingsItem label="Top Item" groupVariant="top" />
        <SettingsItem label="Middle Item" groupVariant="middle" />
        <SettingsItem label="Bottom Item" groupVariant="bottom" />
      </>
    );

    expect(getByText('Single Item')).toBeOnTheScreen();
    expect(getByText('Top Item')).toBeOnTheScreen();
    expect(getByText('Middle Item')).toBeOnTheScreen();
    expect(getByText('Bottom Item')).toBeOnTheScreen();
  });

  it('renders as pressable even without onPress handler', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { getByRole, getByText } = await renderWithProviders(<SettingsItem label="No Handler" />);

    expect(getByRole('button')).toBeOnTheScreen();
    expect(getByText('No Handler')).toBeOnTheScreen();
  });

  it('calls onPress when pressed', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const onPress = jest.fn();
    const user = userEvent.setup();

    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Pressable Item" onPress={onPress} testID="settings-item" />
    );

    await user.press(getByTestId('settings-item'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders icon container with custom background colour', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const DummyIcon = () => null;

    const { getByTestId, getByText } = await renderWithProviders(
      <SettingsItem
        label="Custom Icon"
        startIcon={DummyIcon}
        startIconBgColor="$blue500"
        testID="settings-item"
      />
    );

    expect(getByText('Custom Icon')).toBeOnTheScreen();
    expect(getByTestId('settings-item-icon')).toBeOnTheScreen();
  });

  it('displays label without endLabel when endLabel not provided', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByText, queryByText } = await renderWithProviders(<SettingsItem label="Settings" />);

    expect(getByText('Settings')).toBeOnTheScreen();
    // No secondary text should appear
    expect(queryByText('English')).toBeNull();
  });
});

describe('SettingsItem groupVariant styling', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders single variant in light mode', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { getByText, getByRole } = await renderWithProviders(
      <SettingsItem label="Direct light" groupVariant="single" />
    );

    expect(getByText('Direct light')).toBeOnTheScreen();
    expect(getByRole('button')).toBeOnTheScreen();
  });

  it('renders with icon and custom colour in dark mode', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const DummyIcon = () => null;

    const { getByText, getByTestId } = await renderWithProviders(
      <SettingsItem
        label="Default groupVariant"
        startIcon={DummyIcon}
        startIconBgColor="$secondary500"
        testID="settings-item"
      />
    );

    expect(getByText('Default groupVariant')).toBeOnTheScreen();
    expect(getByTestId('settings-item-icon')).toBeOnTheScreen();
  });
});

describe('getSettingsItemStyles', () => {
  describe('theme and variant combinations', () => {
    it.each([
      ['light', 'single', '#FFFFFF', '#000000', '#6B6B6B', 16, 16],
      ['light', 'top', '#FFFFFF', '#000000', '#6B6B6B', 16, 0],
      ['light', 'middle', '#FFFFFF', '#000000', '#6B6B6B', 0, 0],
      ['light', 'bottom', '#FFFFFF', '#000000', '#6B6B6B', 0, 16],
      ['dark', 'single', '#262626', '#FFFFFF', '#A3A3A3', 16, 16],
      ['dark', 'top', '#262626', '#FFFFFF', '#A3A3A3', 16, 0],
      ['dark', 'middle', '#262626', '#FFFFFF', '#A3A3A3', 0, 0],
      ['dark', 'bottom', '#262626', '#FFFFFF', '#A3A3A3', 0, 16],
    ] as const)(
      'returns correct styles for %s theme with %s variant (bg=%s, top=%s, bottom=%s)',
      (theme, variant, expectedBg, expectedLabel, expectedChevron, expectedTop, expectedBottom) => {
        const styles = getSettingsItemStyles(theme, variant);

        expect(styles.bg).toBe(expectedBg);
        expect(styles.labelColor).toBe(expectedLabel);
        expect(styles.chevronColor).toBe(expectedChevron);
        expect(styles.top).toBe(expectedTop);
        expect(styles.bottom).toBe(expectedBottom);
      }
    );
  });

  describe('variant border radius consistency', () => {
    it.each(['light', 'dark'] as const)(
      'applies consistent theme colours across all variants in %s mode',
      theme => {
        const variants = ['single', 'top', 'middle', 'bottom'] as const;
        const expectedBg = theme === 'light' ? '#FFFFFF' : '#262626';
        const expectedLabel = theme === 'light' ? '#000000' : '#FFFFFF';
        const expectedChevron = theme === 'light' ? '#6B6B6B' : '#A3A3A3';

        variants.forEach(variant => {
          const styles = getSettingsItemStyles(theme, variant);
          expect(styles.bg).toBe(expectedBg);
          expect(styles.labelColor).toBe(expectedLabel);
          expect(styles.chevronColor).toBe(expectedChevron);
        });
      }
    );
  });
});

describe('SettingsItem accessibility', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('has accessibilityRole of button', async () => {
    const { getByRole } = await renderWithProviders(
      <SettingsItem label="Settings" testID="settings-item" />
    );

    expect(getByRole('button')).toBeOnTheScreen();
  });

  it('combines label and endLabel in accessibilityLabel', async () => {
    const { getByLabelText } = await renderWithProviders(
      <SettingsItem label="Language" endLabel="English" testID="language-item" />
    );

    // Should find by combined label: "Language, English"
    expect(getByLabelText('Language, English')).toBeOnTheScreen();
  });

  it('uses only label as accessibilityLabel when endLabel is not provided', async () => {
    const { getByLabelText } = await renderWithProviders(
      <SettingsItem label="Settings" testID="settings-item" />
    );

    expect(getByLabelText('Settings')).toBeOnTheScreen();
  });

  it('applies accessibilityHint when provided', async () => {
    const hint = 'Double tap to change appearance settings';
    const { getByA11yHint } = await renderWithProviders(
      <SettingsItem label="Appearance" accessibilityHint={hint} testID="appearance-item" />
    );

    expect(getByA11yHint(hint)).toBeOnTheScreen();
  });

  it('applies all accessibility props correctly', async () => {
    const { getByRole, getByLabelText, getByA11yHint } = await renderWithProviders(
      <SettingsItem
        label="Appearance"
        endLabel="Automatic"
        accessibilityHint="Double tap to change theme"
        testID="appearance-item"
      />
    );

    expect(getByRole('button')).toBeOnTheScreen();
    expect(getByLabelText('Appearance, Automatic')).toBeOnTheScreen();
    expect(getByA11yHint('Double tap to change theme')).toBeOnTheScreen();
  });
});

describe('SettingsItem EAA touch targets', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('verifies touch target sizing with expectMinTouchTarget utility', async () => {
    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Settings" testID="settings-item" />
    );

    const item = getByTestId('settings-item');
    // SettingsItem uses py="$3" (12px padding) which contributes to touch target
    // The utility will warn if no explicit sizing is found
    expectMinTouchTarget(item);
  });

  it('should render all interactive content within the pressable area', async () => {
    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Language" endLabel="English" testID="language-item" />
    );

    const item = getByTestId('language-item');
    expect(item).toBeOnTheScreen();
    expectMinTouchTarget(item);
  });

  it('should maintain touch target size with icon', async () => {
    const DummyIcon = () => null;

    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Profile" startIcon={DummyIcon} testID="profile-item" />
    );

    const item = getByTestId('profile-item');
    expect(item).toBeOnTheScreen();
    expectMinTouchTarget(item);
  });

  it('should support pressed state feedback for accessibility', async () => {
    const onPress = jest.fn();

    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Settings" onPress={onPress} testID="settings-item" />
    );

    const item = getByTestId('settings-item');
    expect(item).toBeOnTheScreen();
    // Pressed state styling is verified in visual/E2E tests
  });
});

describe('SettingsItem complete accessibility verification', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('has complete accessibility properties with label only', async () => {
    const { getByTestId } = await renderWithProviders(
      <SettingsItem label="Settings" testID="settings-item" />
    );

    expectAccessibilityComplete(getByTestId('settings-item'), {
      role: 'button',
      label: 'Settings',
      touchTarget: true,
    });
  });

  it('has complete accessibility properties with combined label', async () => {
    const { getByTestId } = await renderWithProviders(
      <SettingsItem
        label="Language"
        endLabel="English"
        accessibilityHint="Double tap to change language"
        testID="language-item"
      />
    );

    expectAccessibilityComplete(getByTestId('language-item'), {
      role: 'button',
      label: 'Language, English',
      hint: 'Double tap to change language',
      touchTarget: true,
    });
  });
});

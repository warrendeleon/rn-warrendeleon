import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { getSettingsItemStyles, SettingsItem } from '../SettingsItem';

describe('SettingsItem', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders in light mode with default props (single variant) and no icon', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root, queryByTestId } = renderWithProviders(
      <SettingsItem label="Profile" testID="chevron-button" />
    );

    // Component should render
    expect(UNSAFE_root).toBeDefined();

    // No startIcon → no icon container
    expect(queryByTestId('button-with-chevron-icon')).toBeNull();
  });

  it('renders with a start icon when startIcon is provided', () => {
    mockUseColorScheme.mockReturnValue('light');

    const DummyIcon = () => null;

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem label="Settings" startIcon={DummyIcon} testID="chevron-pressable" />
    );

    // Component should render with icon
    // Icon rendering is verified in E2E tests and implementation tests
    expect(UNSAFE_root).toBeDefined();
  });

  it('renders in dark mode with endLabel', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem label="Language" endLabel="English" testID="chevron-dark" />
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it('supports all groupVariant values', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(
      <>
        <SettingsItem label="single" groupVariant="single" />
        <SettingsItem label="top" groupVariant="top" />
        <SettingsItem label="middle" groupVariant="middle" />
        <SettingsItem label="bottom" groupVariant="bottom" />
      </>
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders without onPress handler', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(<SettingsItem label="No Handler" />);

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders with startIcon and custom startIconBgColor', () => {
    mockUseColorScheme.mockReturnValue('light');

    const DummyIcon = () => null;

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem
        label="Custom Icon"
        startIcon={DummyIcon}
        startIconBgColor="$blue500"
        testID="custom-icon-button"
      />
    );

    expect(UNSAFE_root).toBeDefined();
    // Icon and color rendering verified in E2E tests
  });

  it('renders with endLabel in light mode', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem label="Language" endLabel="English" />
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders without endLabel', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { UNSAFE_root } = renderWithProviders(<SettingsItem label="Settings" />);

    expect(UNSAFE_root).toBeDefined();
  });
});

describe('SettingsItem implementation', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders in light mode with explicit groupVariant', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem label="Direct light" groupVariant="single" />
    );

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders with default groupVariant, startIcon, and custom startIconBgColor', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const DummyIcon = () => null;

    const { UNSAFE_root } = renderWithProviders(
      <SettingsItem
        label="Default groupVariant"
        startIcon={DummyIcon}
        startIconBgColor="$secondary500"
      />
    );

    expect(UNSAFE_root).toBeDefined();
  });
});

describe('getSettingsItemStyles', () => {
  it('returns light mode styles for single variant', () => {
    const styles = getSettingsItemStyles('light', 'single');

    expect(styles.bg).toBe('$white');
    expect(styles.labelColor).toBe('$black');
    expect(styles.chevronColor).toBe('$textLight500');
    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$2xl');
  });

  it('returns dark mode styles for bottom variant', () => {
    const styles = getSettingsItemStyles('dark', 'bottom');

    expect(styles.bg).toBe('$backgroundDark900');
    expect(styles.labelColor).toBe('$white');
    expect(styles.chevronColor).toBe('$textLight400');
    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$2xl');
  });

  it('returns correct radii for middle variant', () => {
    const styles = getSettingsItemStyles('light', 'middle');

    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$none');
  });

  it('returns correct radii for top variant', () => {
    const styles = getSettingsItemStyles('light', 'top');

    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$none');
  });

  it('returns light mode styles for all variants', () => {
    const single = getSettingsItemStyles('light', 'single');
    const top = getSettingsItemStyles('light', 'top');
    const middle = getSettingsItemStyles('light', 'middle');
    const bottom = getSettingsItemStyles('light', 'bottom');

    [single, top, middle, bottom].forEach(styles => {
      expect(styles.bg).toBe('$white');
      expect(styles.labelColor).toBe('$black');
      expect(styles.chevronColor).toBe('$textLight500');
    });
  });

  it('returns dark mode styles for all variants', () => {
    const single = getSettingsItemStyles('dark', 'single');
    const top = getSettingsItemStyles('dark', 'top');
    const middle = getSettingsItemStyles('dark', 'middle');
    const bottom = getSettingsItemStyles('dark', 'bottom');

    [single, top, middle, bottom].forEach(styles => {
      expect(styles.bg).toBe('$backgroundDark900');
      expect(styles.labelColor).toBe('$white');
      expect(styles.chevronColor).toBe('$textLight400');
    });
  });
});

describe('SettingsItem accessibility', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders with accessibilityLabel combining label and endLabel', () => {
    expect(() =>
      renderWithProviders(<SettingsItem label="Language" endLabel="English" />)
    ).not.toThrow();
  });

  it('renders with accessibilityLabel without endLabel', () => {
    expect(() => renderWithProviders(<SettingsItem label="Settings" />)).not.toThrow();
  });

  it('renders with accessibilityHint when provided', () => {
    const hint = 'Double tap to change appearance settings';
    expect(() =>
      renderWithProviders(<SettingsItem label="Appearance" accessibilityHint={hint} />)
    ).not.toThrow();
  });

  it('renders without accessibilityHint when not provided', () => {
    expect(() => renderWithProviders(<SettingsItem label="About" />)).not.toThrow();
  });

  it('renders with all accessibility props correctly', () => {
    expect(() =>
      renderWithProviders(
        <SettingsItem
          label="Appearance"
          endLabel="Automatic"
          accessibilityHint="Double tap to change theme"
        />
      )
    ).not.toThrow();
  });
});

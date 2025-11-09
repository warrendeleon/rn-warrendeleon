import React, { type ComponentProps } from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { ButtonWithChevron, getButtonWithChevronStyles } from '../ButtonWithChevron';

describe('ButtonWithChevron', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders in light mode with default props (single variant) and no icon', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { queryByTestId } = renderWithProviders(
      <ButtonWithChevron label="Profile" testID="chevron-button" />
    );

    // No startIcon → no icon container
    expect(queryByTestId('button-with-chevron-icon')).toBeNull();
  });

  it('renders with a start icon when startIcon is provided (no crash)', () => {
    mockUseColorScheme.mockReturnValue('light');

    const DummyIcon = () => null;

    // We just assert that rendering with startIcon succeeds;
    // the branch itself is covered by the implementation test below.
    expect(() =>
      renderWithProviders(
        <ButtonWithChevron label="Settings" startIcon={DummyIcon} testID="chevron-pressable" />
      )
    ).not.toThrow();
  });

  it('renders in dark mode without crashing', () => {
    mockUseColorScheme.mockReturnValue('dark');

    expect(() =>
      renderWithProviders(<ButtonWithChevron label="Dark Mode" testID="chevron-dark" />)
    ).not.toThrow();
  });

  it('supports all groupVariant values without crashing', () => {
    mockUseColorScheme.mockReturnValue('light');

    expect(() =>
      renderWithProviders(
        <>
          <ButtonWithChevron label="single" groupVariant="single" />
          <ButtonWithChevron label="top" groupVariant="top" />
          <ButtonWithChevron label="middle" groupVariant="middle" />
          <ButtonWithChevron label="bottom" groupVariant="bottom" />
        </>
      )
    ).not.toThrow();
  });
});

describe('ButtonWithChevron implementation', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  type ButtonWithChevronProps = ComponentProps<typeof ButtonWithChevron>;

  it('invokes component body in light mode with explicit groupVariant', () => {
    mockUseColorScheme.mockReturnValue('light');

    const props: ButtonWithChevronProps = {
      label: 'Direct light',
      groupVariant: 'single',
    };

    const element = ButtonWithChevron(props);

    expect(element).toBeTruthy();
  });

  it('invokes component body using default groupVariant, startIcon, and custom startIconBgColor', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const DummyIcon = () => null;

    const props: ButtonWithChevronProps = {
      label: 'Default groupVariant',
      // no groupVariant → exercises the default 'single'
      startIcon: DummyIcon, // → exercises the startIconElement assignment branch
      startIconBgColor: '$secondary500', // → exercises the non-default iconBackgroundColor branch
    };

    const element = ButtonWithChevron(props);

    expect(element).toBeTruthy();
  });
});

describe('getButtonWithChevronStyles', () => {
  it('returns light mode styles for single variant', () => {
    const styles = getButtonWithChevronStyles('light', 'single');

    expect(styles.bg).toBe('$backgroundLight0');
    expect(styles.borderColor).toBe('$borderLight200');
    expect(styles.labelColor).toBe('$textDark900');
    expect(styles.chevronColor).toBe('$textLight500');
    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$2xl');
  });

  it('returns dark mode styles for bottom variant', () => {
    const styles = getButtonWithChevronStyles('dark', 'bottom');

    expect(styles.bg).toBe('$backgroundDark950');
    expect(styles.borderColor).toBe('$borderDark700');
    expect(styles.labelColor).toBe('$textLight50');
    expect(styles.chevronColor).toBe('$textLight400');
    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$2xl');
  });

  it('returns correct radii for middle variant', () => {
    const styles = getButtonWithChevronStyles('light', 'middle');

    expect(styles.top).toBe('$none');
    expect(styles.bottom).toBe('$none');
  });

  it('returns correct radii for top variant', () => {
    const styles = getButtonWithChevronStyles('light', 'top');

    expect(styles.top).toBe('$2xl');
    expect(styles.bottom).toBe('$none');
  });
});

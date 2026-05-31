/**
 * SettingsItem rendered accessibility tests.
 *
 * These render the real component through the paint-aware harness (nativewind/test),
 * so the assertions read the colours the component actually paints from its inline
 * styles, not a hand-maintained token table. Both themes are exercised because the
 * component picks different colours per scheme.
 *
 * Describe titles carry the WCAG success criterion so the accessibility reporter can
 * aggregate them (see src/test-utils/a11y/reporter.js).
 */
import React from 'react';
import { Globe } from 'lucide-react-native';

import {
  calculateContrastRatio,
  expectAccessibilityProps,
  expectColorContrast,
  expectFocusOrder,
} from '@app/test-utils/accessibility';
import { renderForA11y } from '@app/test-utils/renderForA11y';

import { SettingsItem } from '../SettingsItem';

type Style = Record<string, unknown>;

const settings = (theme: 'light' | 'dark') => ({
  preloadedState: { settings: { theme, language: 'en' } as const },
});

describe('WCAG 1.4.3 - Contrast (Minimum): SettingsItem label text', () => {
  it('label meets 4.5:1 against the row background in light mode', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Theme" testID="row" />,
      settings('light')
    );
    const rowBg = (screen.getByTestId('row').props.style as Style).backgroundColor as string;
    const labelColor = (screen.getByText('Theme').props.style as Style).color as string;

    expectColorContrast(labelColor, rowBg, { type: 'normalText' });
  });

  it('label meets 4.5:1 against the row background in dark mode', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Theme" testID="row" />,
      settings('dark')
    );
    const rowBg = (screen.getByTestId('row').props.style as Style).backgroundColor as string;
    const labelColor = (screen.getByText('Theme').props.style as Style).color as string;

    expectColorContrast(labelColor, rowBg, { type: 'normalText' });
  });
});

describe('WCAG 1.4.11 - Non-text Contrast: SettingsItem start icon', () => {
  it('the white glyph meets 3:1 against the icon background', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Language" startIcon={Globe} testID="row" />,
      settings('light')
    );
    const iconBg = (screen.getByTestId('settings-item-icon').props.style as Style)
      .backgroundColor as string;

    // The component always paints the glyph white (#FFFFFF); assert the rendered
    // background gives it at least the 3:1 a graphical object needs.
    expectColorContrast('#FFFFFF', iconBg, { type: 'uiComponents' });
    expect(calculateContrastRatio('#FFFFFF', iconBg)).toBeGreaterThanOrEqual(3);
  });
});

describe('WCAG 1.4.3 - Contrast (Minimum): SettingsItem secondary text', () => {
  it('endLabel grey falls short of 4.5:1 in light mode (known: pending a darker secondary grey)', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Theme" endLabel="Dark" testID="row" />,
      settings('light')
    );
    const rowBg = (screen.getByTestId('row').props.style as Style).backgroundColor as string;
    const endLabelColor = (screen.getByText('Dark').props.style as Style).color as string;

    // #8C8C8C on #FFFFFF is ~3.36:1: it clears the 3:1 a UI element/large text needs but
    // not the 4.5:1 minimum for normal-size body text. Recorded as a known, accepted
    // finding so the report flags it honestly rather than claiming a clean pass. When the
    // secondary grey is darkened to meet AA, the upper bound below fails and forces an update.
    const ratio = calculateContrastRatio(endLabelColor, rowBg);
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratio).toBeLessThan(4.5);
  });
});

describe('WCAG 4.1.2 - Name, Role, Value: SettingsItem', () => {
  it('exposes a button role and an accessible name', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Theme" endLabel="Dark" testID="row" />,
      settings('light')
    );

    expectAccessibilityProps(screen.getByTestId('row'), {
      role: 'button',
      label: 'Theme, Dark',
    });
  });
});

describe('WCAG 2.5.3 - Label in Name: SettingsItem', () => {
  it('the accessible name contains the visible label so voice control works', async () => {
    const { screen } = await renderForA11y(
      <SettingsItem label="Language" testID="row" />,
      settings('light')
    );

    const label = String(screen.getByTestId('row').props.accessibilityLabel ?? '').toLowerCase();
    expect(label).toContain('language');
  });
});

describe('WCAG 2.4.3 - Focus Order: settings list', () => {
  it('every row in a grouped list is reachable in order', async () => {
    const { screen } = await renderForA11y(
      <>
        <SettingsItem label="Appearance" groupVariant="top" testID="row-1" />
        <SettingsItem label="Language" groupVariant="bottom" testID="row-2" />
      </>,
      settings('light')
    );

    expectFocusOrder([screen.getByTestId('row-1'), screen.getByTestId('row-2')]);
  });
});

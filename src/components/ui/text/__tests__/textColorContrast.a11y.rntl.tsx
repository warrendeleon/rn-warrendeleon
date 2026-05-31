/**
 * Design-system text colour contrast.
 *
 * Unlike the per-component tests that read inline-style hex, these colours live only in
 * Tailwind classes (text-blue-600 accent, text-red-600 error) with no inline style. Their
 * value exists only once nativewind/test compiles the theme, so this is the case the
 * paint-aware harness exists for: the plain render leaves the colour empty, here it resolves
 * to a real value the contrast helper can check. These two classes are the semantic text
 * colours the migrated screens use (selected/active accents, inline form errors).
 */
import React from 'react';

import { Text } from '@app/components/ui/text';
import { calculateContrastRatio, expectColorContrast } from '@app/test-utils/accessibility';
import { renderForA11y } from '@app/test-utils/renderForA11y';

type Style = Record<string, unknown>;

const WHITE = '#FFFFFF';

async function resolvedColour(className: string): Promise<string> {
  const { screen } = await renderForA11y(
    <Text testID="t" className={className}>
      sample
    </Text>
  );
  return (screen.getByTestId('t').props.style as Style).color as string;
}

describe('WCAG 1.4.3 - Contrast (Minimum): design-system semantic text colours', () => {
  it('accent text (text-blue-600) resolves from its class and meets 4.5:1 on white', async () => {
    const colour = await resolvedColour('text-blue-600');

    // Resolved from the class by the harness, not an inline style or a hand-typed hex.
    expect(colour).toBeTruthy();
    expect(calculateContrastRatio(colour, WHITE)).toBeGreaterThanOrEqual(4.5);
    expectColorContrast(colour, WHITE, { type: 'normalText' });
  });

  it('error text (text-red-600) resolves from its class and meets 4.5:1 on white', async () => {
    const colour = await resolvedColour('text-red-600');

    expect(colour).toBeTruthy();
    expectColorContrast(colour, WHITE, { type: 'normalText' });
  });
});

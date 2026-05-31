import React from 'react';
// nativewind/test compiles the project's Tailwind theme and enables cssInterop on the
// components, so className utilities resolve to real style values in the render tree
// (colours as rgba(), spacing and size as numbers). That is what lets the rendered-style
// accessibility assertions read the colours and sizes a component actually paints, instead
// of a hand-maintained token table. CSS-variable families (primary/background/typography)
// are injected by the provider at runtime and do NOT resolve here; those stay covered by
// the token-matrix tests and the native audit (see the WCAG criteria catalogue).
import { render as nativewindRender, screen } from 'nativewind/test';

import tailwindConfig from '../../tailwind.config.js';

import type { AppStore, RootState } from './renderWithProviders';
import { createTestStore, TestProviders } from './renderWithProviders';

interface A11yRenderOptions {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Paint-aware render for accessibility tests. Same provider stack as
 * {@link renderWithProviders}, but driven by nativewind/test so the component's
 * className-derived styles resolve to concrete values the WCAG helpers can assert.
 *
 * Queries come from nativewind/test's `screen` (re-exported here for convenience).
 *
 * @example
 * const { screen } = await renderForA11y(<SettingsItem label="Theme" />);
 * const style = flattenStyle(screen.getByTestId('row').props.style);
 * expectColorContrast(style.color, style.backgroundColor);
 */
export async function renderForA11y(
  ui: React.ReactElement,
  { preloadedState, store }: A11yRenderOptions = {}
) {
  const createdStore = store || createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <TestProviders store={createdStore}>{children}</TestProviders>;
  }

  await nativewindRender(ui, {
    config: { ...tailwindConfig, content: [] },
    wrapper: Wrapper,
  });

  return { store: createdStore, screen };
}

export { screen };

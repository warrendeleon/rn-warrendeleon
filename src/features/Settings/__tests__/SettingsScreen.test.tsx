import React from 'react';

import { SettingsScreen } from '@app/features';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = renderWithProviders(<SettingsScreen />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders complete component tree', () => {
    const component = renderWithProviders(<SettingsScreen />);

    // Ensure the component rendered successfully
    expect(component.UNSAFE_root).toBeTruthy();
  });
});

describe('SettingsScreen implementation', () => {
  it('exports SettingsScreen as a React component', () => {
    expect(typeof SettingsScreen).toBe('function');
    expect(SettingsScreen.name).toBe('SettingsScreen');
  });
});

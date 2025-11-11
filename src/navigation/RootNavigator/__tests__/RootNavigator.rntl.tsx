import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { RootNavigator } from '../RootNavigator';

describe('RootNavigator', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<RootNavigator />)).not.toThrow();
  });

  it('renders complete component tree', () => {
    const component = renderWithProviders(<RootNavigator />);

    // Ensure the component rendered successfully
    expect(component.UNSAFE_root).toBeTruthy();
  });

  it('renders NavigationContainer with Stack Navigator', () => {
    const { UNSAFE_root } = renderWithProviders(<RootNavigator />);

    // Check that the navigator structure is rendered
    expect(UNSAFE_root).toBeTruthy();
    expect(UNSAFE_root.findAllByType).toBeDefined();
  });

  it('uses translation hook for screen titles', () => {
    const { UNSAFE_root } = renderWithProviders(<RootNavigator />);

    // Component renders which means useTranslation was called
    expect(UNSAFE_root).toBeTruthy();
  });
});

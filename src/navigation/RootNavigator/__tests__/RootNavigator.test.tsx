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
});

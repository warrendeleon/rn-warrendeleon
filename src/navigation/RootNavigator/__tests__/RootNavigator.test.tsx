import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { RootNavigator } from '../RootNavigator';

describe('RootNavigator', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<RootNavigator />)).not.toThrow();
  });
});

describe('RootNavigator implementation', () => {
  it('can be invoked directly to produce an element', () => {
    type RootNavigatorProps = Parameters<typeof RootNavigator>[0];
    const props = {} as RootNavigatorProps;

    const element = RootNavigator(props);

    expect(element).toBeTruthy();
  });
});

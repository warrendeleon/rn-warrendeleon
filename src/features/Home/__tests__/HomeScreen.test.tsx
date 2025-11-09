import React from 'react';

import { handleSettingsPress, HomeScreen } from '@app/features';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<HomeScreen />)).not.toThrow();
  });

  it('invokes the settings handler without crashing', () => {
    expect(() => handleSettingsPress()).not.toThrow();
  });
});

describe('HomeScreen implementation', () => {
  it('can be invoked directly to produce an element', () => {
    type HomeScreenProps = Parameters<typeof HomeScreen>[0];
    const props = {} as HomeScreenProps;

    const element = HomeScreen(props);

    expect(element).toBeTruthy();
  });
});

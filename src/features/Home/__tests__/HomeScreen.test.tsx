import React from 'react';

import { handleSettingsPress, HomeScreen } from '@app/features';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = renderWithProviders(<HomeScreen />);

    // Verify the component renders successfully
    expect(UNSAFE_root).toBeTruthy();
  });

  it('invokes the settings handler and logs correctly', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    handleSettingsPress();

    expect(consoleSpy).toHaveBeenCalledWith('Pressed!');

    consoleSpy.mockRestore();
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

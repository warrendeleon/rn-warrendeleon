import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { AppearanceScreen } from '../AppearanceScreen';

describe('AppearanceScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders without crashing', () => {
    mockUseColorScheme.mockReturnValue('light');

    expect(() => renderWithProviders(<AppearanceScreen />)).not.toThrow();
  });

  it('renders in light mode', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(<AppearanceScreen />);

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { UNSAFE_root } = renderWithProviders(<AppearanceScreen />);

    expect(UNSAFE_root).toBeDefined();
  });
});

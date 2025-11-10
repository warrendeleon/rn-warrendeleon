import React from 'react';
import * as ReactNative from 'react-native';

import { renderWithProviders } from '@app/test-utils';

import { LanguageScreen } from '../LanguageScreen';

describe('LanguageScreen', () => {
  const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme') as jest.Mock;

  beforeEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('renders without crashing', () => {
    mockUseColorScheme.mockReturnValue('light');

    expect(() => renderWithProviders(<LanguageScreen />)).not.toThrow();
  });

  it('renders in light mode', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { UNSAFE_root } = renderWithProviders(<LanguageScreen />);

    expect(UNSAFE_root).toBeDefined();
  });

  it('renders in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { UNSAFE_root } = renderWithProviders(<LanguageScreen />);

    expect(UNSAFE_root).toBeDefined();
  });
});

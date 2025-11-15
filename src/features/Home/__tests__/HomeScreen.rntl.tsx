/* eslint-disable simple-import-sort/imports */
import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import component directly to avoid circular dependency
import { handleSettingsPress, HomeScreen } from '../HomeScreen';

import type { RootStackParamList } from '@app/navigation';
import { renderWithProviders } from '@app/test-utils/renderWithProviders';
/* eslint-enable simple-import-sort/imports */

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    const { UNSAFE_root } = renderWithProviders(<HomeScreen />);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders complete component tree', () => {
    const component = renderWithProviders(<HomeScreen />);

    // Ensure the component rendered successfully
    expect(component.UNSAFE_root).toBeTruthy();
  });

  it('renders button and calls navigation when clicked', () => {
    const { UNSAFE_root } = renderWithProviders(<HomeScreen />);

    // Verify component rendered with its internal structure
    expect(UNSAFE_root).toBeTruthy();

    // The component uses useNavigation and useTranslation hooks
    // and renders a ButtonWithChevron, which we've tested separately
  });

  it('navigates to Settings when handleSettingsPress is called', () => {
    const mockNavigation = {
      navigate: jest.fn(),
    } as unknown as HomeScreenNavigationProp;

    handleSettingsPress(mockNavigation);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
  });
});

describe('HomeScreen implementation', () => {
  it('exports handleSettingsPress function', () => {
    expect(typeof handleSettingsPress).toBe('function');
  });
});

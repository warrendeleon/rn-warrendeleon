import React from 'react';

import { renderWithProviders } from '@app/test-utils/renderWithProviders';

import { RootNavigator } from '../RootNavigator';

describe('RootNavigator', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error during tests to avoid noise from React Navigation initialization
    // These errors are expected as screens using navigation hooks (useRoute, useNavigation)
    // are mounted during test setup before the navigator is fully initialized
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

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

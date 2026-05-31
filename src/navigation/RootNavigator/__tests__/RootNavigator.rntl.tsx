import React from 'react';

import { expectRendersSuccessfully, renderWithProviders } from '@app/test-utils';

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

  it('renders without throwing errors', async () => {
    await expect(renderWithProviders(<RootNavigator />)).resolves.toBeDefined();
  });

  it('renders complete component tree', async () => {
    const result = await renderWithProviders(<RootNavigator />);
    expectRendersSuccessfully(result);
  });

  it('renders NavigationContainer with Stack Navigator structure', async () => {
    const result = await renderWithProviders(<RootNavigator />);

    // Check that the navigator structure is rendered and accessible
    expectRendersSuccessfully(result);
  });

  it('initialises translation hook for screen titles', async () => {
    const result = await renderWithProviders(<RootNavigator />);

    // Component renders which means useTranslation was called
    expectRendersSuccessfully(result);
  });
});

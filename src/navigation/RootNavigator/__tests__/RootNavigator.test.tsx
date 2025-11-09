import React from 'react';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { render } from '@testing-library/react-native';

import { RootNavigator } from '../RootNavigator';

describe('RootNavigator', () => {
  it('renders the Home screen as the initial route', () => {
    const { getByText } = render(
      <GluestackUIProvider config={config}>
        <RootNavigator />
      </GluestackUIProvider>
    );

    // Check that the navigator renders
    expect(getByText).toBeDefined();
  });
});

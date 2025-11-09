import React from 'react';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { render } from '@testing-library/react-native';

import { HomeScreen } from '@app/features';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <GluestackUIProvider config={config}>
        <HomeScreen />
      </GluestackUIProvider>
    );

    // Check that the screen renders without crashing
    expect(getByTestId).toBeDefined();
  });
});

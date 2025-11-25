import '../src/i18n'; // Initialize i18next for components using useTranslation

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { NavigationContainer } from '@react-navigation/native';
import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';
import type { Preview } from '@storybook/react-native';

import { store } from '../src/store';

import '../global.css';

const preview: Preview = {
  decorators: [
    Story => (
      <SafeAreaProvider>
        <Provider store={store}>
          <GluestackUIProvider config={config}>
            <NavigationContainer>
              <Story />
            </NavigationContainer>
          </GluestackUIProvider>
        </Provider>
      </SafeAreaProvider>
    ),
    withBackgrounds,
  ],
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#1A1A1A' },
        { name: 'gray', value: '#F5F5F5' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;

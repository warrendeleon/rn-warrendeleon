import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import type { Preview } from '@storybook/react-native';

import { config } from '../gluestack-ui.config';

const preview: Preview = {
  decorators: [
    Story => (
      <GluestackUIProvider config={config}>
        <Story />
      </GluestackUIProvider>
    ),
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

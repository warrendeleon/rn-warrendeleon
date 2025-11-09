import '@app/i18n';

import React from 'react';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';

import { RootNavigator } from '@app/navigation';

import '../../global.css';

export const App: React.FC = () => {
  return (
    <GluestackUIProvider config={config}>
      <RootNavigator />
    </GluestackUIProvider>
  );
};

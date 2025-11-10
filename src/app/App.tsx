import '@app/i18n';

import React from 'react';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { PersistGate } from 'redux-persist/integration/react';

import { RootNavigator } from '@app/navigation';
import { persistor, store } from '@app/store';

import '../../global.css';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GluestackUIProvider config={config}>
          <RootNavigator />
        </GluestackUIProvider>
      </PersistGate>
    </Provider>
  );
};

import '@app/i18n';

import React, { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { PersistGate } from 'redux-persist/integration/react';

import { RootNavigator } from '@app/navigation';
import { persistor, store } from '@app/store';

import '../../global.css';

const AppContent: React.FC = () => {
  useEffect(() => {
    // Hide splash screen with fade animation after a brief delay
    const timer = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <RootNavigator />
    </GluestackUIProvider>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

import '@app/i18n';

import React, { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { PersistGate } from 'redux-persist/integration/react';

import { SplashScreen } from '@app/features';
import { RootNavigator } from '@app/navigation';
import { persistor, store } from '@app/store';

import '../../global.css';

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide native splash screen with fade animation
    const timer = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <GluestackUIProvider config={config}>
      {showSplash ? <SplashScreen onComplete={handleSplashComplete} /> : <RootNavigator />}
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

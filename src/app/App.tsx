import '@app/i18n';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { PersistGate } from 'redux-persist/integration/react';

import { AuthProvider, SplashScreen } from '@app/features';
import { selectLanguage } from '@app/features/Settings/store';
import { RootNavigator } from '@app/navigation';
import { persistor, store, useAppSelector } from '@app/store';

import '../../global.css';

const AppContent: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { i18n } = useTranslation();
  const persistedLanguage = useAppSelector(selectLanguage);

  // Sync i18next with persisted language preference after Redux rehydration
  useEffect(() => {
    if (persistedLanguage && i18n.language !== persistedLanguage) {
      i18n.changeLanguage(persistedLanguage);
    }
  }, [persistedLanguage, i18n]);

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
      <AuthProvider>
        {showSplash ? <SplashScreen onComplete={handleSplashComplete} /> : <RootNavigator />}
      </AuthProvider>
    </GluestackUIProvider>
  );
};

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

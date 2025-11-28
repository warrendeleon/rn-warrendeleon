import '@app/i18n';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DevSettings } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { PersistGate } from 'redux-persist/integration/react';

import { isE2EMockEnabled } from '@app/config/e2e';
import { AuthProvider, SplashScreen } from '@app/features';
import { selectLanguage } from '@app/features/Settings/store';
import { RootNavigator } from '@app/navigation';
import {
  fetchEducation,
  fetchProfile,
  fetchWorkExperience,
  persistor,
  store,
  useAppDispatch,
  useAppSelector,
} from '@app/store';

import '../../global.css';

// Storybook is only loaded in __DEV__ - tree-shaken in production builds
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StorybookUI = __DEV__ ? require('../../.rnstorybook').default : null;

const AppContent: React.FC = () => {
  // Skip JS splash screen in E2E mode - mocked data loads instantly
  const [showSplash, setShowSplash] = useState(!isE2EMockEnabled);
  const [showStorybook, setShowStorybook] = useState(false);
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const persistedLanguage = useAppSelector(selectLanguage);

  // Sync i18next with persisted language preference after Redux rehydration
  useEffect(() => {
    if (persistedLanguage && i18n.language !== persistedLanguage) {
      i18n.changeLanguage(persistedLanguage);
    }
  }, [persistedLanguage, i18n]);

  // In E2E mode, load portfolio data immediately (skip splash UI but still fetch data)
  useEffect(() => {
    if (isE2EMockEnabled) {
      dispatch(fetchProfile());
      dispatch(fetchEducation());
      dispatch(fetchWorkExperience());
    }
  }, [dispatch]);

  useEffect(() => {
    // In E2E mode, hide native splash immediately without animation
    if (isE2EMockEnabled) {
      BootSplash.hide({ fade: false });
      return;
    }

    // Normal mode: Hide native splash screen with fade animation after delay
    const timer = setTimeout(() => {
      BootSplash.hide({ fade: true });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Add dev menu item to toggle Storybook (only in __DEV__)
  useEffect(() => {
    if (__DEV__) {
      DevSettings.addMenuItem('Toggle Storybook', () => {
        setShowStorybook(prev => !prev);
      });
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return (
      <GluestackUIProvider config={config}>
        <SplashScreen onComplete={handleSplashComplete} />
      </GluestackUIProvider>
    );
  }

  // In dev mode, can toggle to Storybook after splash
  // Storybook is wrapped with GluestackUIProvider so components render correctly
  if (__DEV__ && showStorybook && StorybookUI) {
    return (
      <GluestackUIProvider config={config}>
        <StorybookUI />
      </GluestackUIProvider>
    );
  }

  // Main app
  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <RootNavigator />
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

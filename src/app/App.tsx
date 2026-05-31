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

import { GluestackUIProvider as GluestackUIProviderV2 } from '@app/components/ui/gluestack-ui-provider';
import { hasLoadedOverride, isE2EMockEnabled, loadPersistedMockOverride } from '@app/config/e2e';
import { getE2EErrorConfig } from '@app/config/e2e-error';
import { AuthProvider, SplashScreen } from '@app/features';
import { selectLanguage } from '@app/features/Settings/store';
import { RootNavigator } from '@app/navigation';
import { ToastProvider } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
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
const StorybookUI = __DEV__ ? require('../../.rnstorybook').default : null;

const AppContent: React.FC = () => {
  // Get E2E error config to determine if we should show splash for error testing
  const e2eErrorConfig = getE2EErrorConfig();

  // Wait for persisted mock override to load before deciding on splash behaviour
  const [mockOverrideLoaded, setMockOverrideLoaded] = useState(hasLoadedOverride());

  // Skip JS splash screen in E2E mode UNLESS error mode is enabled
  // When testing error states, we need the splash screen to show error UI
  const [showSplash, setShowSplash] = useState(!isE2EMockEnabled() || e2eErrorConfig.enabled);
  const [showStorybook, setShowStorybook] = useState(false);
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const persistedLanguage = useAppSelector(selectLanguage);
  // Drives NativeWind's colour scheme (Gluestack v2 tokens + dark: variants)
  // from the user's persisted theme preference.
  const colorScheme = useAppColorScheme();

  // Load persisted E2E mock override from AsyncStorage at startup
  useEffect(() => {
    if (!mockOverrideLoaded) {
      loadPersistedMockOverride().then(() => {
        setMockOverrideLoaded(true);
        // Update showSplash based on loaded mock setting
        setShowSplash(!isE2EMockEnabled() || e2eErrorConfig.enabled);
      });
    }
  }, [mockOverrideLoaded, e2eErrorConfig.enabled]);

  // Sync i18next with persisted language preference after Redux rehydration
  useEffect(() => {
    if (persistedLanguage && i18n.language !== persistedLanguage) {
      i18n.changeLanguage(persistedLanguage);
    }
  }, [persistedLanguage, i18n]);

  // In E2E mode (without error testing), load portfolio data immediately
  // When error mode is enabled, SplashScreen handles data fetching and error display
  useEffect(() => {
    if (isE2EMockEnabled() && !e2eErrorConfig.enabled) {
      dispatch(fetchProfile());
      dispatch(fetchEducation());
      dispatch(fetchWorkExperience());
    }
  }, [dispatch, e2eErrorConfig.enabled]);

  useEffect(() => {
    // In E2E mode, hide native splash immediately without animation
    if (isE2EMockEnabled()) {
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

  // Wait for mock override to load from AsyncStorage before deciding what to show
  // This prevents flash of wrong content if user has toggled mock mode
  if (!mockOverrideLoaded) {
    return null; // BootSplash native screen is still visible
  }

  let content: React.ReactNode;
  if (showSplash) {
    // Show splash screen first
    content = <SplashScreen onComplete={handleSplashComplete} />;
  } else if (__DEV__ && showStorybook && StorybookUI) {
    // In dev mode, can toggle to Storybook after splash
    content = <StorybookUI />;
  } else {
    // Main app
    content = (
      <ToastProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ToastProvider>
    );
  }

  // v2 provider (outer) injects the design-token CSS variables and syncs the
  // colour scheme to the user's theme; the v1 provider (inner) still serves the
  // screens not yet migrated off @gluestack-ui/themed.
  return (
    <GluestackUIProviderV2 mode={colorScheme}>
      <GluestackUIProvider config={config}>{content}</GluestackUIProvider>
    </GluestackUIProviderV2>
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

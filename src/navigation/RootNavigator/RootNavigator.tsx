import React from 'react';
import { useTranslation } from 'react-i18next';
import { enableScreens } from 'react-native-screens';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ErrorBoundary } from '@app/components';
import { AppearanceScreen, HomeScreen, LanguageScreen, SettingsScreen } from '@app/features';
import { useAppColorScheme } from '@app/hooks';

enableScreens(true);

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();

  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navigationTheme}>
      <ErrorBoundary>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000000' : '#F2F2F7',
            },
            headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('home.title') }} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('settings.title') }}
          />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{ title: t('language.title') }}
          />
          <Stack.Screen
            name="Appearance"
            component={AppearanceScreen}
            options={{ title: t('appearance.title') }}
          />
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

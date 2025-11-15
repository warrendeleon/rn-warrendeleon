import React from 'react';
import { useTranslation } from 'react-i18next';
import { enableScreens } from 'react-native-screens';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ErrorBoundary } from '@app/components';
import {
  AppearanceScreen,
  EducationDataScreen,
  HomeScreen,
  LanguageScreen,
  PDFScreen,
  ProfileDataScreen,
  SettingsScreen,
  WebViewScreen,
  WorkXPDataScreen,
} from '@app/features';
import { useAppColorScheme } from '@app/hooks';

enableScreens(true);

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
  ProfileData: undefined;
  WorkXPData: undefined;
  EducationData: undefined;
  WebView: { uri: string };
  PDF: { uri: string; title?: string };
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
          <Stack.Screen
            name="ProfileData"
            component={ProfileDataScreen}
            options={{ title: 'Profile Data' }}
          />
          <Stack.Screen
            name="WorkXPData"
            component={WorkXPDataScreen}
            options={{ title: 'Work Experience Data' }}
          />
          <Stack.Screen
            name="EducationData"
            component={EducationDataScreen}
            options={{ title: 'Education Data' }}
          />
          <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: 'GitHub' }} />
          <Stack.Screen name="PDF" component={PDFScreen} options={{ title: 'CV' }} />
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { enableScreens } from 'react-native-screens';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ErrorBoundary, HeaderBackButton } from '@app/components';
import {
  AppearanceScreen,
  EducationScreen,
  HomeScreen,
  LanguageScreen,
  MockStatusScreen,
  PDFScreen,
  ProfileScreen,
  SettingsScreen,
  WebViewScreen,
  WorkExperienceClientsScreen,
  WorkExperienceDetailsScreen,
  WorkExperiencePositionsScreen,
  WorkExperienceScreen,
} from '@app/features';
import { useAppColorScheme } from '@app/hooks';

enableScreens(true);

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
  Profile: undefined;
  WorkExperience: undefined;
  WorkExperienceDetails: { workExperienceId: string };
  WorkExperienceClients: { workExperienceId: string };
  WorkExperiencePositions: { workExperienceId: string };
  Education: undefined;
  WebView: { uri: string };
  PDF: { uri: string; title?: string };
  MockStatus: undefined;
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
            gestureEnabled: false,
            headerLeft: () => <HeaderBackButton />,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: t('home.title'), headerLeft: () => null }}
          />
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
            name="Profile"
            component={ProfileScreen}
            options={{ title: t('home.profile') }}
          />
          <Stack.Screen
            name="Education"
            component={EducationScreen}
            options={{ title: t('home.education') }}
          />
          <Stack.Screen
            name="WorkExperience"
            component={WorkExperienceScreen}
            options={{ title: t('home.workExperience') }}
          />
          <Stack.Screen
            name="WorkExperienceDetails"
            component={WorkExperienceDetailsScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="WorkExperienceClients"
            component={WorkExperienceClientsScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="WorkExperiencePositions"
            component={WorkExperiencePositionsScreen}
            options={{ title: '' }}
          />
          <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: 'GitHub' }} />
          <Stack.Screen name="PDF" component={PDFScreen} options={{ title: 'CV' }} />
          <Stack.Screen
            name="MockStatus"
            component={MockStatusScreen}
            options={{ title: 'Mock Status' }}
          />
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
};

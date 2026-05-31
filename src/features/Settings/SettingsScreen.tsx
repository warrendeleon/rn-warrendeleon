import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Activity, Globe, LogIn, Moon, ShieldAlert } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { isTestUIEnabled } from '@app/config/e2e';
import { selectUser, useAuth } from '@app/features/Auth';
import type { RootStackParamList } from '@app/navigation';
import { SettingsGroup, type SettingsGroupItem, UserCard } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import { useAppSelector } from '@app/store';

import { selectLanguage, selectTheme } from './store';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { isAuthenticated } = useAuth();
  const user = useAppSelector(selectUser);
  const currentLanguage = useAppSelector(selectLanguage);
  const currentTheme = useAppSelector(selectTheme);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Error trigger state for testing ErrorBoundary
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    throw new Error('Test error triggered from Settings');
  }

  const getLanguageLabel = () => {
    return currentLanguage === 'en' ? t('language.english') : t('language.spanish');
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'system':
        return t('appearance.automatic');
      case 'light':
        return t('appearance.light');
      case 'dark':
        return t('appearance.dark');
      default:
        return t('appearance.automatic');
    }
  };

  const handleLanguagePress = useCallback(() => {
    navigation.navigate('Language');
  }, [navigation]);

  const handleAppearancePress = useCallback(() => {
    navigation.navigate('Appearance');
  }, [navigation]);

  const handleTriggerError = useCallback(() => {
    setShouldThrowError(true);
  }, []);

  const handleMockStatus = useCallback(() => {
    navigation.navigate('MockStatus');
  }, [navigation]);

  const handleSignIn = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleEditAccount = useCallback(() => {
    navigation.navigate('EditAccount');
  }, [navigation]);

  const settingsItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('settings.appearance'),
        onPress: handleAppearancePress,
        endLabel: getThemeLabel(),
        startIcon: Moon,
        startIconBgColor: '#6366f1',
        testID: 'settings-appearance-button',
      },
      {
        label: t('settings.language'),
        onPress: handleLanguagePress,
        endLabel: getLanguageLabel(),
        startIcon: Globe,
        startIconBgColor: '#3b82f6',
        testID: 'settings-language-button',
      },
    ],
    [t, currentLanguage, currentTheme, handleAppearancePress, handleLanguagePress]
  );

  const testingItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: 'Show Error Boundary',
        onPress: handleTriggerError,
        startIcon: ShieldAlert,
        startIconBgColor: '#ef4444',
        testID: 'settings-trigger-error-button',
        showChevron: false,
      },
      {
        label: 'View Mock Status',
        onPress: handleMockStatus,
        startIcon: Activity,
        startIconBgColor: '#22c55e',
        testID: 'settings-mock-status-button',
        showChevron: true,
      },
    ],
    [handleTriggerError, handleMockStatus]
  );

  const signInItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('settings.signIn'),
        onPress: handleSignIn,
        startIcon: LogIn,
        startIconBgColor: '#0077E6',
        testID: 'settings-sign-in-button',
        showChevron: true,
      },
    ],
    [handleSignIn, t]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      testID="settings-screen"
      accessibilityLabel={t('settings.title')}
    >
      {/* Account Section */}
      <Box className="mt-2">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}
          accessibilityRole="header"
        >
          {t('settings.account')}
        </Text>
        {isAuthenticated && user ? (
          <UserCard
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            profilePictureUri={user.profilePicture}
            onPress={handleEditAccount}
            groupVariant="single"
            testID="settings-user-card"
          />
        ) : (
          <SettingsGroup items={signInItems} />
        )}
      </Box>

      {/* General Section */}
      <Box className="mt-6">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}
          accessibilityRole="header"
        >
          {t('settings.general')}
        </Text>
        <SettingsGroup items={settingsItems} />
      </Box>

      {isTestUIEnabled && (
        <Box className="mt-6">
          <Text
            className="mb-2 ml-4 text-xs font-medium uppercase"
            style={{ color: isDark ? '#A3A3A3' : '#8C8C8C' }}
            accessibilityRole="header"
          >
            Testing
          </Text>
          <SettingsGroup items={testingItems} />
        </Box>
      )}
    </ScrollView>
  );
};

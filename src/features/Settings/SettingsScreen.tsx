import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, GlobeIcon, MoonIcon, ScrollView, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Activity, LogIn, ShieldAlert } from 'lucide-react-native';

import { SettingsGroup, type SettingsGroupItem, UserCard } from '@app/components';
import { isTestUIEnabled } from '@app/config/e2e';
import { selectUser, useAuth } from '@app/features/Auth';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
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
        startIcon: MoonIcon,
        startIconBgColor: '$indigo500',
        testID: 'settings-appearance-button',
      },
      {
        label: t('settings.language'),
        onPress: handleLanguagePress,
        endLabel: getLanguageLabel(),
        startIcon: GlobeIcon,
        startIconBgColor: '$blue500',
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
        startIconBgColor: '$red500',
        testID: 'settings-trigger-error-button',
        showChevron: false,
      },
      {
        label: 'View Mock Status',
        onPress: handleMockStatus,
        startIcon: Activity,
        startIconBgColor: '$green500',
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
        startIconBgColor: '$primary500',
        testID: 'settings-sign-in-button',
        showChevron: true,
      },
    ],
    [handleSignIn, t]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      testID="settings-screen"
      accessibilityLabel={t('settings.title')}
    >
      {/* Account Section */}
      <Box mt="$2">
        <Text
          mb="$3"
          pt="$1"
          fontSize="$xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          lineHeight="$sm"
          color="$coolGray500"
          accessibilityRole="header"
        >
          {t('settings.account')}
        </Text>
        {isAuthenticated && user ? (
          <UserCard
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            onPress={handleEditAccount}
            groupVariant="single"
            testID="settings-user-card"
          />
        ) : (
          <SettingsGroup items={signInItems} />
        )}
      </Box>

      {/* General Section */}
      <Box mt="$6">
        <Text
          mb="$3"
          pt="$1"
          fontSize="$xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          lineHeight="$sm"
          color="$coolGray500"
          accessibilityRole="header"
        >
          {t('settings.general')}
        </Text>
        <SettingsGroup items={settingsItems} />
      </Box>

      {isTestUIEnabled && (
        <Box mt="$6">
          <Text
            mb="$3"
            pt="$1"
            fontSize="$xs"
            fontWeight="$semibold"
            textTransform="uppercase"
            lineHeight="$sm"
            color="$coolGray500"
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

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { Box, GlobeIcon, MoonIcon, ScrollView, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Activity, LogOut, ShieldAlert } from 'lucide-react-native';

import { SettingsGroup, type SettingsGroupItem } from '@app/components';
import { useAuth } from '@app/features/Auth';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { logout, useAppDispatch, useAppSelector } from '@app/store';

import { selectLanguage, selectTheme } from './store';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const currentLanguage = useAppSelector(selectLanguage);
  const currentTheme = useAppSelector(selectTheme);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Check if test UI is enabled (debug builds only, includes E2E tests)
  const isTestUIEnabled = __DEV__;

  // Error trigger state for testing ErrorBoundary
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = useCallback(() => {
    Alert.alert(t('settings.logoutTitle'), t('settings.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await dispatch(logout()).unwrap();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  }, [dispatch, navigation, t]);

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

  const accountItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: isLoggingOut ? t('settings.loggingOut') : t('settings.logout'),
        onPress: handleLogout,
        startIcon: LogOut,
        startIconBgColor: '$coolGray500',
        testID: 'settings-logout-button',
        showChevron: false,
        isDisabled: isLoggingOut,
      },
    ],
    [handleLogout, isLoggingOut, t]
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

      {isAuthenticated && (
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
            {t('settings.account')}
          </Text>
          <SettingsGroup items={accountItems} />
        </Box>
      )}
    </ScrollView>
  );
};

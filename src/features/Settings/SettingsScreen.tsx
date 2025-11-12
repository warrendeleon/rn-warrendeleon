import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { GlobeIcon, MoonIcon, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChevronButtonGroup, type ChevronButtonGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppSelector } from '@app/store';

import { selectLanguage, selectTheme } from './store';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const currentLanguage = useAppSelector(selectLanguage);
  const currentTheme = useAppSelector(selectTheme);
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

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

  const settingsItems: ChevronButtonGroupItem[] = useMemo(
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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      testID="settings-screen"
    >
      <View className="mt-2">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
        >
          {t('settings.general')}
        </Text>
        <ChevronButtonGroup items={settingsItems} />
      </View>
    </ScrollView>
  );
};

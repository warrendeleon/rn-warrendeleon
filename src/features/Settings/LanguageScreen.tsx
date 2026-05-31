import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { PickerGroup, type PickerGroupItem } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';

import type { Language } from './store';
import { selectLanguage, setLanguage } from './store';

export const LanguageScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(selectLanguage);
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'en', label: t('language.english') },
    { code: 'es', label: t('language.spanish') },
    { code: 'ca', label: t('language.catalan') },
    { code: 'pl', label: t('language.polish') },
    { code: 'tl', label: t('language.tagalog') },
  ];

  const handleLanguageSelect = useCallback(
    async (language: Language) => {
      dispatch(setLanguage(language));
      await i18n.changeLanguage(language);
      navigation.goBack();
    },
    [dispatch, i18n, navigation]
  );

  const languageItems: PickerGroupItem[] = useMemo(
    () =>
      languages.map(language => ({
        label: language.label,
        onPress: () => handleLanguageSelect(language.code),
        isSelected: currentLanguage === language.code,
        testID: `language-option-${language.code}`,
      })),
    [t, currentLanguage, handleLanguageSelect]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      testID="language-screen"
      accessibilityLabel={t('language.title')}
    >
      <Box className="mt-2">
        <Text
          className="mb-2 ml-4 text-xs font-medium uppercase"
          style={{ color: isDark ? '#A3A3A3' : '#6B6B6B' }}
          accessibilityRole="header"
        >
          {t('language.languages')}
        </Text>
        <PickerGroup items={languageItems} />
      </Box>
    </ScrollView>
  );
};

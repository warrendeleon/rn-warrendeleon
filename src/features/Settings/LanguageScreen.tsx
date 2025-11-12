import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

import { SelectableButtonGroup, type SelectableButtonGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
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
  ];

  const handleLanguageSelect = useCallback(
    async (language: Language) => {
      dispatch(setLanguage(language));
      await i18n.changeLanguage(language);
      navigation.goBack();
    },
    [dispatch, i18n, navigation]
  );

  const languageItems: SelectableButtonGroupItem[] = useMemo(
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
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      testID="language-screen"
      accessibilityLabel={t('language.title')}
    >
      <View className="mt-2">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
          accessibilityRole="header"
        >
          {t('language.languages')}
        </Text>
        <SelectableButtonGroup items={languageItems} />
      </View>
    </ScrollView>
  );
};

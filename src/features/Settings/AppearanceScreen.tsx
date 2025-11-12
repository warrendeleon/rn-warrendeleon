import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

import { SelectableButtonGroup, type SelectableButtonGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';

import type { Theme } from './store';
import { selectTheme, setTheme } from './store';

export const AppearanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const themes: Array<{ value: Theme; label: string }> = [
    { value: 'system', label: t('appearance.automatic') },
    { value: 'light', label: t('appearance.light') },
    { value: 'dark', label: t('appearance.dark') },
  ];

  const handleThemeSelect = useCallback(
    (theme: Theme) => {
      dispatch(setTheme(theme));
      navigation.goBack();
    },
    [dispatch, navigation]
  );

  const themeItems: SelectableButtonGroupItem[] = useMemo(
    () =>
      themes.map(theme => ({
        label: theme.label,
        onPress: () => handleThemeSelect(theme.value),
        isSelected: currentTheme === theme.value,
        testID: `appearance-option-${theme.value}`,
      })),
    [t, currentTheme, handleThemeSelect]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      testID="appearance-screen"
      accessibilityLabel={t('appearance.title')}
    >
      <View className="mt-2">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
          accessibilityRole="header"
        >
          {t('appearance.appearance')}
        </Text>
        <SelectableButtonGroup items={themeItems} />
      </View>
    </ScrollView>
  );
};

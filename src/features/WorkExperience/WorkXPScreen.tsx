import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DetailListGroup, type DetailListGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchWorkExperience } from './store/actions';
import {
  selectWorkExperience,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
} from './store/selectors';

type WorkXPScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkXP'>;

// Format date range for work experience
const formatDateRange = (start: string, end: string, presentText: string): string => {
  const endDate = end === 'Present' ? presentText : end;
  return `${start} - ${endDate}`;
};

export const WorkXPScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<WorkXPScreenNavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const workExperience = useAppSelector(selectWorkExperience);
  const loading = useAppSelector(selectWorkExperienceLoading);
  const error = useAppSelector(selectWorkExperienceError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchWorkExperience());
  }, [dispatch, language]);

  const handleWorkXPPress = useCallback(
    (workXPId: string, hasClients: boolean) => {
      // TODO: Implement navigation when WorkXPDetails and Clients screens are created
      // if (hasClients) {
      //   navigation.navigate('Clients', { workXPId });
      // } else {
      //   navigation.navigate('WorkXPDetails', { workXPId });
      // }
      console.log(`WorkXP pressed: ${workXPId}, hasClients: ${hasClients}`);
    },
    [navigation]
  );

  const workExperienceItems: DetailListGroupItem[] = useMemo(() => {
    if (!workExperience) return [];

    return workExperience.map(item => {
      const clientCount = item.clients?.length ?? 0;
      const hasClients = clientCount > 0;
      const dateRange = formatDateRange(item.start, item.end, t('workExperience.present'));

      return {
        id: item.id,
        label: item.position,
        subtitle: `${item.company} • ${dateRange}`,
        logoUri: item.logo,
        onPress: () => handleWorkXPPress(item.id, hasClients),
        testID: `work-xp-item-${item.id}`,
        showChevron: true,
        badge: hasClients ? clientCount.toString() : undefined,
        accessibilityLabel: t('workExperience.accessibility.itemLabel', {
          position: item.position,
          company: item.company,
          dates: dateRange,
        }),
        accessibilityHint: hasClients
          ? t('workExperience.accessibility.clientsHint', { count: clientCount })
          : t('workExperience.accessibility.detailsHint'),
      };
    });
  }, [t, workExperience, handleWorkXPPress]);

  return (
    <ScrollView
      testID="work-xp-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup
        items={workExperienceItems}
        loading={loading}
        error={error ? t('workExperience.errorMessage') : undefined}
      />

      {!loading && !error && workExperienceItems.length === 0 && (
        <View style={{ padding: 20, alignItems: 'center' }} testID="work-xp-empty-state">
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            {t('workExperience.empty')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

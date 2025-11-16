import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import { DetailListGroup, type DetailListGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppSelector } from '@app/store';

import { selectWorkExperienceById } from './store/selectors';

type WorkExperienceClientsScreenRouteProp = RouteProp<RootStackParamList, 'WorkExperienceClients'>;

interface WorkExperienceClientsScreenProps {
  route: WorkExperienceClientsScreenRouteProp;
}

// Format date range for clients
const formatDateRange = (start: string, end: string, presentText: string): string => {
  const endDate = end === 'Present' ? presentText : end;
  return `${start} - ${endDate}`;
};

export const WorkExperienceClientsScreen: React.FC<WorkExperienceClientsScreenProps> = ({
  route,
}) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { workExperienceId } = route.params;

  const workExperience = useAppSelector(state => selectWorkExperienceById(state, workExperienceId));
  const clients = workExperience?.clients ?? [];

  const clientItems: DetailListGroupItem[] = useMemo(() => {
    if (!clients || clients.length === 0) return [];

    return clients.map(client => {
      const dateRange = formatDateRange(client.start, client.end, t('workExperience.present'));

      return {
        id: client.id,
        label: client.position,
        subtitle: `${client.company} • ${dateRange}`,
        logoUri: client.logo,
        testID: `work-experience-clients-item-${client.id}`,
        showChevron: false,
        accessibilityLabel: t('workExperience.clients.accessibility.itemLabel', {
          position: client.position,
          company: client.company,
          dates: dateRange,
        }),
        accessibilityHint: t('workExperience.clients.accessibility.itemHint'),
      };
    });
  }, [t, clients]);

  return (
    <ScrollView
      testID="work-experience-clients-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={clientItems} loading={false} error={undefined} />

      {clientItems.length === 0 && (
        <View
          style={{ padding: 20, alignItems: 'center' }}
          testID="work-experience-clients-empty-state"
        >
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            {t('workExperience.clients.empty')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

import React, { useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkExperienceClients'>;

export const WorkExperienceClientsScreen: React.FC<WorkExperienceClientsScreenProps> = ({
  route,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { workExperienceId } = route.params;

  const workExperience = useAppSelector(state => selectWorkExperienceById(state, workExperienceId));
  const clients = workExperience?.clients ?? [];

  // Set navigation title to company name
  useLayoutEffect(() => {
    if (workExperience?.company) {
      navigation.setOptions({
        title: workExperience.company,
      });
    }
  }, [navigation, workExperience?.company]);

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
        showChevron: true,
        onPress: () => {
          navigation.navigate('WorkExperienceDetails', { workExperienceId: client.id });
        },
        accessibilityLabel: t('workExperience.clients.accessibility.itemLabel', {
          position: client.position,
          company: client.company,
          dates: dateRange,
        }),
        accessibilityHint: t('workExperience.clients.accessibility.itemHint'),
      };
    });
  }, [t, clients, navigation]);

  return (
    <ScrollView
      testID="work-experience-clients-screen"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={clientItems} loading={false} error={undefined} />

      {clientItems.length === 0 && (
        <Box p="$5" alignItems="center" testID="work-experience-clients-empty-state">
          <Text color={isDark ? '$white' : '$black'} fontSize="$md">
            {t('workExperience.clients.empty')}
          </Text>
        </Box>
      )}
    </ScrollView>
  );
};

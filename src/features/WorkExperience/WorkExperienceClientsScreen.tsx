import React, { useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import type { RootStackParamList } from '@app/navigation';
import { DetailListGroup, type DetailListGroupItem } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import { useAppSelector } from '@app/store';
import { formatDateRange } from '@app/utils/dateFormatter';

import {
  selectWorkExperienceById,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
  selectWorkExperiencePositionsWithClientsById,
} from './store/selectors';

type WorkExperienceClientsScreenRouteProp = RouteProp<RootStackParamList, 'WorkExperienceClients'>;

interface WorkExperienceClientsScreenProps {
  route: WorkExperienceClientsScreenRouteProp;
}

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
  const clientPositions = useAppSelector(state =>
    selectWorkExperiencePositionsWithClientsById(state, workExperienceId)
  );
  const loading = useAppSelector(selectWorkExperienceLoading);
  const error = useAppSelector(selectWorkExperienceError);

  // Set navigation title to company name
  useLayoutEffect(() => {
    if (workExperience?.company) {
      navigation.setOptions({
        title: workExperience.company,
      });
    }
  }, [navigation, workExperience?.company]);

  const clientItems: DetailListGroupItem[] = useMemo(() => {
    if (!clientPositions || clientPositions.length === 0) return [];

    return clientPositions.map(position => {
      // Position has a client reference
      const client = position.client!;
      const dateRange = formatDateRange(
        position.startDate,
        position.endDate,
        t('workExperience.present')
      );

      return {
        id: position.id,
        label: position.title,
        subtitle: `${client.name} • ${dateRange}`,
        logoUri: client.logo,
        testID: `work-experience-clients-item-${position.id}`,
        showChevron: true,
        onPress: () => {
          navigation.navigate('WorkExperienceDetails', { workExperienceId: position.id });
        },
        accessibilityLabel: t('workExperience.clients.accessibility.itemLabel', {
          position: position.title,
          company: client.name,
          dates: dateRange,
        }),
        accessibilityHint: t('workExperience.clients.accessibility.itemHint'),
      };
    });
  }, [t, clientPositions, navigation]);

  return (
    <ScrollView
      testID="work-experience-clients-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={clientItems} loading={loading} error={error ?? undefined} />

      {clientItems.length === 0 && !loading && !error && (
        <Box className="items-center p-5" testID="work-experience-clients-empty-state">
          <Text className="text-base" style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
            {t('workExperience.clients.empty')}
          </Text>
        </Box>
      )}
    </ScrollView>
  );
};

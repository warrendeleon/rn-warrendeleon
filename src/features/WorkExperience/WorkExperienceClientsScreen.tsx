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
import { formatDateRange } from '@app/utils/dateFormatter';

import {
  selectWorkExperienceById,
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

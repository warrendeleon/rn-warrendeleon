import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DetailListGroup, type DetailListGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppDispatch, useAppSelector } from '@app/store';
import type { Position, WorkExperience } from '@app/types/portfolio';

import { fetchWorkExperience } from './store/actions';
import {
  selectWorkExperience,
  selectWorkExperienceError,
  selectWorkExperienceLoading,
} from './store/selectors';

type WorkExperienceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WorkExperience'
>;

// Format date range for work experience
const formatDateRange = (start: string, end: string, presentText: string): string => {
  const endDate = end === 'Present' ? presentText : end;
  return `${start} - ${endDate}`;
};

// Get the latest position (first in array, assuming sorted by date desc)
const getLatestPosition = (positions: Position[]): Position | null => {
  if (!positions || positions.length === 0) return null;
  return positions[0] ?? null;
};

// Get company date range (earliest start to latest end)
const getCompanyDateRange = (positions: Position[]): { start: string; end: string } => {
  if (!positions || positions.length === 0) {
    return { start: '', end: '' };
  }

  // Positions are sorted newest first, so last item has earliest start
  const lastPosition = positions[positions.length - 1];
  const firstPosition = positions[0];
  const earliestStart = lastPosition?.start ?? '';
  const latestEnd = firstPosition?.end ?? '';

  return { start: earliestStart, end: latestEnd };
};

// Determine navigation type based on work experience content
type NavigationType = 'clients' | 'positions' | 'details';

const getNavigationType = (item: WorkExperience): NavigationType => {
  if (item.clients && item.clients.length > 0) {
    return 'clients';
  }
  if (item.positions && item.positions.length > 1) {
    return 'positions';
  }
  return 'details';
};

export const WorkExperienceScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<WorkExperienceScreenNavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const workExperience = useAppSelector(selectWorkExperience);
  const loading = useAppSelector(selectWorkExperienceLoading);
  const error = useAppSelector(selectWorkExperienceError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchWorkExperience());
  }, [dispatch, language]);

  const handleWorkExperiencePress = useCallback(
    (item: WorkExperience) => {
      const navType = getNavigationType(item);

      switch (navType) {
        case 'clients':
          navigation.navigate('WorkExperienceClients', { workExperienceId: item.id });
          break;
        case 'positions':
          navigation.navigate('WorkExperiencePositions', { workExperienceId: item.id });
          break;
        case 'details':
        default: {
          // Single position - navigate directly to position details
          const positionId = item.positions[0]?.id ?? item.id;
          navigation.navigate('WorkExperienceDetails', { workExperienceId: positionId });
          break;
        }
      }
    },
    [navigation]
  );

  const workExperienceItems: DetailListGroupItem[] = useMemo(() => {
    if (!workExperience) return [];

    return workExperience.map(item => {
      const clientCount = item.clients?.length ?? 0;
      const positionCount = item.positions?.length ?? 0;
      const hasClients = clientCount > 0;
      const hasMultiplePositions = positionCount > 1;

      // Get latest position and company date range
      const latestPosition = getLatestPosition(item.positions);
      const { start, end } = getCompanyDateRange(item.positions);
      const dateRange = formatDateRange(start, end, t('workExperience.present'));

      // Determine badge: clients count takes priority, then positions count
      let badge: string | undefined;
      if (hasClients) {
        badge = clientCount.toString();
      } else if (hasMultiplePositions) {
        badge = positionCount.toString();
      }

      const positionTitle = latestPosition?.title ?? '';

      return {
        id: item.id,
        label: positionTitle,
        subtitle: `${item.company} • ${dateRange}`,
        logoUri: item.logo,
        onPress: () => handleWorkExperiencePress(item),
        testID: `work-experience-item-${item.id}`,
        showChevron: true,
        badge,
        accessibilityLabel: t('workExperience.accessibility.itemLabel', {
          position: positionTitle,
          company: item.company,
          dates: dateRange,
        }),
        accessibilityHint: hasClients
          ? t('workExperience.accessibility.clientsHint', { count: clientCount })
          : hasMultiplePositions
            ? t('workExperience.accessibility.positionsHint', { count: positionCount })
            : t('workExperience.accessibility.detailsHint'),
      };
    });
  }, [t, workExperience, handleWorkExperiencePress]);

  return (
    <ScrollView
      testID="work-experience-screen"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup
        items={workExperienceItems}
        loading={loading}
        error={error ? t('workExperience.errorMessage') : undefined}
      />

      {!loading && !error && workExperienceItems.length === 0 && (
        <Box p="$5" alignItems="center" testID="work-experience-empty-state">
          <Text color={isDark ? '$white' : '$black'} fontSize="$md">
            {t('workExperience.empty')}
          </Text>
        </Box>
      )}
    </ScrollView>
  );
};

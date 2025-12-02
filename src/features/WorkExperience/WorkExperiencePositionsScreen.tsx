import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { DetailListGroup, type DetailListGroupItem } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import { useAppSelector } from '@app/store';
import { formatDateRange } from '@app/utils/dateFormatter';

import { selectWorkExperienceById } from './store/selectors';

type WorkExperiencePositionsScreenRouteProp = RouteProp<
  RootStackParamList,
  'WorkExperiencePositions'
>;

interface WorkExperiencePositionsScreenProps {
  route: WorkExperiencePositionsScreenRouteProp;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkExperiencePositions'>;

const WorkExperiencePositionsScreenComponent: React.FC<WorkExperiencePositionsScreenProps> = ({
  route,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const { workExperienceId } = route.params;

  const workExperience = useAppSelector(state => selectWorkExperienceById(state, workExperienceId));
  const positions = workExperience?.positions ?? [];

  // Set navigation title to company name
  useLayoutEffect(() => {
    if (workExperience?.company) {
      navigation.setOptions({
        title: workExperience.company,
      });
    }
  }, [navigation, workExperience?.company]);

  const handlePositionPress = useCallback(
    (positionId: string) => {
      navigation.navigate('WorkExperienceDetails', { workExperienceId: positionId });
    },
    [navigation]
  );

  const positionItems: DetailListGroupItem[] = useMemo(() => {
    if (!positions || positions.length === 0) return [];

    return positions.map(position => {
      const dateRange = formatDateRange(
        position.startDate,
        position.endDate,
        t('workExperience.present')
      );

      return {
        id: position.id,
        label: position.title,
        subtitle: dateRange,
        logoUri: workExperience?.logo,
        testID: `work-experience-positions-item-${position.id}`,
        showChevron: true,
        onPress: () => handlePositionPress(position.id),
        accessibilityLabel: t('workExperience.positions.accessibility.itemLabel', {
          position: position.title,
          dates: dateRange,
        }),
        accessibilityHint: t('workExperience.positions.accessibility.itemHint'),
      };
    });
  }, [t, positions, handlePositionPress, workExperience?.logo]);

  return (
    <ScrollView
      testID="work-experience-positions-screen"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={positionItems} loading={false} error={undefined} />

      {positionItems.length === 0 && (
        <Box p="$5" alignItems="center" testID="work-experience-positions-empty-state">
          <Text color={isDark ? '$white' : '$black'} fontSize="$md">
            {t('workExperience.positions.empty')}
          </Text>
        </Box>
      )}
    </ScrollView>
  );
};

export const WorkExperiencePositionsScreen = React.memo(WorkExperiencePositionsScreenComponent);

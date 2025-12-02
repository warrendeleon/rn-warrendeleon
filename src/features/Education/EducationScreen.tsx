import React, { useCallback, useEffect, useMemo } from 'react';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation';
import { DetailListGroup, type DetailListGroupItem } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';
import { formatDate } from '@app/utils/dateFormatter';

import { fetchEducation } from './store/actions';
import { selectEducation, selectEducationError, selectEducationLoading } from './store/selectors';

type EducationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Education'>;

export const EducationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<EducationScreenNavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const education = useAppSelector(selectEducation);
  const loading = useAppSelector(selectEducationLoading);
  const error = useAppSelector(selectEducationError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchEducation());
  }, [dispatch, language]);

  const handleEducationPress = useCallback(
    (certificateUrl?: string) => {
      if (certificateUrl) {
        navigation.navigate('WebView', {
          uri: certificateUrl,
        });
      }
    },
    [navigation]
  );

  const educationItems: DetailListGroupItem[] = useMemo(() => {
    if (!education) return [];

    return education.map(item => {
      // Format dates using the date formatter
      const formattedStart = formatDate(item.startDate);
      const formattedEnd = item.endDate ? formatDate(item.endDate) : null;
      const dateRange = formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;

      return {
        id: `${item.institution}-${item.title}`,
        label: item.title,
        subtitle: `${item.institution} • ${dateRange}`,
        logoUri: item.logo,
        onPress: item.certificateUrl ? () => handleEducationPress(item.certificateUrl!) : undefined,
        testID: `education-item-${item.institution.toLowerCase().replace(/\s+/g, '-')}`,
        showChevron: !!item.certificateUrl,
      };
    });
  }, [education, handleEducationPress]);

  return (
    <ScrollView
      testID="education-screen"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={educationItems} loading={loading} error={error || undefined} />

      {!loading && !error && educationItems.length === 0 && (
        <Box p="$5" alignItems="center">
          <Text color={isDark ? '$white' : '$black'} fontSize="$md">
            No education data available
          </Text>
        </Box>
      )}
    </ScrollView>
  );
};

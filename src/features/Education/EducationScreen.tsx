import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { DetailListGroup, type DetailListGroupItem } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchEducation } from './store/actions';
import { selectEducation, selectEducationError, selectEducationLoading } from './store/selectors';

type EducationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Education'>;

// Format date range
const formatDateRange = (start: string, end?: string): string => {
  const endDate = end || 'Present';
  return `${start} - ${endDate}`;
};

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

    return education.map(item => ({
      id: `${item.location}-${item.title}`,
      label: item.title,
      subtitle: `${item.location} • ${formatDateRange(item.start, item.end)}`,
      logoUri: item.logo,
      onPress: item.certificate ? () => handleEducationPress(item.certificate) : undefined,
      testID: `education-item-${item.location.toLowerCase().replace(/\s+/g, '-')}`,
      showChevron: !!item.certificate,
    }));
  }, [education, handleEducationPress]);

  return (
    <ScrollView
      testID="education-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <DetailListGroup items={educationItems} loading={loading} error={error || undefined} />

      {!loading && !error && educationItems.length === 0 && (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            No education data available
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

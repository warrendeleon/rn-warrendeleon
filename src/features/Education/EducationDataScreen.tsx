import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAppColorScheme } from '@app/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchEducation } from './store/actions';
import { selectEducation, selectEducationError, selectEducationLoading } from './store/selectors';

export const EducationDataScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const education = useAppSelector(selectEducation);
  const loading = useAppSelector(selectEducationLoading);
  const error = useAppSelector(selectEducationError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchEducation());
  }, [dispatch, language]);

  return (
    <ScrollView
      testID="education-data-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
    >
      <View>
        {loading && (
          <Text
            testID="education-loading"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}
          >
            Loading...
          </Text>
        )}

        {error && (
          <Text testID="education-error" style={{ color: '#FF3B30', fontSize: 16 }}>
            Error: {error}
          </Text>
        )}

        {education && education.length > 0 && (
          <Text
            testID="education-data-json"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 12, fontFamily: 'Courier' }}
          >
            {JSON.stringify(education, null, 2)}
          </Text>
        )}

        {!loading && !error && (!education || education.length === 0) && (
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            No education data loaded
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

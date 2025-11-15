import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAppColorScheme } from '@app/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchWorkXP } from './store/actions';
import { selectWorkXP, selectWorkXPError, selectWorkXPLoading } from './store/selectors';

export const WorkXPDataScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const workXP = useAppSelector(selectWorkXP);
  const loading = useAppSelector(selectWorkXPLoading);
  const error = useAppSelector(selectWorkXPError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchWorkXP());
  }, [dispatch, language]);

  return (
    <ScrollView
      testID="work-experience-data-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
    >
      <View>
        {loading && (
          <Text
            testID="workxp-loading"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}
          >
            Loading...
          </Text>
        )}

        {error && (
          <Text testID="workxp-error" style={{ color: '#FF3B30', fontSize: 16 }}>
            Error: {error}
          </Text>
        )}

        {workXP && workXP.length > 0 && (
          <Text
            testID="workxp-data-json"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 12, fontFamily: 'Courier' }}
          >
            {JSON.stringify(workXP, null, 2)}
          </Text>
        )}

        {!loading && !error && (!workXP || workXP.length === 0) && (
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            No work experience data loaded
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

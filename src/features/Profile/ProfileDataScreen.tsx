import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAppColorScheme } from '@app/hooks';
import { useAppDispatch, useAppSelector } from '@app/store';

import { fetchProfile } from './store/actions';
import { selectProfile, selectProfileError, selectProfileLoading } from './store/selectors';

export const ProfileDataScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);
  const language = useAppSelector(state => state.settings.language);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch, language]);

  return (
    <ScrollView
      testID="profile-data-screen"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
    >
      <View>
        {loading && (
          <Text
            testID="profile-loading"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}
          >
            Loading...
          </Text>
        )}

        {error && (
          <Text testID="profile-error" style={{ color: '#FF3B30', fontSize: 16 }}>
            Error: {error}
          </Text>
        )}

        {profile && (
          <Text
            testID="profile-data-json"
            style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 12, fontFamily: 'Courier' }}
          >
            {JSON.stringify(profile, null, 2)}
          </Text>
        )}

        {!loading && !error && !profile && (
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', fontSize: 16 }}>
            No profile data loaded
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

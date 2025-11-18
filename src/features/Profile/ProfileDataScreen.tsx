import React, { useEffect } from 'react';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';

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
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      accessibilityLabel="Profile data screen"
    >
      <Box>
        {loading && (
          <Text
            testID="profile-loading"
            color={isDark ? '$white' : '$black'}
            fontSize="$md"
            accessibilityRole="text"
            accessibilityLabel="Loading profile data"
          >
            Loading...
          </Text>
        )}

        {error && (
          <Text
            testID="profile-error"
            color="$error600"
            fontSize="$md"
            accessibilityRole="alert"
            accessibilityLabel={`Error loading profile: ${error}`}
          >
            Error: {error}
          </Text>
        )}

        {profile && (
          <Text
            testID="profile-data-json"
            color={isDark ? '$white' : '$black'}
            fontSize="$xs"
            fontFamily="$mono"
            accessibilityRole="text"
            accessibilityLabel="Profile data in JSON format"
          >
            {JSON.stringify(profile, null, 2)}
          </Text>
        )}

        {!loading && !error && !profile && (
          <Text
            color={isDark ? '$white' : '$black'}
            fontSize="$md"
            accessibilityRole="text"
            accessibilityLabel="No profile data loaded"
          >
            No profile data loaded
          </Text>
        )}
      </Box>
    </ScrollView>
  );
};

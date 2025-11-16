import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { fetchEducation, fetchProfile, fetchWorkExperience, useAppDispatch } from '@app/store';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch portfolio data from GitHub
    dispatch(fetchProfile());
    dispatch(fetchWorkExperience());
    dispatch(fetchEducation());

    // Show splash screen for 4.5 seconds (matches original implementation)
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  }, [dispatch, onComplete]);

  if (!isLoading) {
    return null;
  }

  return (
    <View
      testID="splash-screen"
      accessibilityLabel="Loading splash screen"
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
      ]}
    >
      <Logo testID="splash-logo" darkMode={colorScheme === 'dark'} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 350,
    height: 75,
  },
});

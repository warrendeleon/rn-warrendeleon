import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box } from '@gluestack-ui/themed';

import { Logo } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import { fetchEducation, fetchProfile, fetchWorkExperience, useAppDispatch } from '@app/store';

/**
 * Minimum duration to show splash screen (in milliseconds)
 * Ensures branding visibility even with fast network
 */
const SPLASH_MINIMUM_DURATION = 1500;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    /**
     * Load app data with optimized parallel fetching
     * Uses Promise.all for concurrent API calls with minimum display duration
     */
    const loadAppData = async () => {
      const startTime = Date.now();

      // Fetch all portfolio data in parallel for optimal performance
      await Promise.all([
        dispatch(fetchProfile()),
        dispatch(fetchEducation()),
        dispatch(fetchWorkExperience()),
      ]);

      // Ensure minimum splash duration for branding visibility
      const elapsed = Date.now() - startTime;
      if (elapsed < SPLASH_MINIMUM_DURATION) {
        await new Promise(resolve => setTimeout(resolve, SPLASH_MINIMUM_DURATION - elapsed));
      }

      // Only update state and call onComplete if component is still mounted
      if (isMounted) {
        setIsLoading(false);
        onComplete();
      }
    };

    loadAppData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, onComplete]);

  if (!isLoading) {
    return null;
  }

  return (
    <Box
      testID="splash-screen"
      accessibilityLabel="Loading splash screen"
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
      ]}
    >
      <Logo testID="splash-logo" darkMode={colorScheme === 'dark'} style={styles.logo} />
    </Box>
  );
};

// StyleSheet.create used for core layout container and fixed dimensions
// Justification: Pure RN View layout with no GlueStack equivalent needed
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

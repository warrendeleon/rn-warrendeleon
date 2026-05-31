import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Box } from '@app/components/ui/box';
import { Button, ButtonText } from '@app/components/ui/button';
import { Heading } from '@app/components/ui/heading';
import { Text } from '@app/components/ui/text';
import { incrementRetryAttempts } from '@app/config';
import { Logo } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import {
  fetchEducation,
  fetchProfile,
  fetchWorkExperience,
  selectEducationError,
  selectProfileError,
  selectWorkExperienceError,
  useAppDispatch,
  useAppSelector,
} from '@app/store';

/**
 * Minimum duration to show splash screen (in milliseconds)
 * Ensures branding visibility even with fast network
 */
const SPLASH_MINIMUM_DURATION = 1500;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const colorScheme = useAppColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get error states from Redux
  const profileError = useAppSelector(selectProfileError);
  const educationError = useAppSelector(selectEducationError);
  const workExperienceError = useAppSelector(selectWorkExperienceError);

  // Combine all errors
  const combinedError = profileError || educationError || workExperienceError;

  /**
   * Load app data with optimised parallel fetching
   * Returns true if loading succeeded, false if error occurred
   */
  const loadAppData = async (): Promise<boolean> => {
    const startTime = Date.now();

    try {
      // Fetch all portfolio data in parallel for optimal performance
      const results = await Promise.all([
        dispatch(fetchProfile()),
        dispatch(fetchEducation()),
        dispatch(fetchWorkExperience()),
      ]);

      // Check if any fetch was rejected
      const hasRejection = results.some(result => result.meta.requestStatus === 'rejected');

      if (hasRejection) {
        setHasError(true);
        setIsLoading(false);
        return false;
      }

      // Ensure minimum splash duration for branding visibility
      const elapsed = Date.now() - startTime;
      if (elapsed < SPLASH_MINIMUM_DURATION) {
        await new Promise(resolve => setTimeout(resolve, SPLASH_MINIMUM_DURATION - elapsed));
      }

      setIsLoading(false);
      return true;
    } catch {
      setHasError(true);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (): Promise<void> => {
      const success = await loadAppData();
      if (!isMounted) return;
      if (success) {
        onComplete();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handle retry button press
   */
  const handleRetry = async (): Promise<void> => {
    incrementRetryAttempts();
    setHasError(false);
    setIsLoading(true);
    const success = await loadAppData();
    if (success) {
      onComplete();
    }
  };

  // Show error UI if data loading failed
  if (hasError) {
    return (
      <Box
        testID="splash-error-screen"
        accessibilityLabel="Error loading data screen"
        style={[
          styles.container,
          { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
        ]}
      >
        <Heading
          size="xl"
          className="mb-4 text-center"
          style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
        >
          {t('error.title')}
        </Heading>

        <Text
          size="md"
          className="mb-8 px-6 text-center"
          style={{ color: colorScheme === 'dark' ? '#A3A3A3' : '#8C8C8C' }}
        >
          {__DEV__ && combinedError ? combinedError : t('error.loadingFailed')}
        </Text>

        <Box className="w-full max-w-[300px] px-6">
          <Button
            onPress={handleRetry}
            testID="splash-retry-button"
            accessibilityRole="button"
            accessibilityLabel={t('error.tryAgain')}
            accessibilityHint="Attempts to load data again"
          >
            <ButtonText>{t('error.tryAgain')}</ButtonText>
          </Button>
        </Box>
      </Box>
    );
  }

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

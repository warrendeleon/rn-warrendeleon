import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Logo } from '@app/components';
import { useAppColorScheme } from '@app/hooks';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const colorScheme = useAppColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading (fetch user data, initialize app state, etc.)
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 4500); // 4.5 second loading time (matches original implementation)

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isLoading) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' },
      ]}
    >
      <Logo darkMode={colorScheme === 'dark'} style={styles.logo} />
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

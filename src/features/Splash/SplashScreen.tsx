import React, { useEffect, useState } from 'react';
import { Box } from '@gluestack-ui/themed';

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
    }, 2500); // 2.5 second loading time

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isLoading) {
    return null;
  }

  return (
    <Box
      flex={1}
      backgroundColor={colorScheme === 'dark' ? '$black' : '$white'}
      alignItems="center"
      justifyContent="center"
    >
      <Box width="$64" height="$64">
        <Logo darkMode={colorScheme === 'dark'} />
      </Box>
    </Box>
  );
};

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, ButtonText, Heading, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '@app/navigation/RootNavigator/RootNavigator';

interface FallbackUIProps {
  error: Error | null;
  onReset: () => void;
}

export const FallbackUI: React.FC<FallbackUIProps> = ({ error, onReset }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoHome = (): void => {
    onReset();
    navigation.navigate('Home');
  };

  return (
    <Box flex={1} justifyContent="center" alignItems="center" px="$6" bg="$backgroundLight0">
      <Heading size="xl" mb="$4" textAlign="center">
        {t('error.title')}
      </Heading>

      <Text size="md" mb="$8" textAlign="center" color="$textLight500">
        {__DEV__ ? error?.message : t('error.message')}
      </Text>

      <Box w="$full" maxWidth={300}>
        <Button onPress={onReset} mb="$4" testID="error-try-again-button">
          <ButtonText>{t('error.tryAgain')}</ButtonText>
        </Button>

        <Button onPress={handleGoHome} action="secondary" testID="error-go-home-button">
          <ButtonText>{t('error.goHome')}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
};

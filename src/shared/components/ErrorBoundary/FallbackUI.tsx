import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '@app/components/ui/box';
import { Button, ButtonText } from '@app/components/ui/button';
import { Heading } from '@app/components/ui/heading';
import { Text } from '@app/components/ui/text';
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
    <Box className="flex-1 items-center justify-center bg-[#FCFCFC] px-6">
      <Heading size="xl" className="mb-4 text-center">
        {t('error.title')}
      </Heading>

      <Text size="md" className="mb-8 text-center text-[#8C8C8C]">
        {__DEV__ ? error?.message : t('error.message')}
      </Text>

      <Box className="w-full max-w-[300px]">
        <Button onPress={onReset} className="mb-4" testID="error-try-again-button">
          <ButtonText>{t('error.tryAgain')}</ButtonText>
        </Button>

        <Button onPress={handleGoHome} action="secondary" testID="error-go-home-button">
          <ButtonText>{t('error.goHome')}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
};

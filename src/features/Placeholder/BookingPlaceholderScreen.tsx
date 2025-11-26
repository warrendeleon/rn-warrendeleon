import React from 'react';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text, VStack } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/hooks';

export const BookingPlaceholderScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box
      flex={1}
      bg={isDark ? '$black' : '$coolGray100'}
      justifyContent="center"
      alignItems="center"
      p="$6"
      testID="booking-placeholder-screen"
      accessibilityLabel={t('placeholder.booking.title')}
    >
      <VStack space="lg" alignItems="center">
        <Box bg="$pink700" p="$6" borderRadius="$full" accessibilityElementsHidden>
          <MaterialCommunityIcons name="calendar-clock" size={48} color="#FFFFFF" />
        </Box>

        <Text
          fontSize="$2xl"
          fontWeight="$bold"
          color={isDark ? '$white' : '$black'}
          testID="booking-placeholder-title"
        >
          {t('placeholder.booking.title')}
        </Text>

        <Text fontSize="$lg" color="$coolGray500" testID="booking-placeholder-coming-soon">
          {t('placeholder.booking.comingSoon')}
        </Text>

        <Text
          fontSize="$md"
          color={isDark ? '$coolGray400' : '$coolGray600'}
          textAlign="center"
          maxWidth="$80"
          testID="booking-placeholder-description"
        >
          {t('placeholder.booking.description')}
        </Text>
      </VStack>
    </Box>
  );
};

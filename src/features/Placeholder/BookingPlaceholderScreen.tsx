import React from 'react';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Box } from '@app/components/ui/box';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

export const BookingPlaceholderScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box
      className="flex-1 items-center justify-center p-6"
      style={{ backgroundColor: isDark ? '#000000' : '#f3f4f6' }}
      testID="booking-placeholder-screen"
      accessibilityLabel={t('placeholder.booking.title')}
    >
      <VStack space="lg" className="items-center">
        <Box
          className="rounded-full p-6"
          style={{ backgroundColor: '#be185d' }}
          accessibilityElementsHidden
        >
          <MaterialCommunityIcons name="calendar-clock" size={48} color="#FFFFFF" />
        </Box>

        <Text
          className="text-2xl font-bold"
          style={{ color: isDark ? '#FFFFFF' : '#000000' }}
          testID="booking-placeholder-title"
        >
          {t('placeholder.booking.title')}
        </Text>

        <Text
          className="text-lg"
          style={{ color: '#6b7280' }}
          testID="booking-placeholder-coming-soon"
        >
          {t('placeholder.booking.comingSoon')}
        </Text>

        <Text
          className="max-w-[320px] text-center text-base"
          style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
          testID="booking-placeholder-description"
        >
          {t('placeholder.booking.description')}
        </Text>
      </VStack>
    </Box>
  );
};

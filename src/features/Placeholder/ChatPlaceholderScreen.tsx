import React from 'react';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text, VStack } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/hooks';

export const ChatPlaceholderScreen: React.FC = () => {
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
      testID="chat-placeholder-screen"
      accessibilityLabel={t('placeholder.chat.title')}
    >
      <VStack space="lg" alignItems="center">
        <Box bg="$green500" p="$6" borderRadius="$full" accessibilityElementsHidden>
          <MaterialCommunityIcons name="chat" size={48} color="#FFFFFF" />
        </Box>

        <Text
          fontSize="$2xl"
          fontWeight="$bold"
          color={isDark ? '$white' : '$black'}
          testID="chat-placeholder-title"
        >
          {t('placeholder.chat.title')}
        </Text>

        <Text fontSize="$lg" color="$coolGray500" testID="chat-placeholder-coming-soon">
          {t('placeholder.chat.comingSoon')}
        </Text>

        <Text
          fontSize="$md"
          color={isDark ? '$coolGray400' : '$coolGray600'}
          textAlign="center"
          maxWidth="$80"
          testID="chat-placeholder-description"
        >
          {t('placeholder.chat.description')}
        </Text>
      </VStack>
    </Box>
  );
};

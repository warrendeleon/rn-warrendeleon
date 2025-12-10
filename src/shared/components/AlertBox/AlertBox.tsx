import React from 'react';
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

import { useAppColorScheme } from '@app/shared/hooks';

export type AlertBoxVariant = 'error' | 'success' | 'info';

export interface AlertBoxProps {
  /** The variant determines the colour scheme */
  variant: AlertBoxVariant;
  /** The main message to display */
  message: string;
  /** Optional title displayed above the message */
  title?: string;
  /** Test ID for E2E testing */
  testID?: string;
  /** Accessibility live region for screen reader announcements */
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

const VARIANT_CONFIG = {
  error: {
    light: {
      bg: '$red100',
      border: '$red300',
      iconColor: '#DC2626',
      titleColor: '$red800',
      textColor: '$red700',
    },
    dark: {
      bg: '$red900',
      border: '$red700',
      iconColor: '#FCA5A5',
      titleColor: '$red200',
      textColor: '$red300',
    },
    Icon: AlertCircle,
  },
  success: {
    light: {
      bg: '$green100',
      border: '$green300',
      iconColor: '#16A34A',
      titleColor: '$green800',
      textColor: '$green700',
    },
    dark: {
      bg: '$green900',
      border: '$green700',
      iconColor: '#86EFAC',
      titleColor: '$green200',
      textColor: '$green300',
    },
    Icon: CheckCircle,
  },
  info: {
    light: {
      bg: '$blue100',
      border: '$blue300',
      iconColor: '#2563EB',
      titleColor: '$blue800',
      textColor: '$blue700',
    },
    dark: {
      bg: '$blue900',
      border: '$blue700',
      iconColor: '#93C5FD',
      titleColor: '$blue200',
      textColor: '$blue300',
    },
    Icon: Info,
  },
};

/**
 * AlertBox - Displays error, success, or info messages
 *
 * Used across Auth screens for consistent alert styling.
 * EAA compliant with proper accessibility role.
 */
export const AlertBox: React.FC<AlertBoxProps> = ({
  variant,
  message,
  title,
  testID,
  accessibilityLiveRegion,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const config = VARIANT_CONFIG[variant];
  const colors = isDark ? config.dark : config.light;
  const IconComponent = config.Icon;
  const iconSize = title ? 24 : 20;

  return (
    <Box
      bg={colors.bg}
      borderRadius="$xl"
      p={title ? '$4' : '$3'}
      borderWidth={1}
      borderColor={colors.border}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={title ? `${title}: ${message}` : message}
      accessibilityLiveRegion={accessibilityLiveRegion}
    >
      <HStack space={title ? 'md' : 'sm'} alignItems={title ? 'flex-start' : 'center'}>
        <IconComponent size={iconSize} color={colors.iconColor} />
        {title ? (
          <VStack flex={1} space="xs">
            <Text color={colors.titleColor} fontWeight="$semibold" fontSize="$md">
              {title}
            </Text>
            <Text color={colors.textColor} fontSize="$sm">
              {message}
            </Text>
          </VStack>
        ) : (
          <Text color={colors.textColor} flex={1} fontSize="$sm">
            {message}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
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
      bg: '#fee2e2',
      border: '#fca5a5',
      iconColor: '#DC2626',
      titleColor: '#991b1b',
      textColor: '#b91c1c',
    },
    dark: {
      bg: '#7f1d1d',
      border: '#b91c1c',
      iconColor: '#FCA5A5',
      titleColor: '#fecaca',
      textColor: '#fca5a5',
    },
    Icon: AlertCircle,
  },
  success: {
    light: {
      bg: '#dcfce7',
      border: '#86efac',
      iconColor: '#16A34A',
      titleColor: '#166534',
      textColor: '#15803d',
    },
    dark: {
      bg: '#14532d',
      border: '#15803d',
      iconColor: '#86EFAC',
      titleColor: '#bbf7d0',
      textColor: '#86efac',
    },
    Icon: CheckCircle,
  },
  info: {
    light: {
      bg: '#dbeafe',
      border: '#93c5fd',
      iconColor: '#2563EB',
      titleColor: '#1e40af',
      textColor: '#1d4ed8',
    },
    dark: {
      bg: '#1e3a8a',
      border: '#1d4ed8',
      iconColor: '#93C5FD',
      titleColor: '#bfdbfe',
      textColor: '#93c5fd',
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
  accessibilityLiveRegion = 'polite',
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const config = VARIANT_CONFIG[variant];
  const colors = isDark ? config.dark : config.light;
  const IconComponent = config.Icon;
  const iconSize = title ? 24 : 20;

  return (
    <Box
      className={`rounded-xl border ${title ? 'p-4' : 'p-3'}`}
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={title ? `${title}: ${message}` : message}
      accessibilityLiveRegion={accessibilityLiveRegion}
    >
      <HStack space={title ? 'md' : 'sm'} className={title ? 'items-start' : 'items-center'}>
        <IconComponent size={iconSize} color={colors.iconColor} />
        {title ? (
          <VStack space="xs" className="flex-1">
            <Text className="text-base font-semibold" style={{ color: colors.titleColor }}>
              {title}
            </Text>
            <Text className="text-sm" style={{ color: colors.textColor }}>
              {message}
            </Text>
          </VStack>
        ) : (
          <Text className="flex-1 text-sm" style={{ color: colors.textColor }}>
            {message}
          </Text>
        )}
      </HStack>
    </Box>
  );
};

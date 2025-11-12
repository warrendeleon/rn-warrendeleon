import React from 'react';
import { Box, HStack, Icon, Pressable, Text } from '@gluestack-ui/themed';
import { ChevronRightIcon } from '@gluestack-ui/themed';

import { type GroupVariant, groupVariantRadius } from '@app/components/shared';
import { useAppColorScheme } from '@app/hooks';

type ButtonWithChevronProps = {
  label: string;
  onPress?: () => void;
  startIcon?: React.ElementType;
  startIconBgColor?: string;
  endLabel?: string;
  /** For grouped list styling */
  groupVariant?: GroupVariant;
  testID?: string;
  /** Optional accessibility hint for screen readers */
  accessibilityHint?: string;
};

/**
 * Pure helper that computes themed and grouped button styles.
 * This function is isolated so it can be fully tested for coverage.
 */
export const getButtonWithChevronStyles = (
  scheme: 'light' | 'dark',
  groupVariant: GroupVariant
) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '$backgroundDark900' : '$white';
  const labelColor = isDark ? '$white' : '$black';
  const chevronColor = isDark ? '$textLight400' : '$textLight500';

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, labelColor, chevronColor, top, bottom };
};

export const ButtonWithChevron = React.memo<ButtonWithChevronProps>(
  ({
    label,
    onPress,
    startIcon: StartIcon,
    startIconBgColor,
    endLabel,
    groupVariant = 'single',
    testID,
    accessibilityHint,
  }) => {
    const scheme = useAppColorScheme(); // "light" | "dark"

    const { bg, labelColor, chevronColor, top, bottom } = getButtonWithChevronStyles(
      scheme,
      groupVariant
    );

    const iconBackgroundColor = startIconBgColor ?? '$primary500';

    const shouldRenderStartIcon = Boolean(StartIcon);

    /*
     * I use an explicit variable instead of a ternary because Istanbul coverage tools
     * sometimes misreport JSX conditional branches. This makes both branches testable
     * and ensures more accurate coverage reporting.
     */
    let startIconElement: React.ReactNode = null;
    if (shouldRenderStartIcon && StartIcon) {
      startIconElement = (
        <Box
          testID="button-with-chevron-icon"
          w="$9"
          h="$9"
          borderRadius="$lg"
          alignItems="center"
          justifyContent="center"
          bg={iconBackgroundColor}
        >
          <Icon as={StartIcon} color="$white" size="md" />
        </Box>
      );
    }

    return (
      <Pressable
        accessibilityLabel={label + (endLabel ? `, ${endLabel}` : '')}
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        testID={testID}
        className="w-full flex-row items-center justify-between px-4"
        py="$3"
        bg={bg}
        borderTopLeftRadius={top}
        borderTopRightRadius={top}
        borderBottomLeftRadius={bottom}
        borderBottomRightRadius={bottom}
      >
        <HStack space="md" alignItems="center" flex={1}>
          {startIconElement}

          <Text color={labelColor} fontWeight="$semibold" lineHeight="$xl">
            {label}
          </Text>
        </HStack>

        <HStack space="sm" alignItems="center">
          {endLabel && (
            <Text color={chevronColor} fontSize="$sm">
              {endLabel}
            </Text>
          )}
          <Icon as={ChevronRightIcon} color={chevronColor} size="lg" />
        </HStack>
      </Pressable>
    );
  }
);

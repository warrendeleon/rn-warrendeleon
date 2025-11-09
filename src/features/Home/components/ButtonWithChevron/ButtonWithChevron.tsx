import React from 'react';
import { type ColorSchemeName, useColorScheme } from 'react-native';
import { Box, HStack, Icon, Pressable, Text } from '@gluestack-ui/themed';
import { ChevronRightIcon } from '@gluestack-ui/themed';

type GroupVariant = 'single' | 'top' | 'middle' | 'bottom';

type ButtonWithChevronProps = {
  label: string;
  onPress?: () => void;
  startIcon?: React.ElementType;
  startIconBgColor?: string;
  /** For grouped list styling */
  groupVariant?: GroupVariant;
  testID?: string;
};

const groupVariantRadius: Record<GroupVariant, { top: string; bottom: string }> = {
  single: { top: '$2xl', bottom: '$2xl' },
  top: { top: '$2xl', bottom: '$none' },
  middle: { top: '$none', bottom: '$none' },
  bottom: { top: '$none', bottom: '$2xl' },
};

/**
 * Pure helper that computes themed and grouped button styles.
 * This function is isolated so it can be fully tested for coverage.
 */
export const getButtonWithChevronStyles = (
  scheme: ColorSchemeName | null,
  groupVariant: GroupVariant
) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '$backgroundDark950' : '$backgroundLight0';
  const borderColor = isDark ? '$borderDark700' : '$borderLight200';
  const labelColor = isDark ? '$textLight50' : '$textDark900';
  const chevronColor = isDark ? '$textLight400' : '$textLight500';

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, borderColor, labelColor, chevronColor, top, bottom };
};

export const ButtonWithChevron: React.FC<ButtonWithChevronProps> = ({
  label,
  onPress,
  startIcon: StartIcon,
  startIconBgColor,
  groupVariant = 'single',
  testID,
}) => {
  const scheme = useColorScheme(); // "light" | "dark" | null

  const { bg, borderColor, labelColor, chevronColor, top, bottom } = getButtonWithChevronStyles(
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
        borderRadius="$full"
        alignItems="center"
        justifyContent="center"
        bg={iconBackgroundColor}
      >
        <Icon as={StartIcon} color="$white" size="sm" />
      </Box>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      className="w-full flex-row items-center justify-between px-4 py-3"
      bg={bg}
      borderWidth="$1"
      borderColor={borderColor}
      borderTopLeftRadius={top}
      borderTopRightRadius={top}
      borderBottomLeftRadius={bottom}
      borderBottomRightRadius={bottom}
    >
      <HStack space="md" alignItems="center">
        {startIconElement}

        <Text color={labelColor} fontWeight="$semibold">
          {label}
        </Text>
      </HStack>

      <Icon as={ChevronRightIcon} color={chevronColor} size="lg" />
    </Pressable>
  );
};

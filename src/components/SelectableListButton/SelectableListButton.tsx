import React from 'react';
import { HStack, Pressable, Text } from '@gluestack-ui/themed';

import { type GroupVariant, groupVariantRadius } from '@app/components/shared';
import { useAppColorScheme } from '@app/hooks';

type SelectableListButtonProps = {
  label: string;
  onPress?: () => void;
  /** For grouped list styling */
  groupVariant?: GroupVariant;
  /** Show check icon when selected */
  isSelected?: boolean;
  testID?: string;
};

/**
 * Pure helper that computes themed and grouped button styles.
 * This function is isolated so it can be fully tested for coverage.
 */
export const getSelectableListButtonStyles = (
  scheme: 'light' | 'dark',
  groupVariant: GroupVariant
) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '$backgroundDark900' : '$white';
  const labelColor = isDark ? '$white' : '$black';

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, labelColor, top, bottom };
};

/**
 * SelectableListButton component renders a pressable list item with optional check mark.
 * Automatically handles rounded corners based on groupVariant.
 * Shows a blue check mark when isSelected is true.
 */
export const SelectableListButton = React.memo<SelectableListButtonProps>(
  ({ label, onPress, groupVariant = 'single', isSelected = false, testID }) => {
    const scheme = useAppColorScheme(); // "light" | "dark"

    const { bg, labelColor, top, bottom } = getSelectableListButtonStyles(scheme, groupVariant);

    return (
      <Pressable
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
          <Text color={labelColor} fontWeight="$semibold" lineHeight="$xl">
            {label}
          </Text>
        </HStack>

        {isSelected && (
          <Text className="text-xl" color="$blue600" fontWeight="$bold">
            ✓
          </Text>
        )}
      </Pressable>
    );
  }
);

import React from 'react';

import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { type GroupVariant, groupVariantRadius } from '@app/shared/components/shared';
import { useAppColorScheme } from '@app/shared/hooks';

type PickerItemProps = {
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
export const getPickerItemStyles = (scheme: 'light' | 'dark', groupVariant: GroupVariant) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '#262626' : '#FFFFFF'; // backgroundDark900 : white
  const labelColor = isDark ? '#FFFFFF' : '#000000'; // white : black

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, labelColor, top, bottom };
};

/**
 * PickerItem component renders a pressable list item with optional check mark.
 * Automatically handles rounded corners based on groupVariant.
 * Shows a blue check mark when isSelected is true.
 */
export const PickerItem = React.memo<PickerItemProps>(
  ({ label, onPress, groupVariant = 'single', isSelected = false, testID }) => {
    const scheme = useAppColorScheme(); // "light" | "dark"

    const { bg, labelColor, top, bottom } = getPickerItemStyles(scheme, groupVariant);

    return (
      <Pressable
        accessibilityLabel={label + (isSelected ? ', selected' : '')}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={onPress}
        testID={testID}
        className="w-full flex-row items-center justify-between px-4 py-3"
        style={{
          backgroundColor: bg,
          borderTopLeftRadius: top,
          borderTopRightRadius: top,
          borderBottomLeftRadius: bottom,
          borderBottomRightRadius: bottom,
        }}
      >
        <HStack space="md" className="flex-1 items-center">
          <Text className="font-semibold leading-[28px]" style={{ color: labelColor }}>
            {label}
          </Text>
        </HStack>

        {isSelected && <Text className="text-xl font-bold text-blue-600">✓</Text>}
      </Pressable>
    );
  }
);

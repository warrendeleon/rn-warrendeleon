import React from 'react';
import { ChevronRight } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { type GroupVariant, groupVariantRadius } from '@app/shared/components/shared';
import { useAppColorScheme } from '@app/shared/hooks';

export type SettingsItemProps = {
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
  /** Show chevron icon on the right (default: true) */
  showChevron?: boolean;
  /** Label font weight (default: '$semibold') */
  labelFontWeight?: '$normal' | '$medium' | '$semibold' | '$bold';
};

/**
 * Pure helper that computes themed and grouped button styles.
 * This function is isolated so it can be fully tested for coverage.
 */
export const getSettingsItemStyles = (scheme: 'light' | 'dark', groupVariant: GroupVariant) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '#262626' : '#FFFFFF';
  const labelColor = isDark ? '#FFFFFF' : '#000000';
  const chevronColor = isDark ? '#A3A3A3' : '#6B6B6B';

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, labelColor, chevronColor, top, bottom };
};

export const SettingsItem = React.memo<SettingsItemProps>(
  ({
    label,
    onPress,
    startIcon: StartIcon,
    startIconBgColor,
    endLabel,
    groupVariant = 'single',
    testID,
    accessibilityHint,
    showChevron = true,
    labelFontWeight = '$semibold',
  }) => {
    const scheme = useAppColorScheme(); // "light" | "dark"

    const { bg, labelColor, chevronColor, top, bottom } = getSettingsItemStyles(
      scheme,
      groupVariant
    );

    const iconBackgroundColor = startIconBgColor ?? '#0077E6';

    const labelFontWeightClass = {
      $normal: 'font-normal',
      $medium: 'font-medium',
      $semibold: 'font-semibold',
      $bold: 'font-bold',
    }[labelFontWeight];

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
          testID="settings-item-icon"
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBackgroundColor }}
        >
          <StartIcon color="#FFFFFF" size={18} />
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
          {startIconElement}

          <Text className={`${labelFontWeightClass} leading-[28px]`} style={{ color: labelColor }}>
            {label}
          </Text>
        </HStack>

        <HStack space="sm" className="items-center">
          {endLabel && (
            <Text className="text-sm" style={{ color: chevronColor }}>
              {endLabel}
            </Text>
          )}
          {showChevron && <ChevronRight color={chevronColor} size={20} />}
        </HStack>
      </Pressable>
    );
  }
);

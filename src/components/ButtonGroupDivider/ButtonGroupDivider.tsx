import React from 'react';
import { View } from 'react-native';

import { useAppColorScheme } from '@app/hooks';

/**
 * Pure function to get divider color based on color scheme.
 * Exported for testing purposes.
 */
export const getDividerColor = (isDark: boolean): string => {
  return isDark ? '#3A3A3C' : '#C6C6C8';
};

/**
 * ButtonGroupDivider component renders a thin horizontal line between grouped buttons.
 * Follows iOS Settings app style with left padding to align with button text.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export const ButtonGroupDivider: React.FC = React.memo(() => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const dividerColor = getDividerColor(isDark);

  return (
    <View
      style={{
        height: 0.5,
        backgroundColor: dividerColor,
        marginLeft: 64, // Aligns with button text: padding (16px) + icon (36px) + spacing (12px)
      }}
    />
  );
});

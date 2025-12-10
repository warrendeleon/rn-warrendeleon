/**
 * PINDot Component
 *
 * Single PIN dot indicator for iOS 26 style PIN entry.
 * Shows filled/empty state with smooth animations.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Box } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/shared/hooks';

interface PINDotProps {
  /** Whether this dot is filled (digit entered) */
  isFilled: boolean;
  /** Whether this dot is in error state */
  hasError?: boolean;
  /** Index of this dot (0-5) for accessibility */
  index: number;
  /** Total number of dots */
  total?: number;
  /** Test ID prefix */
  testID?: string;
}

/**
 * PINDot - iOS 26 style PIN indicator dot
 *
 * Displays as:
 * - Empty: Hollow circle with border
 * - Filled: Solid circle
 * - Error: Red circle
 */
export const PINDot: React.FC<PINDotProps> = ({
  isFilled,
  hasError = false,
  index,
  total = 6,
  testID = 'pin-dot',
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation for scale effect when filling
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFilled) {
      // Pulse animation when filled
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset without animation when cleared
      scaleAnim.setValue(1);
    }
  }, [isFilled, scaleAnim]);

  // Determine colours based on state
  const getBackgroundColor = (): string => {
    if (hasError) {
      return isDark ? '#EF4444' : '#DC2626'; // Red for error
    }

    if (isFilled) {
      return isDark ? '#FFFFFF' : '#000000'; // Filled dot
    }

    return 'transparent'; // Empty dot
  };

  const getBorderColor = (): string => {
    if (hasError) {
      return isDark ? '#EF4444' : '#DC2626';
    }

    return isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
  };

  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Box
      testID={`${testID}-${index}`}
      accessibilityRole="none"
      accessibilityLabel={`PIN digit ${index + 1} of ${total}, ${isFilled ? 'entered' : 'empty'}`}
    >
      <Animated.View style={animatedStyle}>
        <Box
          style={[
            styles.dot,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
            },
          ]}
        />
      </Animated.View>
    </Box>
  );
};

const DOT_SIZE = 16;

const styles = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
});

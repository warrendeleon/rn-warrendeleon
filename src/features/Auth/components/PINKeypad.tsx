/**
 * PINKeypad Component
 *
 * iOS 26 style numeric keypad for PIN entry.
 * Features circular buttons, haptic feedback, and accessibility support.
 */

import React, { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/shared/hooks';

interface PINKeypadProps {
  /** Called when a digit is pressed */
  onDigitPress: (digit: string) => void;
  /** Called when delete is pressed */
  onDeletePress: () => void;
  /** Whether keypad is disabled */
  disabled?: boolean;
  /** Test ID prefix */
  testID?: string;
}

/**
 * Trigger haptic feedback on button press
 */
const triggerHaptic = (): void => {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  ReactNativeHapticFeedback.trigger(
    Platform.OS === 'ios' ? 'impactLight' : 'impactMedium',
    options
  );
};

/**
 * Individual keypad button
 */
interface KeypadButtonProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
  isDark: boolean;
  isDelete?: boolean;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({
  label,
  sublabel,
  onPress,
  disabled = false,
  testID,
  isDark,
  isDelete = false,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      triggerHaptic();
      onPress();
    }
  }, [disabled, onPress]);

  const backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const pressedColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? '$white' : '$black';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={isDelete ? 'Delete' : `Digit ${label}`}
      accessibilityHint={isDelete ? 'Removes the last entered digit' : `Enters digit ${label}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? pressedColor : backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <VStack alignItems="center" justifyContent="center">
        <Text fontSize="$3xl" fontWeight="$medium" color={textColor}>
          {label}
        </Text>
        {sublabel && (
          <Text fontSize="$xs" color={isDark ? '$coolGray400' : '$coolGray600'} mt={-4}>
            {sublabel}
          </Text>
        )}
      </VStack>
    </Pressable>
  );
};

/**
 * Empty space placeholder for keypad layout
 */
const EmptySpace: React.FC = () => <Box style={styles.button} />;

/**
 * PINKeypad - iOS 26 style numeric keypad
 *
 * Layout:
 * [1] [2] [3]
 * [4] [5] [6]
 * [7] [8] [9]
 * [ ] [0] [⌫]
 */
export const PINKeypad: React.FC<PINKeypadProps> = ({
  onDigitPress,
  onDeletePress,
  disabled = false,
  testID = 'pin-keypad',
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Letter sublabels (like iOS phone keypad)
  const sublabels: Record<string, string> = {
    '2': 'ABC',
    '3': 'DEF',
    '4': 'GHI',
    '5': 'JKL',
    '6': 'MNO',
    '7': 'PQRS',
    '8': 'TUV',
    '9': 'WXYZ',
  };

  const createDigitHandler = useCallback(
    (digit: string) => () => {
      onDigitPress(digit);
    },
    [onDigitPress]
  );

  return (
    <VStack space="md" testID={testID} accessibilityRole="none" accessibilityLabel="PIN keypad">
      {/* Row 1: 1, 2, 3 */}
      <HStack space="lg" justifyContent="center">
        <KeypadButton
          label="1"
          onPress={createDigitHandler('1')}
          disabled={disabled}
          testID={`${testID}-1`}
          isDark={isDark}
        />
        <KeypadButton
          label="2"
          sublabel={sublabels['2']}
          onPress={createDigitHandler('2')}
          disabled={disabled}
          testID={`${testID}-2`}
          isDark={isDark}
        />
        <KeypadButton
          label="3"
          sublabel={sublabels['3']}
          onPress={createDigitHandler('3')}
          disabled={disabled}
          testID={`${testID}-3`}
          isDark={isDark}
        />
      </HStack>

      {/* Row 2: 4, 5, 6 */}
      <HStack space="lg" justifyContent="center">
        <KeypadButton
          label="4"
          sublabel={sublabels['4']}
          onPress={createDigitHandler('4')}
          disabled={disabled}
          testID={`${testID}-4`}
          isDark={isDark}
        />
        <KeypadButton
          label="5"
          sublabel={sublabels['5']}
          onPress={createDigitHandler('5')}
          disabled={disabled}
          testID={`${testID}-5`}
          isDark={isDark}
        />
        <KeypadButton
          label="6"
          sublabel={sublabels['6']}
          onPress={createDigitHandler('6')}
          disabled={disabled}
          testID={`${testID}-6`}
          isDark={isDark}
        />
      </HStack>

      {/* Row 3: 7, 8, 9 */}
      <HStack space="lg" justifyContent="center">
        <KeypadButton
          label="7"
          sublabel={sublabels['7']}
          onPress={createDigitHandler('7')}
          disabled={disabled}
          testID={`${testID}-7`}
          isDark={isDark}
        />
        <KeypadButton
          label="8"
          sublabel={sublabels['8']}
          onPress={createDigitHandler('8')}
          disabled={disabled}
          testID={`${testID}-8`}
          isDark={isDark}
        />
        <KeypadButton
          label="9"
          sublabel={sublabels['9']}
          onPress={createDigitHandler('9')}
          disabled={disabled}
          testID={`${testID}-9`}
          isDark={isDark}
        />
      </HStack>

      {/* Row 4: empty, 0, delete */}
      <HStack space="lg" justifyContent="center">
        <EmptySpace />
        <KeypadButton
          label="0"
          onPress={createDigitHandler('0')}
          disabled={disabled}
          testID={`${testID}-0`}
          isDark={isDark}
        />
        <KeypadButton
          label="⌫"
          onPress={onDeletePress}
          disabled={disabled}
          testID={`${testID}-delete`}
          isDark={isDark}
          isDelete
        />
      </HStack>
    </VStack>
  );
};

const BUTTON_SIZE = 75;

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});

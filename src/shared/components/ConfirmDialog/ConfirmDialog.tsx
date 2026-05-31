import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

export interface ConfirmDialogButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  testID?: string;
}

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: ConfirmDialogButton[];
  onClose?: () => void;
  testID?: string;
}

/**
 * A testable confirmation dialog that mimics iOS 18+ native Alert appearance.
 * Unlike native Alert.alert(), this component renders within the React Native
 * view hierarchy, making it fully accessible to Detox E2E tests.
 *
 * @example
 * <ConfirmDialog
 *   visible={showLogout}
 *   title="Log Out"
 *   message="Are you sure you want to log out?"
 *   testID="logout-dialog"
 *   buttons={[
 *     { text: 'Cancel', style: 'cancel', onPress: () => setShowLogout(false) },
 *     { text: 'Log Out', style: 'destructive', onPress: handleLogout },
 *   ]}
 * />
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  buttons,
  onClose,
  testID = 'confirm-dialog',
}: ConfirmDialogProps) {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const handleButtonPress = (button: ConfirmDialogButton) => {
    button.onPress?.();
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      testID={testID}
      accessibilityViewIsModal
    >
      <Box
        className="flex-1 items-center justify-center px-10"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        testID={`${testID}-overlay`}
      >
        <Box
          className="w-full max-w-[270px] overflow-hidden rounded-[28px]"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          }}
          testID={`${testID}-content`}
          accessibilityRole="alert"
        >
          {/* Blur background for frosted glass effect */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={isDark ? 'dark' : 'xlight'}
            blurAmount={20}
            reducedTransparencyFallbackColor={isDark ? '#1c1c1e' : 'white'}
          />

          {/* Title and Message - Left aligned like iOS 18+ */}
          <VStack className="px-5 pb-3 pt-4">
            <Text
              className="text-[17px] font-semibold"
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
              testID={`${testID}-title`}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {message && (
              <Text
                className="mt-0.5 text-[13px]"
                style={{ color: isDark ? '#A3A3A3' : '#737373' }}
                testID={`${testID}-message`}
              >
                {message}
              </Text>
            )}
          </VStack>

          {/* Buttons - Pill shaped like iOS 18+ */}
          <HStack space="sm" className="px-3 pb-3">
            {buttons.map((button, index) => (
              <DialogButton
                key={button.text}
                button={button}
                onPress={() => handleButtonPress(button)}
                testID={button.testID || `${testID}-button-${index}`}
                isDark={isDark}
              />
            ))}
          </HStack>
        </Box>
      </Box>
    </Modal>
  );
}

interface DialogButtonProps {
  button: ConfirmDialogButton;
  onPress: () => void;
  testID: string;
  isDark: boolean;
}

function DialogButton({ button, onPress, testID, isDark }: DialogButtonProps) {
  const isCancel = button.style === 'cancel';
  const isDestructive = button.style === 'destructive';

  // Button background colors for dark/light mode
  const cancelBg = isDark ? 'rgba(99, 99, 102, 0.36)' : 'rgba(120, 120, 128, 0.24)';
  const defaultBg = isDark ? 'rgba(99, 99, 102, 0.24)' : 'rgba(120, 120, 128, 0.12)';

  // Text color for non-destructive buttons
  const textColor = isDestructive ? '#E63535' : isDark ? '#FFFFFF' : '#262626';

  return (
    <Pressable
      className="flex-1 items-center justify-center rounded-full py-2.5"
      style={({ pressed }) => ({
        backgroundColor: isCancel ? cancelBg : defaultBg,
        opacity: pressed ? 0.7 : 1,
      })}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={button.text}
    >
      <Text
        className={isCancel ? 'text-[17px] font-semibold' : 'text-[17px] font-normal'}
        style={{ color: textColor }}
      >
        {button.text}
      </Text>
    </Pressable>
  );
}

export default ConfirmDialog;

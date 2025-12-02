import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { Box, HStack, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { BlurView } from '@react-native-community/blur';

import { useAppColorScheme } from '@app/hooks';

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
        flex={1}
        bg="rgba(0, 0, 0, 0.4)"
        justifyContent="center"
        alignItems="center"
        px="$10"
        testID={`${testID}-overlay`}
      >
        <Box
          w="$full"
          maxWidth={270}
          borderRadius={28}
          overflow="hidden"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.25}
          shadowRadius={10}
          elevation={5}
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
          <VStack px="$5" pt="$4" pb="$3">
            <Text
              fontSize={17}
              fontWeight="$semibold"
              color={isDark ? '$white' : '$black'}
              testID={`${testID}-title`}
              accessibilityRole="header"
            >
              {title}
            </Text>
            {message && (
              <Text
                fontSize={13}
                color={isDark ? '$textDark400' : '$textLight600'}
                mt="$0.5"
                testID={`${testID}-message`}
              >
                {message}
              </Text>
            )}
          </VStack>

          {/* Buttons - Pill shaped like iOS 18+ */}
          <HStack px="$3" pb="$3" space="sm">
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
  const textColor = isDestructive ? '$error500' : isDark ? '$white' : '$textLight900';

  return (
    <Pressable
      flex={1}
      alignItems="center"
      justifyContent="center"
      py="$2.5"
      borderRadius="$full"
      bg={isCancel ? cancelBg : defaultBg}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={button.text}
      sx={{
        ':pressed': {
          opacity: 0.7,
        },
      }}
    >
      <Text fontSize={17} fontWeight={isCancel ? '$semibold' : '$normal'} color={textColor}>
        {button.text}
      </Text>
    </Pressable>
  );
}

export default ConfirmDialog;

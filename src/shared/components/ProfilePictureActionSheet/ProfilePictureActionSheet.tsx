/**
 * Profile Picture Action Sheet
 *
 * iOS 26 "Liquid Glass" style action sheet with options for profile picture:
 * - Take Photo (camera)
 * - Choose from Library
 * - Remove Photo (if exists)
 *
 * Dismiss by tapping outside (no Cancel button needed).
 *
 * Uses a pending action pattern to ensure the modal is fully dismissed
 * before triggering camera/library pickers, avoiding modal conflicts.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform } from 'react-native';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

export interface ProfilePictureActionSheetProps {
  /** Whether the action sheet is visible */
  isOpen: boolean;
  /** Callback when the action sheet is closed */
  onClose: () => void;
  /** Callback when Take Photo is selected */
  onTakePhoto: () => void;
  /** Callback when Choose from Library is selected */
  onChooseFromLibrary: () => void;
  /** Callback when Remove Photo is selected */
  onRemovePhoto?: () => void;
  /** Whether the user has an existing profile picture */
  hasExistingPhoto?: boolean;
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID: string;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  label,
  onPress,
  destructive = false,
  testID,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [pressed, setPressed] = useState(false);

  // iOS 26 style colours
  const textColor = destructive ? '#FF453A' : isDark ? '#FFFFFF' : '#000000';
  const bgColor = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const pressedBg = isDark ? 'rgba(58, 58, 60, 0.9)' : 'rgba(120, 120, 128, 0.24)';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className="rounded-[25px] px-5 py-3.5"
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={{
        minHeight: Platform.OS === 'ios' ? 50 : 48,
        backgroundColor: pressed ? pressedBg : bgColor,
      }}
    >
      <HStack space="sm" className="items-center justify-center">
        {icon}
        <Text size="md" className="font-medium" style={{ color: textColor }}>
          {label}
        </Text>
      </HStack>
    </Pressable>
  );
};

/** Actions that can be pending after modal dismissal */
type PendingAction = 'takePhoto' | 'chooseLibrary' | null;

/**
 * Profile Picture Action Sheet
 *
 * iOS 26 Liquid Glass style action sheet for managing profile pictures.
 * Tap outside to dismiss (no Cancel button).
 *
 * @example
 * ```tsx
 * <ProfilePictureActionSheet
 *   isOpen={showActionSheet}
 *   onClose={() => setShowActionSheet(false)}
 *   onTakePhoto={handleTakePhoto}
 *   onChooseFromLibrary={handleChooseFromLibrary}
 *   onRemovePhoto={handleRemovePhoto}
 *   hasExistingPhoto={!!profilePictureUrl}
 * />
 * ```
 */
export const ProfilePictureActionSheet: React.FC<ProfilePictureActionSheetProps> = ({
  isOpen,
  onClose,
  onTakePhoto,
  onChooseFromLibrary,
  onRemovePhoto,
  hasExistingPhoto = false,
}) => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Track pending action to execute after modal dismissal
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const wasOpenRef = useRef(isOpen);

  // Execute pending action when modal closes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Detect transition from open to closed
    if (wasOpenRef.current && !isOpen && pendingAction) {
      // Small delay to ensure native modal animation completes
      timer = setTimeout(() => {
        if (pendingAction === 'takePhoto') {
          onTakePhoto();
        } else if (pendingAction === 'chooseLibrary') {
          onChooseFromLibrary();
        }
        setPendingAction(null);
      }, 100);
    }

    wasOpenRef.current = isOpen;

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen, pendingAction, onTakePhoto, onChooseFromLibrary]);

  // Clear pending action when modal opens (reset state)
  useEffect(() => {
    if (isOpen) {
      setPendingAction(null);
    }
  }, [isOpen]);

  const handleTakePhoto = useCallback(() => {
    setPendingAction('takePhoto');
    onClose();
  }, [onClose]);

  const handleChooseFromLibrary = useCallback(() => {
    setPendingAction('chooseLibrary');
    onClose();
  }, [onClose]);

  const handleRemovePhoto = useCallback(() => {
    onClose();
    onRemovePhoto?.();
  }, [onClose, onRemovePhoto]);

  const handleBackdropPress = useCallback(() => {
    setPendingAction(null); // Clear any pending action on backdrop dismiss
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const showRemoveOption = hasExistingPhoto && onRemovePhoto;
  const iconSize = 20;
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
      statusBarTranslucent
    >
      <Box className="flex-1 items-center justify-center">
        {/* Backdrop - tap to dismiss */}
        <Pressable
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel={t('common.close', 'Close')}
          testID="profile-picture-action-sheet-backdrop"
        />

        {/* Action Sheet - Floating Card */}
        <Box
          className="mx-6 max-w-[300px] rounded-[20px] p-4"
          style={{
            backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
          testID="profile-picture-action-sheet"
        >
          {/* Title */}
          <Text
            size="sm"
            className="mb-3 text-center"
            style={{ color: isDark ? '#8E8E93' : '#6C6C70' }}
            accessibilityRole="header"
            testID="profile-picture-action-sheet-title"
          >
            {t('profilePicture.actionSheet.title', 'Change Profile Picture')}
          </Text>

          {/* Action Pills */}
          <VStack space="sm">
            {/* Take Photo */}
            <ActionItem
              icon={<Camera size={iconSize} color={iconColor} />}
              label={t('profilePicture.actionSheet.takePhoto', 'Take Photo')}
              onPress={handleTakePhoto}
              testID="profile-picture-action-take-photo"
            />

            {/* Choose from Library */}
            <ActionItem
              icon={<ImageIcon size={iconSize} color={iconColor} />}
              label={t('profilePicture.actionSheet.chooseFromLibrary', 'Choose from Library')}
              onPress={handleChooseFromLibrary}
              testID="profile-picture-action-choose-library"
            />

            {/* Remove Photo */}
            {showRemoveOption && (
              <ActionItem
                icon={<Trash2 size={iconSize} color="#FF453A" />}
                label={t('profilePicture.actionSheet.removePhoto', 'Remove Photo')}
                onPress={handleRemovePhoto}
                destructive
                testID="profile-picture-action-remove"
              />
            )}
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProfilePictureActionSheet;

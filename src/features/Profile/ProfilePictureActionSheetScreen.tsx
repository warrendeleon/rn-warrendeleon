/**
 * Profile Picture Action Sheet Screen
 *
 * Navigation modal screen for profile picture options.
 * Uses React Navigation's transparentModal presentation.
 *
 * Flow:
 * - Take Photo / Choose from Library: Opens picker directly, then navigates
 *   to Preview on success or resets to EditAccount on cancel
 * - Remove Photo: Navigates back to EditAccount with remove action
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Spinner } from '@app/components/ui/spinner';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import type { RootStackParamList } from '@app/navigation';
import {
  useAppColorScheme,
  useCameraPermission,
  usePhotoLibraryPermission,
} from '@app/shared/hooks';
import {
  openCameraForProfilePicture,
  openLibraryForProfilePicture,
} from '@app/shared/services/media';

type ProfilePictureActionSheetScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfilePictureActionSheet'
>;

type ProfilePictureActionSheetScreenRouteProp = NativeStackScreenProps<
  RootStackParamList,
  'ProfilePictureActionSheet'
>['route'];

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

  // iOS 26 style colours
  const textColor = destructive ? '#FF453A' : isDark ? '#FFFFFF' : '#000000';
  const bgColor = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const pressedBg = isDark ? 'rgba(58, 58, 60, 0.9)' : 'rgba(120, 120, 128, 0.24)';

  return (
    <Pressable
      onPress={onPress}
      className="rounded-[25px] px-5 py-3.5"
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => ({
        minHeight: Platform.OS === 'ios' ? 50 : 48,
        backgroundColor: pressed ? pressedBg : bgColor,
      })}
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

/**
 * Profile Picture Action Sheet Screen
 *
 * Presented as a transparent modal overlay.
 * Passes selected action back to EditAccount via navigation params.
 */
export const ProfilePictureActionSheetScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfilePictureActionSheetScreenNavigationProp>();
  const route = useRoute<ProfilePictureActionSheetScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const [isProcessing, setIsProcessing] = useState(false);

  const { status: cameraStatus, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const { status: libraryStatus, requestPermission: requestLibraryPermission } =
    usePhotoLibraryPermission();

  const { hasExistingPhoto = false } = route.params ?? {};

  const handleDismiss = useCallback(() => {
    if (!isProcessing) navigation.goBack();
  }, [navigation, isProcessing]);

  // Pop back to EditAccount
  const resetToEditAccount = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Check permission status
  const checkPermission = useCallback(
    async (
      currentStatus: string | null,
      requestFn: () => Promise<string | null>,
      allowLimited: boolean
    ): Promise<'granted' | 'denied'> => {
      const isDenied = currentStatus === RESULTS.DENIED || currentStatus === RESULTS.BLOCKED;
      if (isDenied) return 'denied';

      const isGranted = currentStatus === RESULTS.GRANTED;
      const isLimited = allowLimited && currentStatus === RESULTS.LIMITED;
      if (isGranted || isLimited) return 'granted';

      const newStatus = await requestFn();
      const newGranted = newStatus === RESULTS.GRANTED;
      const newLimited = allowLimited && newStatus === RESULTS.LIMITED;
      return newGranted || newLimited ? 'granted' : 'denied';
    },
    []
  );

  // Open picker and handle result
  const openPicker = useCallback(
    async (source: 'camera' | 'library') => {
      setIsProcessing(true);

      // Delay to let modal UI settle before opening native picker
      await new Promise(resolve => setTimeout(resolve, 500));

      const pickerFn =
        source === 'camera' ? openCameraForProfilePicture : openLibraryForProfilePicture;

      let result;
      try {
        result = await pickerFn();
      } catch {
        resetToEditAccount();
        return;
      }

      if (result.success && result.uri) {
        // Navigate to preview, replacing the modal
        navigation.replace('ProfilePicturePreview', { imageUri: result.uri, source });
      } else {
        // Cancelled - reset to EditAccount
        resetToEditAccount();
      }
    },
    [navigation, resetToEditAccount]
  );

  const handleTakePhoto = useCallback(async () => {
    if (isProcessing) return;

    const result = await checkPermission(cameraStatus, requestCameraPermission, false);
    if (result === 'granted') {
      openPicker('camera');
    } else {
      navigation.navigate('PermissionDenied', { permissionType: 'camera' });
    }
  }, [
    isProcessing,
    cameraStatus,
    requestCameraPermission,
    checkPermission,
    openPicker,
    navigation,
  ]);

  const handleChooseFromLibrary = useCallback(async () => {
    if (isProcessing) return;

    const result = await checkPermission(libraryStatus, requestLibraryPermission, true);
    if (result === 'granted') {
      openPicker('library');
    } else {
      navigation.navigate('PermissionDenied', { permissionType: 'photoLibrary' });
    }
  }, [
    isProcessing,
    libraryStatus,
    requestLibraryPermission,
    checkPermission,
    openPicker,
    navigation,
  ]);

  const handleRemovePhoto = useCallback(() => {
    if (isProcessing) return;

    // Set params on the existing EditAccount route and go back
    const state = navigation.getState();
    const editAccountRoute = state.routes.find(r => r.name === 'EditAccount');

    if (editAccountRoute) {
      navigation.dispatch({
        ...CommonActions.setParams({ profilePictureAction: 'remove' }),
        source: editAccountRoute.key,
      });
    }

    navigation.goBack();
  }, [isProcessing, navigation]);

  const iconSize = 20;
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  // Show loading state while processing to hide EditAccount underneath
  if (isProcessing) {
    return (
      <Box
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: isDark ? '#000000' : '#FFFFFF' }}
        testID="profile-picture-action-sheet"
      >
        <Spinner size="large" color={isDark ? '#FFFFFF' : '#0077E6'} />
      </Box>
    );
  }

  return (
    <Box className="flex-1 items-center justify-center">
      {/* Backdrop - tap to dismiss */}
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onPress={handleDismiss}
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
          {hasExistingPhoto && (
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
  );
};

export default ProfilePictureActionSheetScreen;

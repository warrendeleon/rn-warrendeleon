/**
 * Permission Denied Screen
 *
 * Displayed when a permission (camera or photo library) is denied or blocked.
 * Provides instructions and a button to open app settings.
 *
 * Reusable for both camera and photo library permissions via route params.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AlertCircle, Camera, ImageIcon } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Center } from '@app/components/ui/center';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import type { RootStackParamList } from '@app/navigation';
import { AuthScreenWrapper } from '@app/shared/components';
import {
  useAppColorScheme,
  useCameraPermission,
  usePhotoLibraryPermission,
} from '@app/shared/hooks';

type PermissionDeniedScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PermissionDenied'
>;

type PermissionDeniedScreenRouteProp = NativeStackScreenProps<
  RootStackParamList,
  'PermissionDenied'
>['route'];

/** Permission type for the denied screen */
export type PermissionType = 'camera' | 'photoLibrary';

/**
 * Permission Denied Screen
 *
 * Shows when camera or photo library permission is denied/blocked.
 * Provides a button to open app settings where users can grant permission.
 */
export const PermissionDeniedScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<PermissionDeniedScreenNavigationProp>();
  const route = useRoute<PermissionDeniedScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const permissionType = route.params?.permissionType ?? 'camera';

  const cameraPermission = useCameraPermission();
  const photoLibraryPermission = usePhotoLibraryPermission();

  // iOS 26 style colours
  const pillBg = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const primaryButtonBg = '#0066FF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtleTextColor = isDark ? '#8E8E93' : '#6C6C70';
  const errorBgColor = isDark ? 'rgba(220, 38, 38, 0.2)' : 'rgba(220, 38, 38, 0.1)';

  // Use appropriate permission hook based on type
  const openAppSettings =
    permissionType === 'camera'
      ? cameraPermission.openAppSettings
      : photoLibraryPermission.openAppSettings;

  const handleOpenSettings = useCallback(async () => {
    await openAppSettings();
  }, [openAppSettings]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Content based on permission type
  const isCamera = permissionType === 'camera';

  const title = isCamera
    ? t('permissions.denied.camera.title', 'Camera Access Required')
    : t('permissions.denied.photoLibrary.title', 'Photo Library Access Required');

  const description = isCamera
    ? t(
        'permissions.denied.camera.description',
        'Camera access has been denied. To take a profile photo, please enable camera access in your device settings.'
      )
    : t(
        'permissions.denied.photoLibrary.description',
        'Photo library access has been denied. To choose a profile photo, please enable photo access in your device settings.'
      );

  const settingsInstructions = Platform.select({
    ios: t(
      'permissions.denied.instructions.ios',
      'Go to Settings > Privacy > [Permission] and enable access for this app.'
    ).replace('[Permission]', isCamera ? 'Camera' : 'Photos'),
    android: t(
      'permissions.denied.instructions.android',
      'Go to Settings > Apps > [App Name] > Permissions and enable [Permission].'
    ).replace('[Permission]', isCamera ? 'Camera' : 'Storage'),
    default: '',
  });

  const IconComponent = isCamera ? Camera : ImageIcon;

  return (
    <AuthScreenWrapper testID="permission-denied-screen">
      <VStack className="flex-1 px-6">
        {/* Content area - centered */}
        <VStack className="flex-1 items-center justify-center" space="xl">
          {/* Icon */}
          <Box className="relative" accessibilityElementsHidden>
            <Center
              className="h-[120px] w-[120px] rounded-[60px]"
              style={{ backgroundColor: errorBgColor }}
            >
              <IconComponent size={56} color="#DC2626" strokeWidth={1.5} />
            </Center>
            {/* Alert badge */}
            <Box
              className="absolute bottom-0 right-0 rounded-[16px] border-[3px] p-1.5"
              style={{ backgroundColor: '#DC2626', borderColor: isDark ? '#000000' : '#FFFFFF' }}
            >
              <AlertCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Box>
          </Box>

          {/* Title */}
          <Text
            className="text-center text-2xl font-bold"
            style={{ color: textColor }}
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* Description */}
          <Text className="text-center text-base leading-[24px]" style={{ color: subtleTextColor }}>
            {description}
          </Text>

          {/* Instructions */}
          <Box className="w-full rounded-[16px] p-4" style={{ backgroundColor: pillBg }}>
            <Text className="text-center text-sm" style={{ color: subtleTextColor }}>
              {settingsInstructions}
            </Text>
          </Box>
        </VStack>

        {/* Buttons - fixed at bottom */}
        <VStack space="sm" className="w-full pb-8 pt-4">
          {/* Open Settings Button - Primary */}
          <Pressable
            onPress={handleOpenSettings}
            className="rounded-[25px] py-3.5"
            style={{ backgroundColor: primaryButtonBg, minHeight: Platform.OS === 'ios' ? 50 : 48 }}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.denied.openSettings', 'Open Settings')}
            accessibilityHint={t(
              'permissions.denied.openSettingsHint',
              'Opens your device settings where you can enable permission'
            )}
            testID="permission-denied-settings-button"
          >
            <Center>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {t('permissions.denied.openSettings', 'Open Settings')}
              </Text>
            </Center>
          </Pressable>

          {/* Go Back Button - Secondary */}
          <Pressable
            onPress={handleGoBack}
            className="rounded-[25px] py-3.5"
            style={{ backgroundColor: pillBg, minHeight: Platform.OS === 'ios' ? 50 : 48 }}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.denied.goBack', 'Go Back')}
            accessibilityHint={t('permissions.denied.goBackHint', 'Returns to the previous screen')}
            testID="permission-denied-back-button"
          >
            <Center>
              <Text className="text-base font-medium" style={{ color: textColor }}>
                {t('permissions.denied.goBack', 'Go Back')}
              </Text>
            </Center>
          </Pressable>
        </VStack>
      </VStack>
    </AuthScreenWrapper>
  );
};

export default PermissionDeniedScreen;

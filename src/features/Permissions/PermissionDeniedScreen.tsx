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
import { Box, Center, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AlertCircle, Camera, ImageIcon } from 'lucide-react-native';

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
      <VStack flex={1} px="$6">
        {/* Content area - centered */}
        <VStack flex={1} justifyContent="center" alignItems="center" space="xl">
          {/* Icon */}
          <Box position="relative" accessibilityElementsHidden>
            <Center w={120} h={120} borderRadius={60} bg={errorBgColor}>
              <IconComponent size={56} color="#DC2626" strokeWidth={1.5} />
            </Center>
            {/* Alert badge */}
            <Box
              position="absolute"
              bottom={0}
              right={0}
              bg="#DC2626"
              borderRadius={16}
              p="$1.5"
              borderWidth={3}
              borderColor={isDark ? '#000000' : '#FFFFFF'}
            >
              <AlertCircle size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Box>
          </Box>

          {/* Title */}
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            textAlign="center"
            color={textColor}
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* Description */}
          <Text fontSize="$md" textAlign="center" color={subtleTextColor} lineHeight={24}>
            {description}
          </Text>

          {/* Instructions */}
          <Box bg={pillBg} p="$4" borderRadius={16} w="$full">
            <Text fontSize="$sm" color={subtleTextColor} textAlign="center">
              {settingsInstructions}
            </Text>
          </Box>
        </VStack>

        {/* Buttons - fixed at bottom */}
        <VStack space="sm" w="$full" pb="$8" pt="$4">
          {/* Open Settings Button - Primary */}
          <Pressable
            onPress={handleOpenSettings}
            bg={primaryButtonBg}
            py="$3.5"
            borderRadius={25}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.denied.openSettings', 'Open Settings')}
            accessibilityHint={t(
              'permissions.denied.openSettingsHint',
              'Opens your device settings where you can enable permission'
            )}
            testID="permission-denied-settings-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$semibold" color="#FFFFFF">
                {t('permissions.denied.openSettings', 'Open Settings')}
              </Text>
            </Center>
          </Pressable>

          {/* Go Back Button - Secondary */}
          <Pressable
            onPress={handleGoBack}
            bg={pillBg}
            py="$3.5"
            borderRadius={25}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.denied.goBack', 'Go Back')}
            accessibilityHint={t('permissions.denied.goBackHint', 'Returns to the previous screen')}
            testID="permission-denied-back-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$medium" color={textColor}>
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

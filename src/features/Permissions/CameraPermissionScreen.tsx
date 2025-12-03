/**
 * Camera Permission Screen
 *
 * GDPR-compliant pre-permission explanation screen for camera access.
 * Shows users why camera permission is needed before triggering the native prompt.
 *
 * Displayed when:
 * - User taps "Take Photo" for profile picture
 * - Camera permission has not been requested yet
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Box, Center, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'lucide-react-native';

import type { RootStackParamList } from '@app/navigation';
import { AuthScreenWrapper } from '@app/shared/components';
import { useAppColorScheme, useCameraPermission } from '@app/shared/hooks';

type CameraPermissionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CameraPermission'
>;

export interface CameraPermissionScreenProps {
  /** Callback when permission is granted */
  onPermissionGranted?: () => void;
}

/**
 * Camera Permission Screen
 *
 * Pre-permission explanation screen following GDPR/UK DPA 2018 guidelines.
 * Explains why camera access is needed before requesting permission.
 */
export const CameraPermissionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<CameraPermissionScreenNavigationProp>();
  const { requestPermission } = useCameraPermission();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // iOS 26 style colours
  const pillBg = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const primaryButtonBg = '#0066FF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtleTextColor = isDark ? '#8E8E93' : '#6C6C70';
  const iconBgColor = isDark ? 'rgba(0, 102, 255, 0.2)' : 'rgba(0, 102, 255, 0.1)';

  const handleContinue = useCallback(async () => {
    const status = await requestPermission();

    if (status === 'granted') {
      // Permission granted - navigate back to EditAccount
      // The calling screen will handle opening the camera
      navigation.goBack();
    } else if (status === 'denied' || status === 'blocked') {
      // Permission denied - navigate to PermissionDenied screen
      navigation.replace('PermissionDenied', { permissionType: 'camera' });
    }
  }, [requestPermission, navigation]);

  const handleSkip = useCallback(() => {
    // User chose to skip - go back without requesting
    navigation.goBack();
  }, [navigation]);

  return (
    <AuthScreenWrapper testID="camera-permission-screen">
      <VStack flex={1} px="$6">
        {/* Content area - centered */}
        <VStack flex={1} justifyContent="center" alignItems="center" space="xl">
          {/* Icon */}
          <Center w={120} h={120} borderRadius={60} bg={iconBgColor} accessibilityElementsHidden>
            <Camera size={56} color="#0066FF" strokeWidth={1.5} />
          </Center>

          {/* Title */}
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            textAlign="center"
            color={textColor}
            accessibilityRole="header"
          >
            {t('permissions.camera.title', 'Camera Access Required')}
          </Text>

          {/* Description */}
          <Text fontSize="$md" textAlign="center" color={subtleTextColor} lineHeight={24}>
            {t(
              'permissions.camera.description',
              'To take a profile photo, we need access to your camera.'
            )}
          </Text>

          {/* Usage points */}
          <VStack space="sm" w="$full" px="$4">
            <Text fontSize="$sm" color={subtleTextColor}>
              {t('permissions.camera.usage.takePhoto', '• Take a photo for your profile')}
            </Text>
            <Text fontSize="$sm" color={subtleTextColor}>
              {t(
                'permissions.camera.usage.localProcessing',
                '• Face detection happens on your device only'
              )}
            </Text>
            <Text fontSize="$sm" color={subtleTextColor}>
              {t(
                'permissions.camera.usage.noStorage',
                '• Photos are not stored without your consent'
              )}
            </Text>
          </VStack>

          {/* Privacy notice */}
          <Box bg={pillBg} p="$4" borderRadius={16} w="$full">
            <Text fontSize="$xs" color={subtleTextColor} textAlign="center">
              {t(
                'permissions.camera.privacy',
                'Your photo stays on your phone until you save it. Face detection happens locally, not on our servers. Nothing leaves your device until you tap Save.'
              )}
            </Text>
          </Box>
        </VStack>

        {/* Buttons - fixed at bottom */}
        <VStack space="sm" w="$full" pb="$8" pt="$4">
          {/* Continue Button - Primary */}
          <Pressable
            onPress={handleContinue}
            bg={primaryButtonBg}
            py="$3.5"
            borderRadius={25}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.camera.continue', 'Continue')}
            accessibilityHint={t(
              'permissions.camera.continueHint',
              'Requests camera permission from your device'
            )}
            testID="camera-permission-continue-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$semibold" color="#FFFFFF">
                {t('permissions.camera.continue', 'Continue')}
              </Text>
            </Center>
          </Pressable>

          {/* Skip Button - Secondary */}
          <Pressable
            onPress={handleSkip}
            py="$3.5"
            borderRadius={25}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.camera.skip', 'Skip for now')}
            accessibilityHint={t(
              'permissions.camera.skipHint',
              'Returns to the previous screen without requesting camera access'
            )}
            testID="camera-permission-skip-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$medium" color={subtleTextColor}>
                {t('permissions.camera.skip', 'Skip for now')}
              </Text>
            </Center>
          </Pressable>
        </VStack>
      </VStack>
    </AuthScreenWrapper>
  );
};

export default CameraPermissionScreen;

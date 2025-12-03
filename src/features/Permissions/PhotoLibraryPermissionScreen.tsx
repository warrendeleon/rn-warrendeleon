/**
 * Photo Library Permission Screen
 *
 * GDPR-compliant pre-permission explanation screen for photo library access.
 * Shows users why photo library permission is needed before triggering the native prompt.
 *
 * Displayed when:
 * - User taps "Choose from Library" for profile picture
 * - Photo library permission has not been requested yet
 *
 * Note: iOS 14+ LIMITED access is acceptable and treated as granted.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Box, Center, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageIcon } from 'lucide-react-native';

import type { RootStackParamList } from '@app/navigation';
import { AuthScreenWrapper } from '@app/shared/components';
import { useAppColorScheme, usePhotoLibraryPermission } from '@app/shared/hooks';

type PhotoLibraryPermissionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhotoLibraryPermission'
>;

/**
 * Photo Library Permission Screen
 *
 * Pre-permission explanation screen following GDPR/UK DPA 2018 guidelines.
 * Explains why photo library access is needed before requesting permission.
 */
export const PhotoLibraryPermissionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<PhotoLibraryPermissionScreenNavigationProp>();
  const { requestPermission } = usePhotoLibraryPermission();
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

    // iOS LIMITED is acceptable for profile picture selection
    if (status === 'granted' || status === 'limited') {
      // Permission granted (or limited on iOS) - navigate back
      // The calling screen will handle opening the photo picker
      navigation.goBack();
    } else if (status === 'denied' || status === 'blocked') {
      // Permission denied - navigate to PermissionDenied screen
      navigation.replace('PermissionDenied', { permissionType: 'photoLibrary' });
    }
  }, [requestPermission, navigation]);

  const handleSkip = useCallback(() => {
    // User chose to skip - go back without requesting
    navigation.goBack();
  }, [navigation]);

  return (
    <AuthScreenWrapper testID="photo-library-permission-screen">
      <VStack flex={1} px="$6">
        {/* Content area - centered */}
        <VStack flex={1} justifyContent="center" alignItems="center" space="xl">
          {/* Icon */}
          <Center w={120} h={120} borderRadius={60} bg={iconBgColor} accessibilityElementsHidden>
            <ImageIcon size={56} color="#0066FF" strokeWidth={1.5} />
          </Center>

          {/* Title */}
          <Text
            fontSize="$2xl"
            fontWeight="$bold"
            textAlign="center"
            color={textColor}
            accessibilityRole="header"
          >
            {t('permissions.photoLibrary.title', 'Photo Library Access Required')}
          </Text>

          {/* Description */}
          <Text fontSize="$md" textAlign="center" color={subtleTextColor} lineHeight={24}>
            {t(
              'permissions.photoLibrary.description',
              'To choose a profile photo, we need access to your photo library.'
            )}
          </Text>

          {/* Usage points */}
          <VStack space="sm" w="$full" px="$4">
            <Text fontSize="$sm" color={subtleTextColor}>
              {t(
                'permissions.photoLibrary.usage.selectPhoto',
                '• Select a photo from your library'
              )}
            </Text>
            <Text fontSize="$sm" color={subtleTextColor}>
              {t(
                'permissions.photoLibrary.usage.localProcessing',
                '• Face detection happens on your device only'
              )}
            </Text>
            {Platform.OS === 'ios' && (
              <Text fontSize="$sm" color={subtleTextColor}>
                {t(
                  'permissions.photoLibrary.usage.limitedAccess',
                  '• You can grant access to specific photos only'
                )}
              </Text>
            )}
          </VStack>

          {/* Privacy notice */}
          <Box bg={pillBg} p="$4" borderRadius={16} w="$full">
            <Text fontSize="$xs" color={subtleTextColor} textAlign="center">
              {t(
                'permissions.photoLibrary.privacy',
                'We never see your other photos. We only get the one you pick. Face detection happens on your phone, not our servers. Nothing leaves your device until you tap Save.'
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
            accessibilityLabel={t('permissions.photoLibrary.continue', 'Continue')}
            accessibilityHint={t(
              'permissions.photoLibrary.continueHint',
              'Requests photo library permission from your device'
            )}
            testID="photo-library-permission-continue-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$semibold" color="#FFFFFF">
                {t('permissions.photoLibrary.continue', 'Continue')}
              </Text>
            </Center>
          </Pressable>

          {/* Skip Button - Secondary */}
          <Pressable
            onPress={handleSkip}
            py="$3.5"
            borderRadius={25}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.photoLibrary.skip', 'Skip for now')}
            accessibilityHint={t(
              'permissions.photoLibrary.skipHint',
              'Returns to the previous screen without requesting photo library access'
            )}
            testID="photo-library-permission-skip-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text fontSize="$md" fontWeight="$medium" color={subtleTextColor}>
                {t('permissions.photoLibrary.skip', 'Skip for now')}
              </Text>
            </Center>
          </Pressable>
        </VStack>
      </VStack>
    </AuthScreenWrapper>
  );
};

export default PhotoLibraryPermissionScreen;

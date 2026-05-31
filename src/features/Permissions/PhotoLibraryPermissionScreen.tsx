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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageIcon } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Center } from '@app/components/ui/center';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
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
      <VStack className="flex-1 px-6">
        {/* Content area - centered */}
        <VStack className="flex-1 items-center justify-center" space="xl">
          {/* Icon */}
          <Center
            className="h-[120px] w-[120px] rounded-[60px]"
            style={{ backgroundColor: iconBgColor }}
            accessibilityElementsHidden
          >
            <ImageIcon size={56} color="#0066FF" strokeWidth={1.5} />
          </Center>

          {/* Title */}
          <Text
            className="text-center text-2xl font-bold"
            style={{ color: textColor }}
            accessibilityRole="header"
          >
            {t('permissions.photoLibrary.title', 'Photo Library Access Required')}
          </Text>

          {/* Description */}
          <Text className="text-center text-base leading-[24px]" style={{ color: subtleTextColor }}>
            {t(
              'permissions.photoLibrary.description',
              'To choose a profile photo, we need access to your photo library.'
            )}
          </Text>

          {/* Usage points */}
          <VStack space="sm" className="w-full px-4">
            <Text className="text-sm" style={{ color: subtleTextColor }}>
              {t(
                'permissions.photoLibrary.usage.selectPhoto',
                '• Select a photo from your library'
              )}
            </Text>
            <Text className="text-sm" style={{ color: subtleTextColor }}>
              {t(
                'permissions.photoLibrary.usage.localProcessing',
                '• Face detection happens on your device only'
              )}
            </Text>
            {Platform.OS === 'ios' && (
              <Text className="text-sm" style={{ color: subtleTextColor }}>
                {t(
                  'permissions.photoLibrary.usage.limitedAccess',
                  '• You can grant access to specific photos only'
                )}
              </Text>
            )}
          </VStack>

          {/* Privacy notice */}
          <Box className="w-full rounded-[16px] p-4" style={{ backgroundColor: pillBg }}>
            <Text className="text-center text-xs" style={{ color: subtleTextColor }}>
              {t(
                'permissions.photoLibrary.privacy',
                'We never see your other photos. We only get the one you pick. Face detection happens on your phone, not our servers. Nothing leaves your device until you tap Save.'
              )}
            </Text>
          </Box>
        </VStack>

        {/* Buttons - fixed at bottom */}
        <VStack space="sm" className="w-full pb-8 pt-4">
          {/* Continue Button - Primary */}
          <Pressable
            onPress={handleContinue}
            className="rounded-[25px] py-3.5"
            style={{ backgroundColor: primaryButtonBg, minHeight: Platform.OS === 'ios' ? 50 : 48 }}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.photoLibrary.continue', 'Continue')}
            accessibilityHint={t(
              'permissions.photoLibrary.continueHint',
              'Requests photo library permission from your device'
            )}
            testID="photo-library-permission-continue-button"
          >
            <Center>
              <Text className="text-base font-semibold" style={{ color: '#FFFFFF' }}>
                {t('permissions.photoLibrary.continue', 'Continue')}
              </Text>
            </Center>
          </Pressable>

          {/* Skip Button - Secondary */}
          <Pressable
            onPress={handleSkip}
            className="rounded-[25px] py-3.5"
            style={{ minHeight: Platform.OS === 'ios' ? 50 : 48 }}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.photoLibrary.skip', 'Skip for now')}
            accessibilityHint={t(
              'permissions.photoLibrary.skipHint',
              'Returns to the previous screen without requesting photo library access'
            )}
            testID="photo-library-permission-skip-button"
          >
            <Center>
              <Text className="text-base font-medium" style={{ color: subtleTextColor }}>
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

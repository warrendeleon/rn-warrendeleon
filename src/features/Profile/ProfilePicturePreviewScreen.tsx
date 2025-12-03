/**
 * Profile Picture Preview Screen
 *
 * iOS-native style preview screen for selected profile picture.
 * Displays image with subtle face validation status.
 *
 * States:
 * - Validating: Face detection in progress
 * - Valid: Face detected, can save
 * - Invalid: No face / multiple faces / error
 */

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Box, Center, HStack, Image, Pressable, Spinner, Text, VStack } from '@gluestack-ui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AlertCircle, CheckCircle, ChevronLeft, Loader } from 'lucide-react-native';

import { selectUser } from '@app/features/Auth';
import { SupabaseStorageClient } from '@app/httpClients/SupabaseStorageClient';
import type { RootStackParamList } from '@app/navigation';
import { AuthScreenWrapper, useToast } from '@app/shared/components';
import { useAppColorScheme } from '@app/shared/hooks';
import {
  openCameraForProfilePicture,
  openLibraryForProfilePicture,
  type ProfilePictureValidationResult,
  validateProfilePicture,
} from '@app/shared/services/media';
import { useAppSelector } from '@app/store';

type ProfilePicturePreviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfilePicturePreview'
>;

type ProfilePicturePreviewScreenRouteProp = NativeStackScreenProps<
  RootStackParamList,
  'ProfilePicturePreview'
>['route'];

type ValidationState = 'validating' | 'valid' | 'invalid';

/**
 * Profile Picture Preview Screen
 *
 * Shows the selected image and validates it has a face.
 * Uses iOS-native styling with pill-shaped buttons.
 */
export const ProfilePicturePreviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfilePicturePreviewScreenNavigationProp>();
  const route = useRoute<ProfilePicturePreviewScreenRouteProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAppSelector(selectUser);
  const { showToast } = useToast();

  const { imageUri, source } = route.params;

  const [validationState, setValidationState] = useState<ValidationState>('validating');
  const [validationResult, setValidationResult] = useState<ProfilePictureValidationResult | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // iOS-style colours
  const cardBg = isDark ? 'rgba(44, 44, 46, 0.8)' : 'rgba(120, 120, 128, 0.16)';
  const primaryButtonBg = '#0066FF';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const subtleTextColor = isDark ? '#8E8E93' : '#6C6C70';

  // Validate face on mount
  useEffect(() => {
    setValidationState('validating');
    validateProfilePicture(imageUri).then(result => {
      setValidationResult(result);
      setValidationState(result.isValid ? 'valid' : 'invalid');
    });
  }, [imageUri]);

  const handleSave = useCallback(async () => {
    if (!imageUri || !user?.id) return;

    setIsSaving(true);

    try {
      // Upload to Supabase Storage (handles E2E mocking internally)
      // Note: Old picture cleanup is handled by backend trigger + scheduled Edge Function
      const result = await SupabaseStorageClient.uploadProfilePicture(user.id, imageUri);

      if (result.success && result.publicUrl) {
        // Set params on the existing EditAccount route and go back
        const state = navigation.getState();
        const editAccountRoute = state.routes.find(r => r.name === 'EditAccount');

        if (editAccountRoute) {
          navigation.dispatch({
            ...CommonActions.setParams({ selectedImageUri: result.publicUrl }),
            source: editAccountRoute.key,
          });
        }

        navigation.goBack();
      } else {
        // Show error toast
        showToast({
          message: result.error || t('profilePicture.uploadError', 'Failed to upload photo'),
          type: 'error',
          testID: 'upload-error-toast',
        });
        setIsSaving(false);
      }
    } catch {
      showToast({
        message: t('profilePicture.uploadError', 'Failed to upload photo'),
        type: 'error',
        testID: 'upload-error-toast',
      });
      setIsSaving(false);
    }
  }, [imageUri, user?.id, navigation, t, showToast]);

  const handleRetry = useCallback(async () => {
    // Open the same picker (camera or library) that was used before
    const pickerFn =
      source === 'camera' ? openCameraForProfilePicture : openLibraryForProfilePicture;

    const result = await pickerFn();

    if (result.success && result.uri) {
      // Replace current screen with new preview
      navigation.replace('ProfilePicturePreview', { imageUri: result.uri, source });
    } else {
      // Cancelled - pop back to EditAccount
      navigation.goBack();
    }
  }, [navigation, source]);

  // Back button and "Try Different Photo" both reopen the picker
  // Cancelling the picker exits to EditAccount
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerLeft: () => (
        <Pressable
          onPress={handleRetry}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('common.back', 'Back')}
          ml="$1"
        >
          <ChevronLeft size={28} color={isDark ? '#FFFFFF' : '#007AFF'} />
        </Pressable>
      ),
    });
  }, [navigation, handleRetry, isDark, t]);

  const renderValidationStatus = () => {
    const iconSize = 18;

    switch (validationState) {
      case 'validating':
        return (
          <HStack alignItems="center" justifyContent="center" space="sm">
            <Loader size={iconSize} color={subtleTextColor} />
            <Text size="sm" color={subtleTextColor}>
              {t('profilePicture.preview.validating', 'Checking photo...')}
            </Text>
          </HStack>
        );

      case 'valid':
        return (
          <HStack alignItems="center" justifyContent="center" space="sm">
            <CheckCircle size={iconSize} color="#34C759" />
            <Text size="sm" color="#34C759">
              {t('profilePicture.preview.faceDetected', 'Face detected')}
            </Text>
          </HStack>
        );

      case 'invalid':
        return (
          <HStack alignItems="center" justifyContent="center" space="sm">
            <AlertCircle size={iconSize} color="#FF453A" />
            <Text size="sm" color="#FF453A">
              {validationResult?.message || t('profilePicture.preview.noFace', 'No face detected')}
            </Text>
          </HStack>
        );
    }
  };

  return (
    <AuthScreenWrapper testID="profile-picture-preview-screen">
      <VStack flex={1} px="$6" pt="$4" pb="$8">
        {/* Image Preview - Larger, clean circle */}
        <Center flex={1}>
          <Box
            borderRadius={150}
            overflow="hidden"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            elevation={4}
          >
            <Image
              source={{ uri: imageUri }}
              alt={t('profilePicture.preview.imageAlt', 'Selected profile picture')}
              w={280}
              h={280}
              borderRadius={140}
              testID="profile-picture-preview-image"
            />
          </Box>
        </Center>

        {/* Validation Status - Subtle, centered text */}
        <Box py="$4">{renderValidationStatus()}</Box>

        {/* iOS-style pill buttons */}
        <VStack space="sm" px="$2">
          {validationState === 'valid' && (
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              bg={primaryButtonBg}
              py="$3.5"
              px="$6"
              borderRadius={25}
              opacity={isSaving ? 0.6 : 1}
              accessibilityRole="button"
              accessibilityLabel={t('profilePicture.preview.save', 'Save')}
              accessibilityHint={t(
                'profilePicture.preview.saveHint',
                'Saves this photo as your profile picture'
              )}
              testID="profile-picture-preview-save-button"
              minHeight={Platform.OS === 'ios' ? 50 : 48}
            >
              <Center>
                {isSaving ? (
                  <Spinner size="small" color="#FFFFFF" />
                ) : (
                  <Text size="md" fontWeight="$semibold" color="#FFFFFF">
                    {t('profilePicture.preview.save', 'Save')}
                  </Text>
                )}
              </Center>
            </Pressable>
          )}

          <Pressable
            onPress={handleRetry}
            disabled={isSaving}
            bg={cardBg}
            py="$3.5"
            px="$6"
            borderRadius={25}
            opacity={isSaving ? 0.6 : 1}
            accessibilityRole="button"
            accessibilityLabel={t('profilePicture.preview.retry', 'Choose Different Photo')}
            accessibilityHint={t(
              'profilePicture.preview.retryHint',
              'Returns to select a different photo'
            )}
            testID="profile-picture-preview-retry-button"
            minHeight={Platform.OS === 'ios' ? 50 : 48}
          >
            <Center>
              <Text size="md" fontWeight="$medium" color={textColor}>
                {validationState === 'invalid'
                  ? t('profilePicture.preview.tryAgain', 'Try Different Photo')
                  : t('profilePicture.preview.chooseDifferent', 'Choose Different Photo')}
              </Text>
            </Center>
          </Pressable>
        </VStack>
      </VStack>
    </AuthScreenWrapper>
  );
};

export default ProfilePicturePreviewScreen;

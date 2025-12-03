/**
 * Profile Picture Section
 *
 * Avatar display with edit button for the Edit Account screen.
 * Shows user's profile picture or initials fallback.
 * Tapping navigates to the action sheet screen.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  Box,
  Pressable,
  Text,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, Pencil } from 'lucide-react-native';

import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';

type ProfilePictureSectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditAccount'
>;

export interface ProfilePictureSectionProps {
  /** User's display name for fallback initials */
  displayName: string;
  /** Current profile picture URL (if any) */
  profilePictureUrl?: string | null;
  /** Whether the section is in a loading state */
  isLoading?: boolean;
}

/**
 * Profile Picture Section
 *
 * Displays user's avatar with an edit button.
 * Tapping opens the action sheet screen for camera/library/remove options.
 *
 * @example
 * ```tsx
 * <ProfilePictureSection
 *   displayName="John Doe"
 *   profilePictureUrl={user.profilePictureUrl}
 * />
 * ```
 */
export const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  displayName,
  profilePictureUrl,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfilePictureSectionNavigationProp>();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAvatarPress = useCallback(() => {
    if (!isLoading) {
      // Navigate to action sheet screen (transparent modal)
      navigation.navigate('ProfilePictureActionSheet', {
        hasExistingPhoto: !!profilePictureUrl,
      });
    }
  }, [isLoading, navigation, profilePictureUrl]);

  return (
    <Box alignItems="center" pt="$2" pb="$4" testID="profile-picture-section">
      {/* Avatar with edit button */}
      <Pressable
        onPress={handleAvatarPress}
        accessibilityRole="button"
        accessibilityLabel={t('profilePicture.editButton', 'Edit profile picture')}
        accessibilityHint={t(
          'profilePicture.editButtonHint',
          'Opens options to change your profile picture'
        )}
        testID="profile-picture-edit-button"
        disabled={isLoading}
        opacity={isLoading ? 0.5 : 1}
      >
        <Box position="relative">
          {/* Avatar */}
          <Avatar size="2xl" bg="$primary500" borderRadius="$full">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} alt={displayName} />
            ) : (
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
            )}
          </Avatar>

          {/* Edit badge */}
          <Box
            position="absolute"
            bottom={0}
            right={0}
            bg={isDark ? '$backgroundDark700' : '$white'}
            borderRadius="$full"
            p="$2"
            borderWidth={2}
            borderColor={isDark ? '$backgroundDark900' : '$coolGray100'}
            accessibilityElementsHidden
          >
            {profilePictureUrl ? (
              <Pencil size={16} color="#0066FF" />
            ) : (
              <Camera size={16} color="#0066FF" />
            )}
          </Box>
        </Box>
      </Pressable>

      {/* Helper text */}
      <Text
        size="sm"
        color="$textLight500"
        mt="$2"
        accessibilityLabel={t('profilePicture.tapToChange', 'Tap to change')}
      >
        {t('profilePicture.tapToChange', 'Tap to change')}
      </Text>
    </Box>
  );
};

export default ProfilePictureSection;

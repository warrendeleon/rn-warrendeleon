/**
 * Profile Picture Section
 *
 * Avatar display with edit button for the Edit Account screen.
 * Shows user's profile picture or initials fallback.
 * Tapping navigates to the action sheet screen.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, Pencil } from 'lucide-react-native';

import { Avatar, AvatarFallbackText, AvatarImage } from '@app/components/ui/avatar';
import { Box } from '@app/components/ui/box';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
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
    <Box className="items-center pb-4 pt-2" testID="profile-picture-section">
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
        style={{ opacity: isLoading ? 0.5 : 1 }}
      >
        <Box className="relative">
          {/* Avatar */}
          <Avatar size="2xl" className="rounded-full bg-primary-500">
            {profilePictureUrl ? (
              <AvatarImage source={{ uri: profilePictureUrl }} alt={displayName} />
            ) : (
              <AvatarFallbackText>{displayName}</AvatarFallbackText>
            )}
          </Avatar>

          {/* Edit badge */}
          <Box
            className="absolute bottom-0 right-0 rounded-full border-2 p-2"
            style={{
              backgroundColor: isDark ? '#525252' : '#FFFFFF',
              borderColor: isDark ? '#262626' : '#f3f4f6',
            }}
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
        className="mt-2 text-[#6B6B6B]"
        accessibilityLabel={t('profilePicture.tapToChange', 'Tap to change')}
      >
        {t('profilePicture.tapToChange', 'Tap to change')}
      </Text>
    </Box>
  );
};

export default ProfilePictureSection;

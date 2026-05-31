import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { HStack } from '@app/components/ui/hstack';
import { Image } from '@app/components/ui/image';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { type GroupVariant, groupVariantRadius } from '@app/shared/components/shared';
import { useAppColorScheme } from '@app/shared/hooks';

export interface UserCardProps {
  /** User's first name */
  firstName: string | null;
  /** User's last name */
  lastName: string | null;
  /** User's email address */
  email: string | null;
  /** Profile picture URL (optional) */
  profilePictureUri?: string | null;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** For grouped list styling */
  groupVariant?: GroupVariant;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Pure helper that computes themed styles for UserCard.
 */
export const getUserCardStyles = (scheme: 'light' | 'dark', groupVariant: GroupVariant) => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '#262626' : '#FFFFFF';
  const nameColor = isDark ? '#FFFFFF' : '#000000';
  const emailColor = isDark ? '#A3A3A3' : '#6B6B6B';
  const avatarBg = isDark ? '#525252' : '#e5e7eb';
  const initialsColor = isDark ? '#D4D4D4' : '#737373';
  const chevronColor = isDark ? '#A3A3A3' : '#6B6B6B';

  const { top, bottom } = groupVariantRadius[groupVariant];

  return { bg, nameColor, emailColor, avatarBg, initialsColor, chevronColor, top, bottom };
};

/**
 * UserCard Component
 *
 * Displays user profile information with avatar initials, name, and email.
 * Used in Settings for the account section.
 *
 * @example
 * ```tsx
 * <UserCard
 *   firstName="Warren"
 *   lastName="de Leon"
 *   email="warren@example.com"
 *   onPress={handleEditProfile}
 * />
 * ```
 */
export const UserCard = React.memo<UserCardProps>(
  ({
    firstName,
    lastName,
    email,
    profilePictureUri,
    onPress,
    groupVariant = 'single',
    testID = 'user-card',
  }) => {
    const scheme = useAppColorScheme();

    const { bg, nameColor, emailColor, avatarBg, initialsColor, chevronColor, top, bottom } =
      getUserCardStyles(scheme, groupVariant);

    const fullName = useMemo(() => {
      const parts = [firstName, lastName].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : 'User';
    }, [firstName, lastName]);

    const initials = useMemo(() => {
      const first = firstName?.charAt(0) || '';
      const last = lastName?.charAt(0) || '';
      const result = (first + last).toUpperCase();
      return result.length > 0 ? result : 'U';
    }, [firstName, lastName]);

    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`Account for ${fullName}`}
        accessibilityHint="Opens account settings"
        className="w-full flex-row items-center justify-between px-4 py-3"
        style={{
          backgroundColor: bg,
          borderTopLeftRadius: top,
          borderTopRightRadius: top,
          borderBottomLeftRadius: bottom,
          borderBottomRightRadius: bottom,
        }}
      >
        <HStack space="md" className="flex-1 items-center">
          {/* Avatar with profile picture or initials */}
          <Box
            testID="user-card-avatar"
            className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: avatarBg }}
          >
            {profilePictureUri ? (
              <Image
                size="none"
                source={{ uri: profilePictureUri }}
                alt={fullName}
                className="h-12 w-12 rounded-[24px]"
                testID="user-card-profile-picture"
              />
            ) : (
              <Text
                testID="user-card-initials"
                className="text-lg font-semibold"
                style={{ color: initialsColor }}
              >
                {initials}
              </Text>
            )}
          </Box>

          {/* User info */}
          <VStack className="flex-1">
            <Text
              testID="user-card-name"
              className="text-base font-semibold"
              style={{ color: nameColor }}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {email && (
              <Text
                testID="user-card-email"
                className="mt-0.5 text-sm"
                style={{ color: emailColor }}
                numberOfLines={1}
              >
                {email}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Chevron */}
        {onPress && <ChevronRight color={chevronColor} size={20} />}
      </Pressable>
    );
  }
);

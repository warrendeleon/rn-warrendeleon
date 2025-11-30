import React, { useMemo } from 'react';
import { Box, ChevronRightIcon, HStack, Icon, Pressable, Text, VStack } from '@gluestack-ui/themed';

import { type GroupVariant, groupVariantRadius } from '@app/components/shared';
import { useAppColorScheme } from '@app/hooks';

export interface UserCardProps {
  /** User's first name */
  firstName: string | null;
  /** User's last name */
  lastName: string | null;
  /** User's email address */
  email: string | null;
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

  const bg = isDark ? '$backgroundDark900' : '$white';
  const nameColor = isDark ? '$white' : '$black';
  const emailColor = isDark ? '$textLight400' : '$textLight500';
  const avatarBg = isDark ? '$backgroundDark700' : '$coolGray200';
  const initialsColor = isDark ? '$textLight300' : '$textLight600';
  const chevronColor = isDark ? '$textLight400' : '$textLight500';

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
  ({ firstName, lastName, email, onPress, groupVariant = 'single', testID = 'user-card' }) => {
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
        className="w-full flex-row items-center justify-between px-4"
        py="$3"
        bg={bg}
        borderTopLeftRadius={top}
        borderTopRightRadius={top}
        borderBottomLeftRadius={bottom}
        borderBottomRightRadius={bottom}
      >
        <HStack space="md" alignItems="center" flex={1}>
          {/* Avatar with initials */}
          <Box
            testID="user-card-avatar"
            w="$12"
            h="$12"
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            bg={avatarBg}
          >
            <Text
              testID="user-card-initials"
              color={initialsColor}
              fontSize="$lg"
              fontWeight="$semibold"
            >
              {initials}
            </Text>
          </Box>

          {/* User info */}
          <VStack flex={1}>
            <Text
              testID="user-card-name"
              color={nameColor}
              fontWeight="$semibold"
              fontSize="$md"
              numberOfLines={1}
            >
              {fullName}
            </Text>
            {email && (
              <Text
                testID="user-card-email"
                color={emailColor}
                fontSize="$sm"
                numberOfLines={1}
                mt="$0.5"
              >
                {email}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Chevron */}
        {onPress && <Icon as={ChevronRightIcon} color={chevronColor} size="lg" />}
      </Pressable>
    );
  }
);

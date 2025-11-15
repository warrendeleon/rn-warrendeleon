import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Avatar,
  AvatarImage,
  ChevronRightIcon,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { useAppColorScheme } from '@app/hooks';

export type ProfileCardProps = {
  profilePicture: string;
  name: string;
  lastName: string;
  onPress: () => void;
  testID?: string;
};

/**
 * Pure helper that computes themed ProfileCard styles
 */
export const getProfileCardStyles = (scheme: 'light' | 'dark') => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '$backgroundDark900' : '$white';
  const nameColor = isDark ? '$white' : '$black';
  const subtitleColor = isDark ? '$textLight400' : '$textLight500';
  const chevronColor = isDark ? '$textLight400' : '$textLight500';
  // Avatar fallback colors
  const avatarBg = isDark ? '$coolGray700' : '$coolGray200';
  // Icon color as hex for MaterialCommunityIcons compatibility
  const avatarIconColor = isDark ? '#9CA3AF' : '#6B7280'; // coolGray-400 : coolGray-500

  return { bg, nameColor, subtitleColor, chevronColor, avatarBg, avatarIconColor };
};

export const ProfileCard = React.memo<ProfileCardProps>(
  ({ profilePicture, name, lastName, onPress, testID = 'profile-card' }) => {
    const scheme = useAppColorScheme();

    const { bg, nameColor, subtitleColor, chevronColor, avatarBg, avatarIconColor } =
      getProfileCardStyles(scheme);

    const fullName = `${name} ${lastName}`;

    return (
      <Pressable
        accessibilityLabel={`${fullName}, View Profile`}
        accessibilityRole="button"
        accessibilityHint="Opens your profile details"
        onPress={onPress}
        testID={testID}
        bg={bg}
        borderRadius="$2xl"
        p="$3"
        className="w-full"
      >
        <HStack space="md" alignItems="center">
          <Avatar size="md" testID="profile-card-avatar" bg={avatarBg}>
            <MaterialCommunityIcons name="account" size={28} color={avatarIconColor} />
            <AvatarImage source={{ uri: profilePicture }} alt={fullName} />
          </Avatar>

          <VStack flex={1} space="xs">
            <Text color={nameColor} fontWeight="$semibold" fontSize="$md" lineHeight="$lg">
              {fullName}
            </Text>
            <Text color={subtitleColor} fontSize="$sm" lineHeight="$sm">
              View Profile
            </Text>
          </VStack>

          <Icon as={ChevronRightIcon} color={chevronColor} size="lg" />
        </HStack>
      </Pressable>
    );
  }
);

ProfileCard.displayName = 'ProfileCard';

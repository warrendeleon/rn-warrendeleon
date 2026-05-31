import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChevronRight } from 'lucide-react-native';

import { Avatar, AvatarImage } from '@app/components/ui/avatar';
import { HStack } from '@app/components/ui/hstack';
import { Pressable } from '@app/components/ui/pressable';
import { Text } from '@app/components/ui/text';
import { VStack } from '@app/components/ui/vstack';
import { useAppColorScheme } from '@app/shared/hooks';

export type ProfileCardProps = {
  profilePicture: string;
  name: string;
  lastName: string;
  onPress: () => void;
  testID?: string;
};

/**
 * Pure helper that computes themed ProfileCard colours (hex, applied via style
 * so they stay fixed regardless of the active NativeWind colour scheme).
 */
export const getProfileCardStyles = (scheme: 'light' | 'dark') => {
  const isDark = scheme === 'dark';

  const bg = isDark ? '#262626' : '#FFFFFF'; // backgroundDark900 : white
  const nameColor = isDark ? '#FFFFFF' : '#000000'; // white : black
  const subtitleColor = isDark ? '#A3A3A3' : '#6B6B6B'; // secondary text: meets 4.5:1 on light surfaces
  const chevronColor = isDark ? '#A3A3A3' : '#6B6B6B';
  // Avatar fallback colours
  const avatarBg = isDark ? '#374151' : '#E5E7EB'; // coolGray700 : coolGray200
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
        className="w-full rounded-2xl p-3"
        style={{ backgroundColor: bg }}
      >
        <HStack space="md" className="items-center">
          <Avatar size="md" testID="profile-card-avatar" style={{ backgroundColor: avatarBg }}>
            <MaterialCommunityIcons name="account" size={28} color={avatarIconColor} />
            <AvatarImage source={{ uri: profilePicture }} alt={fullName} />
          </Avatar>

          <VStack space="xs" className="flex-1">
            <Text className="text-base font-semibold leading-[24px]" style={{ color: nameColor }}>
              {fullName}
            </Text>
            <Text className="text-sm leading-[20px]" style={{ color: subtitleColor }}>
              View Profile
            </Text>
          </VStack>

          <ChevronRight color={chevronColor} size={20} />
        </HStack>
      </Pressable>
    );
  }
);

ProfileCard.displayName = 'ProfileCard';

import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Avatar,
  Box,
  Divider,
  Heading,
  HStack,
  Image,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { CAROUSEL_HEIGHT_RATIO, TOUCH_TARGET_SIZE } from '@app/config/constants';
import { useAppColorScheme } from '@app/hooks';
import { useAppSelector } from '@app/store';
import { logError } from '@app/utils/logger';

import { selectProfile, selectProfileError, selectProfileLoading } from './store/selectors';

/**
 * Helper to format phone number for tel: URI
 */
const formatPhoneForTel = (phone: string): string => {
  return phone.replace(/[^0-9+]/g, '');
};

/**
 * Helper to format date from ISO to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Contact info row component following iOS Contacts pattern
 */
interface ContactRowProps {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

const ContactRow: React.FC<ContactRowProps> = ({
  icon,
  label,
  value,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const iconColor = isDark ? '#007AFF' : '#007AFF'; // iOS blue
  const labelColor = isDark ? '$textLight400' : '$textLight500';
  const valueColor = isDark ? '$white' : '$black';

  const content = (
    <HStack space="md" alignItems="center" py="$3" px="$4">
      <Box w="$8" alignItems="center">
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      </Box>
      <VStack flex={1} space="xs">
        <Text color={labelColor} fontSize="$xs" lineHeight="$xs">
          {label}
        </Text>
        <Text color={valueColor} fontSize="$md" lineHeight="$md">
          {value}
        </Text>
      </VStack>
    </HStack>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={{ minHeight: TOUCH_TARGET_SIZE.height }}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Box testID={testID} accessibilityRole="text" accessibilityLabel={accessibilityLabel}>
      {content}
    </Box>
  );
};

/**
 * Social media icon button component
 */
interface SocialIconProps {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  url: string;
  onPress: (url: string) => void;
  isDark: boolean;
}

const SocialIcon: React.FC<SocialIconProps> = ({ platform, url, onPress, isDark }) => {
  const iconMap = {
    facebook: 'facebook',
    twitter: 'twitter',
    instagram: 'instagram',
    linkedin: 'linkedin',
  };

  const colorMap = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
  };

  const bgColor = isDark ? '$backgroundDark800' : '$white';
  const iconColor = colorMap[platform];

  return (
    <Pressable
      onPress={() => onPress(url)}
      testID={`profile-social-${platform}`}
      accessibilityRole="button"
      accessibilityLabel={`Open ${platform} profile`}
      accessibilityHint={`Opens ${platform} in browser`}
      bg={bgColor}
      borderRadius="$full"
      p="$3"
      style={styles.socialIcon}
    >
      <MaterialCommunityIcons name={iconMap[platform]} size={28} color={iconColor} />
    </Pressable>
  );
};

/**
 * ProfileScreen - iOS 16 Contacts app design pattern
 */
export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = useWindowDimensions();
  const CAROUSEL_HEIGHT = WINDOW_HEIGHT * CAROUSEL_HEIGHT_RATIO;

  const backgroundColor = isDark ? '#000000' : '#F2F2F7';
  const cardBgColor = isDark ? '$backgroundDark900' : '$white';
  const nameColor = isDark ? '$white' : '$black';
  const headlineColor = isDark ? '$textLight400' : '$textLight500';

  const handlePhonePress = useCallback(() => {
    if (profile?.phone) {
      const telUrl = `tel:${formatPhoneForTel(profile.phone)}`;
      Linking.openURL(telUrl).catch(err => logError('Failed to open phone dialer', err));
    }
  }, [profile?.phone]);

  const handleEmailPress = useCallback(() => {
    if (profile?.email) {
      const mailUrl = `mailto:${profile.email}`;
      Linking.openURL(mailUrl).catch(err => logError('Failed to open email client', err));
    }
  }, [profile?.email]);

  const handleSocialPress = useCallback((url: string) => {
    if (url) {
      Linking.openURL(url).catch(err => logError('Failed to open social media link', err));
    }
  }, []);

  const carouselImage = useMemo(() => {
    if (profile?.galleryImages && profile.galleryImages.length > 0) {
      return profile.galleryImages[0];
    }
    return profile?.profilePicture;
  }, [profile]);

  const fullName = useMemo(() => {
    if (!profile) return '';
    return `${profile.name} ${profile.lastName}`;
  }, [profile]);

  const formattedBirthday = useMemo(() => {
    if (!profile?.birthday) return '';
    return formatDate(profile.birthday);
  }, [profile?.birthday]);

  // Loading state
  if (loading) {
    return (
      <Box testID="profile-screen" style={[styles.container, { backgroundColor }]}>
        <Box style={styles.centeredContent}>
          <Text
            testID="profile-loading"
            color={nameColor}
            fontSize="$md"
            accessibilityRole="text"
            accessibilityLabel={t('profile.states.loading')}
          >
            {t('profile.states.loading')}
          </Text>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box testID="profile-screen" style={[styles.container, { backgroundColor }]}>
        <Box style={styles.centeredContent}>
          <Text
            testID="profile-error"
            color="$error500"
            fontSize="$md"
            accessibilityRole="alert"
            accessibilityLabel={t('profile.states.error', { error })}
          >
            {t('profile.states.error', { error })}
          </Text>
        </Box>
      </Box>
    );
  }

  // Empty state
  if (!profile) {
    return (
      <Box testID="profile-screen" style={[styles.container, { backgroundColor }]}>
        <Box style={styles.centeredContent}>
          <Text
            testID="profile-empty"
            color={nameColor}
            fontSize="$md"
            accessibilityRole="text"
            accessibilityLabel={t('profile.states.empty')}
          >
            {t('profile.states.empty')}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box style={[styles.container, { backgroundColor }]}>
      {/* Fixed Background Image */}
      <Box
        style={[styles.backgroundImageContainer, { height: CAROUSEL_HEIGHT, width: WINDOW_WIDTH }]}
      >
        {carouselImage ? (
          <Image
            source={{ uri: carouselImage }}
            alt={`${fullName} profile photo`}
            style={{ width: WINDOW_WIDTH, height: CAROUSEL_HEIGHT }}
            testID="profile-carousel-image"
            accessibilityRole="image"
            accessibilityLabel={`Profile photo of ${fullName}`}
          />
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center" bg="$coolGray700">
            <Avatar size="2xl" bg="$coolGray500" testID="profile-avatar-fallback">
              <MaterialCommunityIcons name="account" size={80} color="#9CA3AF" />
            </Avatar>
          </Box>
        )}
      </Box>

      {/* Scrollable Content */}
      <ScrollView
        flex={1}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        testID="profile-screen"
      >
        {/* Spacer to push content below background image */}
        <Box style={{ height: CAROUSEL_HEIGHT - 20 }} />

        {/* Main Content Card */}
        <Box bg={cardBgColor} borderTopLeftRadius="$3xl" borderTopRightRadius="$3xl">
          {/* Profile Name Section */}
          <VStack space="xs" alignItems="center" pt="$6" pb="$4" px="$4">
            <Heading
              color={nameColor}
              size="2xl"
              textAlign="center"
              testID="profile-name"
              accessibilityRole="header"
              accessibilityLabel={fullName}
            >
              {fullName}
            </Heading>
            {profile.headline && (
              <Text
                color={headlineColor}
                fontSize="$md"
                textAlign="center"
                testID="profile-headline"
                accessibilityRole="text"
                accessibilityLabel={`Headline: ${profile.headline}`}
              >
                {profile.headline}
              </Text>
            )}
          </VStack>

          <Divider my="$2" />

          {/* Contact Information Section */}
          <VStack py="$2">
            <ContactRow
              icon="phone"
              label={t('profile.contact.phone')}
              value={profile.phone}
              onPress={handlePhonePress}
              testID="profile-phone"
              accessibilityLabel={`${t('profile.contact.phone')}: ${profile.phone}`}
              accessibilityHint="Double tap to call"
            />
            <ContactRow
              icon="email"
              label={t('profile.contact.email')}
              value={profile.email}
              onPress={handleEmailPress}
              testID="profile-email"
              accessibilityLabel={`${t('profile.contact.email')}: ${profile.email}`}
              accessibilityHint="Double tap to send email"
            />
            <ContactRow
              icon="cake-variant"
              label={t('profile.contact.birthday')}
              value={formattedBirthday}
              testID="profile-birthday"
              accessibilityLabel={`${t('profile.contact.birthday')}: ${formattedBirthday}`}
            />
          </VStack>

          <Divider my="$2" />

          {/* Social Media Section */}
          {profile.socials && (
            <VStack space="md" py="$4" px="$4">
              <Text
                color={headlineColor}
                fontSize="$sm"
                fontWeight="$semibold"
                textTransform="uppercase"
                testID="profile-social-header"
                accessibilityRole="header"
              >
                {t('profile.social.header')}
              </Text>
              <HStack space="md" justifyContent="center" flexWrap="wrap">
                {profile.socials.facebook && (
                  <SocialIcon
                    platform="facebook"
                    url={profile.socials.facebook}
                    onPress={handleSocialPress}
                    isDark={isDark}
                  />
                )}
                {profile.socials.twitter && (
                  <SocialIcon
                    platform="twitter"
                    url={profile.socials.twitter}
                    onPress={handleSocialPress}
                    isDark={isDark}
                  />
                )}
                {profile.socials.instagram && (
                  <SocialIcon
                    platform="instagram"
                    url={profile.socials.instagram}
                    onPress={handleSocialPress}
                    isDark={isDark}
                  />
                )}
                {profile.socials.linkedIn && (
                  <SocialIcon
                    platform="linkedin"
                    url={profile.socials.linkedIn}
                    onPress={handleSocialPress}
                    isDark={isDark}
                  />
                )}
              </HStack>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
};

// StyleSheet.create used for complex layout with absolute positioning and responsive design
// Justification: Combines RN layout primitives (flex, position) with dynamic dimensions (useWindowDimensions)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  socialIcon: {
    width: 56,
    height: 56,
    minWidth: TOUCH_TARGET_SIZE.width,
    minHeight: TOUCH_TARGET_SIZE.height,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

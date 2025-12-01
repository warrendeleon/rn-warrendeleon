import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, ScrollView, Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ProfileCard, SettingsGroup, type SettingsGroupItem } from '@app/components';
import { selectProfile } from '@app/features/Profile';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { useAppSelector } from '@app/store';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Create icon wrapper components for vector icons
const createIconComponent = (iconName: string, defaultSize?: number) => {
  const IconComponent = ({ color, size }: { color?: string; size?: number }) => (
    <MaterialCommunityIcons
      name={iconName}
      color={color || '#FFFFFF'}
      size={size || defaultSize || 20}
    />
  );
  IconComponent.displayName = `Icon(${iconName})`;
  return IconComponent;
};

export const handleSettingsPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('Settings');
};

export const handleProfilePress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('Profile');
};

export const handleWorkExperiencePress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('WorkExperience');
};

export const handleEducationPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('Education');
};

export const handleGitHubPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('WebView', { uri: 'https://github.com/warrendeleon/rn-warrendeleon' });
};

export const handleCVPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('PDF', {
    uri: 'https://warrendeleon.com/wp-content/uploads/2025/06/CV_WARRENDELEON_2025.pdf',
    title: 'CV',
  });
};

export const handleContactMePress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('ChatPlaceholder');
};

export const handleBookCallPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('BookingPlaceholder');
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Get profile data from Redux
  const profile = useAppSelector(selectProfile);

  const handleProfile = useCallback(() => {
    handleProfilePress(navigation);
  }, [navigation]);

  const handleWorkPress = useCallback(() => {
    handleWorkExperiencePress(navigation);
  }, [navigation]);

  const handleEducation = useCallback(() => {
    handleEducationPress(navigation);
  }, [navigation]);

  const handleSettings = useCallback(() => {
    handleSettingsPress(navigation);
  }, [navigation]);

  const handleCV = useCallback(() => {
    handleCVPress(navigation);
  }, [navigation]);

  const handleGitHub = useCallback(() => {
    handleGitHubPress(navigation);
  }, [navigation]);

  const handleContactMe = useCallback(() => {
    handleContactMePress(navigation);
  }, [navigation]);

  const handleBookCall = useCallback(() => {
    handleBookCallPress(navigation);
  }, [navigation]);

  const workLearningItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('home.workExperience'),
        onPress: handleWorkPress,
        startIcon: createIconComponent('briefcase'),
        startIconBgColor: '$blue500',
        testID: 'home-work-experience-button',
      },
      {
        label: t('home.education'),
        onPress: handleEducation,
        startIcon: createIconComponent('school'),
        startIconBgColor: '$orange500',
        testID: 'home-education-button',
      },
      {
        label: t('home.cv'),
        onPress: handleCV,
        startIcon: createIconComponent('file-document'),
        startIconBgColor: '$yellow500',
        testID: 'home-cv-button',
      },
    ],
    [t, handleWorkPress, handleEducation, handleCV]
  );

  const settingsItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('home.github'),
        onPress: handleGitHub,
        startIcon: createIconComponent('github'),
        startIconBgColor: '$coolGray800',
        testID: 'home-github-button',
      },
      {
        label: t('home.settings'),
        onPress: handleSettings,
        startIcon: createIconComponent('cog'),
        startIconBgColor: '$coolGray400',
        testID: 'home-settings-button',
      },
    ],
    [t, handleGitHub, handleSettings]
  );

  const contactItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('home.contactMe'),
        onPress: handleContactMe,
        startIcon: createIconComponent('chat', 24),
        startIconBgColor: '$green500',
        testID: 'home-contact-me-button',
      },
      {
        label: t('home.bookACall'),
        onPress: handleBookCall,
        startIcon: createIconComponent('calendar-clock'),
        startIconBgColor: '$pink600',
        testID: 'home-book-a-call-button',
      },
    ],
    [t, handleContactMe, handleBookCall]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      flex={1}
      p="$4"
      bg={isDark ? '$black' : '$coolGray100'}
      testID="home-screen"
      accessibilityLabel={t('home.title')}
    >
      {profile && (
        <Box mb="$4">
          <ProfileCard
            profilePicture={profile.profilePicture}
            name={profile.name}
            lastName={profile.lastName}
            onPress={handleProfile}
          />
        </Box>
      )}

      <Box mt="$2">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={isDark ? '$textDark400' : '$textLight500'}
          accessibilityRole="header"
        >
          Work & Learning
        </Text>
        <SettingsGroup items={workLearningItems} />
      </Box>

      <Box mt="$6">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={isDark ? '$textDark400' : '$textLight500'}
          accessibilityRole="header"
        >
          {t('home.contactWarren')}
        </Text>
        <SettingsGroup items={contactItems} />
      </Box>

      <Box mt="$6">
        <Text
          mb="$2"
          ml="$4"
          fontSize="$xs"
          fontWeight="$medium"
          textTransform="uppercase"
          color={isDark ? '$textDark400' : '$textLight500'}
          accessibilityRole="header"
        >
          Settings
        </Text>
        <SettingsGroup items={settingsItems} />
      </Box>
    </ScrollView>
  );
};

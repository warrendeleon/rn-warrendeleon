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
const createIconComponent = (iconName: string) => {
  const IconComponent = ({ color, size }: { color?: string; size?: number }) => (
    <MaterialCommunityIcons name={iconName} color={color || '#FFFFFF'} size={size || 20} />
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

export const handleRegistrationPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('Registration');
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

  const handleRegistration = useCallback(() => {
    handleRegistrationPress(navigation);
  }, [navigation]);

  const workLearningItems: SettingsGroupItem[] = useMemo(
    () => [
      {
        label: t('home.workExperience'),
        onPress: handleWorkPress,
        startIcon: createIconComponent('briefcase'),
        startIconBgColor: '#007AFF',
        testID: 'home-work-experience-button',
      },
      {
        label: t('home.education'),
        onPress: handleEducation,
        startIcon: createIconComponent('school'),
        startIconBgColor: '#5856D6',
        testID: 'home-education-button',
      },
      {
        label: t('home.cv'),
        onPress: handleCV,
        startIcon: createIconComponent('file-document'),
        startIconBgColor: '#00BCD4',
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
        startIconBgColor: '#1C1C1E',
        testID: 'home-github-button',
      },
      {
        label: t('home.settings'),
        onPress: handleSettings,
        startIcon: createIconComponent('cog'),
        startIconBgColor: '#8E8E93',
        testID: 'home-settings-button',
      },
      // TODO: Remove after testing TASK-199
      {
        label: 'Register (Test)',
        onPress: handleRegistration,
        startIcon: createIconComponent('account-plus'),
        startIconBgColor: '#34C759',
        testID: 'home-register-button',
      },
    ],
    [t, handleGitHub, handleSettings, handleRegistration]
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
          mb="$3"
          pt="$1"
          fontSize="$xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          lineHeight="$sm"
          color="$coolGray500"
          accessibilityRole="header"
        >
          Work & Learning
        </Text>
        <SettingsGroup items={workLearningItems} />
      </Box>

      <Box mt="$6">
        <Text
          mb="$3"
          pt="$1"
          fontSize="$xs"
          fontWeight="$semibold"
          textTransform="uppercase"
          lineHeight="$sm"
          color="$coolGray500"
          accessibilityRole="header"
        >
          Settings
        </Text>
        <SettingsGroup items={settingsItems} />
      </Box>
    </ScrollView>
  );
};

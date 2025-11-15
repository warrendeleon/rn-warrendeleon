import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ChevronButtonGroup,
  type ChevronButtonGroupItem,
  ProfileCard,
  TestErrorButton,
} from '@app/components';
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

export const handleProfileDataPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('ProfileData');
};

export const handleWorkXPDataPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('WorkXPData');
};

export const handleEducationDataPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('EducationData');
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  // Get profile data from Redux
  const profile = useAppSelector(selectProfile);

  const handleProfilePress = useCallback(() => {
    handleProfileDataPress(navigation);
  }, [navigation]);

  const handleWorkPress = useCallback(() => {
    handleWorkXPDataPress(navigation);
  }, [navigation]);

  const handleEducationPress = useCallback(() => {
    handleEducationDataPress(navigation);
  }, [navigation]);

  const handleSettings = useCallback(() => {
    handleSettingsPress(navigation);
  }, [navigation]);

  const workLearningItems: ChevronButtonGroupItem[] = useMemo(
    () => [
      {
        label: t('home.workExperience'),
        onPress: handleWorkPress,
        startIcon: createIconComponent('briefcase'),
        startIconBgColor: '#007AFF',
        testID: 'home-work-experience-button',
      },
      {
        label: t('home.studies'),
        onPress: handleEducationPress,
        startIcon: createIconComponent('school'),
        startIconBgColor: '#5856D6',
        testID: 'home-studies-button',
      },
      {
        label: t('home.cv'),
        onPress: () => {}, // TODO: Add CV PDF viewer handler
        startIcon: createIconComponent('file-pdf-box'),
        startIconBgColor: '#00BCD4',
        testID: 'home-cv-button',
      },
      {
        label: t('home.videos'),
        onPress: () => {}, // TODO: Add Videos handler
        startIcon: createIconComponent('youtube'),
        startIconBgColor: '#FF0000',
        testID: 'home-videos-button',
      },
    ],
    [t, handleWorkPress, handleEducationPress]
  );

  const contactItems: ChevronButtonGroupItem[] = useMemo(
    () => [
      {
        label: t('home.contactMe'),
        onPress: () => {}, // TODO: Add Contact handler
        startIcon: createIconComponent('email'),
        startIconBgColor: '#34C759',
        testID: 'home-contact-button',
      },
      {
        label: t('home.bookMeeting'),
        onPress: () => {}, // TODO: Add Meeting booking handler
        startIcon: createIconComponent('calendar'),
        startIconBgColor: '#FF9500',
        testID: 'home-book-meeting-button',
      },
    ],
    [t]
  );

  const settingsItems: ChevronButtonGroupItem[] = useMemo(
    () => [
      {
        label: t('home.github'),
        onPress: () => {}, // TODO: Add GitHub webview handler
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
    ],
    [t, handleSettings]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      testID="home-screen"
      accessibilityLabel={t('home.title')}
    >
      {profile && (
        <View className="mb-4">
          <ProfileCard
            profilePicture={profile.profilePicture}
            name={profile.name}
            lastName={profile.lastName}
            onPress={handleProfilePress}
          />
        </View>
      )}

      <View className="mt-2">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
          accessibilityRole="header"
        >
          Work & Learning
        </Text>
        <ChevronButtonGroup items={workLearningItems} />
      </View>

      <View className="mt-6">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
          accessibilityRole="header"
        >
          Contact
        </Text>
        <ChevronButtonGroup items={contactItems} />
      </View>

      <View className="mt-6">
        <Text
          className="mb-3 pt-1 text-xs font-semibold uppercase leading-normal"
          color="$coolGray500"
          accessibilityRole="header"
        >
          Settings
        </Text>
        <ChevronButtonGroup items={settingsItems} />
      </View>

      <TestErrorButton />
    </ScrollView>
  );
};

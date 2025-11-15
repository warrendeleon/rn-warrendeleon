import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ButtonWithChevron, TestErrorButton } from '@app/components';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      style={{ backgroundColor: isDark ? '#000000' : '#F2F2F7' }}
      testID="home-screen"
      accessibilityLabel={t('home.title')}
    >
      <View>
        <ButtonWithChevron
          label="Profile Data"
          onPress={() => handleProfileDataPress(navigation)}
          testID="home-profile-data-button"
        />
        <ButtonWithChevron
          label="Work Experience Data"
          onPress={() => handleWorkXPDataPress(navigation)}
          testID="home-workxp-data-button"
        />
        <ButtonWithChevron
          label="Education Data"
          onPress={() => handleEducationDataPress(navigation)}
          testID="home-education-data-button"
        />
        <ButtonWithChevron
          label={t('home.settings')}
          onPress={() => handleSettingsPress(navigation)}
          testID="home-settings-button"
        />
        <TestErrorButton />
      </View>
    </ScrollView>
  );
};

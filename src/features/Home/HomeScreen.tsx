import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ButtonWithChevron } from '@app/features';
import type { RootStackParamList } from '@app/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const handleSettingsPress = (navigation: HomeScreenNavigationProp): void => {
  navigation.navigate('Settings');
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1 p-4">
      <View>
        <ButtonWithChevron
          label={t('home.settings')}
          onPress={() => handleSettingsPress(navigation)}
          testID="home-settings-button"
        />
      </View>
    </ScrollView>
  );
};

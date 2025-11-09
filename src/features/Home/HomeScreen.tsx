import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ButtonWithChevron } from '@app/features';

export const handleSettingsPress = (): void => {
  // We keep this simple for now; behaviour can evolve later.

  console.log('Pressed!');
};

export const HomeScreen: React.FC = () => {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
      <View>
        <ButtonWithChevron
          label="Settings"
          onPress={handleSettingsPress}
          testID="home-settings-button"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
});

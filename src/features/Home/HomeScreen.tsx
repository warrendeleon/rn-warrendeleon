import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ViewProfileButton } from '@app/features';
import { LibraryCheck } from '@app/features/Home/components/LibraryCheck';

export const HomeScreen: React.FC = () => {
  //const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
      <View>
        <ViewProfileButton />
        <LibraryCheck />
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

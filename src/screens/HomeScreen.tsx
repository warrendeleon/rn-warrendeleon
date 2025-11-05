import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL, APP_ENV } from '@config/env';

const HomeScreen: React.FC = () => {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
      <View>
        <Text style={styles.title}>Home</Text>

        <Text testID="env-text">
          ENV: {APP_ENV}
          {'\n'}
          API_URL: {API_URL}
        </Text>
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

export default HomeScreen;

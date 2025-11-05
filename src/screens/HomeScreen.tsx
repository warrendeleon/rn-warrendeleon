import React from 'react';
import { ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_ENV, API_URL } from '../config/env';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, padding: 16 }}>
        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '600',
              marginBottom: 8,
            }}
          >
            Home
          </Text>

          <Text testID="env-text">
            ENV: {APP_ENV}
            {'\n'}
            API_URL: {API_URL}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

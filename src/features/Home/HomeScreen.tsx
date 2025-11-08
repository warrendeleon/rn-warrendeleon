import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_URL, APP_ENV } from '@app/config/env.ts';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
      <View>
        <Text style={styles.title}>{t('home.title')}</Text>

        <Text testID="env-text">
          {t('home.env')}: {APP_ENV}
          {'\n'}
          {t('home.apiUrl')}: {API_URL}
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

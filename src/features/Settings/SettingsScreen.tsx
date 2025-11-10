import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Heading } from '@gluestack-ui/themed';

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 p-4"
      testID="settings-screen"
    >
      <Heading size="xl" className="mb-6">
        {t('settings.title')}
      </Heading>
    </ScrollView>
  );
};

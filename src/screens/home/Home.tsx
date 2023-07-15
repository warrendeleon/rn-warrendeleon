import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ButtonWithChevron} from '@app/atoms/buttons';
import {VStack} from 'native-base';
import {useTranslation} from 'react-i18next';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  return (
    <VStack p={4}>
      <ButtonWithChevron
        onPress={() => navigation.navigate('Settings')}
        label={t('home.settings')}
      />
    </VStack>
  );
};

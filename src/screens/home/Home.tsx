import React, {JSX} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ButtonWithChevron} from '@app/atoms';
import {VStack} from 'native-base';
import {useTranslation} from 'react-i18next';
import {faSliders} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  return (
    <VStack p={4}>
      <ButtonWithChevron
        startIcon={
          <FontAwesomeIcon size={18} icon={faSliders} color={'white'} />
        }
        startIconBgColor={'blue.600'}
        onPress={() => navigation.navigate('Settings')}
        label={t('home.settings')}
      />
    </VStack>
  );
};

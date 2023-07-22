import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import {faYoutube} from '@fortawesome/free-brands-svg-icons';
import {faSliders} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

import {MenuListItem} from '@app/models';
import {MenuButtonGroup} from '@app/molecules';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const buttons: MenuListItem[] = [
    {
      icon: faYoutube,
      iconBgColor: 'red.500',
      label: t('home.videos'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: faSliders,
      iconBgColor: 'blue.600',
      label: t('home.settings'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];
  return <MenuButtonGroup menuList={buttons} />;
};

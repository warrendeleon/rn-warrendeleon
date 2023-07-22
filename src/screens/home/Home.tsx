import React, {JSX} from 'react';
import {MenuButtonGroup} from '@app/molecules';
import {MenuListItem} from '@app/models';
import {faSliders} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {faYoutube} from '@fortawesome/free-brands-svg-icons';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const buttons: MenuListItem[] = [
    {
      icon: faYoutube,
      iconBgColor: 'red.500',
      onPress: () => navigation.navigate('Settings'),
      label: t('home.videos'),
    },
    {
      icon: faSliders,
      iconBgColor: 'blue.600',
      onPress: () => navigation.navigate('Settings'),
      label: t('home.settings'),
    },
  ];
  return <MenuButtonGroup menuList={buttons} />;
};

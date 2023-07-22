import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {VStack} from 'native-base';

import {faYoutube} from '@fortawesome/free-brands-svg-icons';
import {
  faBriefcase,
  faCalendar,
  faComment,
  faFilePdf,
  faSchool,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

import {MenuListItem} from '@app/models';
import {MenuButtonGroup} from '@app/molecules';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const buttonsWork: MenuListItem[] = [
    {
      icon: faBriefcase,
      iconBgColor: 'yellow.800',
      label: t('home.workXP'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: faSchool,
      iconBgColor: 'blue.600',
      label: t('home.studies'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: faFilePdf,
      iconBgColor: 'cyan.600',
      label: t('home.pdf'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: faYoutube,
      iconBgColor: 'red.500',
      label: t('home.videos'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const contact: MenuListItem[] = [
    {
      icon: faComment,
      iconBgColor: 'green.500',
      label: t('home.contact'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: faCalendar,
      iconBgColor: 'pink.700',
      label: t('home.meet'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  const settings: MenuListItem[] = [
    {
      icon: faSliders,
      iconBgColor: 'grey',
      label: t('home.settings'),
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <VStack space={1}>
      <MenuButtonGroup menuList={buttonsWork} />
      <MenuButtonGroup menuList={contact} />
      <MenuButtonGroup menuList={settings} />
    </VStack>
  );
};

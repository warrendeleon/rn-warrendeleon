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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {MenuListItem} from '@app/models';
import {MenuButtonGroup} from '@app/molecules';
import {RootStackParamList, ScreenNames} from '@app/navigators';

export const Home = (): JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.HOME>
    >();
  const {t} = useTranslation();

  const buttonsWork: MenuListItem[] = [
    {
      icon: faBriefcase,
      iconBgColor: 'yellow.800',
      label: t('home.workXP'),
      onPress: () => navigation.navigate(ScreenNames.SETTINGS),
    },
    {
      icon: faSchool,
      iconBgColor: 'blue.600',
      label: t('home.studies'),
      onPress: () => navigation.navigate(ScreenNames.SETTINGS),
    },
    {
      icon: faFilePdf,
      iconBgColor: 'cyan.600',
      label: t('home.pdf'),
      onPress: () => navigation.navigate(ScreenNames.PDF),
    },
    {
      icon: faYoutube,
      iconBgColor: 'red.500',
      label: t('home.videos'),
      onPress: () => navigation.navigate(ScreenNames.VIDEOS),
    },
  ];

  const contact: MenuListItem[] = [
    {
      icon: faComment,
      iconBgColor: 'green.500',
      label: t('home.contact'),
      onPress: () => navigation.navigate(ScreenNames.SETTINGS),
    },
    {
      icon: faCalendar,
      iconBgColor: 'pink.700',
      label: t('home.meet'),
      onPress: () => navigation.navigate(ScreenNames.SETTINGS),
    },
  ];

  const settings: MenuListItem[] = [
    {
      icon: faSliders,
      iconBgColor: 'grey',
      label: t('home.settings'),
      onPress: () => navigation.navigate(ScreenNames.SETTINGS),
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

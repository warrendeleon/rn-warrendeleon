import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {ScrollView, VStack} from 'native-base';

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

import {ViewProfileButton} from '@app/atoms';
import {MenuListItem} from '@app/models';
import {profileSelector} from '@app/modules';
import {MenuButtonGroup} from '@app/molecules';
import {RootStackParamList, ScreenNames} from '@app/navigators';

export const Home = (): JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.HOME>
    >();
  const {t} = useTranslation();
  const profile = useSelector(profileSelector);

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
      onPress: () => navigation.navigate(ScreenNames.CONTACT),
    },
    {
      icon: faCalendar,
      iconBgColor: 'pink.700',
      label: t('home.meet'),
      onPress: () => navigation.navigate(ScreenNames.MEET),
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
    <ScrollView flex={1} padding={4}>
      <VStack space={4}>
        <ViewProfileButton
          onPress={() => navigation.navigate(ScreenNames.PROFILE)}
          profilePicture={profile.profilePicture}
          name={profile.name}
          lastname={profile.lastName}
        />
        <MenuButtonGroup menuList={buttonsWork} />
        <MenuButtonGroup menuList={contact} />
        <MenuButtonGroup menuList={settings} />
      </VStack>
    </ScrollView>
  );
};

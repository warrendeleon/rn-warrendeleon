import React, {JSX, useLayoutEffect} from 'react';
import {SvgFromUri} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {Box, ScrollView} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {MenuButtonGroupSvg} from '@app/components/molecules/menu-button-group-svg/MenuButtonGroupSvg';
import {workXPSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {MenuListItemSvg, WorkXP as WorkXPType} from '@app/types';
import {Client} from '@app/types/workXP';

export const WorkXP = (): JSX.Element => {
  const experience: WorkXPType[] = useSelector(workXPSelector);
  const {params} =
    useRoute<RouteProp<RootStackParamList, ScreenNames.WORK_XP>>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.WORK_XP>
    >();

  useLayoutEffect(() => {
    if (params?.workXPId) {
      const foundXP = experience.find(xp => xp.id === params.workXPId);
      navigation.setOptions({
        headerBackTitleVisible: false,
        title: foundXP?.company,
      });
    }
  }, [experience, navigation, params]);

  if (params?.workXPId) {
    const foundXP = experience.find(xp => xp.id === params.workXPId);
    let menuList: MenuListItemSvg[] = [];
    if (foundXP) {
      menuList = foundXP.clients.map((client: Client) => {
        return {
          end: client.end,
          label: client.position,
          onPressItem: () => {
            navigation.push(ScreenNames.WORK_XP_DETAILS, {workXPId: client.id});
          },
          start: client.start,
          svg: <SvgFromUri uri={client.logo} width={'100%'} height={'100%'} />,
        };
      });
    }

    return menuList.length > 0 ? (
      <ScrollView flex={1} padding={4}>
        <MenuButtonGroupSvg menuList={menuList} />
      </ScrollView>
    ) : (
      <Box />
    );
  }

  const menuList: MenuListItemSvg[] = experience.map((xp: WorkXPType) => {
    return {
      end: xp.end,
      label: xp.position,
      onPressItem: () => {
        const itemHasClients = xp.clients?.length > 0;
        if (!itemHasClients) {
          navigation.push(ScreenNames.WORK_XP_DETAILS, {workXPId: xp.id});
        }

        if (itemHasClients) {
          navigation.push(ScreenNames.WORK_XP, {workXPId: xp.id});
        }
      },
      start: xp.start,
      svg: <SvgFromUri uri={xp.logo} width={'100%'} height={'100%'} />,
    };
  });

  return (
    <ScrollView flex={1} padding={4}>
      <MenuButtonGroupSvg menuList={menuList} />
    </ScrollView>
  );
};

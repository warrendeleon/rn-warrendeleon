import React, {JSX, useLayoutEffect} from 'react';
import {SvgFromUri} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {Box, ScrollView} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {MenuButtonGroupSvg} from '@app/components/molecules/menu-button-group-svg/MenuButtonGroupSvg';
import {clientsSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {RootState} from '@app/redux';
import {Client, MenuListItemSvg} from '@app/types';

export const Clients = (): JSX.Element => {
  const {params} =
    useRoute<RouteProp<RootStackParamList, ScreenNames.CLIENTS>>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.CLIENTS>
    >();
  const clientList = useSelector((state: RootState) =>
    clientsSelector(state, params?.workXPId || ''),
  );

  useLayoutEffect(() => {
    if (params?.workXPId) {
      navigation.setOptions({title: params?.company});
    }
  }, [navigation, params]);
  let menuList: MenuListItemSvg[] = [];

  if (clientList) {
    menuList = clientList.map((client: Client) => {
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
};

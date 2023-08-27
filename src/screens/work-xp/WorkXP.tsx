import React, {JSX, useLayoutEffect} from 'react';
import {useSelector} from 'react-redux';
import {Box, ScrollView} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {MenuButtonGroupSvg} from '@app/components/molecules/menu-button-group-svg/MenuButtonGroupSvg';
import {workXPSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {WorkXP as WorkXPType} from '@app/types';

export const WorkXP = (): JSX.Element => {
  const experience: WorkXPType[] = useSelector(workXPSelector);
  const {params} =
    useRoute<RouteProp<RootStackParamList, ScreenNames.WORK_XP>>();
  const route = useRoute<RouteProp<RootStackParamList, ScreenNames.WORK_XP>>();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (params?.workXPId) {
      const foundXP = experience.find(xp => xp.id === params.workXPId);
      navigation.setOptions({
        headerBackTitleVisible: false,
        title: foundXP?.company,
      });
    }
  }, [experience, navigation, params, route]);

  if (params?.workXPId) {
    const foundXP = experience.find(xp => xp.id === params.workXPId);

    return foundXP ? (
      <ScrollView flex={1} padding={4}>
        <MenuButtonGroupSvg menuList={foundXP.clients} />
      </ScrollView>
    ) : (
      <Box />
    );
  }

  return (
    <ScrollView flex={1} padding={4}>
      <MenuButtonGroupSvg menuList={experience} />
    </ScrollView>
  );
};

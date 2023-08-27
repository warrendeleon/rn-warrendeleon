import React, {JSX, useLayoutEffect} from 'react';
import {useSelector} from 'react-redux';
import {Box} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {workXPDetailsSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {RootState} from '@app/redux';

export const WorkXPDetails = (): JSX.Element => {
  const {params} =
    useRoute<RouteProp<RootStackParamList, ScreenNames.WORK_XP_DETAILS>>();

  const id = params?.workXPId || '';
  const navigation = useNavigation();
  const details = useSelector((state: RootState) =>
    workXPDetailsSelector(state, id),
  );

  useLayoutEffect(() => {
    if (params?.workXPId) {
      navigation.setOptions({
        headerBackTitleVisible: false,
        title: details?.company,
      });
    }
  }, [details, navigation, params]);

  return <Box>Hello World!</Box>;
};

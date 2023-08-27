import React, {JSX} from 'react';
import {useSelector} from 'react-redux';
import {ScrollView, VStack} from 'native-base';

import {MenuButtonGroupSvg} from '@app/components/molecules/menu-button-group-svg/MenuButtonGroupSvg';
import {workXPSelector} from '@app/modules';
import {WorkXP as WorkXPType} from '@app/types';

export const WorkXP = (): JSX.Element => {
  const experience: WorkXPType[] = useSelector(workXPSelector);

  return (
    <ScrollView flex={1} padding={4}>
      <MenuButtonGroupSvg menuList={experience} />
    </ScrollView>
  );
};

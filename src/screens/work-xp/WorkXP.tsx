import React, {JSX} from 'react';
import {useSelector} from 'react-redux';
import {Box} from 'native-base';

import {workXPSelector} from '@app/modules';

export const WorkXP = (): JSX.Element => {
  const experience = useSelector(workXPSelector);

  console.log('WORK:', JSON.stringify(experience));
  return <Box>Hello World!</Box>;
};

import React, {JSX} from 'react';
import {Box, ZStack} from 'native-base';

import {Badge} from '@app/atoms';

export const RoundedSvg = ({
  svg,
  badge = 0,
}: {
  svg: JSX.Element | Array<JSX.Element>;
  badge?: number;
}): JSX.Element => {
  return (
    <ZStack alignItems={'center'} height={16} width={16}>
      {badge > 1 && <Badge number={badge} />}
      <Box
        mr={4}
        size={'16'}
        p={3}
        rounded={'full'}
        alignItems={'center'}
        bgColor={'muted.100'}
        justifyContent={'center'}>
        {svg}
      </Box>
    </ZStack>
  );
};

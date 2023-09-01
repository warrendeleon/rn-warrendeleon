import React, {JSX} from 'react';
import {Box} from 'native-base';

export const Badge = ({number}: {number: number}): JSX.Element => {
  return (
    <Box
      bgColor={'danger.500'}
      rounded={'full'}
      zIndex={1}
      size={4}
      variant="solid"
      alignSelf="flex-end"
      alignItems={'center'}
      justifyContent={'center'}
      _text={{
        color: 'white',
        fontSize: 10,
        textAlign: 'center',
      }}>
      {number}
    </Box>
  );
};

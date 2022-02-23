import React, {useEffect} from 'react';
import {Box, Center, HStack, useColorModeValue} from 'native-base';
import {useDispatch} from 'react-redux';
import {getWorkXP} from '../../modules/workXP/actions';

export const WorkXP = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getWorkXP());
  }, []);
  return (
    <Center flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')}>
      <HStack alignItems="center" space={4}>
        <Box
          bg={{
            linearGradient: {
              colors: ['lightBlue.300', 'violet.800'],
              start: [0, 0],
              end: [1, 0],
            },
          }}
          p="12"
          rounded="lg"
          _text={{fontSize: 'md', fontWeight: 'bold', color: 'white'}}>
          This is a Box with Linear Gradient
        </Box>
      </HStack>
    </Center>
  );
};

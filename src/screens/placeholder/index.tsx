import React from 'react';
import {Box, Center, HStack, useColorModeValue} from 'native-base';

export const Placeholder = () => {
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
          This is a placeholder screen
        </Box>
      </HStack>
    </Center>
  );
};

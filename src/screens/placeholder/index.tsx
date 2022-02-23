import React from "react";
import { Box, Button, Center, HStack, Icon, useColorMode, useColorModeValue } from "native-base";
import { Entypo } from "@native-base/icons";

export const Placeholder = () => {
  const {toggleColorMode} = useColorMode();
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

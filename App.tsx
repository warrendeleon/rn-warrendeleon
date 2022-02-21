import React from 'react';
import {NativeBaseProvider, Box, Center, Icon} from 'native-base';
import {Entypo} from '@native-base/icons';

export default function App() {
  return (
    <NativeBaseProvider>
      <Center flex={1}>
        <Box>Hello world</Box>
        <Icon as={Entypo} name="user" />
      </Center>
    </NativeBaseProvider>
  );
}

import React from "react";
import { Box, Center, Icon, NativeBaseProvider } from "native-base";
import { Entypo } from "@native-base/icons";

export const Placeholder = () => {
  return (
    <NativeBaseProvider>
      <Center flex={1} bg="blueGray.900">
        <Box
          _text={{
            fontSize: 'md',
            fontWeight: 'medium',
            color: 'lightText',
            letterSpacing: 'lg',
          }}>
          Hello world
        </Box>
        <Icon as={Entypo} name="user" color={'lightText'} />
      </Center>
    </NativeBaseProvider>
  );
};

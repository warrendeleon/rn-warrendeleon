import {Avatar, Box, HStack, VStack} from 'native-base';
import React from 'react';
import {Clinic} from '../../models/Clinic';

interface SalveListItemProps {
  isPressed: boolean;
  item: Clinic;
}

export const ClinicListItem = ({isPressed, item}: SalveListItemProps) => (
  <Box
    maxW="96"
    borderWidth="1"
    borderColor="coolGray.300"
    shadow="3"
    my={2}
    bg={isPressed ? 'coolGray.200' : 'white'}
    p="5"
    rounded="8"
    style={{
      transform: [
        {
          scale: isPressed ? 0.96 : 1,
        },
      ],
    }}>
    <HStack flex={1}>
      <Avatar
        source={{
          uri: `https://ui-avatars.com/api/?background=001489&color=FFFFFF&name=${item.name}`,
        }}
      />
      <VStack justifyContent={'center'} ml={4}>
        <Box _text={{color: 'darkText'}}>{item.name}</Box>
      </VStack>
    </HStack>
  </Box>
);

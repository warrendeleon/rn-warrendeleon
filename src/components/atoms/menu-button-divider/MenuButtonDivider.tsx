import React, {JSX} from 'react';
import {
  Box,
  Divider as NBDivider,
  HStack,
  useColorModeValue,
} from 'native-base';

export const MenuButtonDivider = ({
  paddingLeftWidth = 9,
}: {
  paddingLeftWidth?: number;
}): JSX.Element => {
  const bgColor = useColorModeValue('white', 'dark.50');
  const divider = useColorModeValue('muted.200', 'muted.700');
  return (
    <HStack bgColor={bgColor}>
      <Box mr={4} width={paddingLeftWidth} />
      <Box flex={1}>
        <NBDivider bgColor={divider} />
      </Box>
    </HStack>
  );
};

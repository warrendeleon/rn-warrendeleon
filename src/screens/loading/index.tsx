import React from 'react';
import {Box, Center, Spinner, useColorModeValue} from 'native-base';

export const Loading = () => {
  return (
    <Box
      flex={1}
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('muted.100', 'blueGray.900')}
      safeArea>
      <Spinner size="lg" />
    </Box>
  );
};

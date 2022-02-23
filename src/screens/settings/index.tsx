import React, {useState} from 'react';
import {
  Center,
  HStack,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
} from 'native-base';

export const Settings = () => {
  const {toggleColorMode, colorMode} = useColorMode();
  const [isEnabled, setIsEnabled] = useState(colorMode === 'dark');
  const toggleSwitch = () => {
    toggleColorMode();
    setIsEnabled(previousState => !previousState);
  };

  return (
    <Center flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')}>
      <HStack alignItems="center" space={4}>
        <Text fontSize="md">Dark mode</Text>
        <Switch
          size="md"
          onValueChange={toggleSwitch}
          value={isEnabled}
          colorScheme="lime"
        />
      </HStack>
    </Center>
  );
};

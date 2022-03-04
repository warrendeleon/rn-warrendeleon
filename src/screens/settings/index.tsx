import React, {useState} from 'react';
import {
  Box,
  Center,
  CheckIcon,
  HStack,
  Select,
  Switch,
  Text,
  useColorMode,
  useColorModeValue,
} from 'native-base';
import {setLanguage} from '../../modules/settings/actions';
import {useDispatch, useSelector} from 'react-redux';
import {languageSelector} from '../../modules/settings/selectors';

export const Settings = () => {
  const lan = useSelector(languageSelector);
  let [language] = useState(lan);
  const {toggleColorMode, colorMode} = useColorMode();
  const [isEnabled, setIsEnabled] = useState(colorMode === 'light');
  const toggleSwitch = () => {
    toggleColorMode();
    setIsEnabled(previousState => !previousState);
  };
  const dispatch = useDispatch();
  return (
    <Center flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')}>
      <HStack alignItems="center" space={4}>
        <Text fontSize="md">Light mode</Text>
        <Switch
          size="md"
          onValueChange={toggleSwitch}
          value={isEnabled}
          colorScheme="lime"
        />
      </HStack>
      <Box maxW="300">
        <Select
          selectedValue={language}
          minWidth="100"
          accessibilityLabel="Choose language"
          placeholder={language}
          _selectedItem={{
            bg: 'teal.600',
            endIcon: <CheckIcon size="5" />,
          }}
          mt={1}
          onValueChange={itemValue => {
            dispatch(setLanguage(itemValue));
          }}>
          <Select.Item label="English" value="en" />
          <Select.Item label="Spanish" value="es" />
        </Select>
      </Box>
    </Center>
  );
};

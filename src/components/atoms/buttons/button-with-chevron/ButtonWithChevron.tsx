import React from 'react';
import {
  Button as NativeBaseButton,
  ChevronRightIcon,
  useColorModeValue,
} from 'native-base';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

type ButtonProps = {
  label: string;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
};

export const ButtonWithChevron = ({
  label,
  onPress,
}: ButtonProps): JSX.Element => (
  <NativeBaseButton
    onPress={onPress}
    rounded={8}
    p={4}
    colorScheme={'black'}
    variant={'unstyled'}
    bgColor={useColorModeValue('white', 'dark.100')}
    endIcon={<ChevronRightIcon />}
    _stack={{flex: 1, justifyContent: 'space-between'}}>
    {label}
  </NativeBaseButton>
);

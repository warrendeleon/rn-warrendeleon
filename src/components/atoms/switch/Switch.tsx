import React, {JSX, PropsWithChildren} from 'react';
import {Switch as RNSwitch} from 'react-native';
import {Box, useColorModeValue} from 'native-base';

type SwitchProps = PropsWithChildren<{
  value: boolean;
  onValueChange?: ((value: boolean) => Promise<void> | void) | null | undefined;
  label: string;
}>;
export const Switch = ({
  value,
  onValueChange,
  label,
}: SwitchProps): JSX.Element => {
  return (
    <Box
      rounded={8}
      _text={{
        fontSize: 'md',
      }}
      alignItems={'center'}
      justifyContent={'space-between'}
      flexDirection={'row'}
      bgColor={useColorModeValue('white', 'dark.100')}
      px={4}
      py={2}>
      {label}
      <RNSwitch value={value} onValueChange={onValueChange} />
    </Box>
  );
};

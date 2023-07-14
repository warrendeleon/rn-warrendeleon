import React from 'react';
import {Button as NativeBaseButton, ChevronRightIcon} from 'native-base';

type ButtonProps = {
  label: string;
};

export const ButtonWithChevron = ({label}: ButtonProps): JSX.Element => (
  <NativeBaseButton
    borderRadius={10}
    colorScheme={'black'}
    variant={'unstyled'}
    bgColor={'white'}
    endIcon={<ChevronRightIcon />}
    _stack={{flex: 1, justifyContent: 'space-between'}}>
    {label}
  </NativeBaseButton>
);

import React from 'react';
import {VStack} from 'native-base';
import {ButtonWithChevron} from '@app/atoms/buttons';

export const Settings = (): JSX.Element => {
  return (
    <VStack p={4}>
      <ButtonWithChevron label={'Language'} />
    </VStack>
  );
};

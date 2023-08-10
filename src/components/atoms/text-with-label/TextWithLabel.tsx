import React, {JSX} from 'react';
import {Text, VStack} from 'native-base';

type TextWithLabelProps = {
  label: string;
  text: string;
};

export const TextWithLabel = ({
  label,
  text,
}: TextWithLabelProps): JSX.Element => {
  return (
    <VStack rounded={'lg'} bgColor={'white'} py={3} px={4} my={2} space={1}>
      <Text fontSize={'2xs'} fontWeight={'bold'}>
        {label}
      </Text>
      <Text>{text}</Text>
    </VStack>
  );
};

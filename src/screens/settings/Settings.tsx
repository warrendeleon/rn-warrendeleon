import React from 'react';
import { Heading, useColorModeValue, VStack } from "native-base";
import {Select} from '@app/atoms/select';

export const Settings = (): JSX.Element => {
  const [language, setLanguage] = React.useState('en');
  const languages = [
    {
      label: 'Spanish',
      value: 'es',
    },
    {
      label: 'English',
      value: 'en',
    },
  ];
  return (
    <VStack p={4}>
      <Heading
        color="muted.500"
        fontSize="xs"
        mb={2}
        ml={4}
        textTransform="uppercase">
        Language
      </Heading>
      <Select
        items={languages}
        selectedValue={language}
        accessibilityLabel="Choose language"
        placeholder="Choose language"
        onValueChange={(itemValue: string) => setLanguage(itemValue)}
      />
    </VStack>
  );
};

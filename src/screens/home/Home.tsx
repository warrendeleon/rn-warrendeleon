import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ButtonWithChevron} from '@app/atoms/buttons';
import {VStack} from 'native-base';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  return (
    <VStack p={4}>
      <ButtonWithChevron
        onPress={() => navigation.navigate('Settings')}
        label={'Settings'}
      />
    </VStack>
  );
};

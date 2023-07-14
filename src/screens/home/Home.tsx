import React from 'react';
import {Button} from 'native-base';
import {useNavigation} from '@react-navigation/native';

export const Home = (): JSX.Element => {
  const navigation = useNavigation();
  return (
    <Button onPress={() => navigation.navigate('Settings')}>Settings</Button>
  );
};

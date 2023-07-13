import React from 'react';
import {Box, Button} from 'native-base';
import {useNavigation} from '@react-navigation/native';

const Home = (): JSX.Element => {
  const navigation = useNavigation();
  return (
    <Button onPress={() => navigation.navigate('Settings')}>Settings</Button>
  );
};

export default Home;

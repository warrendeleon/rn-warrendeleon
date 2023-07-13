import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/home/Home';

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator();
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Home" component={Home} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;

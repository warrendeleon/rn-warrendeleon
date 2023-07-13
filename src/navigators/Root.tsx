import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../screens/Home/Home';

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator();
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Home" component={Home} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;

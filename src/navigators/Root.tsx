import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, Settings} from '@app/screens';

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator();
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Home" component={Home} />
      <RootStack.Screen name="Settings" component={Settings} />
    </RootStack.Navigator>
  );
};

export default RootNavigator;

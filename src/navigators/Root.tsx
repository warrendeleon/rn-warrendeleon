import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, Settings} from '@app/screens';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useColorModeValue} from 'native-base';

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator();
  return (
    <NavigationContainer theme={useColorModeValue(DefaultTheme, DarkTheme)}>
      <RootStack.Navigator>
        <RootStack.Screen name="Home" component={Home} />
        <RootStack.Screen name="Settings" component={Settings} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Placeholder} from '../screens/placeholder';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Placeholder} />
        <Tab.Screen name="Settings" component={Placeholder} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

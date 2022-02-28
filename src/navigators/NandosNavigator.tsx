import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Nandos} from '../screens/nandos';
import {WebView} from '../screens/webView';
import {ScreenNames} from './ScreenNames';

const Stack = createNativeStackNavigator();

export const NandosStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name="Restaurants"
        component={Nandos}
      />
      <Stack.Screen
        name={ScreenNames.NANDOS}
        component={WebView}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
};

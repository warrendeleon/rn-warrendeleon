import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Nandos} from '../screens/nandos';
import {WebView} from '../screens/webView';
import {ScreenNames} from './ScreenNames';

export type NandosStackParamList = {
  [ScreenNames.RESTAURANTS]: {url: string};
  [ScreenNames.WEB_VIEW]: undefined;
};

const Stack = createNativeStackNavigator<NandosStackParamList>();

export const NandosStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name={ScreenNames.RESTAURANTS}
        component={Nandos}
      />
      <Stack.Screen
        name={ScreenNames.WEB_VIEW}
        component={WebView}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
};

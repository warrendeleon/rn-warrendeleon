import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScreenNames} from './ScreenNames';
import {Clinics} from '../screens/clinics';

export type SalveStackParamList = {
  [ScreenNames.CLINICS]: undefined;
};

const Stack = createNativeStackNavigator<SalveStackParamList>();

export const SalveStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{headerShown: false}}
        name={ScreenNames.CLINICS}
        component={Clinics}
      />
    </Stack.Navigator>
  );
};

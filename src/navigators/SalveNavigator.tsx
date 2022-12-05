import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScreenNames} from './ScreenNames';
import {Clinics} from '../screens/clinics';
import {Patients} from '../screens/patients';

export type SalveStackParamList = {
  [ScreenNames.CLINICS]: undefined;
  [ScreenNames.PATIENTS]: {clinicId: number};
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
        }}
        name={ScreenNames.PATIENTS}
        component={Patients}
      />
    </Stack.Navigator>
  );
};

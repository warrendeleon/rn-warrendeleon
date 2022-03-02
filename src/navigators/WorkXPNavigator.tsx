import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorkXP} from '../screens/workXP';
import {Clients} from '../screens/clients';
import {ScreenNames} from './ScreenNames';

export type WorkXPStackParamList = {
  [ScreenNames.WORK_XP]: {url: string};
  [ScreenNames.CLIENTS]: {id: string};
};

const Stack = createNativeStackNavigator<WorkXPStackParamList>();

export const WorkXPStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        options={{headerShown: false}}
        name={ScreenNames.WORK_XP}
        component={WorkXP}
      />
      <Stack.Screen
        name={ScreenNames.CLIENTS}
        component={Clients}
        options={{
          presentation: 'transparentModal',
          animation: 'none',
        }}
      />
    </Stack.Navigator>
  );
};

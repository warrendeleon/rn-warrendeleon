import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorkXP} from '../screens/workXP';
import {Clients} from '../screens/clients';

export type WorkXPStackParamList = {
  ['WorkXP']: {url: string};
  ['Clients']: {id: string};
};

const Stack = createNativeStackNavigator<WorkXPStackParamList>();

export const WorkXPStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        options={{headerShown: false}}
        name="WorkXP"
        component={WorkXP}
      />
      <Stack.Screen
        name="Clients"
        component={Clients}
        options={{
          presentation: 'transparentModal',
          animation: 'none',
        }}
      />
    </Stack.Navigator>
  );
};

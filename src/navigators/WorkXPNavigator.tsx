import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorkXP} from '../screens/workXP';
import {Projects} from '../screens/projects';

export type WorkXPStackParamList = {
  ['WorkXP']: {url: string};
  ['Projects']: undefined;
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
        name="Projects"
        component={Projects}
        options={{
          presentation: 'transparentModal',
          animation: 'none',
        }}
      />
    </Stack.Navigator>
  );
};

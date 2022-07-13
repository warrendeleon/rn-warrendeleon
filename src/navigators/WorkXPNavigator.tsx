import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorkXP} from '../screens/workXP';
import {Clients} from '../screens/clients';
import {ScreenNames} from './ScreenNames';
import {JobDescription} from '../screens/jobDescription';
import {useTheme} from 'native-base';

export type WorkXPStackParamList = {
  [ScreenNames.WORK_XP]: {url: string};
  [ScreenNames.JOB_DESCRIPTION]: {id: string};
  [ScreenNames.CLIENTS]: {id: string};
};

const Stack = createNativeStackNavigator<WorkXPStackParamList>();

export const WorkXPStackNavigator = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.primary[900],
        },
        headerBackTitleVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        options={{headerShown: false}}
        name={ScreenNames.WORK_XP}
        component={WorkXP}
      />
      <Stack.Screen
        options={{headerShown: true}}
        name={ScreenNames.JOB_DESCRIPTION}
        component={JobDescription}
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

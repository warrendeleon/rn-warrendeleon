import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScreenNames} from './ScreenNames';
import {useTheme} from 'native-base';
import {Profile} from '../screens/profile';
import {PdfScreen} from '../screens/pdf';

export type ProfileStackParamList = {
  [ScreenNames.INFO]: undefined;
  [ScreenNames.PDF]: {url: string};
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
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
        name={ScreenNames.INFO}
        component={Profile}
      />
      <Stack.Screen
        options={{headerShown: true, presentation: 'modal'}}
        name={ScreenNames.PDF}
        component={PdfScreen}
      />
    </Stack.Navigator>
  );
};

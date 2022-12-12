import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScreenNames} from './ScreenNames';
import {useTheme} from 'native-base';
import {PokedexScreen} from '../screens/pokedex';

export type PokemonNavigatorParamList = {
  [ScreenNames.POKEDEX]: undefined;
};

const Stack = createNativeStackNavigator<PokemonNavigatorParamList>();

export const PokemonNavigator = () => {
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
        name={ScreenNames.POKEDEX}
        component={PokedexScreen}
      />
    </Stack.Navigator>
  );
};

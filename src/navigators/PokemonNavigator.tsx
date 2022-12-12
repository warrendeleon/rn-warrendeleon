import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ScreenNames} from './ScreenNames';
import {useTheme} from 'native-base';
import {PokedexScreen} from '../screens/pokedex';
import {PokemonScreen} from '../screens/pokemon';

export type PokemonNavigatorParamList = {
  [ScreenNames.POKEDEX]: undefined;
  [ScreenNames.POKEMON]: {url: string};
};

const Stack = createNativeStackNavigator<PokemonNavigatorParamList>();

export const PokemonNavigator = () => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
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
        name={ScreenNames.POKEDEX}
        component={PokedexScreen}
      />
      <Stack.Screen
        name={ScreenNames.POKEMON}
        component={PokemonScreen}
      />
    </Stack.Navigator>
  );
};

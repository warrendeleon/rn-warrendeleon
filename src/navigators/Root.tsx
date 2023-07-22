import React, {JSX} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, Settings} from '@app/screens';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useColorModeValue} from 'native-base';
import {useTranslation} from 'react-i18next';

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator();

  const {t} = useTranslation();
  return (
    <NavigationContainer theme={useColorModeValue(DefaultTheme, DarkTheme)}>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Home"
          component={Home}
          options={{title: t('screens.home')}}
        />
        <RootStack.Screen
          name="Settings"
          component={Settings}
          options={{title: t('screens.settings')}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

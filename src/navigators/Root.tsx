import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useColorModeValue} from 'native-base';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Home, Pdf, Settings, Videos} from '@app/screens';

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
        <RootStack.Screen
          name="Pdf"
          component={Pdf}
          options={{title: t('home.pdf')}}
        />
        <RootStack.Screen
          name="Videos"
          component={Videos}
          options={{title: t('home.videos')}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

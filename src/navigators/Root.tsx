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
import {Video} from '@app/screens/videos/Video';

import {ScreenNames} from './screen-names';

export type RootStackParamList = {
  [ScreenNames.HOME]: undefined;
  [ScreenNames.SETTINGS]: undefined;
  [ScreenNames.PDF]: undefined;
  [ScreenNames.VIDEOS]: undefined;
  [ScreenNames.VIDEO]: {videoId: string; title: string};
};

const RootNavigator = (): JSX.Element => {
  const RootStack = createNativeStackNavigator<RootStackParamList>();

  const {t} = useTranslation();
  return (
    <NavigationContainer theme={useColorModeValue(DefaultTheme, DarkTheme)}>
      <RootStack.Navigator>
        <RootStack.Screen
          name={ScreenNames.HOME}
          component={Home}
          options={{title: t('screens.home')}}
        />
        <RootStack.Screen
          name={ScreenNames.SETTINGS}
          component={Settings}
          options={{title: t('screens.settings')}}
        />
        <RootStack.Screen
          name={ScreenNames.PDF}
          component={Pdf}
          options={{title: t('home.pdf')}}
        />
        <RootStack.Screen
          name={ScreenNames.VIDEOS}
          component={Videos}
          options={{title: t('home.videos')}}
        />
        <RootStack.Screen
          name={ScreenNames.VIDEO}
          component={Video}
          options={{presentation: 'modal'}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

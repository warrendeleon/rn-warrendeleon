import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useColorModeValue} from 'native-base';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Contact, Home, Pdf, Settings, Videos, WebView} from '@app/screens';
import {Video} from '@app/screens/videos/Video';

import {ScreenNames} from './screen-names';

export type RootStackParamList = {
  [ScreenNames.HOME]: undefined;
  [ScreenNames.SETTINGS]: undefined;
  [ScreenNames.PDF]: undefined;
  [ScreenNames.VIDEOS]: undefined;
  [ScreenNames.VIDEO]: {videoId: string; title: string};
  [ScreenNames.CONTACT]: undefined;
  [ScreenNames.MEET]: {uri: string} | undefined;
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
        <RootStack.Screen
          name={ScreenNames.CONTACT}
          component={Contact}
          options={{title: t('screens.contact')}}
        />
        <RootStack.Screen
          name={ScreenNames.MEET}
          component={WebView}
          options={{title: t('screens.meet')}}
          initialParams={{uri: 'https://calendly.com/warrendeleon'}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {useColorModeValue} from 'native-base';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  Contact,
  Home,
  Pdf,
  Profile,
  Settings,
  Video,
  Videos,
  WebView,
  WorkXP,
  WorkXPDetails,
} from '@app/screens';
import {Clients} from '@app/screens/clients/Clients';
import {Education} from '@app/screens/education/Education';

import {ScreenNames} from './screen-names';

export type RootStackParamList = {
  [ScreenNames.HOME]: undefined;
  [ScreenNames.SETTINGS]: undefined;
  [ScreenNames.PDF]: undefined;
  [ScreenNames.VIDEOS]: undefined;
  [ScreenNames.VIDEO]: {videoId: string; title: string};
  [ScreenNames.CONTACT]: undefined;
  [ScreenNames.MEET]: {uri: string} | undefined;
  [ScreenNames.PROFILE]: undefined;
  [ScreenNames.WORK_XP]: {workXPId: string} | undefined;
  [ScreenNames.WORK_XP_DETAILS]: {workXPId: string} | undefined;
  [ScreenNames.EDUCATION]: undefined;
  [ScreenNames.WEBVIEW]: {uri: string; title?: string} | undefined;
  [ScreenNames.CLIENTS]: {workXPId: string; company: string} | undefined;
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
          options={({route}) => ({
            presentation: 'modal',
            title: route.params?.title ? route.params.title : '',
          })}
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
        <RootStack.Screen
          name={ScreenNames.WEBVIEW}
          component={WebView}
          options={({route}) => ({
            headerBackTitleVisible: !route.params?.title,
            title: route.params?.title ? route.params.title : t('screens.meet'),
          })}
        />
        <RootStack.Screen
          name={ScreenNames.PROFILE}
          component={Profile}
          options={{title: t('screens.profile')}}
        />
        <RootStack.Screen
          name={ScreenNames.WORK_XP}
          component={WorkXP}
          options={{title: t('screens.workXP')}}
        />
        <RootStack.Screen
          name={ScreenNames.WORK_XP_DETAILS}
          component={WorkXPDetails}
          options={{headerBackTitleVisible: false}}
        />
        <RootStack.Screen
          name={ScreenNames.EDUCATION}
          component={Education}
          options={{title: t('screens.education')}}
        />
        <RootStack.Screen
          name={ScreenNames.CLIENTS}
          component={Clients}
          options={({route}) => ({
            headerBackTitleVisible: false,
            title: route.params?.company ? route.params?.company : '',
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

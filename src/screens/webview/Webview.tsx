import {JSX} from 'react';
import RNWebView from 'react-native-webview';

import {RouteProp, useRoute} from '@react-navigation/native';

import {RootStackParamList, ScreenNames} from '@app/navigators';

export const WebView = (): JSX.Element => {
  const route = useRoute<RouteProp<RootStackParamList, ScreenNames.MEET>>();
  return <RNWebView source={{uri: route.params.uri}} />;
};

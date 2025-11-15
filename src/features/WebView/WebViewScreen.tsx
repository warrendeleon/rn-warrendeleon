import React from 'react';
import RNWebView from 'react-native-webview';
import { type RouteProp, useRoute } from '@react-navigation/native';

import type { RootStackParamList } from '@app/navigation';

type WebViewScreenRouteProp = RouteProp<RootStackParamList, 'WebView'>;

export const WebViewScreen = () => {
  const route = useRoute<WebViewScreenRouteProp>();

  return <RNWebView source={{ uri: route.params.uri }} />;
};

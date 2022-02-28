import React from 'react';
import {Box} from 'native-base';
import {WebView as RNWebview} from 'react-native-webview';
import { StyleSheet } from "react-native";

export const WebView = ({route, navigation}) => {
  const {url} = route.params;
  return (
    <Box flex={1} bg={'muted.100'}>
      <RNWebview source={{uri: url}} />
    </Box>
  );
};

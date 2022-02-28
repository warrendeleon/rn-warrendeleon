import React from 'react';
import {Box} from 'native-base';
import {WebView as RNWebview} from 'react-native-webview';
import {NandosStackParamList} from '../../navigators/NandosNavigator';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

export const WebView = ({
  route,
}: NativeStackScreenProps<NandosStackParamList, 'Nandos'>) => {
  const {url} = route.params;
  return (
    <Box flex={1} bg={'muted.100'}>
      <RNWebview source={{uri: url}} />
    </Box>
  );
};

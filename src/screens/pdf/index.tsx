import {Box, Factory} from 'native-base';
import React from 'react';
import Pdf from 'react-native-pdf';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkXPStackParamList} from '../../navigators/WorkXPNavigator';
import {ScreenNames} from '../../navigators/ScreenNames';
import {ProfileStackParamList} from '../../navigators/ProfileNavigator';

export const PdfScreen = ({
  route,
}: NativeStackScreenProps<ProfileStackParamList, ScreenNames.PDF>) => {
  const {url} = route.params;
  const FactoryPDF = Factory(Pdf);
  return (
    <FactoryPDF
      w={'full'}
      h={'full'}
      source={{
        uri: url,
        cache: true,
      }}
    />
  );
};

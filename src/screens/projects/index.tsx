import {Text} from 'native-base';
import React from 'react';
import {BlurredModalBG} from '../../components/blurredModalBG';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkXPStackParamList} from '../../navigators/WorkXPNavigator';

export const Projects = ({
  navigation,
}: NativeStackScreenProps<WorkXPStackParamList, 'Projects'>) => {
  return (
    <BlurredModalBG goBack={() => navigation.goBack()} title={'Projects'}>
      <Text>Hello</Text>
    </BlurredModalBG>
  );
};

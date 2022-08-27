import {Factory, Icon} from 'native-base';
import React, {useCallback, useEffect} from 'react';
import Pdf from 'react-native-pdf';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenNames} from '../../navigators/ScreenNames';
import {ProfileStackParamList} from '../../navigators/ProfileNavigator';
import Share from 'react-native-share';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const PdfScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<ProfileStackParamList, ScreenNames.PDF>) => {
  const {url} = route.params;
  const FactoryPDF = Factory(Pdf);
  const onPress = useCallback(() => {
    Share.open({url});
  }, [url]);

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: props => (
        <Icon
          onPress={onClose}
          size="lg"
          color={props.tintColor}
          as={Ionicons}
          name={'ios-close'}
        />
      ),
      headerRight: props => (
        <Icon
          onPress={onPress}
          size="md"
          color={props.tintColor}
          as={Ionicons}
          name={'ios-share-outline'}
        />
      ),
    });
  }, [navigation, onClose, onPress]);

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

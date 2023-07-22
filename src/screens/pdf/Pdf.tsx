import React, {JSX, useCallback, useEffect} from 'react';
import PdfReader from 'react-native-pdf';
import Share from 'react-native-share';
import {Button, Factory} from 'native-base';

import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';

export const Pdf = (): JSX.Element => {
  const navigation = useNavigation();
  const FactoryPDF = Factory(PdfReader);
  const url = 'https://warrendeleon.com/docs/CV_WARREN_2022_EN.pdf';
  const onPress = useCallback(() => {
    Share.open({url});
  }, [url]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          variant={'link'}
          onPress={onPress}
          startIcon={
            <FontAwesomeIcon
              size={14}
              icon={faArrowUpRightFromSquare}
              color={'#007AFF'}
            />
          }
        />
      ),
    });
  }, [navigation, onPress]);

  return (
    <FactoryPDF
      w={'full'}
      h={'full'}
      source={{
        cache: true,
        uri: url,
      }}
    />
  );
};

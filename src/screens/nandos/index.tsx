import React, {useCallback, useEffect} from 'react';
import {
  Box,
  Divider,
  FlatList,
  Pressable,
  useColorModeValue,
  VStack,
} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {getRestaurants} from '../../modules/nandos/actions';
import {nandosSelector} from '../../modules/nandos/selectors';

export const Nandos = ({navigation}) => {
  const dispatch = useDispatch();
  const restaurants = useSelector(nandosSelector);
  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);
  const logo = useColorModeValue(
    require('../../assets/animations/logo/dark.json'),
    require('../../assets/animations/logo/light.json'),
  );
  const cardsBGColor = useColorModeValue('blueGray.900', 'muted.100');
  const textColor = useColorModeValue('lightText', 'darkText');

  const onPress = useCallback(
    (url: string) => () => navigation.navigate('Nandos', {url: url}),
    [navigation],
  );

  return (
    <Box flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')} safeArea>
      <Box flexGrow={0} px={4}>
        <FlatList
          data={restaurants}
          keyExtractor={item => item.geo.address.postalCode}
          contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
          renderItem={({item, index}) => {
            return (
              <>
                {index === 0 && (
                  <Box height={50}>
                    <LottieView source={logo} autoPlay />
                  </Box>
                )}
                <Pressable onPress={onPress(item.url)}>
                  <VStack
                    bgColor={cardsBGColor}
                    rounded={'xl'}
                    padding={3}
                    my={2}>
                    <Box _text={{color: textColor}}>{item.name}</Box>
                    <Box _text={{color: textColor}}>
                      {item.geo.address.streetAddress}
                    </Box>
                    <Box _text={{color: textColor}}>
                      {item.geo.address.addressLocality}
                    </Box>
                    <Box _text={{color: textColor}}>
                      {item.geo.address.postalCode}
                    </Box>
                  </VStack>
                </Pressable>
              </>
            );
          }}
        />
      </Box>
    </Box>
  );
};

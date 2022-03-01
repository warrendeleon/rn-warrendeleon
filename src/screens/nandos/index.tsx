import React, {useCallback, useEffect} from 'react';
import {Box, FlatList, Pressable, useColorModeValue, VStack} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {getRestaurants} from '../../modules/nandos/actions';
import {nandosSelector} from '../../modules/nandos/selectors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NandosStackParamList} from '../../navigators/NandosNavigator';

export const Nandos = ({
  navigation,
}: NativeStackScreenProps<NandosStackParamList, 'Restaurants'>) => {
  const dispatch = useDispatch();
  const restaurants = useSelector(nandosSelector);
  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);
  const logo = useColorModeValue(
    require('../../assets/animations/logo/dark.json'),
    require('../../assets/animations/logo/light.json'),
  );

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
                  {({isPressed}) => {
                    return (
                      <Box
                        maxW="96"
                        borderWidth="1"
                        borderColor="coolGray.300"
                        shadow="3"
                        my={2}
                        bg={isPressed ? 'coolGray.200' : 'white'}
                        p="5"
                        rounded="8"
                        style={{
                          transform: [
                            {
                              scale: isPressed ? 0.96 : 1,
                            },
                          ],
                        }}>
                        <VStack>
                          <Box _text={{color: 'darkText'}}>{item.name}</Box>
                          <Box _text={{color: 'darkText'}}>
                            {item.geo.address.streetAddress}
                          </Box>
                          <Box _text={{color: 'darkText'}}>
                            {item.geo.address.addressLocality}
                          </Box>
                          <Box _text={{color: 'darkText'}}>
                            {item.geo.address.postalCode}
                          </Box>
                        </VStack>
                      </Box>
                    );
                  }}
                </Pressable>
              </>
            );
          }}
        />
      </Box>
    </Box>
  );
};

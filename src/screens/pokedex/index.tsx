import React, {useCallback, useEffect} from 'react';
import {
  Box,
  FlatList,
  Image,
  Pressable,
  useColorModeValue,
  VStack,
} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import {PokemonNavigatorParamList} from '../../navigators/PokemonNavigator';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenNames} from '../../navigators/ScreenNames';
import {useNavigation} from '@react-navigation/native';
import {
  getInitialPokedexInfo,
  getPokedex,
  getPokemonInfo,
} from '../../modules/pokedex/actions';
import {pokedexSelector} from '../../modules/pokedex/selectors';
import {POKEMON_URL} from '../../httpClient';

export const PokedexScreen = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<
      NativeStackScreenProps<PokemonNavigatorParamList, ScreenNames.POKEDEX>
    >();
  const pokedex = useSelector(pokedexSelector);
  useEffect(() => {
    if (pokedex.next && pokedex.currentCount < 1000) {
      dispatch(getPokedex({url: pokedex.next}));
    } else {
      dispatch(getInitialPokedexInfo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPress = useCallback(
    (url: string) => () => {
      dispatch(getPokemonInfo({url}));
    },
    [dispatch],
  );
  const onEndReached = useCallback(() => {
    if (pokedex.next && pokedex.currentCount < 1000) {
      dispatch(getPokedex({url: pokedex.next}));
    }
  }, [dispatch, pokedex]);

  return (
    <Box
      flex={1}
      bg={useColorModeValue('muted.100', 'blueGray.900')}
      px={4}
      safeArea>
      <FlatList
        data={pokedex.results}
        numColumns={2}
        keyExtractor={item => `${item.url}`}
        contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
        onEndReachedThreshold={25}
        onEndReached={onEndReached}
        renderItem={({item}) => {
          return (
            <Pressable testID={'listItem'} onPress={onPress(item.url)} flex={1}>
              {({isPressed}) => {
                const pokemonId = item.url
                  .replace(`${POKEMON_URL}/pokemon/`, '')
                  .replace('/', '');
                return (
                  <VStack
                    flex={1}
                    h={40}
                    borderWidth="1"
                    borderColor="coolGray.300"
                    shadow="3"
                    m={2}
                    bg={isPressed ? 'coolGray.200' : 'white'}
                    p="2"
                    rounded="8"
                    style={{
                      transform: [
                        {
                          scale: isPressed ? 0.96 : 1,
                        },
                      ],
                    }}>
                    <Image
                      flex={1}
                      source={{
                        uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
                      }}
                      fallbackSource={{
                        uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
                      }}
                      size={'full'}
                      resizeMode={'contain'}
                      alt={item.name}
                    />
                    <Box
                      _text={{color: 'darkText', textAlign: 'center'}}
                      flexGrow={0}>
                      {item.name}
                    </Box>
                  </VStack>
                );
              }}
            </Pressable>
          );
        }}
      />
    </Box>
  );
};

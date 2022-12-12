import React, {useCallback, useEffect, useState} from 'react';
import {
  Box,
  FlatList,
  IconButton,
  Image,
  Pressable,
  useColorModeValue,
  VStack,
} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import {PokemonNavigationProps} from '../../navigators/PokemonNavigator';
import {ScreenNames} from '../../navigators/ScreenNames';
import {useNavigation} from '@react-navigation/native';
import {
  addPokemonToParty,
  getInitialPokedexInfo,
  getPokedex,
  getPokemonInfo,
  removePokemonFromParty,
} from '../../modules/pokedex/actions';
import {
  isPartyFullSelector,
  partySelector,
  pokedexSelector,
} from '../../modules/pokedex/selectors';
import {POKEMON_URL} from '../../httpClient';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {PokedexEntry} from '../../models/Pokedex';

export const PokedexScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<PokemonNavigationProps>();
  const pokedex = useSelector(pokedexSelector);
  const party = useSelector(partySelector);
  const [showParty, setShowParty] = useState(false);
  useEffect(() => {
    if (pokedex.next && pokedex.currentCount < 1000) {
      dispatch(getPokedex({url: pokedex.next}));
    } else {
      dispatch(getInitialPokedexInfo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          onPress={() => setShowParty(!showParty)}
          _icon={{
            color: 'white',
            as: MaterialCommunity,
            name: showParty ? 'filter-off-outline' : 'filter-outline',
          }}
        />
      ),
    });
  }, [navigation, showParty]);

  const isPartyFull = useSelector(isPartyFullSelector);
  const onPress = useCallback(
    (url: string) => () => {
      dispatch(getPokemonInfo({url}));
      navigation.push(ScreenNames.POKEMON, {url});
    },
    [dispatch, navigation],
  );

  const onHeartPressed = useCallback(
    (pokemon: PokedexEntry) => () => {
      if (pokemon.party) {
        dispatch(removePokemonFromParty(pokemon.name));
      } else {
        dispatch(addPokemonToParty(pokemon.name));
      }
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
        data={showParty ? party : pokedex.results}
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
                    {item.party && (
                      <Box flexGrow={0}>
                        <IconButton
                          onPress={onHeartPressed(item)}
                          _icon={{
                            color: 'red.500',
                            as: MaterialCommunity,
                            name: 'heart',
                          }}
                        />
                      </Box>
                    )}
                    {!item.party && !isPartyFull && (
                      <Box flexGrow={0}>
                        <IconButton
                          onPress={onHeartPressed(item)}
                          _icon={{
                            color: 'black',
                            as: MaterialCommunity,
                            name: 'heart-outline',
                          }}
                        />
                      </Box>
                    )}
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

import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenNames} from '../../navigators/ScreenNames';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Image,
  Progress,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';
import {PokemonNavigatorParamList} from '../../navigators/PokemonNavigator';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/configureStore';
import {pokemonSelector} from '../../modules/pokedex/selectors';
import {POKEMON_TYPE_COLORS} from '../../models/Pokemon';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

export const PokemonScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<PokemonNavigatorParamList, ScreenNames.POKEMON>) => {
  const {url} = route.params;
  const pokemon = useSelector((state: RootState) =>
    pokemonSelector(state, url),
  );
  const containerBgColor = useColorModeValue('muted.100', 'blueGray.900');
  const borderColor = useColorModeValue('black', 'white');

  if (!pokemon) {
    return <Box />;
  }

  navigation.setOptions({
    title:
      pokemon.name.slice(0, 1).toUpperCase() +
      pokemon.name.slice(1, pokemon.name.length),
  });

  return (
    <VStack w={'full'} h={'full'} bg={containerBgColor}>
      <Box flex={1} bgColor={'white'}>
        <Image
          flex={1}
          source={{
            uri: pokemon.sprites.other
              ? pokemon.sprites.other['official-artwork'].front_default
              : undefined,
          }}
          size={'full'}
          resizeMode={'contain'}
          alt={pokemon.name}
        />
      </Box>
      <Box flex={2} p={5}>
        <HStack
          m={5}
          alignItems={'center'}
          justifyContent={'center'}
          space={5}
          flexWrap={'wrap'}>
          <Text textAlign={'center'}>Types: </Text>
          {pokemon.types.map(item => (
            <Badge
              key={item.type.name}
              bg={POKEMON_TYPE_COLORS[item.type.name.toLowerCase()]}
              _text={{
                color: 'lightText',
                textAlign: 'center',
                fontSize: 'sm',
              }}
              variant={'solid'}
              rounded={'full'}
              my={1}>
              {item.type.name}
            </Badge>
          ))}
        </HStack>
        <HStack
          alignItems={'center'}
          space={12}
          mb={5}
          flexWrap={'wrap'}
          justifyContent={'center'}>
          <VStack>
            <Text textAlign={'center'} fontSize={'3xl'}>
              {pokemon.height / 10}m
            </Text>
            <Text textAlign={'center'}>Height</Text>
          </VStack>
          <VStack>
            <Text textAlign={'center'} fontSize={'3xl'}>
              {pokemon.weight / 10}Kg
            </Text>
            <Text textAlign={'center'}>weight</Text>
          </VStack>
        </HStack>
        <VStack
          borderWidth={1}
          borderColor={borderColor}
          p={2}
          space={2}
          alignItems={'center'}>
          {pokemon.stats.map(item => (
            <HStack space={2}>
              <Text textAlign={'right'} flex={2}>
                {item.stat.name}
              </Text>
              <Box flex={3} justifyContent={'center'}>
                <Progress value={(item.base_stat * 100) / 255} mx="4" />
              </Box>
              <Text textAlign={'left'} flex={1}>
                {item.base_stat}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

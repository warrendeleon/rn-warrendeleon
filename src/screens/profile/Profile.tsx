import React, {JSX} from 'react';
import {Dimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {useSelector} from 'react-redux';
import {
  Box,
  Center,
  Divider,
  Image,
  ScrollView,
  useColorModeValue,
  ZStack,
} from 'native-base';

import {HorizontalImgCarousel} from '@app/components/molecules/horizontal-img-carousel/HorizontalImgCarousel';
import {profileSelector} from '@app/modules';

export const Profile = (): JSX.Element => {
  const profile = useSelector(profileSelector);
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height * 0.5;
  return (
    <ZStack flex={1} bgColor={useColorModeValue('#F2F2F2FF', 'gray.900')}>
      <HorizontalImgCarousel width={width} height={height} profile={profile} />
      <ScrollView w={'full'} h={'full'} showsVerticalScrollIndicator={false}>
        <Box w={'full'} h={height} />
        <Box
          w={'full'}
          roundedTop={'2xl'}
          px={4}
          h={10000}
          shadow={4}
          bgColor={useColorModeValue('white', 'muted.800')}>
          <Center>
            <Divider thickness="4" rounded={'2xl'} width={8} m={4} />
          </Center>
          Content here
        </Box>
      </ScrollView>
    </ZStack>
  );
};

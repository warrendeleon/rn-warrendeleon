import React, {JSX} from 'react';
import {Dimensions} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {useSelector} from 'react-redux';
import {Box, Image, ScrollView, ZStack} from 'native-base';

import {profileSelector} from '@app/modules';

export const Profile = (): JSX.Element => {
  const profile = useSelector(profileSelector);
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height * 0.5;
  return (
    <ZStack flex={1} bgColor={'black'}>
      <Box width={'full'} height={'50%'} position={'absolute'} top={0}>
        <Carousel
          loop
          width={width}
          height={height}
          autoPlay={true}
          data={profile.carousel}
          scrollAnimationDuration={1000}
          mode="parallax"
          modeConfig={{
            parallaxScrollingOffset: 50,
            parallaxScrollingScale: 0.9,
          }}
          autoPlayInterval={5000}
          renderItem={({item, index}) => (
            <Image
              key={index}
              w={'full'}
              h={'full'}
              resizeMode="cover"
              alt={'image profile'}
              source={{
                uri: item,
              }}
            />
          )}
        />
      </Box>
      <ScrollView w={'full'} h={'full'}>
        <Box w={'full'} h={height} />
        <Box
          w={'full'}
          roundedTop={'2xl'}
          p={4}
          pt={6}
          h={10000}
          bgColor={'white'}>
          Content here
        </Box>
      </ScrollView>
    </ZStack>
  );
};

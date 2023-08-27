import React from 'react';
import Carousel from 'react-native-reanimated-carousel';
import {Image} from 'native-base';

import {Profile} from '@app/types';

type HorizontalImgCarouselProps = {
  profile: Profile;
  height: number;
  width: number;
};

export const HorizontalImgCarousel = ({
  profile,
  height,
  width,
}: HorizontalImgCarouselProps): JSX.Element => {
  return (
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
      autoPlayInterval={1000}
      renderItem={({item, index}) => (
        <Image
          key={index}
          w={'full'}
          h={'full'}
          alt={'image profile'}
          source={{
            uri: item,
          }}
        />
      )}
    />
  );
};

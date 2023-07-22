import React, {JSX} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import {VStack} from 'native-base';

export const Videos = (): JSX.Element => {
  return (
    <VStack flex={1}>
      <YoutubePlayer height={300} videoId={'7mi80BSK_Qg'} />
    </VStack>
  );
};

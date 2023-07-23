import React, {JSX, useLayoutEffect} from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import {Box} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {RootStackParamList, ScreenNames} from '@app/navigators';

export const Video = (): JSX.Element => {
  const route = useRoute<RouteProp<RootStackParamList, ScreenNames.VIDEO>>();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.title,
    });
  }, [navigation, route]);

  return (
    <Box>
      <YoutubePlayer height={300} videoId={route.params.videoId} />
    </Box>
  );
};

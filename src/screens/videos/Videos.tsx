import React, {JSX} from 'react';
import {useSelector} from 'react-redux';
import {Box, FlatList} from 'native-base';

import {VideoCard} from '@app/components/atoms/buttons/video-card/VideoCard';
import {Video} from '@app/models/Video';
import {videosSelector} from '@app/modules/videos/selectors';

export const Videos = (): JSX.Element => {
  const videos: Video[] = useSelector(videosSelector);

  if (videos.length > 0) {
    return (
      <FlatList
        numColumns={2}
        keyExtractor={item => item.id}
        data={videos}
        renderItem={({item}) => <VideoCard item={item} onPress={() => {}} />}
      />
    );
  }

  return <Box />;
};

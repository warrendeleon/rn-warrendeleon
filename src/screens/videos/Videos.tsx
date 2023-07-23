import React, {JSX} from 'react';
import {useSelector} from 'react-redux';
import {Box, FlatList} from 'native-base';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {VideoCard} from '@app/components/atoms/buttons/video-card/VideoCard';
import {Video} from '@app/models/Video';
import {videosSelector} from '@app/modules/videos/selectors';
import {RootStackParamList, ScreenNames} from '@app/navigators';

export const Videos = (): JSX.Element => {
  const videos: Video[] = useSelector(videosSelector);
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, ScreenNames.VIDEOS>
    >();

  if (videos.length > 0) {
    return (
      <FlatList
        numColumns={2}
        keyExtractor={item => item.id}
        data={videos}
        renderItem={({item}) => (
          <VideoCard
            item={item}
            onPress={() => {
              navigation.navigate(ScreenNames.VIDEO, {
                title: item.snippet.title,
                videoId: item.snippet.resourceId.videoId,
              });
            }}
          />
        )}
      />
    );
  }

  return <Box />;
};

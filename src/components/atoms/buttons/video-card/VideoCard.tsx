import React, {JSX, PropsWithChildren} from 'react';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {Box, Image, Pressable, useColorModeValue} from 'native-base';

import {Video} from '@app/types/Video';

type VideoCardProps = PropsWithChildren<{
  item: Video;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
}>;

export const VideoCard = ({item, onPress}: VideoCardProps): JSX.Element => {
  const bgColor = useColorModeValue('white', 'dark.50');
  const pressedBgColor = useColorModeValue('coolGray.200', 'dark.100');

  return (
    <Pressable
      onPress={onPress}
      overflow="hidden"
      width={'50%'}
      height={48}
      p={2}>
      {({isPressed}) => {
        return (
          <Box
            shadow={2}
            p={1.5}
            height={'full'}
            width={'full'}
            bgColor={isPressed ? pressedBgColor : bgColor}
            style={{
              transform: [
                {
                  scale: isPressed ? 0.95 : 1,
                },
              ],
            }}
            rounded={'lg'}>
            <Box flex={4} alignItems={'center'} justifyContent={'flex-start'}>
              <Image
                rounded={'lg'}
                w={'full'}
                h={'full'}
                resizeMode="cover"
                source={{
                  uri: item.snippet.thumbnails.maxres?.url
                    ? item.snippet.thumbnails.maxres.url
                    : item.snippet.thumbnails.high.url,
                }}
                alt={item.snippet.title}
              />
            </Box>
            <Box
              pt={2}
              _text={{
                fontSize: 'xs',
                numberOfLines: 2,
                textAlign: 'center',
              }}
              alignItems={'center'}
              justifyContent={'center'}
              flex={1}>
              {item.snippet.title}
            </Box>
          </Box>
        );
      }}
    </Pressable>
  );
};

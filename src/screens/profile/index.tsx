import {
  Avatar,
  Box,
  Heading,
  HStack,
  useColorModeValue,
  VStack,
} from 'native-base';
import React, {useEffect, useState} from 'react';
import TrackPlayer, {
  IOSCategory,
  IOSCategoryMode,
} from 'react-native-track-player';
import {useDispatch, useSelector} from 'react-redux';
import {profileSelector} from '../../modules/profile/selectors';
import {getProfile} from '../../modules/profile/actions';
import {Profile as ProfileType} from '../../models/Profile';
import {AudioPlayerSetupService} from '../../service/audioPlayerSetupService';

export const Profile = () => {
  const profile = useSelector(profileSelector) as ProfileType;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    TrackPlayer.add({
      url: 'https://github.com/warrendeleon/rn-warrendeleon/blob/main/src/assets/audio/warren.m4a?raw=true',
      title: 'name pronunciation',
    });
    TrackPlayer.play();
  }, [profile]);

  return (
    <Box
      flex={1}
      px={4}
      bg={useColorModeValue('muted.100', 'blueGray.900')}
      safeArea>
      <HStack>
        <Avatar
          size="2xl"
          source={require('../../assets/img/profile-pic.png')}
        />
        <VStack px={4} alignSelf="center">
          <Heading size="lg">
            {profile?.name} {profile?.lastName}
          </Heading>
          <Heading size="sm">{profile?.headline}</Heading>
        </VStack>
      </HStack>
    </Box>
  );
};

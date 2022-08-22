import {
  Avatar,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';
import React, {useCallback, useEffect} from 'react';
import TrackPlayer from 'react-native-track-player';
import {useDispatch, useSelector} from 'react-redux';
import {profileSelector} from '../../modules/profile/selectors';
import {getProfile} from '../../modules/profile/actions';
import {Profile as ProfileType} from '../../models/Profile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';
import MapView, {Marker} from 'react-native-maps';
import {StyleSheet} from 'react-native';

export const Profile = () => {
  const profile = useSelector(profileSelector) as ProfileType;
  const dispatch = useDispatch();
  const {t} = useTranslation();

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const onPress = useCallback(() => {
    TrackPlayer.reset();
    TrackPlayer.add({
      url: profile?.namePronunciationAudioTrack,
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
          accessibilityLabel={`${t('profile.accProfilePic')} ${profile?.name}`}
          size="2xl"
          source={{
            uri: profile?.profilePicture,
          }}>
          WD
        </Avatar>
        <VStack px={4} alignSelf="center">
          <Heading
            size="lg"
            accessibilityLabel={`${t('profile.accName')} ${profile?.name} ${
              profile?.lastName
            }`}>
            {profile?.name} {profile?.lastName}
          </Heading>
          <Heading
            size="sm"
            accessibilityLabel={`${t('profile.accHeadline')} ${
              profile?.headline
            }`}>
            {profile?.headline}
          </Heading>
        </VStack>
      </HStack>
      <VStack mt={4}>
        <HStack space={2} alignItems={'center'}>
          <Text accessible={false} bold>
            {t('profile.namePronunciation')}
          </Text>
          <Button
            accessibilityLabel={t('profile.accNamePronunciation')}
            onPress={onPress}
            leftIcon={<Icon as={Ionicons} name="md-play-sharp" />}>
            {profile?.namePronunciation}
          </Button>
        </HStack>
        {profile?.location?.coordinates && (
          <>
            <HStack mt={4} space={2} alignItems={'center'}>
              <Text bold>{t('profile.location')}</Text>
              <Text>
                {profile?.location?.cityTown}, {profile?.location?.county},{' '}
                {profile?.location?.country}
              </Text>
            </HStack>
            <Box mt={2} w={'full'} height={48}>
              <MapView
                style={StyleSheet.absoluteFill}
                initialCamera={{
                  pitch: 0,
                  heading: 0,
                  center: profile?.location?.coordinates,
                  altitude: 100000,
                }}>
                <Marker coordinate={profile?.location?.coordinates} />
              </MapView>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

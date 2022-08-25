import {
  Avatar,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
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
import {Platform, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {ScreenNames} from '../../navigators/ScreenNames';
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigators/ProfileNavigator';

export const Profile = () => {
  const profile = useSelector(profileSelector) as ProfileType;
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const navigation =
    useNavigation<
      NativeStackScreenProps<ProfileStackParamList, ScreenNames.INFO>
    >();

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

  const onPressPDFBtn = useCallback(
    () =>
      navigation.push(ScreenNames.PDF, {
        url: 'https://warrendeleon.com/docs/CV_WARREN_2022_EN.pdf',
      }),
    [navigation],
  );
  return (
    <Box
      flex={1}
      px={4}
      bg={useColorModeValue('white', 'blueGray.900')}
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
          <Button size={'sm'} mt={4} onPress={onPressPDFBtn}>
            CV PDF
          </Button>
        </VStack>
      </HStack>
      <VStack mt={4}>
        {profile?.namePronunciation && (
          <HStack w={'full'} h={10} space={2} alignItems={'center'}>
            <Icon as={MaterialIcons} name="record-voice-over" />
            <Text accessible={false} bold>
              {t('profile.namePronunciation')}
            </Text>
            <Button
              size={'xs'}
              accessibilityLabel={t('profile.accNamePronunciation')}
              onPress={onPress}
              leftIcon={<Icon as={Ionicons} name="md-play-sharp" />}>
              {profile?.namePronunciation}
            </Button>
          </HStack>
        )}

        {profile?.birthday && (
          <HStack w={'full'} h={10} mt={4} space={2} alignItems={'center'}>
            <Icon as={FontAwesome5} name="birthday-cake" />
            <Text bold>{t('profile.birthday')}</Text>
            <Text>{profile.birthday}</Text>
          </HStack>
        )}

        {profile?.phone && (
          <HStack w={'full'} h={10} mt={4} space={2} alignItems={'center'}>
            <Icon as={MaterialIcons} name="phone-iphone" />
            <Text bold>{t('profile.phone')}</Text>
            <Link href={`tel:${profile.phone}`}>{profile.phone}</Link>
            <Link href={`sms:${profile.phone}`}>
              <IconButton
                size={'sm'}
                disabled={true}
                icon={<Icon as={FontAwesome5} name={'sms'} />}
              />
            </Link>
            <Link href={`whatsapp://send?phone=${profile.phone.slice(1)}`}>
              <IconButton
                size={'sm'}
                disabled={true}
                icon={<Icon as={MaterialCommunity} name={'whatsapp'} />}
              />
            </Link>
          </HStack>
        )}

        {profile?.email && (
          <HStack w={'full'} h={10} mt={4} space={2} alignItems={'center'}>
            <Icon as={MaterialIcons} name="alternate-email" />
            <Text bold>{t('profile.email')}</Text>
            <Link href={`mailto:${profile.email}`}>{profile.email}</Link>
          </HStack>
        )}

        {profile?.location?.coordinates && (
          <>
            <HStack w={'full'} h={10} mt={4} space={2} alignItems={'center'}>
              <Icon as={MaterialCommunity} name="map-marker" />
              <Text bold>{t('profile.location')}</Text>
              <Link
                href={Platform.select({
                  ios: `maps:0,0?q=Warren location@${profile?.location?.coordinates?.latitude},${profile?.location?.coordinates?.longitude}`,
                  android: `geo:0,0?q=${profile?.location?.coordinates?.latitude},${profile?.location?.coordinates?.longitude}(Warren location)`,
                })}>
                {profile?.location?.cityTown}, {profile?.location?.county},{' '}
                {profile?.location?.country}
              </Link>
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

import React, {JSX} from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions} from 'react-native';
import {useSelector} from 'react-redux';
import {
  Box,
  Center,
  Divider,
  Heading,
  HStack,
  ScrollView,
  useColorModeValue,
  ZStack,
} from 'native-base';

import {
  faFacebook,
  faInstagram,
  faLinkedinIn,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';

import {IconButton, TextWithLabel} from '@app/atoms';
import {ProfileMap} from '@app/components/organisms/profile-map/ProfileMap';
import {profileSelector} from '@app/modules';
import {HorizontalImgCarousel} from '@app/molecules';

export const Profile = (): JSX.Element => {
  const {t} = useTranslation();
  const profile = useSelector(profileSelector);
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height * 0.5;
  const socials = [
    {
      icon: faFacebook,
      label: 'Facebook',
      link: profile.socials.facebook,
    },
    {
      icon: faTwitter,
      label: 'Twitter',
      link: profile.socials.twitter,
    },
    {
      icon: faInstagram,
      label: 'Instagram',
      link: profile.socials.instagram,
    },
    {
      icon: faLinkedinIn,
      label: 'LinkedIn',
      link: profile.socials.linkedIn,
    },
  ];

  return (
    <ZStack flex={1} bgColor={useColorModeValue('coolGray.200', 'gray.900')}>
      <HorizontalImgCarousel width={width} height={height} profile={profile} />
      <ScrollView w={'full'} h={'full'} showsVerticalScrollIndicator={false}>
        <Box w={'full'} h={height} />
        <Box
          w={'full'}
          roundedTop={'2xl'}
          px={4}
          pb={4}
          shadow={4}
          bgColor={useColorModeValue('muted.100', 'muted.800')}>
          <Center>
            <Divider thickness="4" rounded={'2xl'} width={8} m={4} />
          </Center>
          <Heading size={'md'} mb={2}>
            {profile.name} {profile.lastName}
          </Heading>
          <HStack my={2} space={4}>
            {socials.map((item, index) => (
              <IconButton
                key={index}
                label={item.label}
                iconBgColor={'white'}
                icon={item.icon}
                iconColor={'darkBlue.500'}
                link={item.link}
              />
            ))}
          </HStack>
          <TextWithLabel label={t('profile.phone')} text={profile.phone} />
          <TextWithLabel label={t('profile.email')} text={profile.email} />
          <TextWithLabel
            label={t('profile.birthday')}
            text={profile.birthday}
          />

          {profile?.location?.coordinates && (
            <ProfileMap
              label={t('profile.location')}
              location={profile.location}
            />
          )}
        </Box>
      </ScrollView>
    </ZStack>
  );
};

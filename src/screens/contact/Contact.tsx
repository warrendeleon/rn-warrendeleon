import React, {JSX} from 'react';
import {useSelector} from 'react-redux';
import {Avatar, Center, HStack, ScrollView, Text} from 'native-base';

import {faTelegram, faWhatsapp} from '@fortawesome/free-brands-svg-icons';
import {
  faAddressCard,
  faComment,
  faEnvelope,
  faPhone,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';

import {IconButton} from '@app/atoms';
import {profileSelector} from '@app/modules';

export const Contact = (): JSX.Element => {
  const profile = useSelector(profileSelector);

  return (
    <ScrollView flex={1} px={4} pt={8} pb={4}>
      <Center>
        <Avatar
          size="xl"
          source={{
            uri: profile.profilePicture,
          }}
        />
        <Text mt={2} fontSize="lg">
          {profile.name} {profile.lastName}
        </Text>
      </Center>
      <HStack mt={8} space={2}>
        <IconButton
          icon={faPhone}
          iconBgColor={'green.500'}
          link={`tel:${profile.phone}`}
          label={'Call'}
        />
        <IconButton
          icon={faComment}
          iconBgColor={'blue.500'}
          link={`sms:${profile.phone}`}
          label={'Text'}
        />
        <IconButton
          icon={faEnvelope}
          iconBgColor={'lightBlue.900'}
          link={`mailto:${profile.email}`}
          label={'Email'}
        />
        <IconButton
          icon={faVideo}
          iconBgColor={'pink.700'}
          link={`facetime:${profile.phone}`}
          label={'Facetime'}
        />
      </HStack>
      <HStack mt={8} space={2}>
        <IconButton
          icon={faWhatsapp}
          iconBgColor={'lime.500'}
          link={`whatsapp://send?phone=${profile.phone.slice(1)}`}
          label={'WhatsApp'}
        />
        <IconButton
          icon={faTelegram}
          iconBgColor={'lightBlue.500'}
          link={`tg://resolve?phone=${profile.phone}`}
          label={'Telegram'}
        />
      </HStack>
      <HStack mt={8} space={2}>
        <IconButton
          icon={faAddressCard}
          iconBgColor={'black'}
          link={
            'https://connect.poplme.co/addtocontacts/4295618903/OfIyQHPG/1/'
          }
          label={'Save contact'}
        />
      </HStack>
    </ScrollView>
  );
};

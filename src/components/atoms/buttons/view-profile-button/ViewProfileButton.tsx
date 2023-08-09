import React, {JSX} from 'react';
import {
  Avatar,
  Box,
  Heading,
  Pressable,
  Text,
  useColorModeValue,
  useTheme,
} from 'native-base';

import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

import {Profile} from '@app/models';

type ViewProfileButtonProps = {
  profilePicture: string;
  name: string;
  lastname: string;
};

export const ViewProfileButton = ({
  profilePicture,
  name,
  lastname,
}: ViewProfileButtonProps): JSX.Element => {
  const theme = useTheme();
  return (
    <Pressable
      px={4}
      alignItems={'center'}
      rounded={'lg'}
      width={'full'}
      height={20}
      flexDirection={'row'}
      bgColor={useColorModeValue('white', 'dark.50')}
      _pressed={{bgColor: useColorModeValue('muted.300', 'dark.100')}}>
      <Avatar
        size={'lg'}
        source={{
          uri: profilePicture,
        }}
      />
      <Box ml={2} flexGrow={2}>
        <Heading size={'sm'}>
          {name} {lastname}
        </Heading>
        <Text>View Profile</Text>
      </Box>

      <Box flexGrow={1} alignItems={'flex-end'} justifyContent={'center'}>
        <FontAwesomeIcon
          icon={faChevronRight}
          color={useColorModeValue(
            theme.colors.muted['500'],
            theme.colors.lightText,
          )}
        />
      </Box>
    </Pressable>
  );
};

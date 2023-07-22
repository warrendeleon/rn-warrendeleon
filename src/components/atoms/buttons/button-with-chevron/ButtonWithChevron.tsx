import React, {JSX} from 'react';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {
  Box,
  HStack,
  Pressable,
  Text,
  useColorModeValue,
  useTheme,
} from 'native-base';
import {ILinearGradientProps} from 'native-base/lib/typescript/components/primitives/Box/types';
import {
  ColorType,
  ResponsiveValue,
} from 'native-base/lib/typescript/components/types';

import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

type ButtonProps = {
  label: string;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  startIconBgColor: ResponsiveValue<
    ColorType | (string & {}) | ILinearGradientProps
  >;
  startIcon?: JSX.Element | Array<JSX.Element>;
  roundedTop: ResponsiveValue<
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | string
    | number
    | 'xs'
    | 'full'
    | 'none'
    | '3xl'
  >;
  roundedBottom: ResponsiveValue<
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | string
    | number
    | 'xs'
    | 'full'
    | 'none'
    | '3xl'
  >;
};

export const ButtonWithChevron = ({
  label,
  onPress,
  startIconBgColor,
  startIcon,
  roundedTop,
  roundedBottom,
}: ButtonProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      roundedTop={roundedTop}
      roundedBottom={roundedBottom}
      px={4}
      py={2}
      bgColor={useColorModeValue('white', 'dark.50')}
      _pressed={{bgColor: useColorModeValue('muted.300', 'dark.100')}}
      flexDirection={'row'}
      alignItems={'center'}
      justifyContent={'space-between'}>
      {startIcon && (
        <Box
          mr={4}
          size={7}
          rounded={'md'}
          alignItems={'center'}
          justifyContent={'center'}
          bgColor={startIconBgColor}>
          {startIcon}
        </Box>
      )}
      <HStack flex={1} alignItems={'center'} justifyContent={'space-between'}>
        <Text fontSize={'md'}>{label}</Text>
        <Box size={7} alignItems={'flex-end'} justifyContent={'center'}>
          <FontAwesomeIcon
            icon={faChevronRight}
            color={useColorModeValue(
              theme.colors.muted['500'],
              theme.colors.lightText,
            )}
          />
        </Box>
      </HStack>
    </Pressable>
  );
};

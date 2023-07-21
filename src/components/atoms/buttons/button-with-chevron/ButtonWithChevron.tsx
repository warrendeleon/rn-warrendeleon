import React, {JSX} from 'react';
import {
  Box,
  HStack,
  Pressable,
  Text,
  useColorModeValue,
  useTheme,
} from 'native-base';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {
  ColorType,
  ResponsiveValue,
} from 'native-base/lib/typescript/components/types';
import {ILinearGradientProps} from 'native-base/lib/typescript/components/primitives/Box/types';

type ButtonProps = {
  label: string;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  startIconBgColor: ResponsiveValue<
    ColorType | (string & {}) | ILinearGradientProps
  >;
  startIcon?: JSX.Element | Array<JSX.Element>;
};

export const ButtonWithChevron = ({
  label,
  onPress,
  startIconBgColor,
  startIcon,
}: ButtonProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      rounded={8}
      mt={2}
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

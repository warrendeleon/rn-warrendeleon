import React, {JSX} from 'react';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {Box, HStack, Pressable, Text, useColorModeValue} from 'native-base';
import {ResponsiveValue} from 'native-base/lib/typescript/components/types';

type SvgWithTitleProps = {
  label: string;
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  svg: JSX.Element | Array<JSX.Element>;
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

export const SvgWithTitle = ({
  label,
  onPress,
  roundedTop,
  roundedBottom,
  svg,
}: SvgWithTitleProps): JSX.Element => {
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
      {svg && (
        <Box
          mr={4}
          size={'24'}
          p={3}
          rounded={'full'}
          alignItems={'center'}
          bgColor={'muted.100'}
          justifyContent={'center'}>
          {svg}
        </Box>
      )}
      <HStack flex={1} alignItems={'center'} justifyContent={'space-between'}>
        <Text fontSize={'md'}>{label}</Text>
      </HStack>
    </Pressable>
  );
};

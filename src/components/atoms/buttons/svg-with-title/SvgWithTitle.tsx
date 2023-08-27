import React, {JSX} from 'react';
import {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import {Box, Heading, Pressable, Text, useColorModeValue} from 'native-base';
import {ResponsiveValue} from 'native-base/lib/typescript/components/types';

type SvgWithTitleProps = {
  label: string;
  title: string;
  subtitle: string;
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
  title,
  subtitle,
}: SvgWithTitleProps): JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      roundedTop={roundedTop}
      roundedBottom={roundedBottom}
      px={4}
      alignItems={'center'}
      rounded={'lg'}
      width={'full'}
      height={20}
      flexDirection={'row'}
      bgColor={useColorModeValue('white', 'dark.50')}
      _pressed={{bgColor: useColorModeValue('muted.300', 'dark.100')}}>
      {svg && (
        <Box
          mr={4}
          size={'16'}
          p={3}
          rounded={'full'}
          alignItems={'center'}
          bgColor={'muted.100'}
          justifyContent={'center'}>
          {svg}
        </Box>
      )}
      <Box ml={2} flexGrow={2}>
        <Heading size={'sm'}>{label}</Heading>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </Box>
    </Pressable>
  );
};

import React, {JSX, PropsWithChildren} from 'react';
import {Link, Pressable, Text, useColorModeValue, VStack} from 'native-base';
import {ILinearGradientProps} from 'native-base/lib/typescript/components/primitives/Box/types';
import {
  ColorType,
  ResponsiveValue,
} from 'native-base/lib/typescript/components/types';

import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

type IconButtonProps = PropsWithChildren<{
  label: string;
  link: string;
  icon: IconDefinition;
  iconBgColor: ResponsiveValue<
    ColorType | (string & {}) | ILinearGradientProps
  >;
}>;

export const IconButton = ({
  icon,
  iconBgColor,
  label,
  link,
}: IconButtonProps): JSX.Element => {
  const bgColor = useColorModeValue(iconBgColor, 'dark.50');
  return (
    <Pressable flex={1} height={16}>
      {({isPressed}) => {
        return (
          <Link flex={1} href={link}>
            <VStack
              bgColor={bgColor}
              style={{
                transform: [
                  {
                    scale: isPressed ? 0.95 : 1,
                  },
                ],
              }}
              flex={1}
              rounded={'lg'}
              alignItems={'center'}
              justifyContent={'center'}
              space={1}
              padding={1}
              height={16}>
              <FontAwesomeIcon size={18} icon={icon} color={'white'} />
              <Text fontSize={'xs'} color={'white'}>
                {label}
              </Text>
            </VStack>
          </Link>
        );
      }}
    </Pressable>
  );
};

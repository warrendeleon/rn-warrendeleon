import React from 'react';
import {
  Box,
  Heading,
  HStack,
  Pressable,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';
import {SvgWithCssUri} from 'react-native-svg';
import {GestureResponderEvent} from 'react-native';

interface ListItemProps {
  gradStart: string[];
  gradEnd: string[];
  header: string;
  content: string;
  dateStart: string;
  dateEnd: string;
  logo: string;
  onPress: (event: GestureResponderEvent) => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  gradStart,
  gradEnd,
  header,
  content,
  dateStart,
  dateEnd,
  logo,
  onPress,
}) => {
  const gStart = useColorModeValue(gradStart[0], gradStart[1]);
  const gEnd = useColorModeValue(gradEnd[0], gradEnd[1]);
  const textColor = useColorModeValue('darkText', 'lightText');
  const pressedBG = {
    linearGradient: {
      colors: [gEnd, gStart],
      start: [0, 0],
      end: [0, 1],
    },
  };
  const nonPressedBG = {
    linearGradient: {
      colors: [gStart, gEnd],
      start: [0, 0],
      end: [0, 1],
    },
  };

  return (
    <Pressable flex={1} padding={1} onPress={onPress}>
      {({isPressed}) => {
        return (
          <Box
            flex={1}
            shadow="3"
            my={1}
            bg={isPressed ? pressedBG : nonPressedBG}
            p="3"
            rounded="lg"
            style={{
              transform: [
                {
                  scale: isPressed ? 0.98 : 1,
                },
              ],
            }}>
            <HStack flex={1}>
              {logo && (
                <VStack justifyContent="center">
                  <Box alignItems="center" size={16} overflow="hidden" mr={2}>
                    <SvgWithCssUri width="100%" height="100%" uri={logo} />
                  </Box>
                </VStack>
              )}

              <VStack justifyContent={'center'} flex={1} overflow="hidden">
                <Heading size="sm" color={textColor} shadow="2">
                  {header}
                </Heading>

                <Text
                  fontSize="sm"
                  shadow="2"
                  numberOfLines={2}
                  mb={2}
                  textTransform="uppercase"
                  color={textColor}>
                  {content}
                </Text>

                <Text fontSize={'xs'} color={textColor} shadow="2">
                  {dateStart} - {dateEnd}
                </Text>
              </VStack>
            </HStack>
          </Box>
        );
      }}
    </Pressable>
  );
};

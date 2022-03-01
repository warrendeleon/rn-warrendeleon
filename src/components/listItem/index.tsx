import React from 'react';
import {
  Box,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';
import {StyleSheet} from 'react-native';
import {SvgWithCssUri} from 'react-native-svg';

interface ListItemProps {
  gradStart: string[];
  gradEnd: string[];
  header: string;
  content: string;
  dateStart: string;
  dateEnd: string;
  logo: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  gradStart,
  gradEnd,
  header,
  content,
  dateStart,
  dateEnd,
  logo,
}) => {
  const gStart = useColorModeValue(gradStart[0], gradStart[1]);
  const gEnd = useColorModeValue(gradEnd[0], gradEnd[1]);
  const textColor = useColorModeValue('darkText', 'lightText');
  return (
    <Box flex={1} padding={1}>
      <Box
        bg={{
          linearGradient: {
            colors: [gStart, gEnd],
            start: [0, 0],
            end: [0, 1],
          },
        }}
        p="3"
        flex={1}
        rounded="lg">
        <HStack>
          {logo && (
            <Box alignItems="center" size={24} overflow={'hidden'}>
              <SvgWithCssUri width={'100%'} height={'100%'} uri={logo} />
            </Box>
          )}

          <VStack flexGrow={1} pl={2} justifyContent={'center'}>
            <Heading size="sm" color={textColor} shadow="2">
              {header}
            </Heading>
            <Text
              fontSize="sm"
              shadow="2"
              mt={2}
              style={StyleSheet.flatten({textTransform: 'uppercase'})}
              color={textColor}>
              {content}
            </Text>
            <Text fontSize={'2xs'} color={textColor} shadow="6">
              {dateStart} - {dateEnd}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
};

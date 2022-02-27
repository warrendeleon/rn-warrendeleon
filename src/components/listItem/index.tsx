import React from 'react';
import {Box, Center, Heading, Text, useColorModeValue} from 'native-base';
import {StyleSheet} from 'react-native';

export const ListItem = ({
  gradStart,
  gradEnd,
  header,
  content,
  dateStart,
  dateEnd,
}) => {
  const gStart = useColorModeValue(gradStart[0], gradStart[1]);
  const gEnd = useColorModeValue(gradEnd[0], gradEnd[1]);
  const textColor = useColorModeValue("darkText", "lightText");
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
        p="5"
        flex={1}
        rounded="lg">
        <Center>
          <Heading size="lg" color={textColor} shadow="2">
            {header}
          </Heading>
          <Heading
            size="sm"
            shadow="2"
            mt={2.5}
            style={StyleSheet.flatten({textTransform: 'uppercase'})}
            color={textColor}>
            {content}
          </Heading>
          <Text fontSize={'md'} color={textColor} shadow="6">
            {dateStart} - {dateEnd}
          </Text>
        </Center>
      </Box>
    </Box>
  );
};

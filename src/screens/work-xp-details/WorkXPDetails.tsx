import React, {useLayoutEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {SvgWithCssUri} from 'react-native-svg';
import {useSelector} from 'react-redux';
import {
  Badge,
  Box,
  Heading,
  HStack,
  ScrollView,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {workXPDetailsSelector} from '@app/modules';
import {RootStackParamList, ScreenNames} from '@app/navigators';
import {RootState} from '@app/redux';

export const WorkXPDetails = () => {
  const navigation = useNavigation();
  const {params} =
    useRoute<RouteProp<RootStackParamList, ScreenNames.WORK_XP_DETAILS>>();
  const info = useSelector((state: RootState) =>
    workXPDetailsSelector(state, params?.workXPId || ''),
  );

  useLayoutEffect(() => {
    if (params?.workXPId) {
      navigation.setOptions({title: info?.company});
    }
  }, [info, navigation, params]);

  const containerBgColor = useColorModeValue('white', 'dark.50');
  const bulletColor = useColorModeValue('black', 'white');
  const badgeVariant = useColorModeValue('light', 'dark');

  const {t} = useTranslation();
  return (
    <ScrollView
      bounces={false}
      flex={1}
      contentContainerStyle={StyleSheet.flatten({paddingBottom: 120})}>
      <Box flex={1} p={5}>
        <VStack>
          <Box alignItems="center" height={24} width={'full'} mb={5}>
            <Box size={24} rounded={'full'} bgColor={'white'} p={4}>
              <SvgWithCssUri width="100%" height="100%" uri={info?.logo} />
            </Box>
          </Box>
          {info?.position && (
            <Box alignItems="center" mb={5}>
              <Heading>{info?.position}</Heading>
            </Box>
          )}
          {info?.programmingLanguages && (
            <VStack
              rounded={'lg'}
              bgColor={containerBgColor}
              py={3}
              px={4}
              my={2}
              space={1}>
              <Text fontSize={'2xs'} fontWeight={'bold'}>
                {t('workXPDetails.programmingLanguages')}
              </Text>
              <HStack space={1} flex={1} flexWrap={'wrap'}>
                {info?.programmingLanguages?.map(item => (
                  <Badge key={item} colorScheme={badgeVariant} my={1}>
                    {item}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}

          {info?.techStack && (
            <VStack
              rounded={'lg'}
              bgColor={containerBgColor}
              py={3}
              px={4}
              my={2}
              space={1}>
              <Text fontSize={'2xs'} fontWeight={'bold'}>
                {t('workXPDetails.techStack')}
              </Text>
              <HStack space={1} flex={3} flexWrap={'wrap'}>
                {info?.techStack?.map(item => (
                  <Badge key={item} colorScheme={badgeVariant} my={1}>
                    {item}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}

          {info?.devTools && (
            <VStack
              rounded={'lg'}
              bgColor={containerBgColor}
              py={3}
              px={4}
              my={2}
              space={1}>
              <Text fontSize={'2xs'} fontWeight={'bold'}>
                {t('workXPDetails.devTools')}
              </Text>
              <HStack space={1} flex={2} flexWrap={'wrap'}>
                {info?.devTools?.map(item => (
                  <Badge key={item} colorScheme={badgeVariant} my={1}>
                    {item}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}

          {info?.agileMethodology && (
            <VStack
              rounded={'lg'}
              bgColor={containerBgColor}
              py={3}
              px={4}
              my={2}
              space={1}>
              <Text fontSize={'2xs'} fontWeight={'bold'}>
                {t('workXPDetails.agileMethodology')}
              </Text>
              <HStack space={1} flex={1} flexWrap={'wrap'}>
                {info?.agileMethodology?.map(item => (
                  <Badge key={item} colorScheme={badgeVariant} my={1}>
                    {item}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          )}

          {info?.description && (
            <VStack
              rounded={'lg'}
              bgColor={containerBgColor}
              py={3}
              px={4}
              my={2}>
              <Text fontSize={'2xs'} fontWeight={'bold'}>
                {t('workXPDetails.description')}
              </Text>
              <Markdown
                style={{
                  bullet_list: {
                    color: bulletColor,
                  },
                }}
                rules={{
                  bullet_list: (node, children) => (
                    <Box key={node.key} pb={5}>
                      {children}
                    </Box>
                  ),

                  list_item: (node, children) => {
                    return (
                      <HStack key={node.key} space={2} pl={6} pr={5}>
                        <Text>{'\u2022'}</Text>
                        <Text>{children}</Text>
                      </HStack>
                    );
                  },
                  // Emphasis
                  strong: (node, children, parent, styles) => (
                    <Text key={node.key} style={styles.strong}>
                      {children}
                    </Text>
                  ),
                  text: node => <Text key={node.key}>{node.content}</Text>,
                }}>
                {info?.description}
              </Markdown>
            </VStack>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
};

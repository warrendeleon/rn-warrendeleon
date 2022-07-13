import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkXPStackParamList} from '../../navigators/WorkXPNavigator';
import {useSelector} from 'react-redux';
import {jobInfoSelector} from '../../modules/workXP/selectors';
import {RootState} from '../../redux/configureStore';
import {ScreenNames} from '../../navigators/ScreenNames';
import {
  Badge,
  Box,
  Center,
  Heading,
  HStack,
  ScrollView,
  Text,
  useColorModeValue,
  VStack,
} from 'native-base';
import {SvgWithCssUri} from 'react-native-svg';
import {useTranslation} from 'react-i18next';

export const JobDescription = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkXPStackParamList, ScreenNames.CLIENTS>) => {
  const {id} = route.params;
  const info = useSelector((state: RootState) => jobInfoSelector(state, id));
  navigation.setOptions({title: info?.company});

  const {t} = useTranslation();
  return (
    <ScrollView
      bounces={false}
      flex={1}
      bg={useColorModeValue('muted.100', 'blueGray.900')}
      contentContainerStyle={{paddingBottom: 120}}>
      <Box flex={1} p={5}>
        <VStack>
          <Box alignItems="center" size={24} w={'full'} mb={5}>
            <SvgWithCssUri width="100%" height="100%" uri={info?.logo} />
          </Box>
          <Box alignItems="center" mb={5}>
            <Heading>{info?.position}</Heading>
          </Box>
          <HStack w={'full'} mt={2}>
            <Text mt={1} mr={2} bold>
              {t('jobDescription.programmingLanguages')}
            </Text>
            <HStack space={1} flex={1} flexWrap={'wrap'}>
              {info?.programmingLanguages?.map(item => (
                <Badge
                  key={item}
                  colorScheme={'info'}
                  variant={'outline'}
                  my={1}>
                  {item}
                </Badge>
              ))}
            </HStack>
          </HStack>

          <HStack w={'full'} mt={2}>
            <Text flex={1} mt={1} mr={2} bold>
              {t('jobDescription.techStack')}
            </Text>
            <HStack space={1} flex={3} flexWrap={'wrap'}>
              {info?.techStack?.map(item => (
                <Badge
                  key={item}
                  colorScheme={'info'}
                  variant={'outline'}
                  my={1}>
                  {item}
                </Badge>
              ))}
            </HStack>
          </HStack>

          <HStack w={'full'} mt={2}>
            <Text flex={1} mt={1} mr={2} bold>
              {t('jobDescription.devTools')}
            </Text>
            <HStack space={1} flex={2} flexWrap={'wrap'}>
              {info?.devTools?.map(item => (
                <Badge
                  key={item}
                  colorScheme={'info'}
                  variant={'outline'}
                  my={1}>
                  {item}
                </Badge>
              ))}
            </HStack>
          </HStack>

          <HStack w={'full'} mt={2}>
            <Text mt={1} mr={2} bold>
              {t('jobDescription.agileMethodology')}
            </Text>
            <HStack space={1} flex={1} flexWrap={'wrap'}>
              {info?.agileMethodology?.map(item => (
                <Badge
                  key={item}
                  colorScheme={'info'}
                  variant={'outline'}
                  my={1}>
                  {item}
                </Badge>
              ))}
            </HStack>
          </HStack>

          <Box
            bgColor={useColorModeValue('white', 'coolGray.800')}
            mt={10}
            p={5}
            w={'full'}>
            <Text fontSize={'md'}>{info?.description}</Text>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
};

import React, {useCallback, useEffect} from 'react';
import {
  Avatar,
  Box,
  FlatList,
  HStack,
  Pressable,
  useColorModeValue,
  VStack,
} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {clinicsSelector} from '../../modules/clinics/selectors';
import {getClinics} from '../../modules/clinics/actions';
import {SalveStackParamList} from '../../navigators/SalveNavigator';
import {ScreenNames} from '../../navigators/ScreenNames';
import {ClinicListItem} from '../../components/ClinicListItem';

export const Clinics = ({
  navigation,
}: NativeStackScreenProps<SalveStackParamList, ScreenNames.CLINICS>) => {
  const dispatch = useDispatch();
  const clinics = useSelector(clinicsSelector);
  useEffect(() => {
    dispatch(getClinics());
  }, [dispatch]);
  const logo = useColorModeValue(
    require('../../assets/animations/logo/dark.json'),
    require('../../assets/animations/logo/light.json'),
  );

  const onPress = useCallback(
    (id: number) => () => {
      //TODO Use ID to navigate to patients of that clinic.
      console.log('ID: ', id);
      navigation.push(ScreenNames.PATIENTS, {clinicId: id});
    },
    [navigation],
  );

  return (
    <Box flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')} safeArea>
      <Box flexGrow={0} px={4}>
        <FlatList
          data={clinics}
          keyExtractor={item => `${item.id}`}
          contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
          renderItem={({item, index}) => {
            return (
              <>
                {index === 0 && (
                  <Box height={50}>
                    <LottieView source={logo} autoPlay />
                  </Box>
                )}
                <Pressable onPress={onPress(item.id)}>
                  {({isPressed}) => {
                    return <ClinicListItem isPressed={isPressed} item={item} />;
                  }}
                </Pressable>
              </>
            );
          }}
        />
      </Box>
    </Box>
  );
};

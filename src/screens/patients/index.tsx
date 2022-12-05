import React, {useCallback, useEffect} from 'react';
import {Box, FlatList, Pressable, useColorModeValue} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SalveStackParamList} from '../../navigators/SalveNavigator';
import {ScreenNames} from '../../navigators/ScreenNames';
import {getPatients} from '../../modules/patients/actions';
import {patientsSelector} from '../../modules/patients/selectors';
import {PatientListItem} from '../../components/PatientListItem';

export const Patients = ({
  navigation,
  route,
}: NativeStackScreenProps<SalveStackParamList, ScreenNames.PATIENTS>) => {
  const {clinicId} = route.params;
  const dispatch = useDispatch();
  const patients = useSelector(patientsSelector);
  useEffect(() => {
    dispatch(getPatients(clinicId));
  }, [clinicId, dispatch]);
  const logo = useColorModeValue(
    require('../../assets/animations/logo/dark.json'),
    require('../../assets/animations/logo/light.json'),
  );

  const onPress = useCallback(
    (id: number) => () => {
      //TODO Use ID to navigate to patient info.
      console.log('ID: ', id);
    },
    [],
  );

  return (
    <Box flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')}>
      <Box flexGrow={0} p={4}>
        <FlatList
          data={patients}
          keyExtractor={item => `${item.id}`}
          contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
          renderItem={({item, index}) => {
            return (
              <Pressable onPress={onPress(item.id)}>
                {({isPressed}) => {
                  return <PatientListItem isPressed={isPressed} item={item} />;
                }}
              </Pressable>
            );
          }}
        />
      </Box>
    </Box>
  );
};

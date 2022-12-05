import React, {useCallback, useEffect, useState} from 'react';
import {
  Actionsheet,
  Box,
  FlatList,
  Icon,
  IconButton,
  Pressable,
  useColorModeValue,
  useDisclose,
} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SalveStackParamList} from '../../navigators/SalveNavigator';
import {ScreenNames} from '../../navigators/ScreenNames';
import {getPatients} from '../../modules/patients/actions';
import {patientFilteredSelector} from '../../modules/patients/selectors';
import {PatientListItem} from '../../components/PatientListItem';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootState} from '../../redux/configureStore';

export const Patients = ({
  navigation,
  route,
}: NativeStackScreenProps<SalveStackParamList, ScreenNames.PATIENTS>) => {
  const {clinicId} = route.params;
  const dispatch = useDispatch();
  const [filterBy, setFilterBy] = useState('first_name');
  const patients = useSelector((state: RootState) =>
    patientFilteredSelector(state, filterBy),
  );

  const {isOpen, onOpen, onClose} = useDisclose();

  navigation.setOptions({
    headerRight: () => (
      <IconButton
        onPress={onOpen}
        _icon={{
          as: MaterialCommunity,
          name: 'filter-menu-outline',
        }}
      />
    ),
  });

  useEffect(() => {
    dispatch(getPatients(clinicId));
  }, [clinicId, dispatch]);

  const onOptionPressed = useCallback(
    (filter: string) => () => {
      setFilterBy(filter);
    },
    [],
  );

  return (
    <>
      <Box flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')} p={4}>
        <FlatList
          data={patients}
          keyExtractor={item => `${item.id}`}
          contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
          renderItem={({item}) => {
            return (
              <Pressable>
                {({isPressed}) => {
                  return <PatientListItem isPressed={isPressed} item={item} />;
                }}
              </Pressable>
            );
          }}
        />
      </Box>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Actionsheet.Item
            onPress={onOptionPressed('first_name')}
            startIcon={
              <Icon
                as={MaterialCommunity}
                size="6"
                name="sort-alphabetical-ascending"
              />
            }>
            First Name
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={onOptionPressed('last_name')}
            startIcon={
              <Icon
                as={MaterialCommunity}
                size="6"
                name="sort-alphabetical-ascending"
              />
            }>
            Last Name
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={onOptionPressed('date_of_birth')}
            startIcon={
              <Icon
                as={MaterialCommunity}
                size="6"
                name="sort-calendar-ascending"
              />
            }>
            Date of Birth
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

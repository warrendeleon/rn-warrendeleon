import {FlatList} from 'native-base';
import React from 'react';
import {BlurredModalBG} from '../../components/blurredModalBG';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkXPStackParamList} from '../../navigators/WorkXPNavigator';
import {useSelector} from 'react-redux';
import {colorsSelector, clientsSelector} from '../../modules/workXP/selectors';
import {RootState} from '../../redux/configureStore';
import {StyleSheet} from 'react-native';
import {ListItem} from '../../components/listItem';

export const Clients = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkXPStackParamList, 'Projects'>) => {
  const {id} = route.params;
  const clients = useSelector((state: RootState) =>
    clientsSelector(state, id),
  );
  const colours = useSelector((state: RootState) => colorsSelector(state, id));
  return (
    <BlurredModalBG goBack={() => navigation.goBack()} title={'Projects'}>
      <FlatList
        data={clients}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          return (
            <ListItem
              gradStart={colours.gradStart}
              gradEnd={colours.gradEnd}
              header={item.name}
              content={item.position}
              dateStart={item.start}
              dateEnd={item.end}
              logo={item.logo}
              onPress={() => navigation.navigate('Clients', {id: item.id})}
            />
          );
        }}
      />
    </BlurredModalBG>
  );
};

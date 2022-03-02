import {FlatList} from 'native-base';
import React from 'react';
import {BlurredModalBG} from '../../components/blurredModalBG';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkXPStackParamList} from '../../navigators/WorkXPNavigator';
import {useSelector} from 'react-redux';
import {clientsSelector, colorsSelector} from '../../modules/workXP/selectors';
import {RootState} from '../../redux/configureStore';
import {ListItem} from '../../components/listItem';
import {ScreenNames} from '../../navigators/ScreenNames';

export const Clients = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkXPStackParamList, ScreenNames.CLIENTS>) => {
  const {id} = route.params;
  const clients = useSelector((state: RootState) => clientsSelector(state, id));
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
              onPress={() => {}}
            />
          );
        }}
      />
    </BlurredModalBG>
  );
};

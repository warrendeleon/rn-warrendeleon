import React, {useEffect} from 'react';
import {Box, FlatList, useColorModeValue} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {getWorkXP} from '../../modules/workXP/actions';
import {ListItem} from '../../components/listItem';
import {workXPSelector} from '../../modules/workXP/selectors';
import {StyleSheet} from 'react-native';

export const WorkXP = () => {
  const dispatch = useDispatch();
  const workXPData = useSelector(workXPSelector);
  useEffect(() => {
    dispatch(getWorkXP());
  }, [dispatch]);

  return (
    <Box
      flex={1}
      bg={useColorModeValue('muted.100', 'blueGray.900')}
      safeArea
      px={4}>
      <FlatList
        data={workXPData}
        keyExtractor={item => item.id}
        contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
        renderItem={({item}) => {
          return (
            <ListItem
              gradStart={item.gradStart}
              gradEnd={item.gradEnd}
              header={item.company}
              content={item.position}
              dateStart={item.start}
              dateEnd={item.end}
            />
          );
        }}
      />
    </Box>
  );
};

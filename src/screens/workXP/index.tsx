import React, {useEffect} from 'react';
import {Box, FlatList, useColorModeValue} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {getWorkXP} from '../../modules/workXP/actions';
import {ListItem} from '../../components/listItem';
import {workXPSelector} from '../../modules/workXP/selectors';
import {StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

export const WorkXP = () => {
  const dispatch = useDispatch();
  const workXPData = useSelector(workXPSelector);
  useEffect(() => {
    dispatch(getWorkXP());
  }, [dispatch]);
  const logo = useColorModeValue(
    require('../../assets/animations/logo/dark.json'),
    require('../../assets/animations/logo/light.json'),
  );

  return (
    <Box flex={1} bg={useColorModeValue('muted.100', 'blueGray.900')} safeArea>
      <Box flexGrow={0} px={4}>
        <FlatList
          data={workXPData}
          keyExtractor={item => item.id}
          contentContainerStyle={StyleSheet.flatten({paddingBottom: 90})}
          renderItem={({item, index}) => {
            return (
              <>
                {index === 0 && (
                  <Box height={50}>
                    <LottieView source={logo} autoPlay />
                  </Box>
                )}
                <ListItem
                  gradStart={item.gradStart}
                  gradEnd={item.gradEnd}
                  header={item.company}
                  content={item.position}
                  dateStart={item.start}
                  dateEnd={item.end}
                  logo={item.logo}
                />
              </>
            );
          }}
        />
      </Box>
    </Box>
  );
};

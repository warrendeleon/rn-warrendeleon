import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Placeholder} from '../screens/placeholder';
import {Icon, Text, useColorModeValue, useToken, VStack} from 'native-base';
import {BlurView} from '@react-native-community/blur';
import {Pressable, StyleSheet} from 'react-native';
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@native-base/icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Settings} from '../screens/settings';
import {IconProps} from 'react-native-vector-icons/Icon';
import {WorkXPStackNavigator} from './WorkXPNavigator';
import {NavigatorNames, ScreenNames} from './ScreenNames';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/configureStore';
import {setLanguage} from '../modules/settings/actions';
import {isPendingSelector} from '../modules/status/selectors';
import {Loading} from '../screens/loading';
import {NandosStackNavigator} from './NandosNavigator';

type TabBarParamList = {
  [NavigatorNames.WORK_XP]: {title: string} | undefined;
  [ScreenNames.STUDIES]: {title: string} | undefined;
  [ScreenNames.INFO]: {title: string} | undefined;
  [ScreenNames.SETTINGS]: {title: string} | undefined;
  [NavigatorNames.NANDOS]: {title: string} | undefined;
};

const Tab = createBottomTabNavigator<TabBarParamList>();

export const TabNavigator = () => {
  const {t} = useTranslation();
  const [
    activeTintColorLight,
    activeTintColorDark,
    inactiveTintColorLight,
    inactiveTintColorDark,
  ] = useToken('colors', [
    'blueGray.900',
    'lime.500',
    'muted.200',
    'muted.400',
  ]);
  const tabBarActiveTintColor = useColorModeValue(
    activeTintColorLight,
    activeTintColorDark,
  );

  const tabBarInactiveTintColor = useColorModeValue(
    inactiveTintColorLight,
    inactiveTintColorDark,
  );

  const isLanguageChanging = useSelector((state: RootState) =>
    isPendingSelector(state, setLanguage.typePrefix),
  );

  if (isLanguageChanging) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            height: 90,
            borderRadius: 25,
            borderTopWidth: 0,
            elevation: 4,
          },
          tabBarActiveTintColor,
          tabBarInactiveTintColor,
          tabBarBackground: () => (
            <BlurView
              blurType={'dark'}
              blurAmount={50}
              style={[
                StyleSheet.absoluteFill,
                StyleSheet.flatten({
                  borderRadius: 25,
                }),
              ]}
            />
          ),
          tabBarShowLabel: false,
          tabBarButton: props => (
            <Pressable
              {...props}
              style={StyleSheet.flatten({
                flex: 1,
                height: 90,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              })}
            />
          ),
          tabBarIcon: props => {
            const CustomIcon = (p: IconProps) => {
              switch (route.name) {
                case NavigatorNames.WORK_XP:
                  return <AntDesign {...p} name={'codesquareo'} />;
                case ScreenNames.SETTINGS:
                  return <FontAwesome5 {...p} name={'cog'} />;
                case ScreenNames.STUDIES:
                  return <FontAwesome5 {...p} name={'user-graduate'} />;
                case NavigatorNames.NANDOS:
                  return (
                    <MaterialCommunityIcons {...p} name={'food-drumstick'} />
                  );
                default:
                  return <MaterialIcons {...p} name={'perm-device-info'} />;
              }
            };

            return (
              <VStack space={1} alignItems="center">
                <Icon color={props.color} size={7} as={CustomIcon} />
                <Text fontSize="sm" color={props.color}>
                  {route.params?.title ?? route.name}
                </Text>
              </VStack>
            );
          },
        })}>
        <Tab.Screen
          name={NavigatorNames.WORK_XP}
          component={WorkXPStackNavigator}
          initialParams={{title: t('tabs.workXP')}}
        />
        <Tab.Screen
          name={NavigatorNames.NANDOS}
          initialParams={{title: t('tabs.nandos')}}
          component={NandosStackNavigator}
        />
        {/*<Tab.Screen*/}
        {/*  name={ScreenNames.STUDIES}*/}
        {/*  component={Placeholder}*/}
        {/*  initialParams={{title: t('tabs.studies')}}*/}
        {/*/>*/}
        {/*<Tab.Screen*/}
        {/*  name={ScreenNames.INFO}*/}
        {/*  component={Placeholder}*/}
        {/*  initialParams={{title: t('tabs.info')}}*/}
        {/*/>*/}
        <Tab.Screen
          name={ScreenNames.SETTINGS}
          component={Settings}
          initialParams={{title: t('tabs.settings')}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

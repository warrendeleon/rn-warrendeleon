import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Placeholder} from '../screens/placeholder';
import {Icon, Text, useColorModeValue, useToken, VStack} from 'native-base';
import {BlurView} from '@react-native-community/blur';
import {Pressable, StyleSheet} from 'react-native';
import {AntDesign, MaterialIcons} from '@native-base/icons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {Settings} from '../screens/settings';
import {IconProps} from 'react-native-vector-icons/Icon';
import {WorkXPStackNavigator} from './WorkXPNavigator';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
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
                case 'Work XP':
                  return <AntDesign {...p} name={'codesquareo'} />;
                case 'Settings':
                  return <FontAwesome5 {...p} name={'cog'} />;
                case 'Studies':
                  return <FontAwesome5 {...p} name={'user-graduate'} />;
                default:
                  return <MaterialIcons {...p} name={'perm-device-info'} />;
              }
            };
            return (
              <VStack space={1} alignItems="center">
                <Icon color={props.color} size={7} as={CustomIcon} />
                <Text fontSize="sm" color={props.color}>
                  {route.name}
                </Text>
              </VStack>
            );
          },
        })}>
        <Tab.Screen name="Work XP" component={WorkXPStackNavigator} />
        <Tab.Screen name="Studies" component={Placeholder} />
        <Tab.Screen name="Info" component={Placeholder} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

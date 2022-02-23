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
import {WorkXP} from '../screens/workXP';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const [
    activeTintColorLight,
    activeTintColorDark,
    shadowColorLight,
    shadowColorDark,
    inactiveTintColorLight,
    inactiveTintColorDark,
  ] = useToken('colors', [
    'blueGray.900',
    'lime.500',
    'blueGray.900',
    'blue.200',
    'muted.200',
    'muted.400',
  ]);
  const shadowColor = useColorModeValue(shadowColorLight, shadowColorDark);
  const blurType = useColorModeValue('dark', 'light');
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
            shadowColor: shadowColor,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
          },
          tabBarActiveTintColor,
          tabBarInactiveTintColor,
          tabBarBackground: () => (
            <BlurView
              blurType={blurType}
              blurAmount={50}
              style={[
                StyleSheet.absoluteFill,
                StyleSheet.flatten({
                  borderRadius: 25,
                  opacity: 0.35,
                }),
              ]}
            />
          ),
          tabBarShowLabel: false,
          tabBarButton: props => (
            <Pressable
              {...props}
              style={{
                flex: 1,
                height: 90,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}
            />
          ),
          tabBarIcon: props => {
            const CustomIcon = props => {
              switch (route.name) {
                case 'Work XP':
                  return <AntDesign {...props} name={'codesquareo'} />;
                case 'Settings':
                  return <FontAwesome5 {...props} name={'cog'} />;
                case 'Studies':
                  return <FontAwesome5 {...props} name={'user-graduate'} />;
                default:
                  return <MaterialIcons {...props} name={'perm-device-info'} />;
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
        <Tab.Screen name="Work XP" component={WorkXP} />
        <Tab.Screen name="Studies" component={Placeholder} />
        <Tab.Screen name="Info" component={Placeholder} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

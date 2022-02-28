import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {EnhancedStore} from '@reduxjs/toolkit';
import {render} from '@testing-library/react-native';
import React from 'react';
import {Provider} from 'react-redux';
import {extendTheme, NativeBaseProvider} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import {store} from '../redux/configureStore';

const AllTheProviders: React.FC<{
  component: React.FC;
  customStore?: EnhancedStore;
}> = ({component, customStore = null}) => {
  const Stack = createNativeStackNavigator();
  return (
    <Provider store={customStore ? customStore : store}>
      <NativeBaseProvider
        config={{
          dependencies: {
            'linear-gradient': LinearGradient,
          },
        }}
        theme={extendTheme({
          config: {
            useSystemColorMode: false,
            initialColorMode: 'dark',
          },
        })}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="test" component={component} />
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </Provider>
  );
};

export const customRender = (
  component: React.FC,
  customStore?: EnhancedStore,
) => {
  return render(
    <AllTheProviders component={component} customStore={customStore} />,
  );
};

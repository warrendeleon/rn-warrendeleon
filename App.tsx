import React from 'react';
import {extendTheme, NativeBaseProvider} from 'native-base';
import {TabNavigator} from './src/navigators/TabBarNavigator';
import LinearGradient from 'react-native-linear-gradient';

export default function App() {
  return (
    <NativeBaseProvider
      config={{
        dependencies: {
          'linear-gradient': LinearGradient,
        },
      }}
      theme={extendTheme({
        useSystemColorMode: true,
      })}>
      <TabNavigator />
    </NativeBaseProvider>
  );
}

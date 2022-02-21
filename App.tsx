import React from 'react';
import {NativeBaseProvider} from 'native-base';
import {TabNavigator} from './src/navigators/TabBarNavigator';

export default function App() {
  return (
    <NativeBaseProvider>
      <TabNavigator />
    </NativeBaseProvider>
  );
}

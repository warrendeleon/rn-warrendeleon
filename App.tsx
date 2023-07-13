import React from 'react';
import StorybookUIRoot from './.ondevice/Storybook';
import {useCallback, useEffect, useState} from 'react';
import {NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigators/Root';

const App = (): JSX.Element => {
  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <RootNavigator />
      </NativeBaseProvider>
    </NavigationContainer>
  );
};

const Root = (): JSX.Element => {
  const [storybookActive, setStorybookActive] = useState(false);
  const toggleStorybook = useCallback(
    () => setStorybookActive(active => !active),
    [],
  );

  useEffect(() => {
    if (__DEV__) {
      const DevMenu = require('react-native-dev-menu');
      DevMenu.addItem('Toggle Storybook', toggleStorybook);
    }
  }, [toggleStorybook]);

  return storybookActive ? <StorybookUIRoot /> : <App />;
};

export default Root;

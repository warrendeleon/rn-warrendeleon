import React from 'react';
import StorybookUIRoot from './.ondevice/Storybook';
import {Text} from 'react-native';
import {useCallback, useEffect, useState} from 'react';

const App = (): JSX.Element => {
  return <Text>Hello World!</Text>;
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

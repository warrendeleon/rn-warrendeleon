import React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {NativeBaseProvider} from 'native-base';
import {store} from '@app/redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {Storybook} from '@rn-storybook';
import {injectStore} from '@app/redux/configureStore';
import {Splash} from '@app/screens';

const App = (): JSX.Element => {
  injectStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <Splash />
      </PersistGate>
    </Provider>
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

  return storybookActive ? (
    <NativeBaseProvider>
      <Storybook />
    </NativeBaseProvider>
  ) : (
    <App />
  );
};

export default Root;

import React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {RootNavigator} from '@app/navigators';
import {store} from '@app/redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {Storybook} from '@rn-storybook';
import {theme} from '@app/theme/Theme';
import {injectStore} from '@app/redux/configureStore';

const App = (): JSX.Element => {
  injectStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <NativeBaseProvider theme={theme}>
          <RootNavigator />
        </NativeBaseProvider>
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

import React from 'react';
import {extendTheme, NativeBaseProvider} from 'native-base';
import {TabNavigator} from './src/navigators/TabBarNavigator';
import LinearGradient from 'react-native-linear-gradient';
import {persistStore} from 'redux-persist';
import {store} from './src/redux/configureStore';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import {injectStore} from './src/httpClient';

export default function App() {
  injectStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
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
          <TabNavigator />
        </NativeBaseProvider>
      </PersistGate>
    </Provider>
  );
}

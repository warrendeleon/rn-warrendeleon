import React from 'react';
import {extendTheme, NativeBaseProvider} from 'native-base';
import {TabNavigator} from './src/navigators/TabBarNavigator';
import LinearGradient from 'react-native-linear-gradient';
import {persistStore} from 'redux-persist';
import {store} from './src/redux/configureStore';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';

export default function App() {
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
            useSystemColorMode: true,
          })}>
          <TabNavigator />
        </NativeBaseProvider>
      </PersistGate>
    </Provider>
  );
}

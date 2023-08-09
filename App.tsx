import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';

import {injectStore, store} from '@app/redux';
import {Splash} from '@app/screens';

const App = (): JSX.Element => {
  injectStore(store);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistStore(store)}>
        <GestureHandlerRootView style={styles.gestureHandler}>
          <Splash />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
});

export default App;

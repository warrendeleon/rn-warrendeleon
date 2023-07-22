import React from 'react';
import {store} from '@app/redux';
import {persistStore} from 'redux-persist';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
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

export default App;

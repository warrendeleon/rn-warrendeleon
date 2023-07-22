import React from 'react';
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
        <Splash />
      </PersistGate>
    </Provider>
  );
};

export default App;

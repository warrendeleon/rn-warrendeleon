import AsyncStorage from '@react-native-async-storage/async-storage';
import {configureStore} from '@reduxjs/toolkit';
import {CurriedGetDefaultMiddleware} from '@reduxjs/toolkit/src/getDefaultMiddleware';
import {AnyAction} from 'redux';
import {persistReducer} from 'redux-persist';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist/lib/constants';
import {ThunkAction} from 'redux-thunk';

import {rootReducer} from './rootReducer';

const REDUCERS_TO_PERSIST: string[] = [];
const REDUCERS_NOT_TO_PERSIST: string[] = ['status'];

const persistConfig = {
  blacklist: REDUCERS_NOT_TO_PERSIST,
  key: 'warrendeleon',
  storage: AsyncStorage,
  timeout: 1000,
  whitelist: REDUCERS_TO_PERSIST,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const createDebugger = require('redux-flipper').default;
export const store = configureStore({
  middleware: (getDefaultMiddleware: CurriedGetDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    });

    return __DEV__
      ? defaultMiddleware.concat(createDebugger())
      : defaultMiddleware;
  },
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

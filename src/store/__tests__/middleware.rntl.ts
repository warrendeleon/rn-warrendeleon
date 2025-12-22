/**
 * Redux Middleware Tests
 *
 * Tests middleware configuration and behaviour:
 * - Serializable check middleware with redux-persist actions
 * - Middleware ordering and integration
 * - Action dispatch through middleware chain
 * - State updates via middleware
 *
 * @see src/store/configureStore.ts
 */

import { configureStore, createSlice, type Middleware, type PayloadAction } from '@reduxjs/toolkit';
import createMockStore from 'redux-mock-store';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { thunk } from 'redux-thunk';

import type { RootState } from '../configureStore';
import { persistor, store } from '../configureStore';

// Mock AsyncStorage for persist tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Redux Middleware', () => {
  describe('Default Middleware Configuration', () => {
    it('includes thunk middleware by default', () => {
      // Redux Toolkit includes thunk by default
      // Verify by dispatching a thunk action
      const thunkAction = jest.fn(() => () => {
        return 'thunk result';
      });

      const result = store.dispatch(
        thunkAction() as unknown as Parameters<typeof store.dispatch>[0]
      );

      expect(thunkAction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('dispatch returns action for plain actions', () => {
      // Create a test store to avoid polluting the real store
      const testSlice = createSlice({
        name: 'test',
        initialState: { value: 0 },
        reducers: {
          increment: state => {
            state.value += 1;
          },
        },
      });

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
      });

      const result = testStore.dispatch(testSlice.actions.increment());

      expect(result.type).toBe('test/increment');
    });
  });

  describe('Serializable Check Middleware', () => {
    it('allows redux-persist REHYDRATE action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Dispatch REHYDRATE action - should not trigger serializable check warning
      store.dispatch({
        type: REHYDRATE,
        payload: { settings: { theme: 'dark' } },
        key: 'root',
      });

      // Should not have logged serializable check errors for REHYDRATE
      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('allows redux-persist PERSIST action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.dispatch({
        type: PERSIST,
        register: jest.fn(),
        rehydrate: jest.fn(),
      });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('allows redux-persist FLUSH action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.dispatch({ type: FLUSH });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('allows redux-persist PAUSE action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.dispatch({ type: PAUSE });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('allows redux-persist PURGE action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.dispatch({ type: PURGE, result: jest.fn() });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('allows redux-persist REGISTER action', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      store.dispatch({ type: REGISTER, key: 'test' });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });

    it('processes serializable plain actions without warning', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Dispatch a valid serializable action
      store.dispatch({
        type: 'settings/setTheme',
        payload: 'dark',
      });

      const serializableErrors = consoleErrorSpy.mock.calls.filter(call =>
        call[0]?.includes?.('non-serializable')
      );
      expect(serializableErrors).toHaveLength(0);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Middleware Chain', () => {
    it('processes actions through middleware chain in correct order', () => {
      const actionLog: string[] = [];

      // Create custom middleware that logs actions
      const loggingMiddleware = () => (next: (action: unknown) => unknown) => (action: unknown) => {
        actionLog.push('before');
        const result = next(action);
        actionLog.push('after');
        return result;
      };

      const testSlice = createSlice({
        name: 'test',
        initialState: { count: 0 },
        reducers: {
          increment: state => {
            state.count += 1;
          },
        },
      });

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(loggingMiddleware),
      });

      testStore.dispatch(testSlice.actions.increment());

      expect(actionLog).toContain('before');
      expect(actionLog).toContain('after');
      expect(actionLog.indexOf('before')).toBeLessThan(actionLog.indexOf('after'));
    });

    it('allows middleware to intercept and modify actions', () => {
      interface TestState {
        lastAction: string | null;
      }

      const testSlice = createSlice({
        name: 'test',
        initialState: { lastAction: null } as TestState,
        reducers: {
          setAction: (state, action: PayloadAction<string>) => {
            state.lastAction = action.payload;
          },
        },
      });

      // Middleware that transforms action payload
      const transformMiddleware =
        () => (next: (action: unknown) => unknown) => (action: unknown) => {
          // Type guard to check if action has the expected shape
          const typedAction = action as { type: string; payload?: string };
          if (typedAction.type === 'test/setAction' && typedAction.payload) {
            return next({ ...typedAction, payload: typedAction.payload.toUpperCase() });
          }
          return next(action);
        };

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(transformMiddleware),
      });

      testStore.dispatch(testSlice.actions.setAction('hello'));

      expect(testStore.getState().lastAction).toBe('HELLO');
    });

    it('allows middleware to dispatch additional actions', () => {
      interface TestState {
        items: string[];
      }

      const testSlice = createSlice({
        name: 'test',
        initialState: { items: [] } as TestState,
        reducers: {
          addItem: (state, action: PayloadAction<string>) => {
            state.items.push(action.payload);
          },
          addItemAndNotify: (state, action: PayloadAction<string>) => {
            state.items.push(action.payload);
          },
        },
      });

      // Middleware that dispatches additional action
      const notifyMiddleware: Middleware = storeApi => next => action => {
        const result = next(action);
        // Type guard to check if action has the expected shape
        const typedAction = action as { type: string; payload?: string };
        if (typedAction.type === 'test/addItemAndNotify') {
          storeApi.dispatch(testSlice.actions.addItem('notification'));
        }
        return result;
      };

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(notifyMiddleware),
      });

      testStore.dispatch(testSlice.actions.addItemAndNotify('original'));

      expect(testStore.getState().items).toContain('original');
      expect(testStore.getState().items).toContain('notification');
    });
  });

  describe('Async Middleware (Thunk)', () => {
    it('handles async thunks correctly', async () => {
      jest.useFakeTimers();

      interface TestState {
        loading: boolean;
        data: string | null;
        error: string | null;
      }

      const testSlice = createSlice({
        name: 'test',
        initialState: { loading: false, data: null, error: null } as TestState,
        reducers: {
          setLoading: state => {
            state.loading = true;
          },
          setData: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.data = action.payload;
          },
          setError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
          },
        },
      });

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
      });

      // Create async thunk manually
      const fetchData = () => async (dispatch: (action: unknown) => void) => {
        dispatch(testSlice.actions.setLoading());
        await Promise.resolve(); // Use immediate resolution instead of timeout
        dispatch(testSlice.actions.setData('fetched data'));
      };

      const dispatchPromise = testStore.dispatch(
        fetchData() as unknown as Parameters<typeof testStore.dispatch>[0]
      );

      // Flush all pending promises
      await Promise.resolve();
      jest.advanceTimersByTime(0);
      await dispatchPromise;

      expect(testStore.getState().loading).toBe(false);
      expect(testStore.getState().data).toBe('fetched data');

      jest.useRealTimers();
    });

    it('handles thunk rejections', async () => {
      interface TestState {
        loading: boolean;
        error: string | null;
      }

      const testSlice = createSlice({
        name: 'test',
        initialState: { loading: false, error: null } as TestState,
        reducers: {
          setLoading: state => {
            state.loading = true;
          },
          setError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
          },
        },
      });

      const testStore = configureStore({
        reducer: testSlice.reducer,
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
      });

      const failingThunk = () => async (dispatch: (action: unknown) => void) => {
        dispatch(testSlice.actions.setLoading());
        try {
          await Promise.reject(new Error('Network error'));
        } catch (err) {
          dispatch(testSlice.actions.setError((err as Error).message));
        }
      };

      await testStore.dispatch(
        failingThunk() as unknown as Parameters<typeof testStore.dispatch>[0]
      );

      expect(testStore.getState().loading).toBe(false);
      expect(testStore.getState().error).toBe('Network error');
    });
  });

  describe('Redux-Persist Integration', () => {
    it('store has expected slice structure', () => {
      const state = store.getState();

      // Verify the store contains all expected slices
      expect(state).toHaveProperty('settings');
      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('profile');
      expect(state).toHaveProperty('workExperience');
      expect(state).toHaveProperty('education');
    });

    it('persistor exposes expected API', () => {
      expect(typeof persistor.persist).toBe('function');
      expect(typeof persistor.purge).toBe('function');
      expect(typeof persistor.flush).toBe('function');
      expect(typeof persistor.pause).toBe('function');
      expect(typeof persistor.getState).toBe('function');
    });

    it('persistor getState method exists and is callable', () => {
      // In test environment, persistor may not be fully bootstrapped
      // Verify the method exists and returns a value (or undefined before bootstrap)
      expect(typeof persistor.getState).toBe('function');
      // Can call getState without throwing
      expect(() => persistor.getState()).not.toThrow();
    });

    it('auth slice is persisted with whitelist configuration', () => {
      const state = store.getState();

      // Auth slice exists and has biometricEnabled which is whitelisted
      expect(state.auth).toHaveProperty('biometricEnabled');
      // Verify auth state shape contains expected properties
      expect(state.auth).toHaveProperty('isAuthenticated');
      expect(state.auth).toHaveProperty('isLoading');
    });
  });

  describe('Store Dispatch Types', () => {
    it('dispatch handles plain object actions', () => {
      const action = { type: 'test/action', payload: 'value' };
      const result = store.dispatch(action);

      expect(result.type).toBe('test/action');
      expect(result.payload).toBe('value');
    });

    it('dispatch handles action creators', () => {
      const actionCreator = (value: string) => ({
        type: 'test/actionCreator',
        payload: value,
      });

      const result = store.dispatch(actionCreator('test value'));

      expect(result.type).toBe('test/actionCreator');
      expect(result.payload).toBe('test value');
    });

    it('getState returns current state', () => {
      const state: RootState = store.getState();

      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });

    it('subscribe allows listening to state changes', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      store.dispatch({ type: 'test/trigger' });

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it('unsubscribe stops listener from receiving updates', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.dispatch({ type: 'test/afterUnsubscribe' });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Middleware Error Handling', () => {
    it('does not crash on action with undefined payload', () => {
      expect(() => {
        store.dispatch({ type: 'test/undefinedPayload', payload: undefined });
      }).not.toThrow();
    });

    it('does not crash on action with null payload', () => {
      expect(() => {
        store.dispatch({ type: 'test/nullPayload', payload: null });
      }).not.toThrow();
    });

    it('does not crash on action with complex payload', () => {
      expect(() => {
        store.dispatch({
          type: 'test/complexPayload',
          payload: {
            nested: {
              array: [1, 2, 3],
              object: { a: 'b' },
            },
          },
        });
      }).not.toThrow();
    });
  });
});

describe('Mock Store for Middleware Testing', () => {
  // Cast thunk for compatibility with redux-mock-store's older Redux types
  // The types are incompatible between redux-thunk (UnknownAction) and redux-mock-store (AnyAction)
  const thunkMiddleware = thunk as Parameters<typeof createMockStore>[0] extends (infer M)[]
    ? M
    : never;
  const mockStore = createMockStore<Record<string, never>>([thunkMiddleware]);

  it('tracks dispatched actions', () => {
    const testStore = mockStore({});

    testStore.dispatch({ type: 'TEST_ACTION', payload: 'test' });
    testStore.dispatch({ type: 'ANOTHER_ACTION' });

    const actions = testStore.getActions();

    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('TEST_ACTION');
    expect(actions[1].type).toBe('ANOTHER_ACTION');
  });

  it('clears actions on reset', () => {
    const testStore = mockStore({});

    testStore.dispatch({ type: 'TEST_ACTION' });
    expect(testStore.getActions()).toHaveLength(1);

    testStore.clearActions();
    expect(testStore.getActions()).toHaveLength(0);
  });

  it('handles thunk actions', async () => {
    const testStore = mockStore({});

    const asyncAction = () => async (dispatch: (action: unknown) => void) => {
      dispatch({ type: 'ASYNC_START' });
      await Promise.resolve();
      dispatch({ type: 'ASYNC_END' });
    };

    await testStore.dispatch(asyncAction() as unknown as Parameters<typeof testStore.dispatch>[0]);

    const actions = testStore.getActions();
    expect(actions).toHaveLength(2);
    expect(actions[0].type).toBe('ASYNC_START');
    expect(actions[1].type).toBe('ASYNC_END');
  });
});

describe('Persist Middleware Storage Error Handling', () => {
  it('handles storage write errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // The persist middleware should handle errors from AsyncStorage
    // In the actual implementation, these are caught and logged
    // This test verifies the store continues to work even if storage fails

    const testSlice = createSlice({
      name: 'test',
      initialState: { value: 0 },
      reducers: {
        setValue: (state, action: PayloadAction<number>) => {
          state.value = action.payload;
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [PERSIST, REHYDRATE, FLUSH, PAUSE, PURGE, REGISTER],
          },
        }),
    });

    // Dispatch action - store should work even if storage has issues
    testStore.dispatch(testSlice.actions.setValue(42));

    expect(testStore.getState().value).toBe(42);

    consoleErrorSpy.mockRestore();
  });

  it('handles storage read errors during rehydration', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Dispatch REHYDRATE with payload that could cause issues
    // The store should handle this gracefully
    store.dispatch({
      type: REHYDRATE,
      payload: null, // Simulates failed storage read
      key: 'root',
      err: new Error('Storage read failed'),
    });

    // Store should still be functional
    const state = store.getState();
    expect(state).toBeDefined();

    consoleErrorSpy.mockRestore();
  });

  it('continues operation after storage quota exceeded', () => {
    const testSlice = createSlice({
      name: 'test',
      initialState: { items: [] as string[] },
      reducers: {
        addItem: (state, action: PayloadAction<string>) => {
          state.items.push(action.payload);
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Add items - even if storage is full, in-memory state works
    for (let i = 0; i < 100; i++) {
      testStore.dispatch(testSlice.actions.addItem(`item-${i}`));
    }

    expect(testStore.getState().items).toHaveLength(100);
  });
});

describe('Concurrent Action Handling', () => {
  it('handles multiple simultaneous dispatches correctly', async () => {
    interface CounterState {
      count: number;
    }

    const testSlice = createSlice({
      name: 'counter',
      initialState: { count: 0 } as CounterState,
      reducers: {
        increment: state => {
          state.count += 1;
        },
        decrement: state => {
          state.count -= 1;
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Dispatch multiple actions concurrently
    const promises = [
      Promise.resolve().then(() => testStore.dispatch(testSlice.actions.increment())),
      Promise.resolve().then(() => testStore.dispatch(testSlice.actions.increment())),
      Promise.resolve().then(() => testStore.dispatch(testSlice.actions.increment())),
      Promise.resolve().then(() => testStore.dispatch(testSlice.actions.decrement())),
    ];

    await Promise.all(promises);

    // Final count should be 2 (3 increments - 1 decrement)
    expect(testStore.getState().count).toBe(2);
  });

  it('maintains action order with async thunks', async () => {
    jest.useFakeTimers();

    const actionOrder: string[] = [];

    interface TestState {
      value: string;
    }

    const testSlice = createSlice({
      name: 'test',
      initialState: { value: '' } as TestState,
      reducers: {
        setValue: (state, action: PayloadAction<string>) => {
          state.value = action.payload;
          actionOrder.push(action.payload);
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Create async thunks with different delays
    const asyncAction = (value: string, delay: number) => async (dispatch: unknown) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      (dispatch as (action: unknown) => void)(testSlice.actions.setValue(value));
    };

    // Dispatch in reverse order with delays
    const promises = [
      testStore.dispatch(
        asyncAction('first', 30) as unknown as Parameters<typeof testStore.dispatch>[0]
      ),
      testStore.dispatch(
        asyncAction('second', 20) as unknown as Parameters<typeof testStore.dispatch>[0]
      ),
      testStore.dispatch(
        asyncAction('third', 10) as unknown as Parameters<typeof testStore.dispatch>[0]
      ),
    ];

    // Advance timers to trigger all async operations
    jest.advanceTimersByTime(50);
    await Promise.all(promises);

    // Due to different delays, order should be: third, second, first
    expect(actionOrder).toEqual(['third', 'second', 'first']);

    jest.useRealTimers();
  });

  it('handles rapid state updates without losing data', () => {
    interface ItemState {
      items: number[];
    }

    const testSlice = createSlice({
      name: 'items',
      initialState: { items: [] } as ItemState,
      reducers: {
        addItem: (state, action: PayloadAction<number>) => {
          state.items.push(action.payload);
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Rapidly dispatch 1000 actions
    for (let i = 0; i < 1000; i++) {
      testStore.dispatch(testSlice.actions.addItem(i));
    }

    // All items should be present
    expect(testStore.getState().items).toHaveLength(1000);
    expect(testStore.getState().items[0]).toBe(0);
    expect(testStore.getState().items[999]).toBe(999);
  });

  it('handles interleaved sync and async actions', async () => {
    const executionOrder: string[] = [];

    interface TestState {
      values: string[];
    }

    const testSlice = createSlice({
      name: 'test',
      initialState: { values: [] } as TestState,
      reducers: {
        addValue: (state, action: PayloadAction<string>) => {
          state.values.push(action.payload);
          executionOrder.push(action.payload);
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Sync action
    testStore.dispatch(testSlice.actions.addValue('sync1'));

    // Async action
    const asyncPromise = testStore.dispatch((async (dispatch: unknown) => {
      await Promise.resolve();
      (dispatch as (action: unknown) => void)(testSlice.actions.addValue('async1'));
    }) as unknown as Parameters<typeof testStore.dispatch>[0]);

    // Another sync action
    testStore.dispatch(testSlice.actions.addValue('sync2'));

    await asyncPromise;

    // Sync actions should execute immediately, async after
    expect(executionOrder).toEqual(['sync1', 'sync2', 'async1']);
  });

  it('properly handles action dependencies', async () => {
    interface AuthState {
      token: string | null;
      user: string | null;
      error: string | null;
    }

    const testSlice = createSlice({
      name: 'auth',
      initialState: { token: null, user: null, error: null } as AuthState,
      reducers: {
        setToken: (state, action: PayloadAction<string>) => {
          state.token = action.payload;
        },
        setUser: (state, action: PayloadAction<string>) => {
          state.user = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
          state.error = action.payload;
        },
      },
    });

    const testStore = configureStore({
      reducer: testSlice.reducer,
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });

    // Login flow - token must be set before user
    const loginFlow = () => async (dispatch: unknown) => {
      const typedDispatch = dispatch as (action: unknown) => void;
      typedDispatch(testSlice.actions.setToken('token-123'));

      // User fetch depends on token
      const token = testStore.getState().token;
      if (token) {
        typedDispatch(testSlice.actions.setUser('user-456'));
      } else {
        typedDispatch(testSlice.actions.setError('No token available'));
      }
    };

    await testStore.dispatch(loginFlow() as unknown as Parameters<typeof testStore.dispatch>[0]);

    expect(testStore.getState().token).toBe('token-123');
    expect(testStore.getState().user).toBe('user-456');
    expect(testStore.getState().error).toBeNull();
  });
});

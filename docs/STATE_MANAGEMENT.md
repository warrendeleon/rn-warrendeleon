# State Management Guide

This document covers state management with Redux Toolkit and Redux Persist.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [Creating Features](#creating-features)
- [Using State](#using-state)
- [Redux Persist](#redux-persist)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [DevTools](#devtools)
- [Troubleshooting](#troubleshooting)

## Overview

### Why Redux Toolkit?

- **Simplified Redux**: Less boilerplate than traditional Redux
- **Built-in Best Practices**: Includes Immer, Redux Thunk, and DevTools
- **Type Safety**: Excellent TypeScript support
- **Performance**: Optimized selectors and updates
- **Debugging**: Time-travel debugging with Redux DevTools

### When to Use Redux

**Use Redux for:**

- Global app state (theme, language, user preferences)
- State shared across multiple screens
- State that needs persistence
- Complex state logic

**Don't use Redux for:**

- Local component state (use `useState`)
- Form state (use `useState` or form libraries)
- Derived state (use selectors or `useMemo`)
- Server cache (use React Query/SWR for API data)

## Architecture

### Store Structure

```
store/
├── index.ts              # Store exports
├── configureStore.ts     # Store configuration
└── hooks.ts             # Typed hooks (optional)

features/
  Settings/
    store/
      ├── __tests__/
      │   ├── actions.test.ts
      │   ├── reducer.test.ts
      │   └── selectors.test.ts
      ├── index.ts        # Feature exports
      ├── actions.ts      # Action definitions
      ├── reducer.ts      # Slice and state
      └── selectors.ts    # State selectors
```

### State Shape

```typescript
{
  settings: {
    theme: 'light' | 'dark' | 'system',
    language: 'en' | 'es'
  },
  // Future features
  // auth: { ... }
  // profile: { ... }
}
```

## Setup

The project is already configured with Redux Toolkit. This section documents the setup for reference.

### Dependencies

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.10.1",
    "react-redux": "^9.2.0",
    "redux-persist": "^6.0.0",
    "@react-native-async-storage/async-storage": "^2.2.0"
  }
}
```

### Store Configuration

**`src/store/configureStore.ts`:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import reactotron from '@app/config/reactotron';
import { settingsReducer } from '@app/features/Settings/store';

/**
 * Root reducer combining all slices
 * Separates persisted (settings) from non-persisted (future auth) state
 */
const rootReducer = combineReducers({
  settings: settingsReducer,
  // Future: Add auth reducer here without persistence
  // auth: authReducer, // Will use EncryptedStorage separately
});

/**
 * Redux Persist configuration for settings
 * Uses AsyncStorage for non-sensitive data (theme, language, etc.)
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Only persist settings
  // Future: Blacklist auth or create separate encrypted persist config
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure Redux store with security best practices:
 * - Disable Redux DevTools in production
 * - Add serializable check middleware (ignores redux-persist actions)
 * - Separate sensitive data (future auth) from settings
 * - Connect to Reactotron in development for Redux debugging
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: __DEV__, // Only enable DevTools in development
  enhancers: getDefaultEnhancers =>
    __DEV__ && reactotron.createEnhancer
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
});

export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**`src/store/index.ts`:**

```typescript
export { store, persistor } from './configureStore';
export type { RootState, AppDispatch } from './configureStore';
```

### Provider Setup

**`src/app/App.tsx`:**

```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@app/store';

export const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <RootNavigator />
      </PersistGate>
    </Provider>
  );
};
```

### Typed Hooks (Optional)

**`src/store/hooks.ts`:**

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './configureStore';

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

## Creating Features

### 1. Define State and Types

**`src/features/Settings/store/reducer.ts`:**

```typescript
import { createSlice } from '@reduxjs/toolkit';
import { settingsActions } from './actions';

// Types
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es';

export interface SettingsState {
  theme: Theme;
  language: Language;
}

// Initial state
const initialState: SettingsState = {
  theme: 'system',
  language: 'en',
};

/**
 * Settings slice for non-sensitive user preferences
 * Persisted using AsyncStorage via redux-persist
 */
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: settingsActions,
});

export const settingsReducer = settingsSlice.reducer;
export const settingsSliceActions = settingsSlice.actions;
```

### 2. Define Actions

**`src/features/Settings/store/actions.ts`:**

```typescript
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Language, SettingsState, Theme } from './reducer';

/**
 * Settings actions for managing user preferences
 */
export const settingsActions = {
  setTheme: (state: SettingsState, action: PayloadAction<Theme>) => {
    state.theme = action.payload;
  },
  setLanguage: (state: SettingsState, action: PayloadAction<Language>) => {
    state.language = action.payload;
  },
  resetSettings: (): SettingsState => ({
    theme: 'system',
    language: 'en',
  }),
};
```

**Note**: Actions use Immer for immutable updates. You can write "mutating" code like `state.theme = action.payload` and Immer handles immutability.

### 3. Define Selectors

**`src/features/Settings/store/selectors.ts`:**

```typescript
import type { RootState } from '@app/store';

/**
 * Settings selectors for accessing user preferences from state
 */
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;
```

### 4. Export from Feature

**`src/features/Settings/store/index.ts`:**

```typescript
export { settingsReducer, settingsSliceActions } from './reducer';
export { selectTheme, selectLanguage } from './selectors';
export type { Theme, Language, SettingsState } from './reducer';
```

### 5. Add to Root Reducer

**`src/store/configureStore.ts`:**

```typescript
import { settingsReducer } from '@app/features/Settings/store';
import { profileReducer } from '@app/features/Profile/store';

const rootReducer = combineReducers({
  settings: settingsReducer,
  profile: profileReducer, // New feature
});
```

## Using State

### Reading State

**With `useSelector`:**

```typescript
import { useSelector } from 'react-redux';
import { selectTheme } from '@app/features/Settings/store/selectors';

export const ThemedComponent = () => {
  const theme = useSelector(selectTheme);

  return <View style={theme === 'dark' ? darkStyle : lightStyle} />;
};
```

**With typed hook:**

```typescript
import { useAppSelector } from '@app/store/hooks';
import { selectTheme } from '@app/features/Settings/store/selectors';

export const ThemedComponent = () => {
  const theme = useAppSelector(selectTheme);

  return <View style={theme === 'dark' ? darkStyle : lightStyle} />;
};
```

**Multiple selectors:**

```typescript
import { useAppSelector } from '@app/store/hooks';
import { selectTheme, selectLanguage } from '@app/features/Settings/store/selectors';

export const SettingsScreen = () => {
  const theme = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);

  return (
    <View>
      <Text>Theme: {theme}</Text>
      <Text>Language: {language}</Text>
    </View>
  );
};
```

### Dispatching Actions

**With `useDispatch`:**

```typescript
import { useDispatch } from 'react-redux';
import { settingsSliceActions } from '@app/features/Settings/store';

export const AppearanceScreen = () => {
  const dispatch = useDispatch();

  const changeTheme = (theme: Theme) => {
    dispatch(settingsSliceActions.setTheme(theme));
  };

  return (
    <Button onPress={() => changeTheme('dark')}>
      Dark Mode
    </Button>
  );
};
```

**With typed hook:**

```typescript
import { useAppDispatch } from '@app/store/hooks';
import { settingsSliceActions } from '@app/features/Settings/store';

export const AppearanceScreen = () => {
  const dispatch = useAppDispatch();

  const changeTheme = (theme: Theme) => {
    dispatch(settingsSliceActions.setTheme(theme));
  };

  return (
    <Button onPress={() => changeTheme('dark')}>
      Dark Mode
    </Button>
  );
};
```

### Combined Example

```typescript
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { settingsSliceActions, selectTheme } from '@app/features/Settings/store';

export const AppearanceScreen = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);

  const changeTheme = (theme: Theme) => {
    dispatch(settingsSliceActions.setTheme(theme));
  };

  return (
    <View>
      <Button
        onPress={() => changeTheme('light')}
        variant={currentTheme === 'light' ? 'primary' : 'secondary'}
      >
        Light
      </Button>
      <Button
        onPress={() => changeTheme('dark')}
        variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
      >
        Dark
      </Button>
      <Button
        onPress={() => changeTheme('system')}
        variant={currentTheme === 'system' ? 'primary' : 'secondary'}
      >
        System
      </Button>
    </View>
  );
};
```

## Redux Persist

### Configuration

**Basic Setup:**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Persist only these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

### Whitelist vs Blacklist

**Whitelist** (recommended):

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'preferences'], // Only persist these
};
```

**Blacklist:**

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth', 'session'], // Don't persist these
};
```

### Nested Persist

Persist only part of a reducer:

```typescript
import { persistReducer } from 'redux-persist';

const settingsPersistConfig = {
  key: 'settings',
  storage: AsyncStorage,
  whitelist: ['theme', 'language'], // Only persist these fields
  // blacklist: ['tempData'], // or exclude these fields
};

const rootReducer = combineReducers({
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  auth: authReducer, // Not persisted
});
```

### Encryption for Sensitive Data

For sensitive data like auth tokens, use encrypted storage:

```typescript
import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Encrypted storage adapter for Redux Persist
 * Use for sensitive data (auth tokens, personal info)
 */
const encryptedStorage = {
  setItem: (key: string, value: string) => {
    return EncryptedStorage.setItem(key, value);
  },
  getItem: (key: string) => {
    return EncryptedStorage.getItem(key);
  },
  removeItem: (key: string) => {
    return EncryptedStorage.removeItem(key);
  },
};

const authPersistConfig = {
  key: 'auth',
  storage: encryptedStorage, // Use encrypted storage
};

const rootReducer = combineReducers({
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  auth: persistReducer(authPersistConfig, authReducer),
});
```

### Clear Persisted State

```typescript
import { persistor } from '@app/store';

// Clear all persisted state
await persistor.purge();

// Or clear specific reducer
await persistor.flush(); // Save current state first
// Then update state and persist will save new state
```

### Migration

When changing state shape, use migrations:

```typescript
import { createMigrate } from 'redux-persist';

const migrations = {
  // Version 0 to 1: Add new field
  1: (state: any) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        newField: 'defaultValue',
      },
    };
  },
  // Version 1 to 2: Rename field
  2: (state: any) => {
    const { oldField, ...rest } = state.settings;
    return {
      ...state,
      settings: {
        ...rest,
        newField: oldField,
      },
    };
  },
};

const persistConfig = {
  key: 'root',
  version: 2, // Current version
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: false }),
};
```

## Best Practices

### 1. Feature-Based Organization

Keep Redux code with the feature it belongs to:

```
features/
  Settings/
    store/
      actions.ts
      reducer.ts
      selectors.ts
```

### 2. Use Selectors

Always use selectors instead of accessing state directly:

**Bad:**

```typescript
const theme = useAppSelector(state => state.settings.theme);
```

**Good:**

```typescript
const theme = useAppSelector(selectTheme);
```

Benefits:

- Single source of truth
- Easy to refactor
- Can add memoization
- Better for testing

### 3. Memoized Selectors

For derived state, use `createSelector` from Reselect:

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';

export const selectTheme = (state: RootState) => state.settings.theme;
export const selectLanguage = (state: RootState) => state.settings.language;

// Memoized derived selector
export const selectIsDarkMode = createSelector([selectTheme], theme => {
  if (theme === 'system') {
    return useColorScheme() === 'dark';
  }
  return theme === 'dark';
});

// Combine multiple selectors
export const selectUserPreferences = createSelector(
  [selectTheme, selectLanguage],
  (theme, language) => ({ theme, language })
);
```

### 4. Normalize State Shape

For collections, normalize data:

**Bad:**

```typescript
interface State {
  users: Array<{
    id: string;
    name: string;
    posts: Array<{ id: string; title: string }>;
  }>;
}
```

**Good:**

```typescript
interface State {
  users: {
    byId: { [id: string]: User };
    allIds: string[];
  };
  posts: {
    byId: { [id: string]: Post };
    allIds: string[];
  };
}
```

Use RTK's `createEntityAdapter`:

```typescript
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
}

const usersAdapter = createEntityAdapter<User>();

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: {
    userAdded: usersAdapter.addOne,
    usersReceived: usersAdapter.setAll,
    userUpdated: usersAdapter.updateOne,
    userRemoved: usersAdapter.removeOne,
  },
});

// Auto-generated selectors
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
} = usersAdapter.getSelectors((state: RootState) => state.users);
```

### 5. Async Logic with Thunks

For async operations, use `createAsyncThunk`:

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk('user/fetchUser', async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// In reducer
const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUser.pending, state => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
```

### 6. Keep Actions Simple

**Bad:**

```typescript
export const settingsActions = {
  updateSettings: (state, action) => {
    // Too much logic in action
    const { theme, language } = action.payload;
    if (theme === 'dark' && language === 'en') {
      state.theme = theme;
      state.language = language;
      state.specialMode = true;
    }
  },
};
```

**Good:**

```typescript
export const settingsActions = {
  setTheme: (state, action: PayloadAction<Theme>) => {
    state.theme = action.payload;
  },
  setLanguage: (state, action: PayloadAction<Language>) => {
    state.language = action.payload;
  },
};

// Complex logic in component or thunk
const updateSettings = (theme: Theme, language: Language) => {
  dispatch(settingsSliceActions.setTheme(theme));
  dispatch(settingsSliceActions.setLanguage(language));
  if (theme === 'dark' && language === 'en') {
    dispatch(settingsSliceActions.setSpecialMode(true));
  }
};
```

### 7. Type Safety

Always type your state, actions, and selectors:

```typescript
// State
export interface SettingsState {
  theme: Theme;
  language: Language;
}

// Actions
setTheme: (state: SettingsState, action: PayloadAction<Theme>) => {
  state.theme = action.payload;
};

// Selectors
export const selectTheme = (state: RootState): Theme => state.settings.theme;
```

### 8. Avoid Large State Objects

Split large features into smaller slices:

**Bad:**

```typescript
const appSlice = createSlice({
  name: 'app',
  initialState: {
    theme: 'light',
    language: 'en',
    notifications: [],
    user: {},
    posts: [],
    // Too much in one slice
  },
});
```

**Good:**

```typescript
const settingsSlice = createSlice({
  /* theme, language */
});
const notificationsSlice = createSlice({
  /* notifications */
});
const userSlice = createSlice({
  /* user */
});
const postsSlice = createSlice({
  /* posts */
});
```

## Testing

### Test Reducers

```typescript
import { settingsReducer } from '../reducer';
import { settingsSliceActions } from '../reducer';

describe('settingsReducer', () => {
  const initialState = {
    theme: 'system' as const,
    language: 'en' as const,
  };

  it('updates theme', () => {
    const newState = settingsReducer(initialState, settingsSliceActions.setTheme('dark'));

    expect(newState.theme).toBe('dark');
  });

  it('updates language', () => {
    const newState = settingsReducer(initialState, settingsSliceActions.setLanguage('es'));

    expect(newState.language).toBe('es');
  });

  it('resets settings', () => {
    const modifiedState = {
      theme: 'dark' as const,
      language: 'es' as const,
    };

    const newState = settingsReducer(modifiedState, settingsSliceActions.resetSettings());

    expect(newState).toEqual(initialState);
  });
});
```

### Test Selectors

```typescript
import { selectTheme, selectLanguage } from '../selectors';
import type { RootState } from '@app/store';

describe('settingsSelectors', () => {
  const state: RootState = {
    settings: {
      theme: 'dark',
      language: 'es',
    },
  };

  it('selects theme', () => {
    expect(selectTheme(state)).toBe('dark');
  });

  it('selects language', () => {
    expect(selectLanguage(state)).toBe('es');
  });
});
```

### Test in Components

```typescript
import { renderWithProviders } from '@app/test-utils';
import { settingsSliceActions } from '@app/features/Settings/store';

describe('AppearanceScreen', () => {
  it('dispatches setTheme action when button pressed', () => {
    const { getByText, store } = renderWithProviders(<AppearanceScreen />);

    fireEvent.press(getByText('Dark'));

    expect(store.getState().settings.theme).toBe('dark');
  });
});
```

### Test Async Thunks

```typescript
import { fetchUser } from '../thunks';
import { store } from '@app/store';

describe('fetchUser thunk', () => {
  it('fetches user successfully', async () => {
    // Mock API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: '1', name: 'John' }),
      })
    );

    await store.dispatch(fetchUser('1'));

    expect(store.getState().user.data).toEqual({
      id: '1',
      name: 'John',
    });
  });
});
```

## DevTools

### Redux DevTools

Automatically enabled in development:

```typescript
export const store = configureStore({
  reducer: persistedReducer,
  devTools: __DEV__, // Only in development
});
```

**Features:**

- Time-travel debugging
- Action history
- State diff
- Export/import state

### Reactotron

Integrated for React Native debugging:

```typescript
export const store = configureStore({
  enhancers: getDefaultEnhancers =>
    __DEV__ && reactotron.createEnhancer
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
});
```

**Install Reactotron:**

```bash
brew install --cask reactotron
```

**View Redux in Reactotron:**

1. Open Reactotron app
2. Run your app
3. View Redux tab for:
   - Action log
   - State snapshots
   - Subscriptions

## Troubleshooting

### State Not Persisting

**Problem**: Changes don't persist after app restart

**Solution**:

1. Check persist config whitelist:

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Must include your reducer
};
```

2. Verify PersistGate in App:

```typescript
<PersistGate loading={null} persistor={persistor}>
  {/* App */}
</PersistGate>
```

3. Check AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getAllKeys().then(keys => {
  console.log('Stored keys:', keys);
});
```

### Actions Not Updating State

**Problem**: Dispatching actions doesn't update state

**Solution**:

1. Verify action is dispatched:

```typescript
const dispatch = useAppDispatch();
console.log('Dispatching action');
dispatch(settingsSliceActions.setTheme('dark'));
```

2. Check reducer is added to store:

```typescript
const rootReducer = combineReducers({
  settings: settingsReducer, // Must be included
});
```

3. Verify selector:

```typescript
const theme = useAppSelector(state => {
  console.log('Full state:', state);
  return state.settings.theme;
});
```

### TypeScript Errors

**Problem**: Type errors with actions or state

**Solution**:

1. Use inferred types:

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

2. Type action payloads:

```typescript
setTheme: (state: SettingsState, action: PayloadAction<Theme>) => {
  state.theme = action.payload;
};
```

3. Type selectors:

```typescript
export const selectTheme = (state: RootState): Theme => state.settings.theme;
```

### Serialization Errors

**Problem**: `A non-serializable value was detected in an action`

**Solution**:

1. For redux-persist, ignore persist actions:

```typescript
middleware: getDefaultMiddleware =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
```

2. Don't store non-serializable values (functions, class instances, etc.)

### Performance Issues

**Problem**: App slow when state updates

**Solution**:

1. Use memoized selectors:

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectExpensiveData = createSelector([selectRawData], rawData =>
  expensiveTransform(rawData)
);
```

2. Normalize state for large collections

3. Split large components using selectors:

```typescript
// Bad: Re-renders on any state change
const state = useAppSelector(state => state);

// Good: Only re-renders when theme changes
const theme = useAppSelector(selectTheme);
```

## Next Steps

- See [Testing](./TESTING.md) for testing Redux code
- See [I18n](./I18N.md) for integrating Redux with i18next
- See [Architecture](./ARCHITECTURE.md) for project structure
- See [Contributing](./CONTRIBUTING.md) for code standards

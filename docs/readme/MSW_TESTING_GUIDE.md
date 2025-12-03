# MSW Testing Guide

**TL;DR**: Use MSW (Mock Service Worker) to intercept HTTP requests at the network layer, allowing tests to use real Redux stores and eliminate act() warnings. This guide shows you how to write integration tests that verify actual Redux state updates from HTTP responses.

## Why MSW for React Native Testing?

### The Problem with Mocked Redux

**Before MSW (❌ Bad pattern)**:

```typescript
// Mocking Redux selectors and dispatch
const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();

jest.mock('@app/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
}));

it('fetches profile data', () => {
  render(<SplashScreen />);
  expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
});
```

**Issues**:

- ❌ Tests mock calls, not actual behaviour
- ❌ Causes act() warnings (state updates outside React's control)
- ❌ Doesn't test integration (Redux → HTTP → Redux)
- ❌ Brittle - breaks on implementation details

### The Solution: MSW + Real Redux

**After MSW (✅ Good pattern)**:

```typescript
import { renderWithProviders, server } from '@app/test-utils';

it('fetches profile data', async () => {
  const { store } = renderWithProviders(<SplashScreen />);

  // Wait for Redux state to update
  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  // Verify actual Redux state
  expect(store.getState().profile.data).toBeDefined();
  expect(store.getState().profile.data?.fullName).toBe('Warren de Leon');
});
```

**Benefits**:

- ✅ Tests actual Redux state updates
- ✅ Zero act() warnings
- ✅ Tests real integration behaviour
- ✅ Resilient to refactoring

## How MSW Works

MSW intercepts HTTP requests **before they reach the network**, returning mock responses:

```
Component → Redux Thunk → axios.get() → 🔄 MSW Handler → Mock Response → Redux State
```

**Key insight**: Your code uses real `axios`, real Redux, real thunks. Only the network layer is mocked.

## Installation and Setup

### 1. Install MSW

```bash
yarn add -D msw
```

### 2. Configure Jest Polyfills

Create `jest.polyfills.cjs`:

```javascript
/**
 * MSW Polyfills for React Native
 * Required for Mock Service Worker to work in Jest tests
 */

// TextEncoder/TextDecoder polyfills
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Fetch API polyfill (if not already available)
if (!global.fetch) {
  global.fetch = require('node-fetch');
  global.Headers = require('node-fetch').Headers;
  global.Request = require('node-fetch').Request;
  global.Response = require('node-fetch').Response;
}

// ReadableStream polyfill
if (!global.ReadableStream) {
  try {
    const { ReadableStream } = require('web-streams-polyfill');
    global.ReadableStream = ReadableStream;
  } catch {
    // web-streams-polyfill is optional, MSW may work without it
  }
}
```

### 3. Update Jest Configuration

In `jest.config.cjs`:

```javascript
module.exports = {
  // Add polyfills to setupFiles (runs BEFORE environment setup)
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],

  // Add MSW to transformIgnorePatterns (so Babel transforms it)
  transformIgnorePatterns: ['node_modules/(?!(react-native|...|msw|until-async)/)'],

  // CRITICAL: Remove axios mock to allow MSW interception
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    // ❌ DO NOT mock axios here
    // '^axios$': '<rootDir>/src/test-utils/mocks/axios.ts', // Remove this
  },
};
```

### 4. Create MSW Handlers

Create `src/test-utils/msw/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { mockProfileEN, mockEducationEN, mockWorkXPEN } from './mockData';

const BASE_URL =
  'https://raw.githubusercontent.com/warrendeleon/rn-warrendeleon/main/src/test-utils/fixtures/api';

export const handlers = [
  // Profile endpoint
  http.get(`${BASE_URL}/:lang/profile.json`, ({ params }) => {
    const lang = params.lang as string;
    return HttpResponse.json(mockProfileEN, { status: 200 });
  }),

  // Education endpoint
  http.get(`${BASE_URL}/:lang/education.json`, ({ params }) => {
    return HttpResponse.json(mockEducationEN, { status: 200 });
  }),

  // Work experience endpoint
  http.get(`${BASE_URL}/:lang/workxp.json`, ({ params }) => {
    return HttpResponse.json(mockWorkXPEN, { status: 200 });
  }),
];

// Error handlers for testing failure scenarios
export const errorHandlers = [
  http.get(`${BASE_URL}/:lang/profile.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${BASE_URL}/:lang/education.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${BASE_URL}/:lang/workxp.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),
];
```

### 5. Create MSW Server

Create `src/test-utils/msw/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 6. Add MSW Lifecycle to Jest Setup

In `jest.setup.ts`:

```typescript
import { server } from './src/test-utils/msw/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test (ensures test isolation)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### 7. Update renderWithProviders

Update `src/test-utils/renderWithProviders.tsx`:

```typescript
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

// Import all reducers
const rootReducer = combineReducers({
  settings: settingsReducer,
  profile: profileReducer,
  workExperience: workExperienceReducer,
  education: educationReducer,
});

type RootState = ReturnType<typeof rootReducer>;

// Helper to create a properly typed store for tests
function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
        immutableCheck: false, // Disable for testing
      }),
  });
}

type AppStore = ReturnType<typeof createTestStore>;

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, store, ...renderOptions }: ExtendedRenderOptions = {}
) {
  // Create real Redux store (not mocked)
  const createdStore = store || createTestStore(preloadedState);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={createdStore}>
        <GluestackUIProvider config={config}>
          {children}
        </GluestackUIProvider>
      </Provider>
    );
  }

  // Return store instance for assertions
  return {
    store: createdStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}
```

## Writing Tests with MSW

### Basic Test Pattern

```typescript
import { renderWithProviders } from '@app/test-utils';
import { waitFor } from '@testing-library/react-native';

it('loads profile data on mount', async () => {
  const { store } = renderWithProviders(<ProfileScreen />);

  // Wait for async Redux state update
  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  }, { timeout: 3000 });

  // Verify Redux state
  const state = store.getState();
  expect(state.profile.data).toBeDefined();
  expect(state.profile.data?.fullName).toBe('Warren de Leon');
  expect(state.profile.error).toBeNull();
});
```

### Testing Error Scenarios

Use `server.use()` to override handlers per test:

```typescript
import { errorHandlers, renderWithProviders, server } from '@app/test-utils';

describe('Error Handling', () => {
  beforeEach(() => {
    // Override with error responses for this test suite
    server.use(...errorHandlers);
  });

  it('displays error UI when fetch fails', async () => {
    const { getByTestId } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('updates Redux state with error', async () => {
    const { store } = renderWithProviders(<ProfileScreen />);

    await waitFor(() => {
      expect(store.getState().profile.loading).toBe(false);
    });

    const state = store.getState();
    expect(state.profile.error).toBeTruthy();
    expect(state.profile.data).toBeNull();
  });
});
```

### Testing Multiple Async Actions

```typescript
it('dispatches all fetch actions on mount', async () => {
  const { store } = renderWithProviders(<SplashScreen onComplete={jest.fn()} />);

  // Wait for ALL async actions to complete
  await waitFor(() => {
    const state = store.getState();
    expect(state.profile.loading).toBe(false);
    expect(state.education.loading).toBe(false);
    expect(state.workExperience.loading).toBe(false);
  }, { timeout: 3000 });

  // Verify all data loaded successfully
  const state = store.getState();
  expect(state.profile.data).toBeDefined();
  expect(state.education.data).toBeDefined();
  expect(state.workExperience.data).toBeDefined();
});
```

### Testing User Interactions

```typescript
it('retries data fetch when retry button pressed', async () => {
  // Start with error handlers
  server.use(...errorHandlers);

  const { getByTestId, store } = renderWithProviders(<ProfileScreen />);

  // Wait for error state
  await waitFor(() => {
    expect(getByTestId('retry-button')).toBeTruthy();
  });

  // Switch to success handlers
  server.use(...handlers);

  // Press retry button
  fireEvent.press(getByTestId('retry-button'));

  // Wait for successful fetch
  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  // Verify data loaded
  expect(store.getState().profile.data).toBeDefined();
  expect(store.getState().profile.error).toBeNull();
});
```

### Testing with Preloaded State

```typescript
it('displays cached data whilst fetching fresh data', async () => {
  const cachedProfile = { fullName: 'Cached Name', email: 'cached@example.com' };

  const { store, getByText } = renderWithProviders(<ProfileScreen />, {
    preloadedState: {
      profile: {
        data: cachedProfile,
        loading: false,
        error: null,
      },
    },
  });

  // Cached data displayed immediately
  expect(getByText('Cached Name')).toBeTruthy();

  // Wait for fresh data to load
  await waitFor(() => {
    expect(store.getState().profile.data?.fullName).toBe('Warren de Leon');
  });
});
```

## Common Patterns and Best Practices

### 1. Always Use `waitFor()` for Async Updates

```typescript
// ❌ BAD: Direct assertion (will fail)
const { store } = renderWithProviders(<MyComponent />);
expect(store.getState().profile.data).toBeDefined(); // ❌ Fails - async not complete

// ✅ GOOD: Wait for async update
await waitFor(() => {
  expect(store.getState().profile.loading).toBe(false);
});
expect(store.getState().profile.data).toBeDefined(); // ✅ Passes
```

### 2. Set Appropriate Timeouts

```typescript
// Default timeout may be too short for multiple async actions
await waitFor(
  () => {
    expect(store.getState().profile.loading).toBe(false);
  },
  { timeout: 3000 }
); // 3 seconds for complex operations
```

### 3. Test Redux State, Not Mock Calls

```typescript
// ❌ BAD: Testing mocks
expect(mockDispatch).toHaveBeenCalledWith(fetchProfile());

// ✅ GOOD: Testing actual behaviour
await waitFor(() => {
  expect(store.getState().profile.data).toBeDefined();
});
```

### 4. Use `server.use()` for Test-Specific Handlers

```typescript
describe('Error Handling', () => {
  beforeEach(() => {
    server.use(...errorHandlers); // Override for this suite
  });

  // Tests use error handlers

  // afterEach() in jest.setup.ts automatically resets handlers
});
```

### 5. Verify Both Redux State and UI

```typescript
it('displays profile data', async () => {
  const { store, getByText } = renderWithProviders(<ProfileScreen />);

  // Wait for Redux update
  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  // Verify Redux state
  expect(store.getState().profile.data?.fullName).toBe('Warren de Leon');

  // Verify UI reflects state
  expect(getByText('Warren de Leon')).toBeTruthy();
});
```

### 6. Use `server.resetHandlers()` for Test Isolation

This happens automatically in `jest.setup.ts`, but you can do it manually if needed:

```typescript
afterEach(() => {
  server.resetHandlers(); // Reset to default handlers
});
```

## Debugging MSW Tests

### Check Handlers Are Registered

```typescript
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' }); // Warns about unhandled requests
});
```

### Log MSW Activity

```typescript
import { http, HttpResponse } from 'msw';

http.get('/api/profile', ({ request }) => {
  console.log('MSW intercepted:', request.url);
  return HttpResponse.json(mockProfile);
});
```

### Verify Store State During Test

```typescript
it('test something', async () => {
  const { store } = renderWithProviders(<MyComponent />);

  console.log('Initial state:', store.getState());

  await waitFor(() => {
    console.log('Current state:', store.getState());
    expect(store.getState().profile.loading).toBe(false);
  });

  console.log('Final state:', store.getState());
});
```

## Migration Checklist

When migrating from mocked Redux to MSW:

1. ✅ Remove all Redux mocks (`jest.mock('@app/store')`)
2. ✅ Remove `mockDispatch` and `mockUseAppSelector`
3. ✅ Remove axios mocks from `jest.config.cjs`
4. ✅ Install MSW and configure polyfills
5. ✅ Create MSW handlers for all API endpoints
6. ✅ Update `renderWithProviders` to return store
7. ✅ Replace mock assertions with Redux state assertions
8. ✅ Add `waitFor()` for all async operations
9. ✅ Run tests and verify zero act() warnings

## Results

**Before MSW**:

- 16 act() warnings in SplashScreen tests
- Tests verify mock calls, not actual behaviour
- Brittle tests that break on refactoring

**After MSW**:

- ✅ 0 act() warnings
- ✅ Tests verify actual Redux state updates
- ✅ Tests verify real integration behaviour
- ✅ Resilient to implementation changes

## Further Reading

- [MSW Documentation](https://mswjs.io/)
- [MSW with React Native](https://mswjs.io/docs/integrations/react-native)
- [Redux Testing Best Practices](https://redux.js.org/usage/writing-tests)
- [React Testing Library Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async/)

# TASK-328: MSW Redux Testing Infrastructure

**Task ID**: TASK-328
**Title**: Mock Service Worker (MSW) Redux Testing Infrastructure
**User Story**: [US-059](../stories/US-059-redux-testing-msw.md) - Redux Testing Infrastructure with MSW
**Epic**: [EPIC-030](../epics/EPIC-030-testing-infrastructure.md) - Testing Infrastructure & Quality Improvements
**Status**: 📋 To Do
**Priority**: High
**Effort**: 8 hours
**Owner**: Warren de Leon
**Created**: 2025-11-24

---

## Context

The SplashScreen tests currently have 16 `act()` warnings that occur due to architectural mismatch between mocked Redux dispatch and real Redux store subscriptions. When we mock `dispatch`, components still use `useAppSelector` which subscribes to the actual Redux store. This causes async state updates during the dispatch phase that are outside test control, triggering act() warnings.

**Current Problem**:

```typescript
// Mocking dispatch doesn't prevent Redux subscriptions from firing
mockDispatch.mockResolvedValue({ type: 'fulfilled' });

// Component calls dispatch (mocked)
dispatch(fetchProfile());

// But useAppSelector subscribes to REAL store
// Real store updates happen async, outside test control
// Result: act() warnings
```

**Root Cause**: Mocking at the wrong layer - we're mocking Redux (business logic) instead of HTTP (I/O layer).

**Official Solution**: Use Mock Service Worker (MSW) to mock at HTTP level, use real Redux store in tests. This is the pattern recommended by the Redux team (Mark Erikson).

---

## Objective

Implement MSW (Mock Service Worker) testing infrastructure to eliminate act() warnings by:

1. Installing MSW and configuring React Native polyfills
2. Creating mock handlers for all API endpoints
3. Building renderWithProviders test utility with real Redux store
4. Refactoring SplashScreen tests to use MSW + real store
5. Validating that all 16 act() warnings are resolved
6. Documenting the new testing pattern

**Deliverable**: Zero act() warnings in SplashScreen tests, reusable MSW infrastructure for all Redux tests.

---

## Acceptance Criteria

- [ ] **MSW installed** with React Native polyfills configured
- [ ] **Mock handlers** created for profile, education, work experience APIs
- [ ] **renderWithProviders** utility created with real Redux store
- [ ] **SplashScreen tests refactored** to use MSW instead of mocked dispatch
- [ ] **Zero act() warnings** in validation output
- [ ] **All 743 tests still passing**
- [ ] **MSW_TESTING_GUIDE.md** documentation created
- [ ] **Pattern reusable** for all future Redux integration tests

---

## Detailed Implementation Guide

### Phase 1: Install MSW and Configure Polyfills (30 minutes)

#### Step 1.1: Install Dependencies

```bash
yarn add -D msw
```

**Expected**: MSW installed successfully.

#### Step 1.2: Configure React Native Polyfills

MSW requires Node.js APIs not available in React Native. We need polyfills.

Create `/Users/warrendeleon/Developer/warrendeleon/jest.polyfills.js`:

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
  global.ReadableStream = require('web-streams-polyfill').ReadableStream;
}
```

#### Step 1.3: Update Jest Config

Edit `/Users/warrendeleon/Developer/warrendeleon/jest.config.js`:

```javascript
module.exports = {
  // ... existing config
  setupFiles: [
    '<rootDir>/jest.polyfills.js', // ADD THIS LINE
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  // ... rest of config
};
```

**Save file**.

---

### Phase 2: Create MSW Mock Handlers (45 minutes)

#### Step 2.1: Create Mock Data

Create `/Users/warrendeleon/Developer/warrendeleon/src/test-utils/mocks/mockData.ts`:

```typescript
import { Profile, Education, WorkExperience } from '@app/types';

/**
 * Mock data for MSW handlers
 * Matches the structure of real GitHub API responses
 */

export const mockProfileData: Profile = {
  name: 'Warren de Leon',
  tagline: 'Senior Software Engineer',
  bio: 'Passionate about building great mobile experiences',
  location: 'Barcelona, Spain',
  email: 'warren@example.com',
  website: 'https://warrendeleon.com',
  github: 'warrendeleon',
  linkedin: 'warrendeleon',
  skills: ['React Native', 'TypeScript', 'Redux'],
  languages: ['English', 'Spanish', 'Catalan'],
};

export const mockEducationData: Education[] = [
  {
    id: '1',
    institution: 'University of Example',
    degree: 'Bachelor of Computer Science',
    field: 'Software Engineering',
    startDate: '2015-09',
    endDate: '2019-06',
    description: 'Studied software engineering and computer science',
  },
];

export const mockWorkExperienceData: WorkExperience[] = [
  {
    id: '1',
    company: 'Tech Company',
    position: 'Senior Software Engineer',
    startDate: '2020-01',
    endDate: null,
    description: 'Building React Native applications',
    technologies: ['React Native', 'TypeScript', 'Redux'],
  },
];
```

**Save file**.

#### Step 2.2: Create MSW Handlers

Create `/Users/warrendeleon/Developer/warrendeleon/src/test-utils/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import Config from 'react-native-config';
import { mockProfileData, mockEducationData, mockWorkExperienceData } from './mockData';

/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

const API_BASE_URL = Config.GITHUB_API_BASE_URL || 'https://api.github.com';

export const handlers = [
  // Profile endpoint
  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/profile.json`, () => {
    return HttpResponse.json(
      {
        content: Buffer.from(JSON.stringify(mockProfileData)).toString('base64'),
        encoding: 'base64',
      },
      { status: 200 }
    );
  }),

  // Education endpoint
  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/education.json`, () => {
    return HttpResponse.json(
      {
        content: Buffer.from(JSON.stringify(mockEducationData)).toString('base64'),
        encoding: 'base64',
      },
      { status: 200 }
    );
  }),

  // Work experience endpoint
  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/work-experience.json`, () => {
    return HttpResponse.json(
      {
        content: Buffer.from(JSON.stringify(mockWorkExperienceData)).toString('base64'),
        encoding: 'base64',
      },
      { status: 200 }
    );
  }),
];

/**
 * Error handlers for testing failure scenarios
 */
export const errorHandlers = [
  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/profile.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/education.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),

  http.get(`${API_BASE_URL}/repos/:owner/:repo/contents/data/work-experience.json`, () => {
    return HttpResponse.json({ message: 'Network error' }, { status: 500 });
  }),
];
```

**Save file**.

---

### Phase 3: Configure Jest Setup (30 minutes)

#### Step 3.1: Create MSW Server Setup

Create `/Users/warrendeleon/Developer/warrendeleon/src/test-utils/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW Server for Node.js (Jest) tests
 * Intercepts HTTP requests during tests
 */

export const server = setupServer(...handlers);
```

**Save file**.

#### Step 3.2: Update Jest Setup File

Edit `/Users/warrendeleon/Developer/warrendeleon/jest.setup.js`:

```javascript
import '@testing-library/react-native/extend-expect';
import { server } from './src/test-utils/mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

**Save file**.

---

### Phase 4: Create Test Utilities (45 minutes)

#### Step 4.1: Create renderWithProviders Utility

Create `/Users/warrendeleon/Developer/warrendeleon/src/test-utils/renderWithProviders.tsx`:

```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import { RootState, rootReducer } from '@app/store';

/**
 * Test utility to render components with Redux store
 * Uses REAL Redux store with MSW for HTTP mocking
 */

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: PreloadedState<RootState>;
  store?: ReturnType<typeof configureStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false, // Disable for testing
          immutableCheck: false, // Disable for testing
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
```

**Save file**.

#### Step 4.2: Export Test Utilities

Edit `/Users/warrendeleon/Developer/warrendeleon/src/test-utils/index.ts`:

```typescript
// ... existing exports
export { renderWithProviders } from './renderWithProviders';
export { server } from './mocks/server';
export { handlers, errorHandlers } from './mocks/handlers';
export { mockProfileData, mockEducationData, mockWorkExperienceData } from './mocks/mockData';
```

**Save file**.

---

### Phase 5: Refactor SplashScreen Tests (2 hours)

#### Step 5.1: Backup Current Tests

```bash
cp src/features/Splash/__tests__/SplashScreen.rntl.tsx src/features/Splash/__tests__/SplashScreen.rntl.tsx.backup
```

#### Step 5.2: Refactor Tests to Use MSW

Edit `/Users/warrendeleon/Developer/warrendeleon/src/features/Splash/__tests__/SplashScreen.rntl.tsx`:

```typescript
import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders, server, errorHandlers } from '@app/test-utils';

import { SplashScreen } from '../SplashScreen';

// Mock config functions
jest.mock('@app/config', () => ({
  incrementRetryAttempts: jest.fn(),
}));

// Mock Logo component
jest.mock('@app/components', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    Logo: ({ darkMode, style }: { darkMode: boolean; style: any }) => {
      return React.createElement(
        RN.View,
        { testID: 'logo', style },
        React.createElement(RN.Text, { testID: 'logo-mode' }, darkMode ? 'dark' : 'light')
      );
    },
  };
});

// Mock useAppColorScheme hook
const mockUseAppColorScheme = jest.fn();
jest.mock('@app/hooks', () => ({
  useAppColorScheme: () => mockUseAppColorScheme(),
}));

describe('SplashScreen', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppColorScheme.mockReturnValue('light');
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  it('renders Logo component', async () => {
    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo')).toBeTruthy();
    });
  });

  it('renders with dark mode when colour scheme is dark', async () => {
    mockUseAppColorScheme.mockReturnValue('dark');

    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo-mode')).toHaveTextContent('dark');
    });
  });

  it('renders with light mode when colour scheme is light', async () => {
    mockUseAppColorScheme.mockReturnValue('light');

    const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(getByTestId('logo-mode')).toHaveTextContent('light');
    });
  });

  it('dispatches all three fetch actions on mount', async () => {
    const { store } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await waitFor(
      () => {
        const state = store.getState();
        expect(state.profile.loading).toBe(false);
        expect(state.education.loading).toBe(false);
        expect(state.workExperience.loading).toBe(false);
      },
      { timeout: 3000 }
    );

    // Verify data was loaded successfully
    expect(store.getState().profile.data).toBeDefined();
    expect(store.getState().education.data).toBeDefined();
    expect(store.getState().workExperience.data).toBeDefined();
  });

  it('calls onComplete after 1.5 seconds', async () => {
    renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onComplete before 1.5 seconds', async () => {
    renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('returns null after loading is complete', async () => {
    const { queryByTestId, rerender } = renderWithProviders(
      <SplashScreen onComplete={mockOnComplete} />
    );

    // Initially, should render the splash screen
    await waitFor(() => {
      expect(queryByTestId('logo')).toBeTruthy();
    });

    // Advance timer
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Force re-render to check the new state
    rerender(<SplashScreen onComplete={mockOnComplete} />);

    // After loading is complete, component returns null
    expect(queryByTestId('logo')).toBeNull();
  });

  it('clears timeout on unmount', async () => {
    const { unmount } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // onComplete should not be called after unmount
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Use error handlers for these tests
      server.use(...errorHandlers);
    });

    it('displays error UI when fetch fails', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      expect(getByTestId('splash-retry-button')).toBeTruthy();
    });

    it('does not call onComplete when fetch fails', async () => {
      renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(mockOnComplete).not.toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('retries data fetch when retry button is pressed', async () => {
      const { getByTestId } = renderWithProviders(<SplashScreen onComplete={mockOnComplete} />);

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(getByTestId('splash-error-screen')).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Reset to success handlers
      server.resetHandlers();

      // Press retry button
      const retryButton = getByTestId('splash-retry-button');
      await act(async () => {
        fireEvent.press(retryButton);
      });

      await act(async () => {
        jest.runAllTimers();
      });

      await waitFor(
        () => {
          expect(mockOnComplete).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 }
      );
    });
  });
});
```

**Save file**.

---

### Phase 6: Validation & Testing (1 hour)

#### Step 6.1: Run Tests

```bash
yarn test src/features/Splash/__tests__/SplashScreen.rntl.tsx
```

**Expected**:

- ✅ All tests passing
- ✅ Zero act() warnings
- ✅ Clean console output

#### Step 6.2: Run Full Test Suite

```bash
yarn test
```

**Expected**: 743/743 tests passing (or higher with any new tests).

#### Step 6.3: Full Validation

```bash
yarn validate
```

**Expected**:

- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 violations
- ✅ Tests: All passing

---

### Phase 7: Documentation (30 minutes)

Create `/Users/warrendeleon/Developer/warrendeleon/docs/testing/MSW_TESTING_GUIDE.md`:

```markdown
# Mock Service Worker (MSW) Testing Guide

This guide explains how to use Mock Service Worker (MSW) for integration testing with Redux in React Native.

## Why MSW?

**Problem**: Mocking Redux dispatch causes act() warnings because components using `useAppSelector` subscribe to the real Redux store. Async state updates happen outside test control.

**Solution**: Mock at HTTP level (not Redux level). Use real Redux store with MSW intercepting network requests. This is the official Redux team recommendation.

## Architecture
```

Test → Component → Redux (REAL) → Axios → MSW (MOCKED) → HTTP Response

````

- Components use real Redux store
- Redux thunks make real HTTP calls via Axios
- MSW intercepts HTTP requests and returns mock responses
- No more act() warnings

## Setup

### 1. Install Dependencies

```bash
yarn add -D msw
````

### 2. Configure Polyfills

MSW requires Node.js APIs. Add polyfills in `jest.polyfills.js`:

```javascript
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
```

### 3. Create Mock Handlers

Define API mocks in `src/test-utils/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/profile', () => {
    return HttpResponse.json(mockProfileData, { status: 200 });
  }),
];
```

### 4. Setup MSW Server

Configure server in `src/test-utils/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 5. Configure Jest

Add to `jest.setup.js`:

```javascript
import { server } from './src/test-utils/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Usage

### Test Pattern with renderWithProviders

```typescript
import { renderWithProviders, server, errorHandlers } from '@app/test-utils';

it('loads data successfully', async () => {
  const { store } = renderWithProviders(<MyComponent />);

  await waitFor(() => {
    expect(store.getState().profile.loading).toBe(false);
  });

  expect(store.getState().profile.data).toBeDefined();
});
```

### Testing Error States

```typescript
it('handles fetch errors', async () => {
  server.use(...errorHandlers);

  const { getByTestId } = renderWithProviders(<MyComponent />);

  await waitFor(() => {
    expect(getByTestId('error-message')).toBeTruthy();
  });
});
```

### Dynamic Handler Override

```typescript
it('tests specific response', async () => {
  server.use(
    http.get('/api/profile', () => {
      return HttpResponse.json({ name: 'Custom' }, { status: 200 });
    })
  );

  // Test runs with custom response
});
```

## Benefits

1. **No act() warnings** - All state updates happen within React's control
2. **Real Redux behaviour** - Tests integration, not just mocked units
3. **Reusable infrastructure** - Same pattern for all Redux tests
4. **Better coverage** - Tests actual thunks, selectors, reducers
5. **Maintainable** - Change API structure once in handlers

## Migration Checklist

When converting old tests:

- [ ] Replace `mockDispatch` with `renderWithProviders`
- [ ] Remove Redux mock setup
- [ ] Use `store.getState()` to verify Redux state
- [ ] Use `waitFor()` for async state changes
- [ ] Replace mocked thunk results with MSW handlers
- [ ] Verify zero act() warnings

## Official Resources

- [MSW Documentation](https://mswjs.io/)
- [Redux Testing Guide](https://redux.js.org/usage/writing-tests)
- [Mark Erikson - Testing RTK](https://blog.isquaredsoftware.com/2023/05/redux-toolkit-testing-strategies/)

```

**Save file**.

---

## Files Created/Modified

```

/Users/warrendeleon/Developer/warrendeleon/
├── jest.polyfills.js # Created - MSW polyfills
├── jest.config.js # Modified - Added polyfills setup
├── jest.setup.js # Modified - Added MSW server lifecycle
├── src/
│ ├── test-utils/
│ │ ├── mocks/
│ │ │ ├── mockData.ts # Created - Mock API response data
│ │ │ ├── handlers.ts # Created - MSW request handlers
│ │ │ └── server.ts # Created - MSW server instance
│ │ ├── renderWithProviders.tsx # Created - Test utility with real Redux
│ │ └── index.ts # Modified - Export new utilities
│ └── features/
│ └── Splash/
│ └── **tests**/
│ └── SplashScreen.rntl.tsx # Modified - Refactored to use MSW
└── docs/
└── testing/
└── MSW_TESTING_GUIDE.md # Created - Comprehensive guide

````

---

## Troubleshooting

### Issue: "TextEncoder is not defined"

**Solution**: Ensure `jest.polyfills.js` is listed first in `setupFiles` in jest.config.js.

### Issue: "Network request failed"

**Solution**: Check that MSW server is properly configured in `jest.setup.js` with `beforeAll`, `afterEach`, `afterAll`.

### Issue: Tests still have act() warnings

**Solution**: Verify you're using `renderWithProviders` (not `render`), and using `waitFor()` for all async state changes.

### Issue: Tests timeout

**Solution**: Increase `waitFor()` timeout:
```typescript
await waitFor(() => { /* assertion */ }, { timeout: 3000 });
````

---

## Validation Checklist

Before marking complete:

- [ ] MSW installed and configured with polyfills
- [ ] Mock handlers created for all API endpoints
- [ ] renderWithProviders utility created
- [ ] SplashScreen tests refactored
- [ ] Run `yarn test src/features/Splash` - All passing, zero act() warnings
- [ ] Run `yarn validate` - All passing
- [ ] MSW_TESTING_GUIDE.md created
- [ ] Pattern documented and reusable

---

## Dependencies

### Depends On (Blockers)

- **TASK-191**: 3-Tier Storage Implementation (already complete)

### Blocks (Dependent Tasks)

- Any future Redux integration tests should use this pattern

---

## Additional Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW with React Native](https://mswjs.io/docs/getting-started)
- [Redux Testing Guide](https://redux.js.org/usage/writing-tests)
- [Mark Erikson Blog - Redux Testing Strategies](https://blog.isquaredsoftware.com/2023/05/redux-toolkit-testing-strategies/)
- [Kent C. Dodds - Stop Mocking Fetch](https://kentcdodds.com/blog/stop-mocking-fetch)

---

**Estimated Time**: 8 hours

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-24

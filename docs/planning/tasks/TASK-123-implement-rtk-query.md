# TASK-123: Implement RTK Query for API Caching

**Task ID**: TASK-123
**Title**: Implement RTK Query for API Caching (OPTIONAL)
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-024: Performance Optimization Phase 2](../stories/US-024-performance-optimization-phase-2.md)
**Status**: 📋 To Do
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Performance

---

## Context

**OPTIONAL TASK** - The current Axios + Redux Toolkit approach is well-tested and functional. This migration provides automatic caching, request deduplication, and reduced boilerplate but requires significant test rewrites. Consider deferring if timeline is tight.

---

## Current Architecture Analysis

### Files Involved

**API Layer** (3 files):

- `src/features/Profile/api/api.ts`
- `src/features/Education/api/api.ts`
- `src/features/WorkExperience/api/api.ts`

**Store Layer** (per feature - 3 × 4 = 12 files):

- `store/actions.ts` - createAsyncThunk definitions
- `store/reducer.ts` - createSlice with extraReducers
- `store/selectors.ts` - Reselect memoised selectors
- `store/index.ts` - Feature exports

**Configuration**:

- `src/store/configureStore.ts` - Root store setup
- `src/httpClients/GithubApiClient.ts` - Axios instance
- `src/config/e2e.ts` - E2E mock flag

**Test Files** (18 files):

- 3 × API tests (`api.rntl.ts`)
- 3 × Reducer tests (`reducer.rntl.ts`)
- 3 × Selector tests (where applicable)
- 3 × Screen tests with mocked selectors

### Current Data Flow

```
Component → dispatch(fetchProfile()) → createAsyncThunk
         → fetchProfileData() [API function]
         → GithubApiClient.get() or E2E fixture
         → Redux slice (pending/fulfilled/rejected)
         → useSelector() → Component re-render
```

### Current E2E Mocking Pattern

```typescript
// src/features/Profile/api/api.ts
export const fetchProfileData = async (language: string) => {
  if (isE2EMockEnabled) {
    const fixtureData = profileFixtures[language] || profileFixtures.en;
    return Promise.resolve({
      data: { ...fixtureData, mocked: true },
      status: 200,
      // ... AxiosResponse structure
    });
  }
  return GithubApiClient.get<Profile>(`/${language}/profile.json`);
};
```

**How it works**:

- `isE2EMockEnabled` reads `E2E_MOCK` env var at build time
- During Detox E2E tests, `E2E_MOCK=true` is set
- API functions return fixtures directly without network calls

---

## Comparison: Current Approach vs RTK Query

### Current Approach (Axios + createAsyncThunk)

**Pros**:

- ✅ Familiar pattern for Redux developers
- ✅ Fine-grained control over request/response handling
- ✅ E2E mocking at API function level (simple, isolated)
- ✅ Already tested with 100% coverage
- ✅ Works with existing redux-persist configuration
- ✅ Explicit loading/error state management

**Cons**:

- ❌ Boilerplate: 4 files per feature (actions, reducer, selectors, index)
- ❌ No automatic caching - refetches on every dispatch
- ❌ No request deduplication - same data can be fetched multiple times
- ❌ Manual cache invalidation
- ❌ Must manage subscriptions manually
- ❌ ~160 lines per feature for basic CRUD

### RTK Query Approach

**Pros**:

- ✅ 60% less boilerplate - single API definition file
- ✅ Automatic caching with configurable TTL
- ✅ Request deduplication - multiple components share one request
- ✅ Auto-generated typed hooks (`useGetProfileQuery`)
- ✅ Built-in loading/error/success states
- ✅ Cache invalidation with tags
- ✅ Automatic refetch on focus/reconnect (with `setupListeners`)
- ✅ Normalised cache structure

**Cons**:

- ❌ Learning curve for the team
- ❌ E2E mocking requires custom baseQuery (more complex)
- ❌ All existing tests must be rewritten
- ❌ Different mental model from traditional Redux
- ❌ Preloading requires `initiate()` pattern instead of thunks
- ❌ May conflict with redux-persist (RTK Query manages its own cache)

---

## Why RTK Query May or May Not Be Better

### Better For This Project

1. **Caching**: Profile/Education/WorkXP data rarely changes - perfect for long TTL caching
2. **Language switching**: When user changes language, cache per language key prevents refetch
3. **Deduplication**: Multiple screens using same data won't trigger duplicate requests
4. **Future scaling**: Adding new endpoints is trivial (3 lines vs 40+ lines)

### Not Necessarily Better

1. **E2E mocking complexity**: Current approach is simpler and well-understood
2. **Test rewrite cost**: 18+ test files need significant changes
3. **Preloading pattern change**: SplashScreen must use `initiate()` instead of `dispatch()`
4. **redux-persist**: RTK Query has its own cache - potential conflict
5. **One-time fetch pattern**: Data is fetched once on app load, caching benefits are minimal

### Verdict

For a portfolio app with static data fetched once on launch, **the migration effort outweighs the benefits**. RTK Query shines for apps with frequent data changes, pagination, and CRUD operations. However, if you plan to add features like user accounts, comments, or real-time data, this migration becomes valuable.

---

## E2E Mocking Strategy (Custom baseQuery) - Detailed

### How Current E2E Mocking Works

**Build Process**:

```bash
# .detoxrc.js sets environment variable
E2E_MOCK=true npx detox build -c ios.sim.debug
```

**Configuration Chain**:

```typescript
// .env.e2e (or environment variable)
E2E_MOCK = true;

// src/config/env.ts (react-native-config)
export const E2E_MOCK = Config.E2E_MOCK;

// src/config/e2e.ts
import { E2E_MOCK } from './env';
export const isE2EMockEnabled = E2E_MOCK === 'true';
```

**Current API Function Flow** (e.g., Profile):

```
1. Component dispatches fetchProfile()
2. Thunk calls fetchProfileData('en')
3. fetchProfileData checks isE2EMockEnabled
4. If true → returns profileFixtures['en'] with mocked: true
5. If false → calls GithubApiClient.get('/en/profile.json')
```

### How RTK Query E2E Mocking Works

**Flow with RTK Query**:

```
1. Component calls useGetProfileQuery('en')
2. RTK Query calls endpoint's query function
3. query('en') returns '/<language>/profile.json'
4. RTK Query calls baseQuery with '/en/profile.json'
5. customBaseQuery checks isE2EMockEnabled
6. If true → returns fixtures['/en/profile.json'] with mocked: true
7. If false → calls GithubApiClient.get('/en/profile.json')
8. RTK Query caches result and updates component
```

**Key Difference**: The mocking logic moves from 3 separate API files into 1 centralised baseQuery.

### Complete baseQuery Implementation

```typescript
// src/store/api/baseQuery.ts
import type { BaseQueryFn } from '@reduxjs/toolkit/query';

import { isE2EMockEnabled } from '@app/config/e2e';
import { GithubApiClient } from '@app/httpClients';
import type { Education, Profile, WorkExperience } from '@app/types/portfolio';

// ============================================
// FIXTURE IMPORTS - All 15 fixtures (5 languages × 3 features)
// ============================================

// Profile fixtures
import profileEN from '@app/test-utils/fixtures/api/en/profile.json';
import profileES from '@app/test-utils/fixtures/api/es/profile.json';
import profileCA from '@app/test-utils/fixtures/api/ca/profile.json';
import profilePL from '@app/test-utils/fixtures/api/pl/profile.json';
import profileTL from '@app/test-utils/fixtures/api/tl/profile.json';

// Education fixtures
import educationEN from '@app/test-utils/fixtures/api/en/education.json';
import educationES from '@app/test-utils/fixtures/api/es/education.json';
import educationCA from '@app/test-utils/fixtures/api/ca/education.json';
import educationPL from '@app/test-utils/fixtures/api/pl/education.json';
import educationTL from '@app/test-utils/fixtures/api/tl/education.json';

// WorkExperience fixtures
import workxpEN from '@app/test-utils/fixtures/api/en/workxp.json';
import workxpES from '@app/test-utils/fixtures/api/es/workxp.json';
import workxpCA from '@app/test-utils/fixtures/api/ca/workxp.json';
import workxpPL from '@app/test-utils/fixtures/api/pl/workxp.json';
import workxpTL from '@app/test-utils/fixtures/api/tl/workxp.json';

// ============================================
// TYPE DEFINITIONS
// ============================================

type FixtureData = Profile | Education[] | WorkExperience[];
type FixtureMap = Record<string, FixtureData>;

interface CustomBaseQueryError {
  status: number;
  data: string;
}

// ============================================
// FIXTURE MAP - URL paths to fixture data
// ============================================

const fixtures: FixtureMap = {
  // Profile endpoints
  '/en/profile.json': profileEN as Profile,
  '/es/profile.json': profileES as Profile,
  '/ca/profile.json': profileCA as Profile,
  '/pl/profile.json': profilePL as Profile,
  '/tl/profile.json': profileTL as Profile,

  // Education endpoints
  '/en/education.json': educationEN as Education[],
  '/es/education.json': educationES as Education[],
  '/ca/education.json': educationCA as Education[],
  '/pl/education.json': educationPL as Education[],
  '/tl/education.json': educationTL as Education[],

  // WorkExperience endpoints
  '/en/workxp.json': workxpEN as WorkExperience[],
  '/es/workxp.json': workxpES as WorkExperience[],
  '/ca/workxp.json': workxpCA as WorkExperience[],
  '/pl/workxp.json': workxpPL as WorkExperience[],
  '/tl/workxp.json': workxpTL as WorkExperience[],
};

// ============================================
// CUSTOM BASE QUERY
// ============================================

/**
 * Custom baseQuery for RTK Query with E2E mocking support
 *
 * Behaviour:
 * - When E2E_MOCK=true: Returns fixture data directly (no network)
 * - When E2E_MOCK=false: Calls GithubApiClient for real API
 *
 * @param args - URL string or { url, method } object from endpoint query
 * @returns RTK Query result format: { data } or { error }
 */
export const customBaseQuery: BaseQueryFn<
  string | { url: string; method?: string },
  unknown,
  CustomBaseQueryError
> = async args => {
  // Extract URL from args (can be string or object)
  const url = typeof args === 'string' ? args : args.url;

  // ============================================
  // E2E MOCKING PATH
  // ============================================
  if (isE2EMockEnabled) {
    const fixtureData = fixtures[url];

    // Handle missing fixture (would indicate a bug in endpoint definition)
    if (!fixtureData) {
      return {
        error: {
          status: 404,
          data:
            `E2E Mock Error: No fixture found for URL "${url}". ` +
            `Available fixtures: ${Object.keys(fixtures).join(', ')}`,
        },
      };
    }

    // Add mocked: true flag for E2E test verification
    // This allows tests to assert data came from fixtures
    const mockedData = Array.isArray(fixtureData)
      ? fixtureData.map(item => ({ ...item, mocked: true }))
      : { ...fixtureData, mocked: true };

    // Return in RTK Query success format
    return { data: mockedData };
  }

  // ============================================
  // REAL API PATH
  // ============================================
  try {
    const response = await GithubApiClient.get(url);
    return { data: response.data };
  } catch (error) {
    // Transform Axios error to RTK Query error format
    const axiosError = error as {
      response?: { status: number };
      message?: string;
    };

    return {
      error: {
        status: axiosError.response?.status || 500,
        data: axiosError.message || 'Network request failed',
      },
    };
  }
};
```

### URL Matching Logic

When RTK Query calls an endpoint, the flow is:

```typescript
// portfolioApi.ts
getProfile: build.query<Profile, string>({
  query: (language) => `/${language}/profile.json`,
  //                    ^^^^^^^^^^^^^^^^^^^^^^
  //                    This string is passed to baseQuery
})

// User calls:
useGetProfileQuery('en')

// RTK Query internally calls:
baseQuery('/en/profile.json', api, extraOptions)

// baseQuery looks up:
fixtures['/en/profile.json'] → profileEN fixture
```

**URL Format Must Match Exactly**:

- Endpoint: `/${language}/profile.json`
- Fixture key: `/en/profile.json`
- If they don't match → 404 error with helpful message

### Step-by-Step E2E Test Flow

**1. Detox Build**:

```bash
# Build with E2E mocking enabled
E2E_MOCK=true yarn detox:ios:build
```

**2. App Startup in E2E**:

```typescript
// App.tsx renders SplashScreen
// SplashScreen.tsx
useEffect(() => {
  await Promise.all([
    dispatch(portfolioApi.endpoints.getProfile.initiate(language)),
    dispatch(portfolioApi.endpoints.getEducation.initiate(language)),
    dispatch(portfolioApi.endpoints.getWorkExperience.initiate(language)),
  ]);
}, []);
```

**3. Data Flow for Profile**:

```
portfolioApi.endpoints.getProfile.initiate('en')
  ↓
RTK Query calls: query('en') → '/en/profile.json'
  ↓
RTK Query calls: customBaseQuery('/en/profile.json')
  ↓
customBaseQuery checks: isE2EMockEnabled === true
  ↓
customBaseQuery returns: { data: { ...profileEN, mocked: true } }
  ↓
RTK Query caches result under key: getProfile('en')
  ↓
Component receives: { data: profile, isLoading: false }
```

**4. E2E Test Assertion**:

```typescript
// e2e/step-definitions/profile.steps.ts
Then('I should see profile data', async () => {
  // Profile card shows name from English fixture
  await expect(element(by.id('profile-name'))).toHaveText('Warren');

  // Can also check MockStatusScreen to verify mocked: true
  await expect(element(by.id('mock-indicator'))).toExist();
});
```

### Language Switching in E2E Tests

**Scenario**: User changes language from English to Spanish

```typescript
// E2E test
Given('the app is in English', async () => {
  // App loads with 'en' - fetches fixtures['/en/profile.json']
});

When('I change language to Spanish', async () => {
  await element(by.id('settings-button')).tap();
  await element(by.id('language-button')).tap();
  await element(by.id('language-es')).tap();
});

Then('I should see Spanish profile data', async () => {
  // RTK Query calls: getProfile('es')
  // baseQuery looks up: fixtures['/es/profile.json']
  // Returns Spanish fixture with mocked: true
  await expect(element(by.id('profile-location'))).toHaveText('Barcelona');
});
```

**What happens**:

1. Language selector dispatches `setLanguage('es')`
2. Components re-render with new language
3. `useGetProfileQuery('es')` triggers new query
4. baseQuery returns `fixtures['/es/profile.json']`
5. RTK Query caches under `getProfile('es')` (separate from 'en')

### Jest Unit Tests vs Detox E2E Tests

**Jest Unit Tests** (E2E_MOCK is NOT set):

```typescript
// src/store/api/__tests__/baseQuery.rntl.ts

// Mock the module to control isE2EMockEnabled
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: false,
}));

jest.mock('@app/httpClients');

describe('customBaseQuery - Real API', () => {
  it('calls GithubApiClient when not in E2E mode', async () => {
    const { GithubApiClient } = require('@app/httpClients');
    GithubApiClient.get.mockResolvedValue({
      data: { name: 'Warren', lastName: 'de Leon' },
    });

    const result = await customBaseQuery('/en/profile.json');

    expect(GithubApiClient.get).toHaveBeenCalledWith('/en/profile.json');
    expect(result.data).toEqual({ name: 'Warren', lastName: 'de Leon' });
    expect(result.data.mocked).toBeUndefined(); // No mocked flag
  });
});
```

**Jest Unit Tests** (Testing E2E mocking logic):

```typescript
// src/store/api/__tests__/baseQuery.e2e.rntl.ts

// Mock to simulate E2E mode
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: true,
}));

describe('customBaseQuery - E2E Mode', () => {
  it('returns fixture data with mocked flag', async () => {
    const result = await customBaseQuery('/en/profile.json');

    expect(result.data).toHaveProperty('name');
    expect(result.data).toHaveProperty('mocked', true);
  });

  it('returns array data with mocked flag on each item', async () => {
    const result = await customBaseQuery('/en/education.json');

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0]).toHaveProperty('mocked', true);
  });

  it('returns 404 for unknown URL', async () => {
    const result = await customBaseQuery('/invalid/path.json');

    expect(result.error).toEqual({
      status: 404,
      data: expect.stringContaining('No fixture found'),
    });
  });
});
```

**Detox E2E Tests** (E2E_MOCK=true at build time):

```typescript
// e2e/features/profile.feature
Feature: Profile Screen

  Scenario: View profile information
    Given the app is loaded
    When I navigate to the Profile screen
    Then I should see "Warren" as the name
    And I should see "de Leon" as the last name
    # Data comes from fixtures['/en/profile.json']
```

### Error Handling Scenarios

**1. Missing Fixture (Bug in endpoint definition)**:

```typescript
// If someone adds a new endpoint without adding fixture:
getNewData: build.query({
  query: () => '/en/newdata.json', // No fixture exists!
})

// baseQuery returns:
{
  error: {
    status: 404,
    data: 'E2E Mock Error: No fixture found for URL "/en/newdata.json". ' +
          'Available fixtures: /en/profile.json, /es/profile.json, ...'
  }
}
```

**2. Network Error (Real API mode)**:

```typescript
// GithubApiClient.get throws error
// baseQuery catches and returns:
{
  error: {
    status: 500, // or actual HTTP status
    data: 'Network request failed'
  }
}
```

**3. Invalid Language**:

```typescript
// User somehow requests invalid language
useGetProfileQuery('invalid');
// baseQuery looks for fixtures['/invalid/profile.json']
// Returns 404 with helpful error message
```

### Why This Approach is Reliable

1. **Same mechanism**: Uses exact same `isE2EMockEnabled` check as current approach
2. **Build-time determination**: E2E_MOCK is set at build, not runtime - no race conditions
3. **Type-safe fixtures**: Fixtures are typed as `Profile | Education[] | WorkExperience[]`
4. **Helpful errors**: Missing fixture errors list all available fixtures
5. **Testable**: Jest can mock `isE2EMockEnabled` to test both paths
6. **Verifiable**: `mocked: true` flag allows tests to assert data source

### Comparison to Current Approach

| Aspect               | Current (3 API files)             | RTK Query (1 baseQuery)          |
| -------------------- | --------------------------------- | -------------------------------- |
| Files with E2E logic | 3                                 | 1                                |
| Fixture imports      | 5 per file (15 total, duplicated) | 15 in one place                  |
| URL matching         | Implicit in function              | Explicit in fixture map          |
| Error messages       | Basic                             | Detailed with available fixtures |
| Maintainability      | Add fixture in 3 places           | Add fixture in 1 place           |

---

## Migration Implementation

### Step 1: Create RTK Query API Service

```typescript
// src/store/api/portfolioApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';

import type { Education, Profile, WorkExperience } from '@app/types/portfolio';

import { customBaseQuery } from './baseQuery';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: customBaseQuery,
  endpoints: build => ({
    getProfile: build.query<Profile, string>({
      query: language => `/${language}/profile.json`,
    }),
    getEducation: build.query<Education[], string>({
      query: language => `/${language}/education.json`,
    }),
    getWorkExperience: build.query<WorkExperience[], string>({
      query: language => `/${language}/workxp.json`,
    }),
  }),
});

export const { useGetProfileQuery, useGetEducationQuery, useGetWorkExperienceQuery } = portfolioApi;
```

### Step 2: Update Store Configuration

```typescript
// src/store/configureStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {} from /* persist imports */ 'redux-persist';

import { portfolioApi } from './api/portfolioApi';
import { settingsReducer } from '@app/features/Settings/store';

const rootReducer = combineReducers({
  settings: settingsReducer,
  [portfolioApi.reducerPath]: portfolioApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings'], // Don't persist portfolioApi - it has its own cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(portfolioApi.middleware), // Add RTK Query middleware
  devTools: __DEV__,
  // ... reactotron enhancers
});

// Enable refetchOnFocus/refetchOnReconnect (optional)
setupListeners(store.dispatch);
```

### Step 3: Update SplashScreen (Preloading)

```typescript
// src/features/Splash/SplashScreen.tsx
import { useEffect, useState } from 'react';

import { portfolioApi } from '@app/store/api/portfolioApi';
import { selectLanguage, useAppDispatch, useAppSelector } from '@app/store';

const SPLASH_MINIMUM_DURATION = 1500;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAppData = async () => {
      const startTime = Date.now();

      // Preload all data using initiate() - caches results for later hook usage
      await Promise.all([
        dispatch(portfolioApi.endpoints.getProfile.initiate(language)),
        dispatch(portfolioApi.endpoints.getEducation.initiate(language)),
        dispatch(portfolioApi.endpoints.getWorkExperience.initiate(language)),
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < SPLASH_MINIMUM_DURATION) {
        await new Promise(resolve => setTimeout(resolve, SPLASH_MINIMUM_DURATION - elapsed));
      }

      if (isMounted) {
        setIsLoading(false);
        onComplete();
      }
    };

    loadAppData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, language, onComplete]);

  // ... render
};
```

### Step 4: Update Screen Components

```typescript
// src/features/Profile/ProfileScreen.tsx (Before)
const ProfileScreen = () => {
  const profile = useAppSelector(selectProfile);
  const loading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);
  // ...
};

// src/features/Profile/ProfileScreen.tsx (After)
import { useGetProfileQuery } from '@app/store/api/portfolioApi';
import { selectLanguage, useAppSelector } from '@app/store';

const ProfileScreen = () => {
  const language = useAppSelector(selectLanguage);
  const { data: profile, isLoading, error } = useGetProfileQuery(language);

  // Data is already cached from SplashScreen - instant access
  // ...
};
```

### Step 5: Update Store Exports

```typescript
// src/store/index.ts
export { useAppDispatch, useAppSelector } from './configureStore';
export type { AppDispatch, RootState } from './configureStore';
export { persistor, store } from './configureStore';

// Settings exports (unchanged)
export { selectLanguage, selectTheme, setLanguage, setTheme } from '@app/features/Settings';

// RTK Query exports
export {
  portfolioApi,
  useGetProfileQuery,
  useGetEducationQuery,
  useGetWorkExperienceQuery,
} from './api/portfolioApi';
```

---

## Files to Delete After Migration

### Feature Store Files (12 files)

**Profile** (4 files):

- `src/features/Profile/store/actions.ts`
- `src/features/Profile/store/reducer.ts`
- `src/features/Profile/store/selectors.ts`
- `src/features/Profile/store/index.ts`

**Education** (4 files):

- `src/features/Education/store/actions.ts`
- `src/features/Education/store/reducer.ts`
- `src/features/Education/store/selectors.ts`
- `src/features/Education/store/index.ts`

**WorkExperience** (4 files):

- `src/features/WorkExperience/store/actions.ts`
- `src/features/WorkExperience/store/reducer.ts`
- `src/features/WorkExperience/store/selectors.ts`
- `src/features/WorkExperience/store/index.ts`

### API Files (3 files)

- `src/features/Profile/api/api.ts`
- `src/features/Education/api/api.ts`
- `src/features/WorkExperience/api/api.ts`

### Test Files to Rewrite (12+ files)

All `store/__tests__/*.rntl.ts` files need complete rewrite for RTK Query patterns.

---

## Testing Strategy

### Unit Tests for Custom baseQuery

```typescript
// src/store/api/__tests__/baseQuery.rntl.ts
import { customBaseQuery } from '../baseQuery';

// Mock the e2e config
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: false,
}));

jest.mock('@app/httpClients');

describe('customBaseQuery', () => {
  describe('Real API (isE2EMockEnabled = false)', () => {
    it('calls GithubApiClient.get for profile', async () => {
      const { GithubApiClient } = require('@app/httpClients');
      GithubApiClient.get.mockResolvedValue({ data: { name: 'Test' } });

      const result = await customBaseQuery('/en/profile.json', {}, {});

      expect(GithubApiClient.get).toHaveBeenCalledWith('/en/profile.json');
      expect(result).toEqual({ data: { name: 'Test' } });
    });

    it('returns error on network failure', async () => {
      const { GithubApiClient } = require('@app/httpClients');
      GithubApiClient.get.mockRejectedValue({
        response: { status: 500 },
        message: 'Server error',
      });

      const result = await customBaseQuery('/en/profile.json', {}, {});

      expect(result).toEqual({
        error: { status: 500, data: 'Server error' },
      });
    });
  });
});
```

### Unit Tests for E2E Mocking

```typescript
// src/store/api/__tests__/baseQuery.e2e.rntl.ts
jest.mock('@app/config/e2e', () => ({
  isE2EMockEnabled: true,
}));

describe('customBaseQuery - E2E Mode', () => {
  it('returns fixture data for profile', async () => {
    const result = await customBaseQuery('/en/profile.json', {}, {});

    expect(result.data).toHaveProperty('mocked', true);
    expect(result.data).toHaveProperty('name');
  });

  it('returns fixture data for all languages', async () => {
    for (const lang of ['en', 'es', 'ca', 'pl', 'tl']) {
      const result = await customBaseQuery(`/${lang}/profile.json`, {}, {});
      expect(result.data).toHaveProperty('mocked', true);
    }
  });

  it('returns 404 error for unknown paths', async () => {
    const result = await customBaseQuery('/unknown/path.json', {}, {});

    expect(result.error).toEqual({
      status: 404,
      data: expect.stringContaining('No fixture found'),
    });
  });
});
```

### Integration Tests for API Service

```typescript
// src/store/api/__tests__/portfolioApi.rntl.ts
import { configureStore } from '@reduxjs/toolkit';
import { portfolioApi } from '../portfolioApi';

describe('portfolioApi', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { [portfolioApi.reducerPath]: portfolioApi.reducer },
      middleware: gDM => gDM().concat(portfolioApi.middleware),
    });
  });

  it('fetches and caches profile data', async () => {
    const result = await store.dispatch(portfolioApi.endpoints.getProfile.initiate('en'));

    expect(result.data).toHaveProperty('name');
  });

  it('returns cached data on subsequent calls', async () => {
    // First call
    await store.dispatch(portfolioApi.endpoints.getProfile.initiate('en'));

    // Second call should hit cache
    const state = store.getState();
    const cachedData = portfolioApi.endpoints.getProfile.select('en')(state);

    expect(cachedData.data).toBeDefined();
  });
});
```

---

## Acceptance Criteria

- [ ] Custom baseQuery created with E2E mocking support
- [ ] portfolioApi service created with 3 endpoints
- [ ] Store configured with RTK Query middleware
- [ ] SplashScreen uses `initiate()` for preloading
- [ ] All screens use auto-generated query hooks
- [ ] Old store files deleted
- [ ] baseQuery unit tests (100% coverage)
- [ ] portfolioApi integration tests
- [ ] E2E tests pass with mocked fixtures
- [ ] `yarn validate` passes (typecheck + lint + test)

---

## Effort Estimate

| Task                        | Hours   |
| --------------------------- | ------- |
| Create baseQuery + fixtures | 1.5     |
| Create portfolioApi service | 0.5     |
| Update configureStore       | 0.5     |
| Update SplashScreen         | 0.5     |
| Update 3 screen components  | 1.0     |
| Update store exports        | 0.5     |
| Delete old files            | 0.5     |
| Write baseQuery tests       | 1.5     |
| Write portfolioApi tests    | 1.0     |
| Rewrite screen tests        | 2.0     |
| E2E test verification       | 0.5     |
| **Total**                   | **10h** |

**Note**: Original estimate of 8h is optimistic. Realistic estimate is 10h due to test complexity.

---

## Recommendation

**Defer this task** unless you plan to add features requiring frequent data updates. The current Axios + createAsyncThunk approach:

- Works correctly
- Is fully tested
- Handles E2E mocking elegantly
- Team is familiar with the pattern

RTK Query provides benefits that aren't critical for a portfolio app with static data. Revisit if adding:

- User authentication
- Comments/feedback features
- Real-time updates
- Pagination

---

**Last Updated**: 2025-11-18

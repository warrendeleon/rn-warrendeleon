# Architecture & Testing Reference

> Detailed architecture patterns and testing strategies for the React Native project

## Architecture & Structure

### Feature-First Organization

Each feature is self-contained with screen, components, tests, and logic.

**Structure**: `src/features/FeatureName/` contains `Screen.tsx`, `__tests__/`, `store/` (if needed)

**Key directories**:

- `src/features/` - Feature modules (Home, Settings)
- `src/components/` - Shared components (ButtonWithChevron, SelectableListButton, ErrorBoundary)
- `src/navigation/` - React Navigation setup
- `src/store/` - Redux configuration
- `src/i18n/` - Translations (en.json, es.json)
- `src/test-utils/` - Testing helpers (renderWithProviders, Cucumber)

### Path Aliases

Use `@app` alias for `src/`:

```typescript
import { HomeScreen } from '@app/features';
import { RootNavigator } from '@app/navigation';
```

### Barrel Exports

Use `index.ts` for clean imports:

```typescript
import { SettingsScreen, LanguageScreen } from '@app/features';
```

**Note**: Barrel `index.ts` files excluded from coverage (no logic).

### Provider Hierarchy

1. ErrorBoundary → 2. Redux Provider → 3. GluestackUIProvider → 4. NavigationContainer → 5. i18next

**Testing**: Use `renderWithProviders` helper for Gluestack UI components.

### Redux Store

**Settings slice**: `{ theme: 'system'|'light'|'dark', language: 'en'|'es' }`

**Actions**: `setTheme`, `setLanguage`, `resetSettings`

**Selectors**: `selectTheme`, `selectLanguage`

**Persistence**: AsyncStorage via redux-persist

**Debugging**: Reactotron available in `__DEV__` mode

### Theme vs Color Scheme

- **Color Scheme** (`useColorScheme()`): Current active appearance (`'light'` or `'dark'`)
- **Theme Preference** (Redux `selectTheme`): User's saved preference (`'system'` | `'light'` | `'dark'`)

**Note**: App currently uses system color scheme. Theme preference stored but not yet enforced.

## Environment Configuration

### iOS Build Schemes

| Scheme              | Env File           | Usage              |
| ------------------- | ------------------ | ------------------ |
| `warrendeleon`      | `.env.development` | Debug (default)    |
| `warrendeleon-Prod` | `.env.production`  | Production/release |

**Environment files NOT committed to git.**

**Usage**: `import Config from 'react-native-config'` then `Config.API_URL`

**Note**: After changing schemes, clean Xcode Derived Data.

## Internationalization (i18n)

**Setup**: i18next with device locale detection

**Locale files**: `src/i18n/locales/en.json`, `es.json`

**Structure**: Nested by feature

```json
{
  "feature": { "key": "value" }
}
```

**Usage**:

```typescript
const { t } = useTranslation();
t('settings.title'); // "Settings"
```

**Important**: `localesParity.test.ts` enforces identical key structures across all languages. Adding a key to one file requires adding to all.

## Testing Requirements

### Sustainable Coverage Strategy

**Business logic-first**: 100% coverage on Redux slices, selectors, actions, utilities, shared components

**Excluded**: Presentation components (screens, navigation), infrastructure config, barrel exports

**Why**: Framework limitations with native modules, better suited for E2E tests (Detox)

**Thresholds**:

- Global: 85% (statements, functions, lines), 80% (branches)
- `src/features/**/store/`, `src/store/`, `src/components/`: 100% all metrics

**Testing Utilities**:

- `renderWithProviders`: For Gluestack UI + i18n components
- `render`: For standard React Native components
- `UNSAFE_root`: Access tree structure when needed

**Current Stats**: 97 passing tests (20 suites), 100% coverage on business logic

**Test Patterns**: Co-locate in `__tests__/`, use `*.test.[jt]s?(x)` for Jest, `*.feature` for Detox E2E

### Two-Layer Testing Approach (API + Redux)

**Philosophy**: Test API layer and Redux layer separately for defence-in-depth coverage

#### Layer 1: API Unit Tests

**Purpose**: Test HTTP requests in isolation (URL construction, axios configuration, error handling)

**Location**: `src/features/[Feature]/api/__tests__/api.test.ts`

**Tools**: axios-mock-adapter (v2.1.0+)

**Pattern**:

```typescript
import MockAdapter from 'axios-mock-adapter';
import { GithubApiClient } from '@app/httpClients/GithubApiClient';
import profileFixture from '@app/test-utils/fixtures/api/en/profile.json';
import { fetchProfileData } from '../api';

describe('Profile API', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(GithubApiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  describe('fetchProfileData', () => {
    it('should fetch profile data with correct locale', async () => {
      mock.onGet('/en/profile.json').reply(200, profileFixture);
      const response = await fetchProfileData('en');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(profileFixture);
    });

    it('should handle network errors', async () => {
      mock.onGet('/en/profile.json').networkError();
      await expect(fetchProfileData('en')).rejects.toThrow('Network Error');
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/en/profile.json').reply(404);
      await expect(fetchProfileData('en')).rejects.toThrow();
    });

    it('should construct URL correctly for different languages', async () => {
      mock.onGet('/es/profile.json').reply(200, profileFixture);
      const response = await fetchProfileData('es');
      expect(response.status).toBe(200);
    });
  });
});
```

**Coverage**: 100% required for all API functions

**Test scenarios**:

- Success response (200)
- Network errors
- HTTP error codes (404, 500, etc.)
- URL construction with different parameters

#### Layer 2: Redux Tests

**Purpose**: Test state management logic (async thunks, reducers, selectors)

**Location**: `src/features/[Feature]/store/__tests__/reducer.rntl.ts`

**Tools**: Global axios mock (`__mocks__/axios.ts`)

**Pattern**:

```typescript
import axios from 'axios';
import { fetchProfile } from '../actions';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchProfile async thunk', () => {
  it('sets profile data when fetchProfile is fulfilled', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: profileFixture });
    await store.dispatch(fetchProfile());
    const state = store.getState().profile;
    expect(state.data).toEqual(profileFixture);
  });
});
```

**Coverage**: 100% required for Redux slices, actions, reducers, selectors

#### When to Use Each Layer

**API Layer Tests**:

- Testing HTTP client configuration
- Testing URL construction logic
- Testing error handling before it reaches Redux
- Testing axios interceptors/transformers

**Redux Layer Tests**:

- Testing state transitions
- Testing async thunk logic
- Testing reducer behaviour
- Testing selector memoization

#### Guidelines for New Features

1. **Extract API functions**: Create `api/api.ts` with pure functions
2. **Create API tests**: Test functions with MockAdapter
3. **Use API in thunks**: Import and use in Redux thunks
4. **Test Redux layer**: Mock axios globally for Redux tests

**Example Structure**:

```
src/features/Profile/
├── api/
│   ├── api.ts                    # API functions
│   └── __tests__/
│       └── api.test.ts           # API layer tests (MockAdapter)
├── store/
│   ├── actions.ts                # Redux thunks (use api functions)
│   ├── reducer.ts
│   ├── selectors.ts
│   └── __tests__/
│       └── reducer.rntl.ts       # Redux tests (mocked axios)
```

**Benefits**:

- API bugs caught at API layer
- Redux bugs caught at Redux layer
- Better separation of concerns
- Easier debugging (identify which layer has the issue)
- 100% coverage for both layers

**Reference**: Old app pattern from https://github.com/warrendeleon/rn-warrendeleon/blob/ef04ae560ac66b991be28234f28ae35bd30c5eea/src/modules/workXP/__test__/api.unit.ts

### E2E Testing with Detox + Cucumber

**Stack**: Detox (gray-box testing) + Cucumber (BDD/Gherkin) + Custom formatters

**Organization**:

- Feature files: `src/**/__tests__/*.feature`
- Step definitions: `src/test-utils/cucumber/step-definitions/*.steps.tsx`
- Reusable steps: `common.steps.tsx` (navigation, assertions, interactions)

**Example**:

```gherkin
Scenario: ErrorBoundary catches error and displays fallback UI
  Given the app is launched
  When I tap the element with testID "test-error-button"
  And I dismiss the React Native error screen
  Then I should see an element with testID "error-try-again-button"
```

**Special Techniques**:

- **Recursive Dismiss**: Handles React Native dev error screens (red/yellow) before ErrorBoundary catches
- **TestErrorButton**: DEV-only component (`__DEV__` flag) for triggering errors in E2E tests

**Running**:

```bash
yarn e2e:ios      # Build + test (iOS)
yarn e2e:android  # Build + test (Android)
```

**Best Practices**: Use `testID` for selection, write Gherkin scenarios, reuse step definitions, handle dev screens

**Full examples and techniques**: See `.claude/docs/detox-cucumber.md`

## Styling Approach

**Dual system**: GlueStack UI + NativeWind v4 (Tailwind) + React Native StyleSheet

### GlueStack UI Design Tokens

**`$`-prefixed values**: `$white`, `$black`, `$backgroundDark900`, `$blue500`, `$indigo500`, `$coolGray500`, `$textLight400`

**Spacing**: `$2`, `$3`, `$4`, `$9`

**Border Radius**: `$none`, `$lg` (icon backgrounds), `$2xl` (grouped list corners)

```typescript
<Box bg="$backgroundDark900" w="$9" h="$9" borderRadius="$lg">
```

### iOS Settings-Style UI

**Colors**: Light (#F2F2F7) / Dark (pure black) backgrounds, no visible borders

**Typography**: Uppercase section headers (gray-500, semibold, small)

**Icons**: Rounded square backgrounds with colored fills

**Navigation**: Minimal back button (chevron only, `headerBackButtonDisplayMode: 'minimal'`)

### ButtonWithChevron Component

Primary building block for iOS-style settings lists with `groupVariant` prop:

```typescript
<ButtonWithChevron label="Settings" groupVariant="single" />
```

**GroupVariant**: `single` (all corners rounded), `top` (top only), `middle` (no rounding), `bottom` (bottom only)

**Optional Props**: `startIcon`, `startIconBgColor`, `endLabel`, `testID`

## TypeScript Configuration

- **Strict mode** with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`
- Module resolution: `bundler`
- All files must pass `yarn typecheck` before commit

## Import Sorting

ESLint auto-sorts via `eslint-plugin-simple-import-sort`: Side effects → External (React first) → `@app` → Parent (`../`) → Relative (`./`) → Styles

Run `yarn lint:fix` to auto-sort.

## Navigation Type Safety

Fully typed with `RootStackParamList` in `src/navigation/RootNavigator/RootNavigator.tsx`:

```typescript
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Language: undefined;
  Appearance: undefined;
};
```

**Current screens**: Home → Settings → Language/Appearance

## Common Patterns

### Adding a New Screen

1. Create `src/features/NewFeature/NewFeatureScreen.tsx`
2. Add tests in `__tests__/` (if business logic)
3. Update `RootStackParamList` in `src/navigation/RootNavigator/RootNavigator.tsx`
4. Add to stack navigator with translated title
5. Export from `src/features/index.ts`
6. Add translations to `en.json` and `es.json`

### Adding a New Component

1. Create under feature or `src/components/` if shared
2. Add test in `__tests__/` (100% coverage for shared)
3. Export from `index.ts`
4. Use Gluestack UI primitives
5. Apply React.memo if used in lists

### Running Single Test

```bash
yarn test ButtonWithChevron.test.tsx
yarn test -t "should render correctly"
```

### Adding Translations

1. Add to both `en.json` and `es.json`
2. Use nested structure: `{ "feature": { "key": "value" } }`
3. Access: `t('feature.key')`
4. `localesParity.test.ts` enforces matching keys

## Troubleshooting

### iOS Build

- After switching schemes: Clean Derived Data in Xcode
- Pods fail: `sudo arch -arm64 gem install ffi` then `yarn ios:pods`
- Use `.xcworkspace` not `.xcodeproj`

### Android Build

- Permission denied: `chmod +x android/gradlew`
- Clean: `yarn clean:android`

### Metro Cache

- Clear: `yarn start:reset`
- Delete `node_modules/.cache`

### Detox E2E

- Build error: `yarn clean:ios` then rebuild
- Flaky tests: Increase timeouts, add explicit waits
- Dev screens: Use recursive dismiss pattern (see E2E Testing section)

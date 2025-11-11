# Common Workflows Guide

Step-by-step guides for common development tasks that span multiple parts of the codebase.

## Table of Contents

- [Adding a New Feature (Complete)](#adding-a-new-feature-complete)
- [Adding a New Screen](#adding-a-new-screen)
- [Adding Translations](#adding-translations)
- [Adding a Redux Slice](#adding-a-redux-slice)
- [Writing Tests](#writing-tests)
- [Debugging a Failed E2E Test](#debugging-a-failed-e2e-test)
- [Updating Dependencies](#updating-dependencies)
- [Preparing for Production Release](#preparing-for-production-release)
- [Troubleshooting Build Issues](#troubleshooting-build-issues)

---

## Adding a New Feature (Complete)

Complete workflow for adding a new feature from scratch.

### Step 1: Create Feature Directory

```bash
# Create feature structure
mkdir -p src/features/MyFeature
mkdir -p src/features/MyFeature/__tests__
mkdir -p src/features/MyFeature/components
mkdir -p src/features/MyFeature/store
```

### Step 2: Add Main Screen Component

Create `src/features/MyFeature/MyFeatureScreen.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyFeatureScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    navigation.setOptions({
      title: t('myFeature.title'),
    });
  }, [navigation, t]);

  return (
    <View testID="my-feature-screen">
      <Text>{t('myFeature.welcome')}</Text>
    </View>
  );
};
```

### Step 3: Add Navigation Route

Update `src/navigation/RootNavigator/RootNavigator.tsx`:

```typescript
// Add to RootStackParamList
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  MyFeature: undefined; // ← Add this
};

// Add screen to Stack.Navigator
<Stack.Screen name="MyFeature" component={MyFeatureScreen} />
```

### Step 4: Add Translations

Update `src/i18n/locales/en.json`:

```json
{
  "myFeature": {
    "title": "My Feature",
    "welcome": "Welcome to My Feature"
  }
}
```

Update `src/i18n/locales/es.json`:

```json
{
  "myFeature": {
    "title": "Mi Función",
    "welcome": "Bienvenido a Mi Función"
  }
}
```

Verify parity:

```bash
yarn test localesParity
```

### Step 5: Add Redux Slice (if needed)

Create `src/features/MyFeature/store/reducer.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MyFeatureState {
  data: string[];
  loading: boolean;
}

const initialState: MyFeatureState = {
  data: [],
  loading: false,
};

const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<string[]>) => {
      state.data = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const myFeatureReducer = myFeatureSlice.reducer;
export const myFeatureActions = myFeatureSlice.actions;
```

Add to root reducer in `src/store/configureStore.ts`:

```typescript
import { myFeatureReducer } from '@app/features/MyFeature/store';

const rootReducer = combineReducers({
  settings: settingsReducer,
  myFeature: myFeatureReducer, // ← Add this
});
```

### Step 6: Add Tests

Create `src/features/MyFeature/__tests__/MyFeatureScreen.test.tsx`:

```typescript
import { renderWithProviders } from '@app/test-utils';
import { MyFeatureScreen } from '../MyFeatureScreen';

describe('MyFeatureScreen', () => {
  it('renders without crashing', () => {
    const { getByTestId } = renderWithProviders(<MyFeatureScreen />);
    expect(getByTestId('my-feature-screen')).toBeTruthy();
  });

  it('displays localised title', () => {
    const { getByText } = renderWithProviders(<MyFeatureScreen />);
    expect(getByText('Welcome to My Feature')).toBeTruthy();
  });
});
```

Run tests:

```bash
yarn test MyFeatureScreen.test.tsx
```

### Step 7: Add Barrel Exports

Create `src/features/MyFeature/index.ts`:

```typescript
export { MyFeatureScreen } from './MyFeatureScreen';
export * from './store';
```

Update `src/features/index.ts`:

```typescript
export * from './MyFeature';
```

### Step 8: Test the Feature

```bash
# Start Metro
yarn start

# Run iOS
yarn ios

# Navigate to your feature
# Test all functionality
```

### Step 9: Add E2E Tests (Optional)

Create `src/features/MyFeature/__tests__/MyFeature.feature`:

```gherkin
Feature: My Feature
  As a user
  I want to use My Feature
  So I can accomplish something

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to My Feature
    When I tap the "My Feature" button
    Then I should see "Welcome to My Feature"
```

Create step definitions in `src/features/MyFeature/__tests__/MyFeature.cucumber.tsx`.

Run E2E tests:

```bash
yarn detox:ios:build
yarn detox:ios:test
```

### Step 10: Commit Your Changes

```bash
# Validate everything passes
yarn validate

# Stage changes
git add .

# Commit with descriptive message
git commit -m "✨ feat(my-feature): add My Feature with full test coverage

- Add MyFeatureScreen with navigation and i18n
- Create Redux slice for feature state management
- Add comprehensive unit tests
- Add E2E tests for user flows
- All tests passing, 100% coverage on business logic"

# Push to remote
git push
```

---

## Adding a New Screen

Quick workflow for adding a screen to an existing feature.

### 1. Create Screen Component

```typescript
// src/features/MyFeature/MyNewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export const MyNewScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View testID="my-new-screen">
      <Text>{t('myFeature.newScreen.title')}</Text>
    </View>
  );
};
```

### 2. Add to Navigation

```typescript
// src/navigation/RootNavigator/RootNavigator.tsx
export type RootStackParamList = {
  // ... existing routes
  MyNewScreen: { id?: string }; // Add params if needed
};

<Stack.Screen name="MyNewScreen" component={MyNewScreen} />;
```

### 3. Add Translations

```json
// src/i18n/locales/en.json & es.json
{
  "myFeature": {
    "newScreen": {
      "title": "New Screen"
    }
  }
}
```

### 4. Export from Feature

```typescript
// src/features/MyFeature/index.ts
export { MyNewScreen } from './MyNewScreen';
```

### 5. Add Tests & Commit

```bash
yarn test
yarn validate
git add . && git commit -m "✨ feat(my-feature): add MyNewScreen"
```

---

## Adding Translations

Workflow for adding new translation keys.

### 1. Add Keys to All Language Files

**English** (`src/i18n/locales/en.json`):

```json
{
  "myFeature": {
    "newKey": "New text in English",
    "greeting": "Hello, {{name}}!",
    "itemCount": "You have {{count}} item",
    "itemCount_plural": "You have {{count}} items"
  }
}
```

**Spanish** (`src/i18n/locales/es.json`):

```json
{
  "myFeature": {
    "newKey": "Nuevo texto en español",
    "greeting": "¡Hola, {{name}}!",
    "itemCount": "Tienes {{count}} artículo",
    "itemCount_plural": "Tienes {{count}} artículos"
  }
}
```

### 2. Use in Components

```typescript
const { t } = useTranslation();

// Basic
<Text>{t('myFeature.newKey')}</Text>

// With interpolation
<Text>{t('myFeature.greeting', { name: 'John' })}</Text>

// With pluralisation
<Text>{t('myFeature.itemCount', { count: items.length })}</Text>
```

### 3. Verify Parity

```bash
yarn test localesParity
```

This test ensures all language files have identical key structures.

### 4. Test Language Switching

```bash
yarn ios
# Test in both English and Spanish
```

### 5. Commit

```bash
git add src/i18n
git commit -m "🌐 feat(i18n): add translations for myFeature"
git push
```

---

## Adding a Redux Slice

Step-by-step for adding state management to a feature.

### 1. Create Store Directory

```bash
mkdir -p src/features/MyFeature/store/__tests__
```

### 2. Define State and Reducer

Create `src/features/MyFeature/store/reducer.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface MyFeatureState {
  items: string[];
  status: Status;
  error: string | null;
}

const initialState: MyFeatureState = {
  items: [],
  status: 'idle',
  error: null,
};

const myFeatureSlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
      state.status = 'success';
    },
    setLoading: state => {
      state.status = 'loading';
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
    },
    reset: () => initialState,
  },
});

export const myFeatureReducer = myFeatureSlice.reducer;
export const myFeatureActions = myFeatureSlice.actions;
```

### 3. Create Selectors

Create `src/features/MyFeature/store/selectors.ts`:

```typescript
import type { RootState } from '@app/store';

export const selectItems = (state: RootState) => state.myFeature.items;
export const selectStatus = (state: RootState) => state.myFeature.status;
export const selectError = (state: RootState) => state.myFeature.error;
export const selectIsLoading = (state: RootState) => state.myFeature.status === 'loading';
```

### 4. Add to Root Reducer

Update `src/store/configureStore.ts`:

```typescript
import { myFeatureReducer } from '@app/features/MyFeature/store';

const rootReducer = combineReducers({
  settings: settingsReducer,
  myFeature: myFeatureReducer, // ← Add this
});

// If persistence needed, add to whitelist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'myFeature'], // ← Add if persistent
};
```

### 5. Export from Store

Create `src/features/MyFeature/store/index.ts`:

```typescript
export { myFeatureReducer, myFeatureActions } from './reducer';
export * from './selectors';
export type { MyFeatureState, Status } from './reducer';
```

### 6. Use in Components

```typescript
import { useAppSelector, useAppDispatch } from '@app/store/hooks';
import {
  myFeatureActions,
  selectItems,
  selectIsLoading,
} from '@app/features/MyFeature/store';

export const MyComponent = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const isLoading = useAppSelector(selectIsLoading);

  const handleLoad = () => {
    dispatch(myFeatureActions.setLoading());
    // Fetch data...
    dispatch(myFeatureActions.setItems(['item1', 'item2']));
  };

  return (
    <View>
      {isLoading ? <Text>Loading...</Text> : <Text>{items.length} items</Text>}
    </View>
  );
};
```

### 7. Add Tests

Create `src/features/MyFeature/store/__tests__/reducer.test.ts`:

```typescript
import { myFeatureReducer, myFeatureActions } from '../reducer';

describe('myFeatureReducer', () => {
  const initialState = {
    items: [],
    status: 'idle' as const,
    error: null,
  };

  it('sets items', () => {
    const newState = myFeatureReducer(initialState, myFeatureActions.setItems(['item1']));

    expect(newState.items).toEqual(['item1']);
    expect(newState.status).toBe('success');
  });

  it('sets loading state', () => {
    const newState = myFeatureReducer(initialState, myFeatureActions.setLoading());

    expect(newState.status).toBe('loading');
    expect(newState.error).toBeNull();
  });
});
```

### 8. Test & Commit

```bash
yarn test
yarn validate
git add .
git commit -m "✨ feat(my-feature): add Redux state management"
git push
```

---

## Writing Tests

Workflow for comprehensive test coverage.

### Unit Tests for Components

```typescript
// MyComponent.test.tsx
import { renderWithProviders } from '@app/test-utils';
import { fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('handles button press', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <MyComponent onPress={onPress} />
    );

    fireEvent.press(getByTestId('my-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    const { getByText } = renderWithProviders(
      <MyComponent loading={true} />
    );
    expect(getByText('Loading...')).toBeTruthy();
  });
});
```

### Unit Tests for Redux

```typescript
// reducer.test.ts
import { myReducer, myActions } from '../reducer';

describe('myReducer', () => {
  it('updates state correctly', () => {
    const initialState = { value: 0 };
    const newState = myReducer(initialState, myActions.increment());
    expect(newState.value).toBe(1);
  });
});

// selectors.test.ts
import { selectValue } from '../selectors';

describe('selectors', () => {
  it('selects value from state', () => {
    const state = { myFeature: { value: 10 } };
    expect(selectValue(state)).toBe(10);
  });
});
```

### E2E Tests

```gherkin
# MyFeature.feature
Feature: My Feature

  Scenario: User completes workflow
    Given I am on the "Home" screen
    When I tap the "My Feature" button
    Then I should see "My Feature"
    When I tap the "Action" button
    Then I should see "Success"
```

```typescript
// MyFeature.cucumber.tsx
import { Given, When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect } from 'detox';

Given('I am on the {string} screen', async (screenName: string) => {
  await detoxExpect(element(by.text(screenName))).toBeVisible();
});

When('I tap the {string} button', async (buttonLabel: string) => {
  await element(by.text(buttonLabel)).tap();
});

Then('I should see {string}', async (text: string) => {
  await detoxExpect(element(by.text(text))).toBeVisible();
});
```

### Run All Tests

```bash
# Unit tests
yarn test:coverage

# E2E tests
yarn detox:ios:build
yarn detox:ios:test

# Validate everything
yarn validate
```

---

## Debugging a Failed E2E Test

Step-by-step workflow for debugging E2E test failures.

### Step 1: Reproduce the Failure

```bash
# Run single failing scenario
yarn detox:ios:test 'src/features/MyFeature/__tests__/MyFeature.feature:10'
```

### Step 2: Enable Debug Logging

```bash
# Run with verbose Detox logs
DETOX_LOGLEVEL=trace yarn detox:ios:test 'path/to/test.feature:10'
```

### Step 3: Take Screenshots

Screenshots are automatically taken on failure, but you can manually capture:

```typescript
// In step definition
await device.takeScreenshot('debug-state');
```

Check screenshots in `artifacts/` directory.

### Step 4: Keep App Running

```bash
# Keep app running after test to inspect state
yarn detox:ios:test --cleanup false 'path/to/test.feature:10'
```

### Step 5: Verify Element Selectors

```typescript
// Check if element exists
await detoxExpect(element(by.id('my-button'))).toExist();

// Check element attributes
const attributes = await element(by.id('my-button')).getAttributes();
console.log('Element attributes:', attributes);

// Use multiple matchers
await element(by.id('my-button').and(by.text('Submit'))).tap();
```

### Step 6: Check Test ID in Component

```typescript
// Ensure testID is set in component
<Button testID="my-button" onPress={handlePress}>
  Submit
</Button>
```

### Step 7: Increase Timeouts (if needed)

```typescript
// Wait longer for element
await waitFor(element(by.id('slow-element')))
  .toBeVisible()
  .withTimeout(30000);
```

### Step 8: Fix and Re-test

```bash
# Clean rebuild
yarn detox:ios:build

# Test again
yarn detox:ios:test 'path/to/test.feature:10'
```

---

## Updating Dependencies

Safe workflow for updating npm packages.

### Step 1: Check Outdated Packages

```bash
yarn outdated
```

### Step 2: Update Minor/Patch Versions

```bash
# Update all dependencies (respecting semver)
yarn upgrade

# Or update specific package
yarn upgrade react-native-safe-area-context
```

### Step 3: Update iOS Dependencies

```bash
cd ios
pod update
cd ..
```

### Step 4: Test Everything

```bash
# Clean builds
yarn clean

# Install
yarn install
cd ios && pod install && cd ..

# Run tests
yarn validate

# Test on devices
yarn ios
yarn android
```

### Step 5: Test E2E

```bash
yarn detox:ios:build
yarn detox:ios:test
```

### Step 6: Commit

```bash
git add package.json yarn.lock ios/Podfile.lock
git commit -m "⬆️ chore(deps): update dependencies

- Update React Navigation to 7.x
- Update Gluestack UI to 1.1.x
- Update CocoaPods dependencies
- All tests passing"

git push
```

---

## Preparing for Production Release

Checklist for production builds.

### Step 1: Update Version Numbers

```json
// package.json
{
  "version": "1.2.0"
}
```

```xml
<!-- ios/warrendeleon/Info.plist -->
<key>CFBundleShortVersionString</key>
<string>1.2.0</string>
<key>CFBundleVersion</key>
<string>42</string>
```

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 42
        versionName "1.2.0"
    }
}
```

### Step 2: Run Full Test Suite

```bash
yarn validate
yarn test:coverage
yarn detox:ios:build
yarn detox:ios:test
```

### Step 3: Build iOS

```bash
# Production scheme
yarn ios:release

# Or build archive in Xcode
# Product > Archive
```

### Step 4: Build Android

```bash
# Build release APK
yarn android:apk

# Build release AAB (for Play Store)
yarn android:aab
```

### Step 5: Test Release Builds

- Test on physical devices
- Verify all features work
- Check performance
- Test deep links
- Verify push notifications

### Step 6: Create Release Notes

```markdown
## Version 1.2.0

### New Features

- Added dark mode support
- Implemented offline mode

### Improvements

- Improved app performance
- Updated translations

### Bug Fixes

- Fixed login issue on Android
- Resolved crash on iOS 15
```

### Step 7: Tag Release

```bash
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

---

## Troubleshooting Build Issues

Common issues and fixes.

### Metro Cache Issues

```bash
# Clear Metro cache
yarn start --reset-cache

# Or delete cache manually
rm -rf node_modules/.cache
```

### iOS Build Fails

```bash
# Clean CocoaPods
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..

# Clean Xcode
# In Xcode: Product > Clean Build Folder (Cmd+Shift+K)

# Reset Simulator
xcrun simctl erase all
```

### Android Build Fails

```bash
# Clean Gradle
cd android
./gradlew clean
cd ..

# Clear Gradle cache
rm -rf ~/.gradle/caches
```

### TypeScript Errors

```bash
# Regenerate TypeScript cache
yarn typecheck --force

# Or delete TypeScript cache
rm -rf node_modules/.cache/typescript
```

### Node Version Issues

```bash
# Use correct Node version (.nvmrc)
nvm use

# Verify
node --version  # Should be 22.x
```

### Port Already in Use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill
```

---

## Next Steps

- **[Cheatsheet](./CHEATSHEET.md)** - Quick command reference
- **[Development](./DEVELOPMENT.md)** - Setup & environment guide
- **[Testing](./TESTING.md)** - Unit testing guide
- **[E2E Testing](./E2E_TESTING.md)** - End-to-end testing guide
- **[Contributing](./CONTRIBUTING.md)** - Code standards & conventions

---

**Need help?** Open an issue on GitHub or consult the full documentation.

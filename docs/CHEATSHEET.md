# Quick Reference Cheatsheet

Quick reference for commands, patterns, and conventions. Bookmark this page for fast lookups!

## Table of Contents

- [Development Commands](#development-commands)
- [Testing Commands](#testing-commands)
- [Code Quality Commands](#code-quality-commands)
- [iOS Commands](#ios-commands)
- [Android Commands](#android-commands)
- [Code Patterns](#code-patterns)
- [File Naming Conventions](#file-naming-conventions)
- [Import Patterns](#import-patterns)
- [Component Patterns](#component-patterns)
- [Redux Patterns](#redux-patterns)
- [Testing Patterns](#testing-patterns)
- [i18n Patterns](#i18n-patterns)
- [Navigation Patterns](#navigation-patterns)
- [Debugging](#debugging)

---

## Development Commands

```bash
# Metro Bundler
yarn start                      # Start Metro bundler
yarn start:reset                # Start Metro with cache reset

# Run App
yarn ios                        # Run iOS debug build
yarn ios --no-packager          # Run iOS without starting Metro
yarn ios:release                # Run iOS production build
yarn android                    # Run Android debug build
yarn android:release            # Run Android release build

# CocoaPods
yarn ios:pods                   # Install iOS dependencies (cd ios && pod install)
```

---

## Testing Commands

```bash
# Unit Tests
yarn test                       # Run all unit tests
yarn test:watch                 # Run tests in watch mode
yarn test:coverage              # Run tests with coverage report
yarn test path/to/file.test.ts  # Run specific test file
yarn test -t "test name"        # Run specific test by name
yarn test -u                    # Update snapshots

# E2E Tests
yarn detox:ios:build            # Build iOS app for E2E testing
yarn detox:ios:test             # Run iOS E2E tests (full suite ~2.5 mins)
yarn e2e:ios                    # Build + test iOS (convenience)

yarn detox:android:build        # Build Android app for E2E testing
yarn detox:android:test         # Run Android E2E tests
yarn e2e:android                # Build + test Android (convenience)

# Run Single E2E Scenario (~16 seconds)
yarn detox:ios:test 'src/features/Settings/__tests__/Settings.feature:10'
```

---

## Code Quality Commands

```bash
# Linting
yarn lint                       # Run ESLint
yarn lint:fix                   # Auto-fix ESLint issues

# Type Checking
yarn typecheck                  # Run TypeScript compiler check

# Formatting
yarn format                     # Format all files with Prettier
yarn format:check               # Check formatting without changes

# Validation
yarn validate                   # Run typecheck + lint + test (pre-push check)
```

---

## iOS Commands

```bash
# Clean Builds
cd ios && xcodebuild clean && cd ..
rm -rf ios/Pods ios/Podfile.lock
yarn ios:pods

# Simulators
yarn ios --simulator="iPhone 15 Pro"
yarn ios --simulator="iPhone 14"

# Reset Simulator
xcrun simctl erase all

# View Logs
yarn ios --no-packager  # Logs appear in Xcode console
```

---

## Android Commands

```bash
# Clean Builds
yarn clean:android              # cd android && ./gradlew clean && cd ..

# APK/AAB Builds
yarn android:apk                # Build release APK
yarn android:aab                # Build release AAB (for Play Store)

# Emulator
emulator -list-avds             # List available emulators
emulator -avd <name>            # Start specific emulator

# View Logs
adb logcat | grep ReactNative
```

---

## Code Patterns

### File Structure (Feature-First)

```
src/features/MyFeature/
├── MyFeatureScreen.tsx              # Main screen component
├── components/                      # Feature-specific components
│   ├── MyComponent.tsx
│   └── __tests__/MyComponent.test.tsx
├── __tests__/                       # Feature tests
│   ├── MyFeatureScreen.feature      # E2E scenarios (Gherkin)
│   └── MyFeatureScreen.cucumber.tsx # E2E step definitions
├── store/                           # Redux slice (if needed)
│   ├── actions.ts
│   ├── reducer.ts
│   └── selectors.ts
└── index.ts                         # Barrel exports
```

---

## File Naming Conventions

```bash
# Components
MyComponent.tsx                 # PascalCase for components

# Tests
MyComponent.test.tsx            # Unit/integration tests
MyFeature.feature               # E2E Gherkin scenarios
MyFeature.cucumber.tsx          # E2E step definitions

# Redux
actions.ts                      # Redux actions
reducer.ts                      # Redux slice
selectors.ts                    # Redux selectors

# Utilities
myUtil.ts                       # camelCase for utilities

# Barrel Exports
index.ts                        # Re-exports for public API
```

---

## Import Patterns

```typescript
// Use @app alias for imports
import { HomeScreen } from '@app/features';
import { RootNavigator } from '@app/navigation';
import { selectTheme } from '@app/features/Settings/store';
import { useAppSelector, useAppDispatch } from '@app/store/hooks';

// Import order (auto-sorted by ESLint)
// 1. Side effects
import './global.css';

// 2. External packages (React first)
import React from 'react';
import { View, Text } from 'react-native';

// 3. Internal @app aliases
import { MyComponent } from '@app/components';

// 4. Parent imports
import { Something } from '../utils';

// 5. Relative imports
import { LocalComponent } from './LocalComponent';

// 6. Style imports
import styles from './styles.css';
```

---

## Component Patterns

### Basic Component

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface MyComponentProps {
  label: string;
  onPress?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ label, onPress }) => {
  return (
    <View testID="my-component">
      <Text testID="my-component-label">{label}</Text>
    </View>
  );
};
```

### Component with Gluestack UI

```typescript
import React from 'react';
import { Box, Text, Button } from '@gluestack-ui/themed';

interface CardProps {
  title: string;
  description: string;
}

export const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <Box bg="$white" p="$4" borderRadius="$lg">
      <Text fontSize="$xl" fontWeight="$bold">
        {title}
      </Text>
      <Text color="$coolGray500">{description}</Text>
    </Box>
  );
};
```

### Component with i18n

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export const GreetingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('home.title')}</Text>
      <Text>{t('home.welcome', { name: 'John' })}</Text>
    </View>
  );
};
```

---

## Redux Patterns

### Reading State

```typescript
import { useAppSelector } from '@app/store/hooks';
import { selectTheme, selectLanguage } from '@app/features/Settings/store';

export const MyComponent = () => {
  const theme = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);

  return <Text>Theme: {theme}</Text>;
};
```

### Dispatching Actions

```typescript
import { useAppDispatch } from '@app/store/hooks';
import { settingsSliceActions } from '@app/features/Settings/store';

export const ThemeToggle = () => {
  const dispatch = useAppDispatch();

  const changeTheme = (theme: Theme) => {
    dispatch(settingsSliceActions.setTheme(theme));
  };

  return <Button onPress={() => changeTheme('dark')}>Dark Mode</Button>;
};
```

### Creating a Redux Slice

```typescript
// reducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  value: string;
}

const initialState: MyState = {
  value: '',
};

const mySlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    setValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

export const myReducer = mySlice.reducer;
export const myActions = mySlice.actions;
```

```typescript
// selectors.ts
import type { RootState } from '@app/store';

export const selectValue = (state: RootState) => state.myFeature.value;
```

---

## Testing Patterns

### Basic Component Test

```typescript
import { render } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<MyComponent label="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Test with Gluestack UI Provider

```typescript
import { renderWithProviders } from '@app/test-utils';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with Gluestack UI', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Test User Interaction

```typescript
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@app/test-utils';
import { MyButton } from '../MyButton';

describe('MyButton', () => {
  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <MyButton testID="my-button" onPress={onPress} />
    );

    fireEvent.press(getByTestId('my-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Test Redux Integration

```typescript
import { renderWithProviders } from '@app/test-utils';
import { fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent with Redux', () => {
  it('updates Redux state', () => {
    const { getByText, store } = renderWithProviders(<MyComponent />);

    fireEvent.press(getByText('Update'));

    expect(store.getState().myFeature.value).toBe('updated');
  });
});
```

---

## i18n Patterns

### Using Translations

```typescript
import { useTranslation } from 'react-i18next';

export const MyScreen = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      {/* Basic translation */}
      <Text>{t('home.title')}</Text>

      {/* With interpolation */}
      <Text>{t('home.greeting', { name: 'John' })}</Text>

      {/* With pluralisation */}
      <Text>{t('home.itemCount', { count: 5 })}</Text>

      {/* Current language */}
      <Text>Language: {i18n.language}</Text>
    </>
  );
};
```

### Changing Language

```typescript
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@app/store/hooks';
import { settingsSliceActions } from '@app/features/Settings/store';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const changeLanguage = async (language: Language) => {
    // Update Redux state (persisted)
    dispatch(settingsSliceActions.setLanguage(language));

    // Change i18next language
    await i18n.changeLanguage(language);
  };

  return (
    <>
      <Button onPress={() => changeLanguage('en')}>English</Button>
      <Button onPress={() => changeLanguage('es')}>Spanish</Button>
    </>
  );
};
```

### Translation File Structure

```json
{
  "featureName": {
    "key": "value",
    "greeting": "Hello, {{name}}!",
    "itemCount": "You have {{count}} item",
    "itemCount_plural": "You have {{count}} items"
  }
}
```

---

## Navigation Patterns

### Defining Routes

```typescript
// RootNavigator/RootNavigator.tsx
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
};
```

### Navigate to Screen

```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    // Navigate without params
    navigation.navigate('Settings');

    // Navigate with params
    navigation.navigate('Profile', { userId: '123' });

    // Go back
    navigation.goBack();
  };

  return <Button onPress={handlePress}>Go to Settings</Button>;
};
```

### Screen Options (Localised Titles)

```typescript
import { useTranslation } from 'react-i18next';

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  React.useEffect(() => {
    navigation.setOptions({
      title: t('settings.title'),
    });
  }, [navigation, t]);

  return <View>{/* Screen content */}</View>;
};
```

---

## Debugging

### React Native Debugger

```bash
# Install
brew install --cask react-native-debugger

# Enable Debug Menu
# iOS: Cmd+D in simulator
# Android: Cmd+M or shake device
# Select "Debug" from menu
```

### Reactotron (Redux Debugging)

```bash
# Install
brew install --cask reactotron

# Use
# 1. Open Reactotron app
# 2. Run app in dev mode: yarn ios
# 3. View Redux tab for actions, state snapshots
```

### View Logs

```bash
# iOS
yarn ios --no-packager  # Logs in Xcode console

# Android
adb logcat | grep ReactNative

# Metro
yarn start  # Logs appear in terminal
```

### Common Issues

```bash
# Metro stuck or stale cache
yarn start --reset-cache

# Port 8081 in use
lsof -ti:8081 | xargs kill

# iOS build fails (CocoaPods)
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Android build fails (Gradle)
cd android && ./gradlew clean && cd ..

# iOS Simulator not responding
xcrun simctl erase all
```

---

## Quick Tips

### Code Quality Checklist

Before committing:

```bash
✅ yarn validate          # Runs typecheck + lint + test
✅ yarn format            # Format all files
✅ git add .              # Stage changes
✅ git commit             # Commit with gitmoji + conventional format
```

### Git Commit Format

```bash
[gitmoji] [type]([scope]): [subject]

[multi-line body with bullet points]
- Detail 1
- Detail 2
```

**Examples:**

- `✨ feat(ui): add dark mode toggle`
- `🐛 fix(i18n): resolve missing Spanish translations`
- `🔧 chore(deps): update React Native to 0.82.1`
- `📝 docs(readme): add installation guide`

### TypeScript Strict Mode

This project uses TypeScript strict mode. Common patterns:

```typescript
// Array access returns T | undefined
const item = array[0]; // Type: Item | undefined
if (item) {
  // Safe to use item here
}

// Optional chaining
const value = obj?.prop?.nested;

// Nullish coalescing
const result = value ?? 'default';
```

### Import Alias

Always use `@app` alias for internal imports:

```typescript
// ✅ Good
import { MyComponent } from '@app/components';

// ❌ Avoid
import { MyComponent } from '../../../components';
```

---

## Environment Variables

```bash
# iOS Build Schemes
warrendeleon      → .env.development (Debug)
warrendeleon-Prod → .env.production (Release)

# Access in Code
import Config from 'react-native-config';
const apiUrl = Config.API_URL;
```

---

## Coverage Thresholds

```bash
# Global: 85% (statements, functions, lines, branches 80%)
# Business Logic: 100% (Redux store, shared components)
# Excluded: Screens, navigation, config files
```

---

## Useful Links

- 📚 [Architecture](./ARCHITECTURE.md) - Project structure
- 🛠️ [Development](./DEVELOPMENT.md) - Setup & running
- 🧪 [Testing](./TESTING.md) - Unit testing
- 🎭 [E2E Testing](./E2E_TESTING.md) - End-to-end testing
- 🌍 [i18n](./I18N.md) - Internationalisation
- 📦 [State Management](./STATE_MANAGEMENT.md) - Redux Toolkit
- 📝 [Contributing](./CONTRIBUTING.md) - Code standards
- 🔄 [Workflows](./WORKFLOWS.md) - Common workflows _(coming soon)_

---

**Need help?** Open an issue on GitHub or check the full documentation in `/docs`.

# E2E Testing Guide

This document covers end-to-end (E2E) testing with Detox, Cucumber, and MSW.

## Table of Contents

- [Overview](#overview)
- [Test Stack](#test-stack)
- [Setup](#setup)
- [Writing E2E Tests](#writing-e2e-tests)
- [Running E2E Tests](#running-e2e-tests)
- [MSW for API Mocking](#msw-for-api-mocking)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)

## Overview

### What is E2E Testing?

End-to-end testing validates the complete user flow from start to finish, simulating real user interactions with your app. Unlike unit tests that test individual components in isolation, E2E tests verify that all parts of the app work together correctly.

### Why Detox + Cucumber?

- **Detox**: Gray-box testing framework for React Native with excellent performance and synchronization
- **Cucumber**: Behavior-Driven Development (BDD) tool using human-readable Gherkin syntax
- **MSW (Mock Service Worker)**: API mocking for consistent, reliable tests without backend dependencies

### Testing Approach

```
User Action (Cucumber) → App Interaction (Detox) → API Call (MSW) → Assertion
```

## Test Stack

### Core Technologies

- **Detox**: E2E test runner and automation framework
- **Cucumber**: BDD test framework with Gherkin syntax
- **MSW**: API request interception and mocking
- **Jest**: Test runner (shared with unit tests)

### File Naming Convention

```
features/
  Home/
    __tests__/
      HomeScreen.feature        # Gherkin scenarios
      HomeScreen.cucumber.tsx   # Step definitions
```

- `.feature` - Gherkin scenarios (Given-When-Then)
- `.cucumber.tsx` - TypeScript step definitions

## Setup

### 1. Install Dependencies

```bash
# Detox CLI (global)
npm install -g detox-cli

# Project dependencies
yarn add -D detox @cucumber/cucumber msw
yarn add -D @types/cucumber @types/detox
```

### 2. Initialize Detox

```bash
detox init
```

This creates:

- `.detoxrc.json` - Detox configuration
- `e2e/` - E2E test directory (optional, we use feature-first structure)

### 3. Configure Detox

**`.detoxrc.json`:**

```json
{
  "testRunner": {
    "args": {
      "$0": "cucumber-js",
      "features": "src/**/*.feature",
      "require": ["src/test-utils/cucumber/support/**/*.ts", "src/**/*.cucumber.tsx"],
      "format": ["progress", "json:e2e-results.json"]
    },
    "jest": {
      "setupTimeout": 120000
    }
  },
  "apps": {
    "ios.debug": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/warrendeleon.app",
      "build": "xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "ios.release": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Release-iphonesimulator/warrendeleon.app",
      "build": "xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Release -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "android.debug": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
      "build": "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd .."
    },
    "android.release": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/release/app-release.apk",
      "build": "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd .."
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 15 Pro"
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_7_API_35"
      }
    }
  },
  "configurations": {
    "ios.sim.debug": {
      "device": "simulator",
      "app": "ios.debug"
    },
    "ios.sim.release": {
      "device": "simulator",
      "app": "ios.release"
    },
    "android.emu.debug": {
      "device": "emulator",
      "app": "android.debug"
    },
    "android.emu.release": {
      "device": "emulator",
      "app": "android.release"
    }
  }
}
```

### 4. Configure Cucumber

**`cucumber.js`:**

```javascript
module.exports = {
  default: {
    require: ['src/test-utils/cucumber/support/**/*.ts', 'src/**/*.cucumber.tsx'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'json:e2e-results.json'],
    formatOptions: { snippetInterface: 'async-await' },
  },
};
```

### 5. Add Scripts to package.json

```json
{
  "scripts": {
    "e2e:build:ios": "detox build --configuration ios.sim.debug",
    "e2e:build:android": "detox build --configuration android.emu.debug",
    "e2e:test:ios": "detox test --configuration ios.sim.debug",
    "e2e:test:android": "detox test --configuration android.emu.debug",
    "e2e:ios": "yarn e2e:build:ios && yarn e2e:test:ios",
    "e2e:android": "yarn e2e:build:android && yarn e2e:test:android"
  }
}
```

### 6. Setup Test Utilities

**`src/test-utils/cucumber/support/world.ts`:**

```typescript
import { setWorldConstructor, World } from '@cucumber/cucumber';
import { device, element, expect as detoxExpect } from 'detox';

/**
 * Cucumber World - shared context across step definitions
 */
export class CustomWorld extends World {
  device = device;
  element = element;
  expect = detoxExpect;

  // Store values between steps
  storage: Record<string, any> = {};
}

setWorldConstructor(CustomWorld);
```

**`src/test-utils/cucumber/support/hooks.ts`:**

```typescript
import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { device } from 'detox';

/**
 * Detox lifecycle hooks
 */
BeforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: { notifications: 'YES' },
  });
});

Before(async () => {
  await device.reloadReactNative();
});

After(async function (scenario) {
  if (scenario.result?.status === 'failed') {
    const screenshot = await device.takeScreenshot(scenario.pickle.name);
    this.attach(screenshot, 'image/png');
  }
});

AfterAll(async () => {
  await device.terminateApp();
});
```

**`src/test-utils/cucumber/step-definitions/common.steps.tsx`:**

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect } from 'detox';

/**
 * Common step definitions shared across all features
 */
Given('I am on the {string} screen', async (screenName: string) => {
  await detoxExpect(element(by.text(screenName))).toBeVisible();
});

When('I tap the {string} button', async (buttonLabel: string) => {
  await element(by.text(buttonLabel)).tap();
});

When('I tap the element with testID {string}', async (testID: string) => {
  await element(by.id(testID)).tap();
});

Then('I should see {string}', async (text: string) => {
  await detoxExpect(element(by.text(text))).toBeVisible();
});

Then('I should not see {string}', async (text: string) => {
  await detoxExpect(element(by.text(text))).not.toBeVisible();
});

Then('the element with testID {string} should be visible', async (testID: string) => {
  await detoxExpect(element(by.id(testID))).toBeVisible();
});
```

## Writing E2E Tests

### Gherkin Features

**Syntax:**

```gherkin
Feature: Feature Name
  Description of the feature

  Background:
    Given common setup for all scenarios

  Scenario: Scenario Name
    Given initial state
    When user action
    Then expected outcome

  Scenario Outline: Parameterized Scenario
    Given initial state with <param>
    When action with <param>
    Then outcome with <param>

    Examples:
      | param |
      | value1 |
      | value2 |
```

**Example: `src/features/Home/__tests__/HomeScreen.feature`:**

```gherkin
Feature: Home Screen
  As a user
  I want to navigate from the home screen
  So I can access different parts of the app

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to Settings
    When I tap the "Settings" button
    Then I should see "Settings"
    And I should see "Language"
    And I should see "Appearance"

  Scenario: Display environment information
    Then I should see "ENV"
    And I should see "API_URL"

  Scenario Outline: Language-specific content
    Given the app language is set to "<language>"
    When I am on the "Home" screen
    Then I should see "<homeTitle>"

    Examples:
      | language | homeTitle |
      | en       | Home      |
      | es       | Inicio    |
```

### Step Definitions

**Example: `src/features/Home/__tests__/HomeScreen.cucumber.tsx`:**

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect } from 'detox';

/**
 * Home screen-specific step definitions
 */
Given('the app is launched', async () => {
  // Detox handles this in BeforeAll hook
  await detoxExpect(element(by.id('app-root'))).toExist();
});

Given('the app language is set to {string}', async function (language: string) {
  // Navigate to language settings
  await element(by.text('Settings')).tap();
  await element(by.text('Language')).tap();

  // Select language
  const languageMap: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
  };
  await element(by.text(languageMap[language])).tap();

  // Navigate back to home
  await element(by.id('back-button')).tap();
  await element(by.id('back-button')).tap();

  // Store language for later steps
  this.storage.language = language;
});

Then('I should see {string}', async (text: string) => {
  await detoxExpect(element(by.text(text))).toBeVisible();
});
```

### Using testID in Components

Always add `testID` props for E2E testing:

```typescript
// Component
export const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View testID="home-screen">
      <Text testID="home-title">Home</Text>
      <Button
        testID="settings-button"
        onPress={() => navigation.navigate('Settings')}
      >
        Settings
      </Button>
    </View>
  );
};
```

### Matchers

```typescript
// Visibility
await expect(element(by.id('button'))).toBeVisible();
await expect(element(by.id('button'))).not.toBeVisible();
await expect(element(by.id('button'))).toExist();

// Value
await expect(element(by.id('input'))).toHaveText('Hello');
await expect(element(by.id('label'))).toHaveLabel('Username');

// State
await expect(element(by.id('toggle'))).toHaveToggleValue(true);
```

## Running E2E Tests

### Build and Test

```bash
# iOS
yarn e2e:build:ios    # Build app for testing
yarn e2e:test:ios     # Run tests
yarn e2e:ios          # Build + test

# Android
yarn e2e:build:android
yarn e2e:test:android
yarn e2e:android
```

### Run Specific Features

```bash
# Run specific feature file
detox test --configuration ios.sim.debug src/features/Home/__tests__/HomeScreen.feature

# Run with tag
detox test --configuration ios.sim.debug --tags @smoke
```

### Debug Mode

```bash
# Run with debug logging
detox test --configuration ios.sim.debug --loglevel trace

# Keep app running after tests
detox test --configuration ios.sim.debug --cleanup false
```

## MSW for API Mocking

### Setup MSW

**`src/test-utils/cucumber/mocks/server.ts`:**

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for E2E tests
 * Intercepts API calls and returns mock responses
 */
export const server = setupServer(...handlers);

export const startMockServer = () => {
  server.listen({ onUnhandledRequest: 'warn' });
};

export const stopMockServer = () => {
  server.close();
};

export const resetMockServer = () => {
  server.resetHandlers();
};
```

**`src/test-utils/cucumber/mocks/handlers.ts`:**

```typescript
import { http, HttpResponse } from 'msw';

/**
 * Default API mock handlers
 */
export const handlers = [
  // User profile endpoint
  http.get('https://api.example.com/user/profile', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    });
  }),

  // Login endpoint
  http.post('https://api.example.com/auth/login', async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: { id: '1', email },
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  // Error scenario
  http.get('https://api.example.com/error', () => {
    return HttpResponse.json({ error: 'Server error' }, { status: 500 });
  }),
];
```

### Use MSW in Tests

**Update `hooks.ts`:**

```typescript
import { BeforeAll, AfterAll, Before } from '@cucumber/cucumber';
import { device } from 'detox';
import { startMockServer, stopMockServer, resetMockServer } from '../mocks/server';

BeforeAll(async () => {
  // Start MSW server before all tests
  startMockServer();

  await device.launchApp({
    newInstance: true,
  });
});

Before(async () => {
  // Reset handlers between scenarios
  resetMockServer();
  await device.reloadReactNative();
});

AfterAll(async () => {
  await device.terminateApp();

  // Stop MSW server after all tests
  stopMockServer();
});
```

**Custom Handlers in Tests:**

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { http, HttpResponse } from 'msw';
import { server } from '@app/test-utils/cucumber/mocks/server';

Given('the API returns a server error', async () => {
  // Override default handler for this scenario
  server.use(
    http.get('https://api.example.com/user/profile', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );
});

Then('I should see an error message', async () => {
  await expect(element(by.text('Failed to load profile'))).toBeVisible();
});
```

## Best Practices

### 1. Use Page Object Pattern

**`src/features/Home/__tests__/HomeScreen.page.ts`:**

```typescript
import { by, element } from 'detox';

/**
 * Page Object for Home Screen
 * Encapsulates element selectors and actions
 */
export class HomeScreenPage {
  // Selectors
  get screen() {
    return element(by.id('home-screen'));
  }

  get title() {
    return element(by.id('home-title'));
  }

  get settingsButton() {
    return element(by.id('settings-button'));
  }

  // Actions
  async tapSettings() {
    await this.settingsButton.tap();
  }

  async waitForScreen() {
    await this.screen.waitToBeVisible();
  }
}
```

**Use in steps:**

```typescript
import { When, Then } from '@cucumber/cucumber';
import { HomeScreenPage } from './HomeScreen.page';

const homePage = new HomeScreenPage();

When('I navigate to Settings from Home', async () => {
  await homePage.tapSettings();
});

Then('the Home screen is visible', async () => {
  await homePage.waitForScreen();
});
```

### 2. Write Declarative Scenarios

**Bad:**

```gherkin
Scenario: Login
  Given I tap the email input
  And I type "test@example.com"
  And I tap the password input
  And I type "password123"
  And I tap the login button
  Then I see the home screen
```

**Good:**

```gherkin
Scenario: Login
  Given I am on the login screen
  When I login with valid credentials
  Then I should be on the home screen
```

### 3. Use Background for Common Setup

```gherkin
Feature: Settings

  Background:
    Given the app is launched
    And I navigate to Settings

  Scenario: Change language
    When I select Spanish
    Then the app language should be Spanish
```

### 4. Tag Scenarios

```gherkin
@smoke
Scenario: Critical user flow
  Given initial state
  When action
  Then outcome

@slow
Scenario: Long-running test
  Given initial state
  When slow action
  Then outcome
```

Run by tag:

```bash
detox test --tags @smoke
detox test --tags "not @slow"
```

### 5. Keep Tests Independent

Each scenario should:

- Set up its own data
- Not depend on other scenarios
- Clean up after itself

### 6. Use Meaningful testIDs

```typescript
// Bad
<Button testID="btn1" />

// Good
<Button testID="submit-login-button" />
```

### 7. Wait for Elements

```typescript
// Wait for element to appear
await waitFor(element(by.id('message')))
  .toBeVisible()
  .withTimeout(5000);

// Wait for element to disappear
await waitFor(element(by.id('loading')))
  .not.toBeVisible()
  .withTimeout(10000);
```

## Debugging

### 1. Screenshots

Automatic on failure (configured in hooks), or manual:

```typescript
await device.takeScreenshot('test-failure');
```

### 2. Debug Logging

```typescript
console.log('Current screen:', await element(by.id('screen-title')).getAttributes());
```

### 3. Slow Down Tests

```typescript
await device.launchApp({
  newInstance: true,
  launchArgs: { detoxPrintBusyIdleResources: 'YES' },
});
```

### 4. Inspect Element Hierarchy

```bash
# iOS
detox test --configuration ios.sim.debug --take-screenshots all --record-logs all

# Android
adb shell uiautomator dump
adb pull /sdcard/window_dump.xml
```

### 5. Keep App Running

```bash
detox test --configuration ios.sim.debug --cleanup false
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests hang or timeout

**Solution**:

```typescript
// Increase timeout in specific test
await waitFor(element(by.id('slow-element')))
  .toBeVisible()
  .withTimeout(30000);

// Or in .detoxrc.json
{
  "testRunner": {
    "jest": {
      "setupTimeout": 300000
    }
  }
}
```

### Element Not Found

**Problem**: `Error: Cannot find element`

**Solution**:

1. Verify testID in component
2. Check element visibility
3. Wait for element:

```typescript
await waitFor(element(by.id('element')))
  .toBeVisible()
  .withTimeout(5000);
```

### Synchronization Issues

**Problem**: Detox can't sync with app

**Solution**:

```typescript
// Disable synchronization temporarily
await device.disableSynchronization();
await element(by.id('element')).tap();
await device.enableSynchronization();
```

### Build Failures

**Problem**: Detox build fails

**Solution**:

```bash
# Clean and rebuild
# iOS
cd ios && xcodebuild clean && cd ..
yarn e2e:build:ios

# Android
cd android && ./gradlew clean && cd ..
yarn e2e:build:android
```

### MSW Not Intercepting

**Problem**: API calls not being mocked

**Solution**:

1. Verify MSW is started in hooks
2. Check handler URL matches exactly
3. Enable logging:

```typescript
server.listen({
  onUnhandledRequest: req => {
    console.log('Unhandled request:', req.url);
  },
});
```

## Next Steps

- See [Testing](./TESTING.md) for unit/integration testing
- See [Contributing](./CONTRIBUTING.md) for test requirements
- See [Development](./DEVELOPMENT.md) for running the app

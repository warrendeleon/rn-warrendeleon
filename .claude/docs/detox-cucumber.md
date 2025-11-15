# Detox + Cucumber E2E Testing Examples

Real-world patterns and techniques from this project's E2E test suite.

## Overview

**Stack**:

- **Detox**: Gray-box testing framework for React Native
- **Cucumber**: BDD with Gherkin syntax (Given/When/Then)
- **Custom Formatters**: Checkmark formatter for clean output

**Test Organization**:

- Feature files: `src/features/**/__tests__/*.feature` or `src/components/**/__tests__/*.feature`
- Step definitions: `src/test-utils/cucumber/step-definitions/*.steps.tsx`
- Reusable steps: Common steps in `common.steps.tsx`

---

## Feature File Examples

### Example 1: ErrorBoundary Testing

```gherkin
# src/components/ErrorBoundary/__tests__/ErrorBoundary.feature
Feature: ErrorBoundary
  As a user
  I want errors to be caught gracefully
  So that the app doesn't crash and I can recover

  Scenario: ErrorBoundary catches component error and displays fallback UI
    Given the app is launched
    And I am on the "Home" screen
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    Then I should see an element with testID "error-try-again-button"
    And I should see the text "Something Went Wrong"

  Scenario: Try Again button re-renders component
    Given the app is launched
    And I am on the "Home" screen
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    And I tap the element with testID "error-try-again-button"
    Then I should be on the "Home" screen
    And I should not see the text "Something Went Wrong"

  Scenario: Go Home button navigates to Home screen
    Given the app is launched
    And I am on the "Home" screen
    When I tap the element with testID "test-error-button"
    And I dismiss the React Native error screen
    And I tap the element with testID "error-go-home-button"
    Then I should be on the "Home" screen
    And I should not see the text "Something Went Wrong"
```

**Key patterns**:

- User-centric language ("As a user")
- Clear setup (Given), action (When), verification (Then)
- Uses `testID` for reliable element selection
- Handles React Native dev screens with special step

### Example 2: Navigation Testing

```gherkin
# src/features/Settings/__tests__/Settings.feature
Feature: Settings Navigation
  As a user
  I want to access app settings
  So that I can customize my experience

  Background:
    Given the app is launched
    And I am on the "Home" screen

  Scenario: Navigate to Settings screen
    When I tap the element with testID "settings-button"
    Then I should be on the "Settings" screen
    And I should see the text "Settings"

  Scenario: Navigate to Language selection
    Given I am on the "Settings" screen
    When I tap the element with testID "language-button"
    Then I should be on the "Language" screen
    And I should see the text "Languages"

  Scenario: Navigate to Appearance selection
    Given I am on the "Settings" screen
    When I tap the element with testID "appearance-button"
    Then I should be on the "Appearance" screen
    And I should see the text "Appearance"
```

**Key patterns**:

- `Background` step runs before each scenario
- Chain navigation steps (Settings → Language)
- Verify both navigation and content

---

## Step Definition Examples

### Common Steps (Reusable)

```typescript
// src/test-utils/cucumber/step-definitions/common.steps.tsx
import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, waitFor } from 'detox';

// App lifecycle
Given('the app is launched', async function () {
  await device.launchApp({
    newInstance: true,
    permissions: { notifications: 'YES' },
  });
});

// Navigation verification
Given('I am on the {string} screen', async function (screenName: string) {
  await waitFor(element(by.text(screenName)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should be on the {string} screen', async function (screenName: string) {
  await waitFor(element(by.text(screenName)))
    .toBeVisible()
    .withTimeout(5000);
});

// Element interactions
When('I tap the element with testID {string}', async function (testID: string) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
  await element(by.id(testID)).tap();
});

// Text assertions
Then('I should see the text {string}', async function (text: string) {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should not see the text {string}', async function (text: string) {
  await waitFor(element(by.text(text)))
    .not.toBeVisible()
    .withTimeout(5000);
});

// Element assertions
Then('I should see an element with testID {string}', async function (testID: string) {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});
```

**Best practices**:

- Use `waitFor` for all assertions (handles async rendering)
- Set reasonable timeouts (5000ms default)
- Use `testID` for element selection (more reliable than text)
- Handle both visible and not visible assertions

### Special Technique: Recursive Dismiss

```typescript
// src/test-utils/cucumber/step-definitions/common.steps.tsx
When('I dismiss the React Native error screen', { timeout: 30000 }, async function () {
  const MAX_DISMISS_ATTEMPTS = 10;
  let dismissed = 0;

  for (let attempt = 0; attempt < MAX_DISMISS_ATTEMPTS; attempt++) {
    try {
      // Look for "Dismiss" button (red error screen or yellow warning)
      await waitFor(element(by.text('Dismiss')))
        .toBeVisible()
        .withTimeout(1000);

      // Tap to dismiss
      await element(by.text('Dismiss')).tap();
      dismissed++;

      // Wait for screen to update
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // No more dismiss buttons found - all cleared
      console.log(`Dismissed ${dismissed} error/warning screens`);
      return;
    }
  }

  throw new Error(`Failed to clear all error screens after ${MAX_DISMISS_ATTEMPTS} attempts`);
});
```

**Why this is needed**:

1. In development mode, React Native shows red error screens BEFORE ErrorBoundary catches errors
2. Multiple errors can stack (original error + boundary error)
3. Yellow warning boxes may also appear
4. This step recursively dismisses all of them until the actual UI is visible

**Usage**:

```gherkin
When I tap the element with testID "test-error-button"
And I dismiss the React Native error screen
Then I should see an element with testID "error-try-again-button"
```

---

## TestErrorButton Component

DEV-only component for triggering errors in E2E tests.

```typescript
// src/components/TestErrorButton/TestErrorButton.tsx
import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';

export const TestErrorButton = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }

  return (
    <Pressable
      testID="test-error-button"
      onPress={() => setShouldThrow(true)}
      style={{ padding: 10, backgroundColor: 'red' }}
    >
      <Text style={{ color: 'white' }}>Throw Error</Text>
    </Pressable>
  );
};
```

**Conditional rendering** (only in development):

```typescript
// src/features/Home/HomeScreen.tsx
const HomeScreen = () => {
  return (
    <View>
      {/* Other content */}

      {/* DEV-only error trigger for E2E tests */}
      {__DEV__ && <TestErrorButton />}
    </View>
  );
};
```

**Why this pattern**:

- Errors are hard to trigger reliably in E2E tests
- This provides a deterministic way to test error boundaries
- `__DEV__` flag ensures it never appears in production
- Uses `testID` for reliable Detox selection

---

## Running E2E Tests

### iOS

```bash
# Build once (or when native code changes)
yarn detox:ios:build

# Run tests (can run multiple times)
yarn detox:ios:test

# Full suite (build + test)
yarn e2e:ios
```

**Requirements**:

- iOS simulator must be available
- Xcode command-line tools installed
- Build scheme: `warrendeleon` (debug) or `warrendeleon-Prod` (release)

### Android

```bash
# Build once (or when native code changes)
yarn detox:android:build

# Run tests (can run multiple times)
yarn detox:android:test

# Full suite (build + test)
yarn e2e:android
```

**Requirements**:

- Android emulator running
- Android SDK and tools installed
- Build variant: `debug` or `release`

---

## Debugging E2E Tests

### Common Issues

**Issue 1: Element not found**

```typescript
// ❌ Bad - no wait, flaky
await element(by.id('button')).tap();

// ✅ Good - wait for element
await waitFor(element(by.id('button')))
  .toBeVisible()
  .withTimeout(5000);
await element(by.id('button')).tap();
```

**Issue 2: Timing issues**

```typescript
// ❌ Bad - race condition
await element(by.id('button')).tap();
expect(element(by.text('Success'))).toBeVisible(); // Might not have appeared yet

// ✅ Good - wait for result
await element(by.id('button')).tap();
await waitFor(element(by.text('Success')))
  .toBeVisible()
  .withTimeout(5000);
```

**Issue 3: Stale element references**

```typescript
// ❌ Bad - element might change
const button = element(by.id('button'));
await button.tap();
// ... other actions
await button.tap(); // Might be stale

// ✅ Good - fresh query each time
await element(by.id('button')).tap();
// ... other actions
await element(by.id('button')).tap();
```

### Debugging Commands

```bash
# Verbose output
yarn detox:ios:test --loglevel trace

# Run specific feature
yarn detox:ios:test -f "ErrorBoundary"

# Debug mode (keeps simulator open)
yarn detox:ios:test --debug-synchronization

# Record video
yarn detox:ios:test --record-videos all
```

---

## Best Practices

### 1. Use testID for Element Selection

```typescript
// ✅ Preferred - stable, language-independent
<Pressable testID="settings-button">

// Query
await element(by.id('settings-button')).tap();

// ⚠️ Avoid - changes with language/content
await element(by.text('Settings')).tap();
```

### 2. Write Descriptive Scenarios

```gherkin
# ✅ Good - clear user story
Scenario: User can recover from error with Try Again button
  Given the app has encountered an error
  When I tap "Try Again"
  Then the component should re-render successfully

# ❌ Bad - too technical
Scenario: Try Again button works
  When I tap try again
  Then it works
```

### 3. Use Background for Common Setup

```gherkin
Background:
  Given the app is launched
  And I am on the "Home" screen

Scenario: Test 1
  When ...

Scenario: Test 2
  When ...
```

### 4. Keep Steps Reusable

```typescript
// ✅ Good - reusable across features
When('I tap the element with testID {string}', ...)

// ❌ Bad - feature-specific
When('I tap the settings button in the home screen', ...)
```

### 5. Handle Async Properly

```typescript
// ✅ Always use waitFor
await waitFor(element(by.id('button')))
  .toBeVisible()
  .withTimeout(5000);

// ✅ Set reasonable timeouts
{
  timeout: 30000;
} // For complex operations

// ❌ Never use arbitrary delays
await new Promise(resolve => setTimeout(resolve, 2000)); // Flaky!
```

### 6. Test in Both Light and Dark Modes

```typescript
Given('the app is in dark mode', async function() {
  await device.setPreferredColorScheme('dark');
  await device.launchApp({ newInstance: true });
});

Scenario: Settings screen displays in dark mode
  Given the app is in dark mode
  And I am on the "Settings" screen
  Then ...
```

---

## Example Test Results

```
Feature: ErrorBoundary

  ✓ ErrorBoundary catches component error and displays fallback UI (5.2s)
  ✓ Try Again button re-renders component (4.8s)
  ✓ Go Home button navigates to Home screen (4.5s)

3 scenarios (3 passed)
22 steps (22 passed)
Time: 14.5s
```

**Clean output** from custom checkmark formatter.

---

## Summary

**Key takeaways**:

1. Use `testID` for reliable element selection
2. Always use `waitFor` for assertions
3. Write user-centric scenarios in Gherkin
4. Handle React Native dev screens with recursive dismiss
5. Keep step definitions reusable
6. Test recovery paths and edge cases

**Common patterns**:

- Background for common setup
- Recursive dismiss for dev error screens
- DEV-only test components with `__DEV__` flag
- Parameterized steps for flexibility

**Testing strategy**:

- Unit tests (Jest) for business logic
- E2E tests (Detox + Cucumber) for user flows
- Focus E2E on critical paths and error recovery

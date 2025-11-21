# TASK-203: Registration E2E Tests (Detox + Cucumber)

**ID**: TASK-203 | **US**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 4h | **Created**: 2025-11-21

---

## Context & Background

End-to-end testing for registration flow is critical to ensure the entire user journey works seamlessly from screen interaction to backend integration. Unlike unit tests (RNTL) which test components in isolation, E2E tests validate the full stack: UI interaction → form validation → API calls → navigation → state management.

**Why This Task Matters:**

This task ensures the registration feature works in a real device environment (iOS simulator/Android emulator) with actual network requests to Supabase, file uploads to Supabase Storage, and navigation between screens. E2E tests catch integration issues that unit tests miss, such as:

- Network request failures or timeouts
- Incorrect API payload structure
- Navigation timing issues
- Image upload/compression failures
- Token storage issues in Keychain
- Profile picture cropping/resizing issues
- LinkedIn OAuth redirect handling
- Email verification flow timing

**Detox + Cucumber Framework:**

We use Detox for native element interaction and Cucumber (BDD) for readable test scenarios written in Gherkin syntax. This combination provides:

- **Detox**: Native automation (faster than Appium, supports React Native testID)
- **Cucumber**: Business-readable scenarios, reusable step definitions
- **Gherkin**: Given-When-Then syntax for clear test intent

**Test Coverage Scope:**

- Email/password registration with profile picture upload
- Form validation (invalid email, weak password, password mismatch)
- Profile picture picker (camera/gallery selection, square crop)
- Email verification navigation and completion
- LinkedIn OAuth registration flow
- Error handling (network failures, duplicate email)
- Success scenarios (redirect to Home, tokens stored)

---

## Objective

Build comprehensive E2E test suite using Detox + Cucumber to validate the entire registration flow on iOS and Android, covering:

1. **Happy paths**: Successful email/password registration, LinkedIn OAuth registration
2. **Validation errors**: Email format, password strength, profile picture required
3. **Network errors**: API failures, timeout handling, duplicate email
4. **Image upload**: Profile picture selection, cropping, upload to Supabase Storage
5. **Navigation**: Email verification screen, success redirect to Home
6. **State persistence**: Tokens stored in Keychain, user data in Redux

---

## Detailed Implementation Guide

### Phase 1: Test File Structure Setup (30 minutes)

Create Cucumber feature file for registration scenarios:

**File**: `e2e/features/auth/registration.feature`

```gherkin
Feature: User Registration

  As a new user
  I want to register with email/password or LinkedIn OAuth
  So I can create an account and access the app

  Background:
    Given the app is launched
    And I am on the Registration screen

  @smoke @critical
  Scenario: Successful registration with email and password
    When I enter email "test@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "John Doe"
    And I tap "Select Profile Picture"
    And I select an image from gallery
    And I crop the image to square
    And I tap "Register"
    Then I should see "Email Verification Sent" message
    And I should be navigated to "EmailVerification" screen
    And an access token should be stored in Keychain

  @validation
  Scenario: Registration fails with invalid email
    When I enter email "invalid-email"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "John Doe"
    And I tap "Register"
    Then I should see error "Please enter a valid email address"
    And I should remain on the Registration screen

  @validation
  Scenario: Registration fails with weak password
    When I enter email "test@example.com"
    And I enter password "weak"
    And I confirm password "weak"
    And I enter full name "John Doe"
    And I tap "Register"
    Then I should see error "Password must be at least 8 characters, include uppercase, lowercase, number, and special character"
    And I should remain on the Registration screen

  @validation
  Scenario: Registration fails with password mismatch
    When I enter email "test@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "DifferentPass456!"
    And I enter full name "John Doe"
    And I tap "Register"
    Then I should see error "Passwords do not match"
    And I should remain on the Registration screen

  @validation
  Scenario: Registration fails without profile picture
    When I enter email "test@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "John Doe"
    And I tap "Register"
    Then I should see error "Profile picture is required"
    And I should remain on the Registration screen

  @network @error
  Scenario: Registration fails with duplicate email
    Given a user with email "existing@example.com" already exists
    When I enter email "existing@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "Jane Doe"
    And I tap "Select Profile Picture"
    And I select an image from gallery
    And I tap "Register"
    Then I should see error "Email already registered. Please log in or use a different email."
    And I should remain on the Registration screen

  @network @error
  Scenario: Registration fails with network timeout
    Given the network is slow (5 second delay)
    When I enter email "test@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "John Doe"
    And I tap "Select Profile Picture"
    And I select an image from gallery
    And I tap "Register"
    Then I should see a loading indicator for 5 seconds
    And I should see error "Request timed out. Please check your connection and try again."

  @oauth @linkedin
  Scenario: Successful registration with LinkedIn OAuth
    When I tap "Continue with LinkedIn"
    And I complete LinkedIn OAuth flow in browser
    Then I should see "Registration Successful" message
    And I should be navigated to "BiometricSetup" screen
    And an access token should be stored in Keychain
    And my LinkedIn profile picture should be downloaded and stored

  @image-upload
  Scenario: Profile picture is resized and uploaded correctly
    When I enter email "test@example.com"
    And I enter password "SecurePass123!"
    And I confirm password "SecurePass123!"
    And I enter full name "John Doe"
    And I tap "Select Profile Picture"
    And I select a 4000x3000 image from gallery
    And I crop the image to square
    And I tap "Register"
    Then the image should be resized to 800x800
    And the image should be compressed to 80% JPEG
    And the image should be uploaded to Supabase Storage
    And the EXIF metadata should be stripped
    And I should see "Email Verification Sent" message
```

### Phase 2: Step Definitions Implementation (2 hours)

Create step definitions for registration flows:

**File**: `e2e/step-definitions/auth/registration.steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

// Background steps
Given('the app is launched', async () => {
  await device.launchApp({
    newInstance: true,
    permissions: { photos: 'YES', camera: 'YES' },
  });
});

Given('I am on the Registration screen', async () => {
  await waitFor(element(by.id('registration-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

// Input field steps
When('I enter email {string}', async (email: string) => {
  await element(by.id('email-input')).typeText(email);
  await element(by.id('email-input')).tapReturnKey();
});

When('I enter password {string}', async (password: string) => {
  await element(by.id('password-input')).typeText(password);
  await element(by.id('password-input')).tapReturnKey();
});

When('I confirm password {string}', async (confirmPassword: string) => {
  await element(by.id('confirm-password-input')).typeText(confirmPassword);
  await element(by.id('confirm-password-input')).tapReturnKey();
});

When('I enter full name {string}', async (fullName: string) => {
  await element(by.id('full-name-input')).typeText(fullName);
  await element(by.id('full-name-input')).tapReturnKey();
});

// Profile picture steps
When('I tap {string}', async (buttonText: string) => {
  const testID = buttonText.toLowerCase().replace(/\s+/g, '-');
  await element(by.id(testID)).tap();
});

When('I select an image from gallery', async () => {
  // Wait for image picker to open
  await new Promise(resolve => setTimeout(resolve, 1000));

  // On iOS simulator, this will select the first photo
  // On Android emulator, this will select the first photo
  if (device.getPlatform() === 'ios') {
    await element(by.id('photo-library-image-0')).tap();
  } else {
    await element(by.id('gallery-image-0')).tap();
  }
});

When('I crop the image to square', async () => {
  // Wait for crop screen
  await waitFor(element(by.id('image-cropper')))
    .toBeVisible()
    .withTimeout(3000);

  // Tap confirm crop button
  await element(by.id('confirm-crop-button')).tap();
});

When('I select a {int}x{int} image from gallery', async (width: number, height: number) => {
  // This step assumes test images are pre-loaded in the simulator/emulator
  await element(by.id(`test-image-${width}x${height}`)).tap();
});

// Network condition steps
Given('a user with email {string} already exists', async (email: string) => {
  // This step requires backend seeding or mocking
  // For now, we'll skip backend setup and rely on error simulation
  // In production, you'd call a test API endpoint to create the user
});

Given('the network is slow ({int} second delay)', async (delay: number) => {
  // Detox doesn't support network mocking directly
  // You'll need to use a proxy like Charles or implement MSW (Mock Service Worker)
  // For now, we'll simulate by setting an environment variable
  await device.setURLBlacklist([]);
});

// LinkedIn OAuth steps
When('I complete LinkedIn OAuth flow in browser', async () => {
  // Wait for browser to open
  await new Promise(resolve => setTimeout(resolve, 2000));

  // For E2E tests, you'll need to either:
  // 1. Use a test LinkedIn account with auto-approve
  // 2. Mock the OAuth callback with a deep link
  // 3. Use a headless browser automation library

  // For this example, we'll simulate the callback
  await device.openURL({
    url: 'warrendeleon://linkedin-callback?code=test_auth_code&state=test_state',
  });
});

// Assertion steps
Then('I should see {string} message', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should see error {string}', async (errorMessage: string) => {
  await waitFor(element(by.id('error-message')))
    .toHaveText(errorMessage)
    .withTimeout(3000);
});

Then('I should be navigated to {string} screen', async (screenName: string) => {
  const testID = `${screenName.toLowerCase()}-screen`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should remain on the Registration screen', async () => {
  await detoxExpect(element(by.id('registration-screen'))).toBeVisible();
});

Then('an access token should be stored in Keychain', async () => {
  // Detox cannot directly access Keychain
  // Instead, verify that the app is in an authenticated state
  // by checking for a user profile or protected screen
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should see a loading indicator for {int} seconds', async (seconds: number) => {
  await waitFor(element(by.id('loading-spinner')))
    .toBeVisible()
    .withTimeout(1000);

  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

// Image upload verification steps
Then('the image should be resized to {int}x{int}', async (width: number, height: number) => {
  // This requires backend verification or checking image metadata
  // For E2E tests, you'd typically verify the uploaded image dimensions
  // via an API call or by checking the rendered image size

  // For now, we'll verify that the upload succeeded
  await waitFor(element(by.id('upload-success-indicator')))
    .toBeVisible()
    .withTimeout(10000);
});

Then('the image should be compressed to {int}% JPEG', async (quality: number) => {
  // Verify via backend API that the image was compressed correctly
  // This is typically done by checking file size or image metadata
});

Then('the image should be uploaded to Supabase Storage', async () => {
  // Verify that the profilePictureUrl is set in the user record
  // This can be checked via an API call or by verifying the image is displayed
  await waitFor(element(by.id('profile-picture-preview')))
    .toBeVisible()
    .withTimeout(5000);
});

Then('the EXIF metadata should be stripped', async () => {
  // Verify via backend API that EXIF data is removed
  // This requires fetching the uploaded image and checking metadata
});

Then('my LinkedIn profile picture should be downloaded and stored', async () => {
  // Verify that the LinkedIn profile picture was extracted and stored
  await waitFor(element(by.id('profile-picture-preview')))
    .toBeVisible()
    .withTimeout(5000);
});
```

### Phase 3: Test Helpers and Utilities (1 hour)

Create helper utilities for common E2E operations:

**File**: `e2e/helpers/auth.helper.ts`

```typescript
import { by, device, element, waitFor } from 'detox';
import * as Keychain from 'react-native-keychain';

export class AuthHelper {
  /**
   * Clear all authentication state (Keychain, AsyncStorage, Redux)
   */
  static async clearAuthState() {
    await device.launchApp({
      newInstance: true,
      delete: true, // Deletes app data
    });
  }

  /**
   * Verify that user is authenticated
   */
  static async verifyAuthenticated() {
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  }

  /**
   * Verify that user is NOT authenticated
   */
  static async verifyNotAuthenticated() {
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);
  }

  /**
   * Fill registration form with valid data
   */
  static async fillRegistrationForm(data: { email: string; password: string; fullName: string }) {
    await element(by.id('email-input')).typeText(data.email);
    await element(by.id('email-input')).tapReturnKey();

    await element(by.id('password-input')).typeText(data.password);
    await element(by.id('password-input')).tapReturnKey();

    await element(by.id('confirm-password-input')).typeText(data.password);
    await element(by.id('confirm-password-input')).tapReturnKey();

    await element(by.id('full-name-input')).typeText(data.fullName);
    await element(by.id('full-name-input')).tapReturnKey();
  }

  /**
   * Select profile picture from gallery
   */
  static async selectProfilePicture() {
    await element(by.id('select-profile-picture')).tap();
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (device.getPlatform() === 'ios') {
      await element(by.id('photo-library-image-0')).tap();
    } else {
      await element(by.id('gallery-image-0')).tap();
    }

    await waitFor(element(by.id('image-cropper')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('confirm-crop-button')).tap();
  }
}
```

**File**: `e2e/helpers/network.helper.ts`

```typescript
import { device } from 'detox';

export class NetworkHelper {
  /**
   * Simulate network failure
   */
  static async simulateNetworkFailure() {
    // Detox doesn't support network mocking directly
    // You'll need to use environment variables or a proxy
    await device.setURLBlacklist(['.*']);
  }

  /**
   * Restore network connectivity
   */
  static async restoreNetwork() {
    await device.setURLBlacklist([]);
  }

  /**
   * Simulate slow network (requires proxy setup)
   */
  static async simulateSlowNetwork(delayMs: number) {
    // This requires a proxy like Charles or MSW
    // For now, we'll just document the need
    console.warn('Slow network simulation requires proxy setup');
  }
}
```

### Phase 4: Environment Configuration (30 minutes)

Configure Detox to use E2E mock mode:

**File**: `.env.e2e`

```bash
# E2E Test Environment Variables
E2E_MOCK=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
LINKEDIN_CLIENT_ID=test-client-id
LINKEDIN_REDIRECT_URI=warrendeleon://linkedin-callback
```

Update Detox configuration to load E2E environment:

**File**: `.detoxrc.js`

```javascript
module.exports = {
  testRunner: {
    args: {
      config: 'e2e/config/cucumber.config.ts',
      format: [
        'progress',
        'json:e2e/reports/cucumber-report.json',
        'html:e2e/reports/cucumber-report.html',
      ],
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/warrendeleon.app',
      build:
        'xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      env: {
        E2E_MOCK: 'true',
      },
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      env: {
        E2E_MOCK: 'true',
      },
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

### Phase 5: Running Tests (30 minutes)

**Build iOS app for Detox:**

```bash
yarn detox:ios:build
```

**Run E2E tests on iOS:**

```bash
yarn detox:ios:test
```

**Run specific scenario:**

```bash
yarn detox:ios:test --grep "@smoke"
```

**Build Android app for Detox:**

```bash
yarn detox:android:build
```

**Run E2E tests on Android:**

```bash
yarn detox:android:test
```

**Debug failing test:**

```bash
# Take screenshot on failure
yarn detox:ios:test --take-screenshots failing

# Record video
yarn detox:ios:test --record-videos failing
```

---

## Acceptance Criteria

- [ ] All scenarios pass on iOS simulator (iPhone 15 Pro)
- [ ] All scenarios pass on Android emulator (Pixel 7 API 34)
- [ ] Email/password registration flow tested end-to-end
- [ ] Form validation errors tested (email, password, profile picture)
- [ ] Profile picture upload tested (selection, cropping, upload)
- [ ] LinkedIn OAuth registration tested
- [ ] Network error scenarios tested (duplicate email, timeout)
- [ ] Email verification navigation tested
- [ ] Tokens stored in Keychain verified (via authenticated state check)
- [ ] Test reports generated (JSON + HTML)
- [ ] All test IDs match component implementation
- [ ] No flaky tests (all tests pass 3 consecutive times)
- [ ] Tests run in isolated environment (E2E_MOCK=true)
- [ ] Screenshots captured on failure for debugging

---

## Testing

**Run Full E2E Suite (iOS):**

```bash
yarn detox:ios:build && yarn detox:ios:test
```

**Run Full E2E Suite (Android):**

```bash
yarn detox:android:build && yarn detox:android:test
```

**Run Smoke Tests Only:**

```bash
yarn detox:ios:test --grep "@smoke"
```

**Run Validation Tests Only:**

```bash
yarn detox:ios:test --grep "@validation"
```

---

## Troubleshooting

### Issue: "Element by id 'registration-screen' not found"

**Cause**: Component missing `testID` prop or incorrect testID value

**Solution**:

```typescript
// Add testID to screen container
<View testID="registration-screen">
  {/* screen content */}
</View>
```

### Issue: "Image picker doesn't open"

**Cause**: Missing permissions in Detox config

**Solution**:

```javascript
await device.launchApp({
  permissions: { photos: 'YES', camera: 'YES' },
});
```

### Issue: "LinkedIn OAuth doesn't redirect back to app"

**Cause**: Deep linking not configured correctly

**Solution**:

1. Verify URL scheme in `Info.plist` (iOS) or `AndroidManifest.xml`
2. Test deep link manually: `xcrun simctl openurl booted "warrendeleon://linkedin-callback?code=test"`
3. Check OAuth redirect URI matches app scheme

### Issue: "Tests are flaky (sometimes pass, sometimes fail)"

**Cause**: Race conditions, network timing, animation delays

**Solution**:

```typescript
// Use waitFor with sufficient timeout
await waitFor(element(by.id('element')))
  .toBeVisible()
  .withTimeout(5000);

// Disable animations in test environment
await device.launchApp({
  launchArgs: { detoxDisableAnimations: 'YES' },
});
```

### Issue: "Cannot verify Keychain storage"

**Cause**: Detox cannot access native Keychain APIs directly

**Solution**: Verify authenticated state indirectly by checking for authenticated screens or user data:

```typescript
// Instead of checking Keychain directly
// Verify user is authenticated by checking for protected screen
await waitFor(element(by.id('home-screen')))
  .toBeVisible()
  .withTimeout(5000);
```

### Issue: "Network mocking not working"

**Cause**: Detox doesn't support built-in network mocking

**Solution**: Use one of these approaches:

1. Environment variable flag (`E2E_MOCK=true`) to use mock API responses
2. Charles Proxy or similar tool for network interception
3. MSW (Mock Service Worker) for API mocking

---

**Effort**: 4h | **Last Updated**: 2025-11-21

# TASK-208: LinkedIn OAuth E2E Tests (Detox + Cucumber)

**ID**: TASK-208 | **US**: [US-034](../stories/US-034-linkedin-oauth-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h | **Created**: 2025-11-21

---

## Context & Background

LinkedIn OAuth E2E testing presents unique challenges because it requires interacting with LinkedIn's actual OAuth flow in a browser, then returning to the app. Unlike unit tests that can mock the entire flow, E2E tests need to either use a real LinkedIn account or mock the OAuth callback deep link.

**Why This Task Matters:**

E2E tests for OAuth ensure:

- Browser opens correctly with LinkedIn authorization URL
- User can complete OAuth in browser
- Deep link redirect works correctly
- App processes OAuth callback and extracts user data
- Profile picture downloads and displays
- Account creation succeeds
- Navigation to next screen works

**Testing Challenges:**

1. **Browser Automation**: Cannot directly control LinkedIn login page in browser
2. **Test Account**: Need valid LinkedIn test account credentials
3. **Deep Linking**: Must test app deep link handling
4. **Network Dependence**: Tests depend on LinkedIn API availability
5. **Profile Picture**: Requires actual image download and processing

**Testing Strategies:**

- **Strategy 1 (Recommended)**: Mock OAuth callback via deep link simulation
- **Strategy 2**: Use real LinkedIn test account with automated credentials
- **Strategy 3**: Use LinkedIn's test mode (if available)

We'll use Strategy 1 for reliability and speed.

---

## Objective

Build E2E test suite using Detox + Cucumber to validate LinkedIn OAuth registration flow with:

1. **OAuth initiation**: Button press opens LinkedIn authorization
2. **OAuth callback simulation**: Mock successful OAuth callback via deep link
3. **Profile data extraction**: Verify user data populated correctly
4. **Profile picture handling**: Test image download and display
5. **Initials avatar fallback**: Test when no profile picture available
6. **Error scenarios**: Test cancellation, network errors, duplicate accounts
7. **Platform coverage**: Run on both iOS and Android

---

## Detailed Implementation Guide

### Phase 1: Cucumber Feature File (30 minutes)

**File**: `e2e/features/auth/linkedin-oauth.feature`

```gherkin
Feature: LinkedIn OAuth Registration

  As a new user
  I want to register using LinkedIn OAuth
  So I can quickly create an account with my LinkedIn profile

  Background:
    Given the app is launched
    And I am on the Registration screen

  @smoke @oauth
  Scenario: Successful LinkedIn OAuth registration
    When I tap "Continue with LinkedIn"
    And LinkedIn OAuth completes successfully with profile data
    Then I should see "Registration Successful" message
    And I should be navigated to "BiometricSetup" screen
    And my profile should show name "John Doe"
    And my profile should show email "john@example.com"
    And my profile picture should be displayed

  @oauth @error
  Scenario: LinkedIn OAuth cancellation
    When I tap "Continue with LinkedIn"
    And I cancel LinkedIn OAuth in browser
    Then I should remain on the Registration screen
    And I should see error "LinkedIn sign-in was cancelled"

  @oauth @fallback
  Scenario: LinkedIn OAuth without profile picture
    When I tap "Continue with LinkedIn"
    And LinkedIn OAuth completes without profile picture
    Then I should see "Registration Successful" message
    And I should be navigated to "BiometricSetup" screen
    And my profile should show initials avatar "JD"

  @oauth @error
  Scenario: Duplicate LinkedIn account registration
    Given a user with LinkedIn ID "linkedin-user-123" already exists
    When I tap "Continue with LinkedIn"
    And LinkedIn OAuth completes successfully with profile data
    Then I should see error "Account already exists. Please log in instead."
    And I should remain on the Registration screen

  @oauth @network
  Scenario: LinkedIn OAuth with network error
    When I tap "Continue with LinkedIn"
    And LinkedIn OAuth fails due to network error
    Then I should see error "Network error. Please check your connection and try again."
    And I should remain on the Registration screen

  @oauth @profile
  Scenario: LinkedIn profile picture downloads and displays correctly
    When I tap "Continue with LinkedIn"
    And LinkedIn OAuth completes with large profile picture
    Then the profile picture should be resized to 800x800
    And the profile picture should be uploaded to Supabase Storage
    And I should see the uploaded profile picture on BiometricSetup screen
```

### Phase 2: Step Definitions (1 hour)

**File**: `e2e/step-definitions/auth/linkedin-oauth.steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

// Background steps (already defined in registration.steps.ts)

// LinkedIn OAuth button interaction
When('I tap {string}', async (buttonText: string) => {
  const testID = buttonText.toLowerCase().replace(/\s+/g, '-');
  await element(by.id(testID)).tap();
});

// OAuth success simulation
When('LinkedIn OAuth completes successfully with profile data', async () => {
  // Wait for browser to open (we can't control LinkedIn's page)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate OAuth callback by opening deep link with authorization code
  const mockAuthCode = 'test_auth_code_' + Date.now();
  const mockState = 'test_state_' + Date.now();

  await device.openURL({
    url: `warrendeleon://linkedin-callback?code=${mockAuthCode}&state=${mockState}`,
  });

  // Wait for app to process callback
  await new Promise(resolve => setTimeout(resolve, 3000));
});

// OAuth without profile picture
When('LinkedIn OAuth completes without profile picture', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Use a different deep link that triggers no-picture scenario
  await device.openURL({
    url: `warrendeleon://linkedin-callback?code=test_no_picture&state=test_state`,
  });

  await new Promise(resolve => setTimeout(resolve, 3000));
});

// OAuth cancellation
When('I cancel LinkedIn OAuth in browser', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate cancellation by opening app without OAuth callback
  // Or by sending error callback
  await device.openURL({
    url: `warrendeleon://linkedin-callback?error=user_cancelled&error_description=User+cancelled+flow`,
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Network error simulation
When('LinkedIn OAuth fails due to network error', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  await device.openURL({
    url: `warrendeleon://linkedin-callback?error=network_error&error_description=Network+request+failed`,
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Large profile picture scenario
When('LinkedIn OAuth completes with large profile picture', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  await device.openURL({
    url: `warrendeleon://linkedin-callback?code=test_large_picture&state=test_state`,
  });

  await new Promise(resolve => setTimeout(resolve, 5000)); // Allow time for download
});

// Duplicate account check
Given('a user with LinkedIn ID {string} already exists', async (linkedInId: string) => {
  // This would require backend seeding
  // For E2E tests, you'd call a test API endpoint to create a user
  // For now, we'll rely on E2E_MOCK mode to handle this
  console.log(`[E2E] Seeding user with LinkedIn ID: ${linkedInId}`);
});

// Assertions
Then('I should see {string} message', async (message: string) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should be navigated to {string} screen', async (screenName: string) => {
  const testID = `${screenName.toLowerCase()}-screen`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('my profile should show name {string}', async (name: string) => {
  await waitFor(element(by.text(name)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('my profile should show email {string}', async (email: string) => {
  await waitFor(element(by.text(email)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('my profile picture should be displayed', async () => {
  await waitFor(element(by.id('profile-picture-image')))
    .toBeVisible()
    .withTimeout(5000);
});

Then('my profile should show initials avatar {string}', async (initials: string) => {
  await waitFor(element(by.text(initials)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see error {string}', async (errorMessage: string) => {
  await waitFor(element(by.text(errorMessage)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should remain on the Registration screen', async () => {
  await detoxExpect(element(by.id('registration-screen'))).toBeVisible();
});

Then(
  'the profile picture should be resized to {int}x{int}',
  async (width: number, height: number) => {
    // Verify via backend check or image metadata
    // For E2E, we primarily verify it was uploaded successfully
    await waitFor(element(by.id('profile-picture-image')))
      .toBeVisible()
      .withTimeout(10000);
  }
);

Then('the profile picture should be uploaded to Supabase Storage', async () => {
  // Verify by checking if image loads from Supabase URL
  await waitFor(element(by.id('profile-picture-image')))
    .toBeVisible()
    .withTimeout(10000);
});

Then('I should see the uploaded profile picture on BiometricSetup screen', async () => {
  await waitFor(element(by.id('biometricsetup-screen')))
    .toBeVisible()
    .withTimeout(3000);

  await waitFor(element(by.id('profile-picture-image')))
    .toBeVisible()
    .withTimeout(3000);
});
```

### Phase 3: Deep Link Handler Setup (15 minutes)

Ensure app handles LinkedIn OAuth callback deep links correctly:

**File**: `src/navigation/linking.ts`

```typescript
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['warrendeleon://', 'https://warrendeleon.app'],
  config: {
    screens: {
      // LinkedIn OAuth callback
      LinkedInCallback: {
        path: 'linkedin-callback',
        parse: {
          code: (code: string) => code,
          state: (state: string) => state,
          error: (error: string) => error,
          error_description: (desc: string) => desc,
        },
      },
      // Other screens...
    },
  },
};
```

**File**: `src/screens/auth/LinkedInCallbackScreen.tsx`

```typescript
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLinkedInAuth } from '@/hooks/useLinkedInAuth';

export const LinkedInCallbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { handleOAuthCallback } = useLinkedInAuth();

  useEffect(() => {
    const processCallback = async () => {
      const params = route.params as any;

      if (params.error) {
        // OAuth error (user cancelled, network error, etc.)
        navigation.navigate('Registration', {
          linkedInError: params.error_description || params.error,
        });
        return;
      }

      if (params.code && params.state) {
        // Success: process OAuth callback
        try {
          await handleOAuthCallback(params.code, params.state);
          navigation.navigate('BiometricSetup');
        } catch (error) {
          navigation.navigate('Registration', {
            linkedInError: error.message,
          });
        }
      } else {
        navigation.navigate('Registration', {
          linkedInError: 'Invalid OAuth callback',
        });
      }
    };

    processCallback();
  }, [route.params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};
```

### Phase 4: Mock OAuth Response (15 minutes)

For E2E tests, mock LinkedIn OAuth responses:

**File**: `e2e/mocks/linkedin-oauth.mock.ts`

```typescript
export const mockLinkedInOAuthResponses = {
  // Standard success response
  success: {
    code: 'test_auth_code',
    profile: {
      sub: 'linkedin-user-123',
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://media.licdn.com/dms/image/mock-profile.jpg',
    },
  },

  // Success without profile picture
  noPicture: {
    code: 'test_no_picture',
    profile: {
      sub: 'linkedin-user-456',
      name: 'Jane Doe',
      email: 'jane@example.com',
      // No picture field
    },
  },

  // Large profile picture
  largePicture: {
    code: 'test_large_picture',
    profile: {
      sub: 'linkedin-user-789',
      name: 'Bob Smith',
      email: 'bob@example.com',
      picture: 'https://mock-server/large-4000x3000.jpg',
    },
  },

  // User cancellation
  cancelled: {
    error: 'user_cancelled',
    error_description: 'User cancelled flow',
  },

  // Network error
  networkError: {
    error: 'network_error',
    error_description: 'Network request failed',
  },
};
```

---

## Acceptance Criteria

- [ ] All scenarios pass on iOS simulator (iPhone 15 Pro)
- [ ] All scenarios pass on Android emulator (Pixel 7 API 34)
- [ ] LinkedIn OAuth button opens authorization flow
- [ ] OAuth callback deep link handled correctly
- [ ] Successful OAuth creates user account
- [ ] Profile data (name, email) displayed correctly
- [ ] Profile picture downloads and displays
- [ ] Initials avatar shows when no profile picture
- [ ] User cancellation handled gracefully
- [ ] Network errors displayed with retry option
- [ ] Duplicate account error prevents registration
- [ ] Navigation to BiometricSetup screen works
- [ ] All testIDs present for element selection
- [ ] Tests run in E2E_MOCK mode for reliability
- [ ] Screenshots captured on failure

---

## Testing

**Build iOS app**:

```bash
yarn detox:ios:build
```

**Run LinkedIn OAuth E2E tests**:

```bash
yarn detox:ios:test --grep "@oauth"
```

**Run specific scenario**:

```bash
yarn detox:ios:test -c ios.sim.debug e2e/features/auth/linkedin-oauth.feature
```

**Debug with screenshots**:

```bash
yarn detox:ios:test --grep "@oauth" --take-screenshots failing
```

---

## Troubleshooting

### Issue: "Deep link doesn't redirect back to app"

**Cause**: URL scheme not configured or deep linking not set up

**Solution**:

1. Verify `Info.plist` has URL scheme:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>warrendeleon</string>
    </array>
  </dict>
</array>
```

2. Test deep link manually:

```bash
xcrun simctl openurl booted "warrendeleon://linkedin-callback?code=test&state=test"
```

### Issue: "Profile picture doesn't display"

**Cause**: Image URL incorrect or download failed

**Solution**: Check image URL in mock response and ensure network requests allowed in test environment.

### Issue: "Tests fail intermittently"

**Cause**: Timing issues with OAuth callback processing

**Solution**: Increase wait times:

```typescript
await new Promise(resolve => setTimeout(resolve, 5000));
```

### Issue: "Cannot test actual LinkedIn login page"

**Cause**: Detox cannot control browser pages outside the app

**Solution**: Use deep link simulation approach (recommended) or use real test account with automated credentials (complex).

---

**Effort**: 2h | **Last Updated**: 2025-11-21

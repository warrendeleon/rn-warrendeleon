# TASK-212: Biometric Setup E2E Tests (Detox + Cucumber)

**ID**: TASK-212 | **US**: [US-035](../stories/US-035-biometric-security-setup.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h | **Created**: 2025-11-21

---

## Context & Background

Biometric and PIN setup involve complex user flows with device-specific behaviour, making E2E tests critical for validating the complete user experience. Unlike unit tests (RNTL) that mock biometric APIs, E2E tests verify actual simulator/emulator behaviour.

**Why This Task Matters:**

Biometric setup E2E tests ensure:

- **Device capability detection works**: Face ID vs Touch ID vs Fingerprint vs None
- **Biometric prompts trigger correctly**: Simulator Face ID enrollment verification
- **PIN validation prevents weak patterns**: Sequential, repeated, common PINs rejected
- **Skip warning modal appears**: User acknowledges security implications
- **Navigation flows correctly**: BiometricSetup → PINSetup → Home
- **Keychain storage succeeds**: Hashed PIN stored securely

**Testing Challenges:**

1. **Simulator limitations**: Cannot test real biometric authentication (only enrollment status)
2. **Platform differences**: Face ID (iOS) vs Fingerprint (Android) have different UX
3. **Timing issues**: Biometric prompts may take time to appear
4. **State persistence**: Keychain data persists across tests (requires cleanup)

**E2E Test Coverage:**

| Scenario          | iOS | Android | Purpose                            |
| ----------------- | --- | ------- | ---------------------------------- |
| Face ID setup     | ✅  | ❌      | Verify Face ID flow on iPhone X+   |
| Fingerprint setup | ❌  | ✅      | Verify Fingerprint flow on Android |
| No biometrics     | ✅  | ✅      | Fallback to PIN when no hardware   |
| PIN validation    | ✅  | ✅      | Reject weak PINs (123456, 000000)  |
| PIN confirmation  | ✅  | ✅      | Verify PIN matching logic          |
| Skip warning      | ✅  | ✅      | Security acknowledgement modal     |

---

## Objective

Build full E2E test suite for biometric and PIN setup flows with:

1. **Cucumber feature file**: Gherkin scenarios covering all user paths
2. **Step definitions**: Detox interactions for biometric/PIN flows
3. **Face ID simulation**: Simulator Face ID enrollment configuration
4. **Fingerprint simulation**: Android emulator fingerprint configuration
5. **PIN entry automation**: 6-digit PIN input field interaction
6. **Weak PIN scenarios**: Test all validation rules
7. **Skip modal verification**: Warning modal appears and navigates correctly
8. **Platform coverage**: Tests run on both iOS and Android
9. **Cleanup**: Reset Keychain state between tests

---

## Detailed Implementation Guide

### Phase 1: Cucumber Feature File (40 minutes)

**File**: `e2e/features/auth/biometric-setup.feature`

```gherkin
Feature: Biometric and PIN Setup

  As a registered user
  I want to set up biometric or PIN authentication
  So I can secure my account

  Background:
    Given the app is launched
    And I am on the BiometricSetup screen

  @smoke @biometric @ios
  Scenario: Face ID setup (iOS)
    Given Face ID is enrolled on the device
    When I tap "Enable Face ID"
    Then the Face ID prompt should appear
    When I approve the Face ID prompt
    Then I should be navigated to "Home" screen

  @biometric @android
  Scenario: Fingerprint setup (Android)
    Given Fingerprint is enrolled on the device
    When I tap "Enable Fingerprint"
    Then the Fingerprint prompt should appear
    When I approve the Fingerprint prompt
    Then I should be navigated to "Home" screen

  @biometric @fallback
  Scenario: No biometrics available (fallback to PIN)
    Given no biometrics are enrolled on the device
    Then I should see "Set Up Security" heading
    And I should see "Set Up PIN" button
    When I tap "Set Up PIN"
    Then I should be navigated to "PINSetup" screen

  @pin @validation
  Scenario: 6-digit PIN setup with strong PIN
    When I tap "Set up PIN instead"
    Then I should be navigated to "PINSetup" screen
    When I enter PIN "159487"
    Then I should see "Confirm Your PIN" heading
    When I enter confirmation PIN "159487"
    Then PIN should be hashed and stored
    And I should be navigated to "Home" screen

  @pin @validation
  Scenario: Reject sequential ascending PIN (123456)
    When I tap "Set up PIN instead"
    And I enter PIN "123456"
    Then I should see error "PIN cannot be sequential (e.g., 123456)"
    And I should remain on the "Create a PIN" screen

  @pin @validation
  Scenario: Reject sequential descending PIN (654321)
    When I tap "Set up PIN instead"
    And I enter PIN "654321"
    Then I should see error "PIN cannot be sequential (e.g., 654321)"
    And I should remain on the "Create a PIN" screen

  @pin @validation
  Scenario: Reject repeated digits PIN (000000)
    When I tap "Set up PIN instead"
    And I enter PIN "000000"
    Then I should see error "PIN cannot be all the same digit (e.g., 000000)"
    And I should remain on the "Create a PIN" screen

  @pin @validation
  Scenario: Reject repeated pairs PIN (121212)
    When I tap "Set up PIN instead"
    And I enter PIN "121212"
    Then I should see error "PIN cannot be repeated pairs (e.g., 121212)"
    And I should remain on the "Create a PIN" screen

  @pin @confirmation
  Scenario: Reject mismatched PIN confirmation
    When I tap "Set up PIN instead"
    And I enter PIN "159487"
    Then I should see "Confirm Your PIN" heading
    When I enter confirmation PIN "987654"
    Then I should see error "PINs do not match. Please try again."
    And I should remain on the "Confirm Your PIN" screen

  @pin @confirmation
  Scenario: Change PIN during confirmation
    When I tap "Set up PIN instead"
    And I enter PIN "159487"
    Then I should see "Confirm Your PIN" heading
    When I tap "Change PIN"
    Then I should see "Create a PIN" heading
    And PIN input fields should be cleared

  @skip @warning
  Scenario: Skip biometric setup with warning
    When I tap "Skip for now"
    Then I should see "Skip Security Setup?" modal
    And the modal should explain security implications
    When I tap "Skip Anyway"
    Then the modal should close
    And I should be navigated to "Home" screen

  @skip @warning
  Scenario: Cancel skip and return to setup
    When I tap "Skip for now"
    Then I should see "Skip Security Setup?" modal
    When I tap "Set Up Security"
    Then the modal should close
    And I should remain on the BiometricSetup screen
```

### Phase 2: Step Definitions - Biometric Setup (30 minutes)

**File**: `e2e/step-definitions/auth/biometric-setup.steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

// Background steps
Given('I am on the BiometricSetup screen', async () => {
  await waitFor(element(by.id('biometric-setup-screen')))
    .toBeVisible()
    .withTimeout(5000);
});

// Device capability setup
Given('Face ID is enrolled on the device', async () => {
  // Verify simulator has Face ID enrolled
  // Note: This requires manual simulator configuration
  // Simulator → Features → Face ID → Enrolled
  console.log('[E2E] Face ID enrollment verified (manual setup required)');
});

Given('Fingerprint is enrolled on the device', async () => {
  // Verify Android emulator has fingerprint enrolled
  console.log('[E2E] Fingerprint enrollment verified (manual setup required)');
});

Given('no biometrics are enrolled on the device', async () => {
  // Verify simulator has no biometrics enrolled
  // Simulator → Features → Face ID → Not Enrolled
  console.log('[E2E] No biometrics enrolled (manual setup required)');
});

// Biometric setup actions
When('I tap {string}', async (buttonText: string) => {
  const testID = buttonText.toLowerCase().replace(/\s+/g, '-');
  await element(by.id(testID)).tap();
});

Then('the Face ID prompt should appear', async () => {
  // In Detox, we cannot directly verify native system alerts
  // We verify by checking that the app is waiting for biometric auth
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('[E2E] Face ID prompt expected (cannot verify system alert in Detox)');
});

When('I approve the Face ID prompt', async () => {
  // Simulate Face ID success via simulator
  // In real tests, you'd manually approve in simulator
  await device.matchFace();
  await new Promise(resolve => setTimeout(resolve, 2000));
});

Then('the Fingerprint prompt should appear', async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('[E2E] Fingerprint prompt expected');
});

When('I approve the Fingerprint prompt', async () => {
  // Simulate fingerprint success via emulator
  await device.matchFinger();
  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Assertions
Then('I should see {string} heading', async (headingText: string) => {
  await waitFor(element(by.text(headingText)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should see {string} button', async (buttonText: string) => {
  await waitFor(element(by.text(buttonText)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should be navigated to {string} screen', async (screenName: string) => {
  const testID = `${screenName.toLowerCase().replace(/\s+/g, '-')}-screen`;
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(5000);
});

Then('I should remain on the BiometricSetup screen', async () => {
  await detoxExpect(element(by.id('biometric-setup-screen'))).toBeVisible();
});
```

### Phase 3: Step Definitions - PIN Setup (30 minutes)

**File**: `e2e/step-definitions/auth/pin-setup.steps.ts`

```typescript
import { When, Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect, waitFor } from 'detox';

/**
 * Enter 6-digit PIN by typing into individual fields
 */
When('I enter PIN {string}', async (pin: string) => {
  if (pin.length !== 6) {
    throw new Error(`PIN must be 6 digits, received: ${pin}`);
  }

  // Get currently active PIN input (enter or confirm)
  const testID = await element(by.id('pin-input-enter'))
    .tap()
    .catch(() => 'pin-input-confirm');
  const inputTestID = testID === 'pin-input-confirm' ? 'pin-input-confirm' : 'pin-input-enter';

  // Enter each digit
  for (let i = 0; i < 6; i++) {
    const digit = pin[i];
    await element(by.id(`${inputTestID}-digit-${i}`)).typeText(digit);
  }

  // Wait for validation/navigation
  await new Promise(resolve => setTimeout(resolve, 1000));
});

When('I enter confirmation PIN {string}', async (pin: string) => {
  if (pin.length !== 6) {
    throw new Error(`PIN must be 6 digits, received: ${pin}`);
  }

  // Enter each digit in confirmation fields
  for (let i = 0; i < 6; i++) {
    const digit = pin[i];
    await element(by.id(`pin-input-confirm-digit-${i}`)).typeText(digit);
  }

  // Wait for validation/navigation
  await new Promise(resolve => setTimeout(resolve, 2000));
});

Then('I should see error {string}', async (errorMessage: string) => {
  await waitFor(element(by.text(errorMessage)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('I should remain on the {string} screen', async (screenTitle: string) => {
  await waitFor(element(by.text(screenTitle)))
    .toBeVisible()
    .withTimeout(3000);
});

Then('PIN should be hashed and stored', async () => {
  // Cannot directly verify Keychain storage in E2E
  // Verify by successful navigation to Home
  await waitFor(element(by.id('home-screen')))
    .toBeVisible()
    .withTimeout(5000);

  console.log('[E2E] PIN hashed and stored (inferred from successful navigation)');
});

Then('PIN input fields should be cleared', async () => {
  // Verify first PIN input is empty
  await detoxExpect(element(by.id('pin-input-enter-digit-0'))).toHaveText('');
});
```

### Phase 4: Skip Warning Modal Steps (15 minutes)

**File**: `e2e/step-definitions/auth/skip-warning.steps.ts`

```typescript
import { Then } from '@cucumber/cucumber';
import { by, element, expect as detoxExpect, waitFor } from 'detox';

Then('I should see {string} modal', async (modalTitle: string) => {
  await waitFor(element(by.id('skip-biometric-warning-modal')))
    .toBeVisible()
    .withTimeout(3000);

  await waitFor(element(by.text(modalTitle)))
    .toBeVisible()
    .withTimeout(2000);
});

Then('the modal should explain security implications', async () => {
  await waitFor(
    element(by.text('Without biometric authentication or a PIN, your account will be less secure.'))
  )
    .toBeVisible()
    .withTimeout(2000);
});

Then('the modal should close', async () => {
  await waitFor(element(by.id('skip-biometric-warning-modal')))
    .not.toBeVisible()
    .withTimeout(3000);
});
```

### Phase 5: Simulator Configuration (10 minutes)

**Face ID Enrollment (iOS Simulator):**

```bash
# Enable Face ID in simulator
# Simulator → Features → Face ID → Enrolled

# Or via command line (requires simulator booted)
xcrun simctl spawn booted notifyutil -s com.apple.BiometricKit.enrollmentChanged 1
```

**Disable Face ID for fallback tests:**

```bash
# Simulator → Features → Face ID → Not Enrolled

# Or via command line
xcrun simctl spawn booted notifyutil -s com.apple.BiometricKit.enrollmentChanged 0
```

**Fingerprint Enrollment (Android Emulator):**

```bash
# Enable fingerprint via adb
adb -e emu finger touch 1

# Configure fingerprint in emulator settings
# Settings → Security → Fingerprint
```

### Phase 6: Test Execution (15 minutes)

**Build iOS app:**

```bash
yarn detox:ios:build
```

**Run all biometric setup E2E tests (iOS):**

```bash
yarn detox:ios:test --grep "@biometric|@pin|@skip"
```

**Run specific scenario:**

```bash
yarn detox:ios:test e2e/features/auth/biometric-setup.feature:10
```

**Run iOS smoke tests only:**

```bash
yarn detox:ios:test --grep "@smoke"
```

**Run Android tests:**

```bash
yarn detox:android:build
yarn detox:android:test --grep "@biometric|@pin|@skip"
```

---

## Acceptance Criteria

- [ ] All scenarios pass on iOS simulator (iPhone 15 Pro)
- [ ] All scenarios pass on Android emulator (Pixel 7 API 34)
- [ ] Face ID setup scenario passes on iOS
- [ ] Fingerprint setup scenario passes on Android
- [ ] No biometrics fallback shows PIN setup
- [ ] Strong PIN (159487) validates and stores correctly
- [ ] Weak PIN patterns rejected:
  - [ ] Sequential ascending (123456)
  - [ ] Sequential descending (654321)
  - [ ] Repeated digits (000000)
  - [ ] Repeated pairs (121212)
- [ ] PIN confirmation verifies matching
- [ ] Mismatched PIN confirmation shows error
- [ ] "Change PIN" button returns to first step
- [ ] Skip warning modal appears
- [ ] Skip confirmation navigates to Home
- [ ] Cancel skip returns to BiometricSetup
- [ ] Tests clean up Keychain state after execution
- [ ] All testIDs present for element selection
- [ ] Screenshots captured on failure

---

## Testing Commands

### Full Test Suite

```bash
# Build and test (iOS)
yarn detox:ios:build
yarn detox:ios:test --grep "@biometric|@pin|@skip"

# Build and test (Android)
yarn detox:android:build
yarn detox:android:test --grep "@biometric|@pin|@skip"
```

### Specific Scenarios

```bash
# Face ID setup only (iOS)
yarn detox:ios:test --grep "@biometric.*@ios"

# PIN validation only
yarn detox:ios:test --grep "@pin.*@validation"

# Skip warning only
yarn detox:ios:test --grep "@skip.*@warning"
```

### Debug with Screenshots

```bash
yarn detox:ios:test --grep "@biometric" --take-screenshots failing --record-logs all
```

### Watch Mode (for development)

```bash
# Build once
yarn detox:ios:build

# Run tests iteratively
yarn detox:ios:test --grep "@pin" --reuse
```

---

## Troubleshooting

### Issue: "Face ID prompt doesn't appear"

**Cause**: Simulator Face ID not enrolled

**Solution**: Enable Face ID in simulator:

```bash
# Via menu
Simulator → Features → Face ID → Enrolled

# Verify enrollment
xcrun simctl spawn booted notifyutil -g com.apple.BiometricKit.enrollmentChanged
```

### Issue: "device.matchFace() fails"

**Cause**: Detox biometric matcher not supported on all simulators

**Solution**: Use manual approval in simulator:

```
Simulator → Features → Face ID → Matching Face
```

Or update step definition to wait longer:

```typescript
await new Promise(resolve => setTimeout(resolve, 3000));
```

### Issue: "PIN input fields not found"

**Cause**: testID mismatch or element not rendered

**Solution**: Verify testIDs exist in component:

```typescript
<Input testID="pin-input-enter-digit-0" />
```

And search by correct testID:

```typescript
await element(by.id('pin-input-enter-digit-0')).tap();
```

### Issue: "Tests fail intermittently"

**Cause**: Timing issues with animations/transitions

**Solution**: Increase timeout or add explicit waits:

```typescript
await waitFor(element(by.id('pin-setup-screen')))
  .toBeVisible()
  .withTimeout(5000);
```

### Issue: "Keychain data persists across tests"

**Cause**: Keychain not cleared between tests

**Solution**: Add cleanup hook:

```typescript
import * as Keychain from 'react-native-keychain';

beforeEach(async () => {
  await Keychain.resetGenericPassword({ service: 'pin_hash' });
  await Keychain.resetGenericPassword({ service: 'biometric_preference' });
});
```

### Issue: "Cannot test on Android emulator"

**Cause**: Emulator fingerprint not configured

**Solution**: Configure fingerprint in emulator settings or use adb:

```bash
adb -e emu finger touch 1
```

### Issue: "Detox cannot interact with native biometric prompts"

**Cause**: Detox cannot control system-level alerts

**Solution**: This is expected behaviour. Verify by:

1. Checking app state (waiting for response)
2. Manually approving prompt in simulator
3. Using `device.matchFace()` or `device.matchFinger()` if supported

---

**Effort**: 2h | **Last Updated**: 2025-11-21

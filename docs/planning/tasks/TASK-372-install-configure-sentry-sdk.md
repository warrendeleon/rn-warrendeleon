# TASK-372: Install & Configure Sentry SDK

**Task ID**: TASK-372
**Title**: Install & Configure Sentry SDK
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-068: Production Crash & Error Tracking](../stories/US-068-production-crash-error-tracking.md)
**Status**: 📋 To Do
**Priority**: Critical
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Infrastructure

---

## Overview

Install the Sentry React Native SDK and run the wizard to configure native crash handling for both iOS and Android. This is the foundational task that enables all subsequent logging features.

---

## Technical Details

### Dependencies to Install

```bash
yarn add @sentry/react-native
npx @sentry/wizard@latest -i reactNative
```

### Files Modified by Wizard

The Sentry wizard automatically modifies:

1. **iOS**:
   - `ios/warrendeleon/AppDelegate.mm` - Native crash handling
   - `ios/Podfile` - Sentry pod dependency
   - Xcode build phase for source map upload

2. **Android**:
   - `android/app/src/main/java/.../MainApplication.kt` - Native crash handling
   - `android/app/build.gradle` - Sentry Gradle plugin
   - `android/sentry.properties` - Auth token for source maps

3. **Root**:
   - `package.json` - @sentry/react-native dependency
   - `sentry.properties` - Project configuration

### Manual Steps Required

1. Create Sentry project with EU data residency
2. Get DSN from Sentry project settings
3. Generate auth token for source map uploads
4. Run pod install after wizard

---

## Files to Create

None (wizard handles setup)

## Files to Modify

| File                                               | Changes                               |
| -------------------------------------------------- | ------------------------------------- |
| `ios/warrendeleon/AppDelegate.mm`                  | Sentry native initialisation (wizard) |
| `ios/Podfile`                                      | Sentry pod (wizard)                   |
| `android/app/build.gradle`                         | Sentry plugin (wizard)                |
| `android/app/src/main/java/.../MainApplication.kt` | Sentry initialisation (wizard)        |
| `package.json`                                     | @sentry/react-native dependency       |

---

## Acceptance Criteria

- [ ] `@sentry/react-native` installed via yarn
- [ ] Sentry wizard completed successfully
- [ ] iOS native crash handling configured
- [ ] Android native crash handling configured
- [ ] Sentry project created with EU data residency
- [ ] DSN obtained and stored securely
- [ ] Auth token generated for source map uploads
- [ ] `yarn ios:pods` runs without errors
- [ ] App builds successfully on iOS
- [ ] App builds successfully on Android
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: SDK Installation**

```gherkin
Given the app does not have Sentry installed
When I run yarn add @sentry/react-native
And I run npx @sentry/wizard@latest -i reactNative
Then the wizard should complete without errors
And package.json should include @sentry/react-native
```

**Scenario 2: iOS Build**

```gherkin
Given Sentry SDK is installed
When I run yarn ios:pods
And I run yarn ios
Then the iOS app should build successfully
And no native crash handling errors should appear
```

**Scenario 3: Android Build**

```gherkin
Given Sentry SDK is installed
When I run yarn android
Then the Android app should build successfully
And no native crash handling errors should appear
```

---

## Dependencies

**Blocked By**: None

**Blocks**: TASK-373, TASK-374, TASK-375, TASK-376, TASK-377, TASK-378, TASK-379

---

## Notes

**Sentry Project Setup**:

1. Go to sentry.io and create a new project
2. Select "React Native" as platform
3. Choose EU region for data residency (GDPR compliance)
4. Copy DSN for use in TASK-373

**Source Map Upload**:
The wizard adds a build phase to upload source maps automatically during release builds. This enables readable stack traces for JS errors.

---

**Last Updated**: 2025-12-08

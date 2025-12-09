# TASK-383: Install PostHog SDK

**Task ID**: TASK-383
**Title**: Install PostHog SDK
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-071: PostHog Analytics Integration](../stories/US-071-posthog-analytics-integration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Infrastructure

---

## Overview

Install the PostHog React Native SDK. PostHog provides product analytics with EU data residency on the free tier, making it GDPR compliant.

---

## Technical Details

### Dependencies to Install

```bash
yarn add posthog-react-native
```

### Package Information

- **Package**: `posthog-react-native`
- **Documentation**: https://posthog.com/docs/libraries/react-native
- **EU Hosting**: `https://eu.posthog.com`
- **Free Tier**: 1M events/month

---

## Files to Modify

| File           | Changes                             |
| -------------- | ----------------------------------- |
| `package.json` | Add posthog-react-native dependency |

---

## Acceptance Criteria

- [ ] `posthog-react-native` installed via yarn
- [ ] Package appears in `package.json` dependencies
- [ ] `yarn install` completes without errors
- [ ] No peer dependency warnings related to PostHog
- [ ] iOS pod install succeeds (`yarn ios:pods`)
- [ ] Android build succeeds (`yarn android`)
- [ ] `yarn typecheck` passes with 0 errors

---

## Test Scenarios

**Scenario 1: SDK Installation**

```gherkin
Given the app does not have PostHog installed
When I run yarn add posthog-react-native
Then package.json should include posthog-react-native
And yarn install should complete without errors
```

**Scenario 2: iOS Compatibility**

```gherkin
Given PostHog SDK is installed
When I run yarn ios:pods
Then pod install should complete without errors
```

**Scenario 3: Android Compatibility**

```gherkin
Given PostHog SDK is installed
When I run yarn android
Then the Android app should build successfully
```

---

## Dependencies

**Blocked By**: None

**Blocks**: TASK-384, TASK-385, TASK-386, TASK-387

---

## Notes

**PostHog Account Setup**:

1. Create account at posthog.com
2. Select EU region for data hosting (GDPR compliance)
3. Create a project and get API key
4. API key will be used in TASK-386 (Environment Configuration)

---

**Last Updated**: 2025-12-09

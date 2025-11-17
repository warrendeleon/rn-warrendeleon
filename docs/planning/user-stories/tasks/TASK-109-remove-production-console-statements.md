# TASK-109: Remove Production Console Statements

**Task ID**: TASK-109
**Title**: Remove Production Console Statements
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-022: Security Hardening](../stories/US-022-security-hardening.md)
**Status**: 📋 Not Started
**Priority**: 🔴 Critical
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Reviewer**: _Not assigned_
**Category**: Security

---

## Context

Production code contains `console.log`, `console.error`, and `console.warn` statements that leak sensitive error information, stack traces, and implementation details to potential attackers. These must be removed before production deployment.

**Security risk**: Console statements in production can expose:

- API endpoints and request/response structure
- Error messages with sensitive details
- Stack traces revealing code structure
- Debug information useful for crafting attacks

**Pattern**: Replace console statements with proper error tracking service (Sentry or Firebase Crashlytics) for production error monitoring.

---

## Technical Details

### Files to Modify

Based on codebase grep, console statements found in:

- `src/features/Profile/ProfileScreen.tsx` (lines 174, 181, 187)
- `src/features/ErrorBoundary/ErrorBoundary.tsx` (multiple console.error)
- Other files TBD (comprehensive grep needed)

### Implementation

**Step 1: Install Error Tracking Service**

Choose one:

- **Sentry** (recommended): `yarn add @sentry/react-native`
- **Firebase Crashlytics**: Already have Firebase? Use Crashlytics

**Step 2: Configure Error Tracking**

```typescript
// src/services/errorTracking.ts
import * as Sentry from '@sentry/react-native';

if (!__DEV__) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENVIRONMENT || 'production',
  });
}

export const logError = (error: Error, context?: Record<string, any>) => {
  if (__DEV__) {
    console.error('[DEV]', error, context);
  } else {
    Sentry.captureException(error, { extra: context });
  }
};
```

**Step 3: Replace Console Statements**

**Before**:

```typescript
Linking.openURL(telUrl).catch(err => console.error('Failed to open phone dialer:', err));
```

**After**:

```typescript
import { logError } from '@app/services/errorTracking';

Linking.openURL(telUrl).catch(err => logError(err, { context: 'phone_dialer', url: telUrl }));
```

**Step 4: Grep for All Console Statements**

```bash
# Find all console.* statements
grep -r "console\." src/ --exclude-dir=node_modules

# Verify only __DEV__ conditionals remain
grep -r "console\." src/ | grep -v "__DEV__"
```

---

## Acceptance Criteria

- [ ] Sentry or Firebase Crashlytics installed and configured
- [ ] Error tracking service tested in development
- [ ] All `console.log` statements removed from production code
- [ ] All `console.error` statements replaced with `logError`
- [ ] All `console.warn` statements replaced or removed
- [ ] `__DEV__` conditional console statements allowed (development only)
- [ ] Grep verification: zero production console statements
- [ ] All tests pass (100% coverage maintained)

---

## Test Scenarios

**Scenario 1: Development Console Statements**

```gherkin
Given the app is running in __DEV__ mode
When an error occurs
Then console.error should log to developer console
And error should NOT be sent to Sentry
```

**Scenario 2: Production Error Tracking**

```gherkin
Given the app is running in production (not __DEV__)
When an error occurs
Then error should be sent to Sentry
And error should NOT appear in console
And Sentry dashboard should show the error with context
```

**Scenario 3: No Production Console Statements**

```gherkin
Given I search codebase for console statements
When excluding __DEV__ conditionals
Then zero console.log/error/warn should exist in src/
```

---

## Definition of Ready

- [x] Task description clear and complete
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Technical approach identified
- [x] Dependencies identified
- [x] Epic and User Story linked

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Sentry/Crashlytics configured and tested
- [ ] No production console statements
- [ ] PR merged to main

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 3 hours
**Actual Effort**: _To be tracked_

**Breakdown**:

- Sentry setup: 1h
- Replace console statements: 1.5h
- Testing and verification: 0.5h

---

## Dependencies

**Blockers**: None

**Blocks**: [TASK-108](./TASK-108-add-webview-url-validation.md), [TASK-109](./TASK-109-add-pdf-url-validation.md)

**Enables**: All other security tasks

---

## Git & PR Information

**Branch Name**: `security/remove-console-statements`

**PR Link**: _Not created yet_

**PR Status**: Not started

**Commit Hash**: _Not committed yet_

---

## Code Quality Metrics

**Code Coverage**: 100% (maintain existing coverage)

**Files Modified**: ~5-10 files (TBD after grep)

**Files Created**: 1 (`src/services/errorTracking.ts`)

**Review Time**: _Not tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Install Sentry React Native SDK
- Create centralized error tracking service
- Replace all console.error with logError service
- Remove all console.log/warn from production code
- Keep **DEV** conditionals for development logging

**Validation Results**: _To be filled in during implementation_

**Impact**: Critical security improvement - eliminates information leakage

---

## Blocked Information

**Blocked**: No

**Blocked Since**: _N/A_

**Blocked Reason**: _N/A_

---

## Timeline & Dates

**Start Date**: _Not yet started_

**Completed Date**: _Not yet completed_

**Archive Date**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-17 | Not Started | Task created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Introduces Technical Debt**: No

**Pays Down Technical Debt**: Yes - eliminates security vulnerability

**Technical Debt Score**: -3 (significantly pays down security debt)

---

## Success Criteria

✅ Sentry/Crashlytics configured
✅ All production console statements removed
✅ Development console statements preserved with **DEV**
✅ Error tracking tested and working
✅ Zero console statements in grep (excluding **DEV**)

---

## Verification

**Verified**: Not yet

**Verification Steps**:

1. Grep for console.\* statements (excluding **DEV**)
2. Build production app, verify no console output
3. Test error tracking in development
4. Test error tracking in production build
5. Verify Sentry dashboard receives errors
6. Run full test suite - all tests passing

---

## Related Tasks

- [TASK-108](./TASK-108-add-webview-url-validation.md) - WebView URL validation
- [TASK-109](./TASK-109-add-pdf-url-validation.md) - PDF URL validation
- All security hardening tasks

---

## References

- [User Story US-022](../stories/US-022-security-hardening.md)
- [Epic EPIC-013](../epics/EPIC-013-production-readiness.md)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Firebase Crashlytics](https://rnfirebase.io/crashlytics/usage)
- [OWASP Information Leakage](https://owasp.org/www-community/vulnerabilities/Information_exposure_through_query_strings_in_url)

---

**Last Updated**: 2025-01-17

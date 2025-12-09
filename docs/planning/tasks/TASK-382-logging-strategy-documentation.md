# TASK-382: Documentation for Logging Strategy

**Task ID**: TASK-382
**Title**: Documentation for Logging Strategy
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-070: Observability & Debugging Infrastructure](../stories/US-070-observability-debugging-infrastructure.md)
**Status**: 📋 To Do
**Priority**: Medium
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Documentation

---

## Overview

Document the logging strategy, including usage guidelines, Sentry dashboard access, and best practices. This keeps logging consistent across the codebase and helps new developers understand the observability infrastructure.

---

## Technical Details

### Documentation File

**`.claude/docs/logging-guide.md`**:

````markdown
# Logging Strategy Guide

## Overview

This project uses a two-tier logging strategy:

- **Development**: Console logging with sensitive data masking
- **Production**: Sentry error tracking with GDPR-compliant data scrubbing

## Quick Reference

| Function          | Development   | Production                      |
| ----------------- | ------------- | ------------------------------- |
| `logError()`      | console.error | Sentry.captureException         |
| `logWarning()`    | console.warn  | Sentry.captureMessage (warning) |
| `logDebug()`      | console.log   | Silent (never sent to Sentry)   |
| `logInfo()`       | console.info  | Sentry breadcrumb               |
| `logBreadcrumb()` | console.log   | Sentry breadcrumb               |

## Usage

### Error Logging

```typescript
import { logError } from '@app/utils/logger';

try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error, {
    operationId: '123',
    userId: user.id,
  });
}
```
````

### Warning Logging

```typescript
import { logWarning } from '@app/utils/logger';

if (retryCount > 3) {
  logWarning('High retry count detected', {
    retryCount,
    endpoint: '/api/data',
  });
}
```

### Debug Logging (Development Only)

```typescript
import { logDebug } from '@app/utils/logger';

// Only appears in development console
logDebug('API response received', response.data);
```

### Breadcrumbs

```typescript
import { logInfo, logBreadcrumb } from '@app/utils/logger';

// General info breadcrumb
logInfo('User completed onboarding', { step: 'final' });

// Custom category breadcrumb
logBreadcrumb('user-action', 'Tapped submit button', {
  screen: 'CheckoutScreen',
});
```

## Sensitive Data Masking

All logged data automatically passes through `maskSensitiveData()`.

### Automatically Masked

- JWT tokens (Bearer tokens, access/refresh tokens)
- Email addresses
- Passwords and secrets
- Phone numbers (UK, US, international)
- Credit card numbers
- SSN / NI numbers
- Address fields

### Example

```typescript
// Input
logError('Auth failed', error, {
  email: 'user@example.com',
  password: 'secret123',
});

// Output to Sentry
{
  email: '[MASKED_EMAIL]',
  password: '[MASKED]',
}
```

## Sentry Dashboard

### Access

1. Go to sentry.io
2. Select project: [PROJECT_NAME]
3. Available views:
   - **Issues**: All errors and warnings
   - **Performance**: App start times, screen loads, API calls
   - **Releases**: Errors by app version

### Filtering

- Filter by environment: `environment:production`
- Filter by tag: `errorBoundary:true`
- Filter by Redux thunk: `reduxThunk:rejected`

### Alerts

Configure alerts in Sentry Settings → Alerts:

- New issue detected
- Issue regression
- Error rate threshold exceeded

## Best Practices

### DO

- Use `logError()` for actual errors that need investigation
- Use `logWarning()` for unexpected but recoverable situations
- Use `logDebug()` for development debugging (never in prod)
- Use `logInfo()` and `logBreadcrumb()` for user journey context
- Include relevant context (IDs, screen names, operation types)

### DON'T

- Don't log sensitive user data (the masking catches common patterns, but be careful)
- Don't use console.log/error/warn directly (use the logger utilities)
- Don't log in hot paths (performance impact)
- Don't log excessively (breadcrumb limit is 100)

## Redux Action Breadcrumbs

Redux actions are automatically logged as breadcrumbs via middleware.

### Filtered Actions

These actions are NOT logged (too noisy):

- `persist/*`
- `PERSIST`
- `REHYDRATE`
- `@@redux/*`

### Sensitive Actions

These actions have payloads masked entirely:

- `auth/*`
- `profile/*`
- `user/*`

## API Request Breadcrumbs

API calls are automatically logged via Axios interceptor.

### Logged Data

- HTTP method and URL
- Response status code
- Request duration
- Masked headers (Authorization removed)

### NOT Logged

- Request body (privacy)
- Response body (privacy)

## Performance Monitoring

### Automatic Tracking

- App start time (cold/warm)
- Screen load duration
- Native frame rate (iOS)
- Main thread stalls

### Custom Spans

```typescript
import { measureAsync } from '@app/utils/logging/performanceTracing';

const data = await measureAsync('fetchUserData', async () => {
  return await api.getUser(userId);
});
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check `SENTRY_DSN` is set in `.env.production`
2. Verify app is NOT in `__DEV__` mode
3. Check Sentry project is not paused
4. Verify network connectivity

### Missing Source Maps

1. Ensure Sentry build phase runs during release build
2. Check `sentry.properties` has valid auth token
3. Verify source map upload succeeded in build logs

### Too Many Breadcrumbs

1. Review filtered action list in Redux middleware
2. Consider filtering more API endpoints
3. Adjust logging verbosity in specific features

````

---

## Files to Create

| File | Purpose |
| ---- | ------- |
| `.claude/docs/logging-guide.md` | Full logging documentation |

---

## Acceptance Criteria

- [ ] Documentation created at `.claude/docs/logging-guide.md`
- [ ] Quick reference table for all logging functions
- [ ] Usage examples for all logging functions
- [ ] Sensitive data masking explained with examples
- [ ] Sentry dashboard access documented
- [ ] Best practices (DO/DON'T) included
- [ ] Redux breadcrumb filtering explained
- [ ] API breadcrumb logging explained
- [ ] Performance monitoring usage documented
- [ ] Troubleshooting section included
- [ ] UK English used throughout
- [ ] No AI patterns in writing (check against blacklist)
- [ ] Documentation reviewed for accuracy

---

## Test Scenarios

**Scenario 1: Documentation Accuracy**
```gherkin
Given the logging guide is complete
When a developer follows the usage examples
Then the code should work as documented
And the logs should appear in the expected location
````

**Scenario 2: Completeness Check**

```gherkin
Given the logging guide is complete
When reviewed against the implementation
Then all logging functions should be documented
And all configuration options should be explained
```

---

## Dependencies

**Blocked By**: TASK-372 through TASK-381 (All implementation tasks)

**Blocks**: None

---

## Notes

**Target Audience**:

- New developers joining the project
- Current developers needing reference
- Code reviewers checking logging practices

**Maintenance**:
This documentation should be updated whenever logging functionality changes.

---

**Last Updated**: 2025-12-08

# TASK-377: Create Axios Interceptor for API Logging

**Task ID**: TASK-377
**Title**: Create Axios Interceptor for API Logging
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-069: Application Performance Monitoring](../stories/US-069-application-performance-monitoring.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## Overview

Create an Axios interceptor that logs API requests and responses as Sentry breadcrumbs. This provides context for debugging by showing what API calls were made before an error occurred. All logged data is masked using the existing `maskSensitiveData` utility for GDPR compliance.

---

## Technical Details

### Implementation

**`src/api/sentryAxiosInterceptor.ts`**:

```typescript
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/react-native';

import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

/**
 * Add Sentry breadcrumb logging to an Axios instance
 * Logs requests and responses with masked sensitive data
 */
export const addSentryInterceptor = (axiosInstance: AxiosInstance): void => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!__DEV__) {
        // Store request start time for duration calculation
        (config as unknown as { _sentryStartTime: number })._sentryStartTime = Date.now();

        Sentry.addBreadcrumb({
          category: 'http',
          message: `${config.method?.toUpperCase()} ${config.url}`,
          level: 'info',
          data: {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: maskSensitiveData(config.headers) as Record<string, unknown>,
          },
        });
      }
      return config;
    },
    error => {
      if (!__DEV__) {
        Sentry.addBreadcrumb({
          category: 'http',
          message: 'Request failed to send',
          level: 'error',
          data: {
            error: maskSensitiveData(error.message),
          },
        });
      }
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (!__DEV__) {
        const startTime = (response.config as unknown as { _sentryStartTime: number })
          ._sentryStartTime;
        const duration = startTime ? Date.now() - startTime : undefined;

        Sentry.addBreadcrumb({
          category: 'http',
          message: `${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
          level: 'info',
          data: {
            status: response.status,
            duration: duration ? `${duration}ms` : undefined,
            url: response.config.url,
          },
        });
      }
      return response;
    },
    error => {
      if (!__DEV__) {
        const config = error.config;
        const startTime = config
          ? (config as unknown as { _sentryStartTime: number })._sentryStartTime
          : undefined;
        const duration = startTime ? Date.now() - startTime : undefined;

        Sentry.addBreadcrumb({
          category: 'http',
          message: `${config?.method?.toUpperCase()} ${config?.url} - FAILED`,
          level: 'error',
          data: {
            status: error.response?.status,
            duration: duration ? `${duration}ms` : undefined,
            url: config?.url,
            error: maskSensitiveData(error.message),
          },
        });
      }
      return Promise.reject(error);
    }
  );
};
```

### Integration with Existing API Clients

**`src/features/Profile/api/api.ts`** (and similar):

```typescript
import axios from 'axios';
import { addSentryInterceptor } from '@app/api/sentryAxiosInterceptor';

const axiosInstance = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
});

// Add Sentry logging
addSentryInterceptor(axiosInstance);

export const profileApi = {
  // ... existing methods
};
```

---

## Files to Create

| File                                | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `src/api/sentryAxiosInterceptor.ts` | Axios interceptor for Sentry breadcrumbs |

## Files to Modify

| File                                     | Changes                              |
| ---------------------------------------- | ------------------------------------ |
| `src/features/Profile/api/api.ts`        | Add Sentry interceptor               |
| `src/features/Education/api/api.ts`      | Add Sentry interceptor (if separate) |
| `src/features/WorkExperience/api/api.ts` | Add Sentry interceptor (if separate) |

---

## Acceptance Criteria

- [ ] Request interceptor logs method, URL, and masked headers
- [ ] Response interceptor logs status and duration
- [ ] Error interceptor logs failed requests with error details
- [ ] All logged data passes through `maskSensitiveData()`
- [ ] Authorization headers are masked (Bearer tokens)
- [ ] Request duration calculated and included
- [ ] No interceptors added in development mode
- [ ] Interceptor added to all API clients
- [ ] TypeScript strict mode compliance
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Successful Request Breadcrumb**

```gherkin
Given the app is running in production mode
When a GET request to /api/profile succeeds with status 200
Then two breadcrumbs should be added (request + response)
And the response breadcrumb should include status 200
And the duration should be calculated
```

**Scenario 2: Failed Request Breadcrumb**

```gherkin
Given the app is running in production mode
When a POST request to /api/auth fails with status 401
Then a breadcrumb should be added with level 'error'
And the breadcrumb should include the error message
```

**Scenario 3: Sensitive Data Masking**

```gherkin
Given a request includes an Authorization header with a Bearer token
When the request breadcrumb is logged
Then the Authorization header should be masked as '[MASKED_TOKEN]'
```

**Scenario 4: Error Context**

```gherkin
Given the user makes 3 API calls (success, success, fail)
When an error is captured to Sentry
Then the error should include all 3 API calls as breadcrumbs
And the breadcrumbs should show the chronological order
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373 (Sentry SDK and configuration)

**Blocks**: None

---

## Notes

**Request Duration**:
The interceptor attaches a start time to each request config and calculates the duration on response. This provides valuable performance data.

**Breadcrumb Limit**:
HTTP breadcrumbs count towards the 100 breadcrumb limit. High-traffic apps may need to filter non-essential requests.

**Data Privacy**:
Response bodies are NOT logged to avoid capturing user data. Only status codes and URLs are logged.

---

**Last Updated**: 2025-12-08

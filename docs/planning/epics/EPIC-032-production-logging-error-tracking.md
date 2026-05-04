# EPIC-032: Production Logging & Error Tracking

**Epic ID**: EPIC-032
**Title**: Production Logging & Error Tracking (Sentry Integration)
**Status**: 📋 To Do
**Priority**: High
**Owner**: Warren de Leon
**Created**: 2025-12-08
**Target Release**: Q1 2026

---

## Overview

Implement production-grade logging and error tracking using Sentry. The app currently has solid development-only logging with sensitive data masking, but zero visibility into production crashes and errors. This epic adds full observability: crash reporting, performance monitoring, navigation/API breadcrumbs, and Redux action tracking.

**Key Architecture Decision**: Leverage existing `maskSensitiveData` utility for GDPR-compliant data scrubbing before sending to Sentry.

---

## Business Value

- **Production Visibility**: Know when and why the app crashes for real users
- **Faster Debugging**: Stack traces with source maps, breadcrumbs showing user journey
- **Performance Insights**: Identify slow screens, API calls, and app start times
- **User Trust**: Fix issues before users report them
- **Compliance**: GDPR-compliant with EU data residency option

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native App                           │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Error Sources                             ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ ││
│  │  │ JS Errors│  │ Native   │  │ Redux    │  │ API Errors   │ ││
│  │  │ (thrown) │  │ Crashes  │  │ Thunks   │  │ (Axios)      │ ││
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ ││
│  └───────┼─────────────┼─────────────┼───────────────┼─────────┘│
│          │             │             │               │          │
│          ▼             ▼             ▼               ▼          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  Enhanced Logger                             ││
│  │  ┌──────────────────────────────────────────────────────┐   ││
│  │  │ logError() / logWarning() / logBreadcrumb()          │   ││
│  │  │           ↓                                           │   ││
│  │  │ maskSensitiveData() ─── GDPR Compliance               │   ││
│  │  │           ↓                                           │   ││
│  │  │ __DEV__ ? console : Sentry.capture*()                 │   ││
│  │  └──────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  Sentry SDK                                  ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ ││
│  │  │ Errors   │  │ Perf     │  │ Breadcrumbs │ │ Session    │ ││
│  │  │ & Crashes│  │ Tracing  │  │ (nav/api) │  │ Replay     │ ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
               ┌────────────────────┐
               │ Sentry Cloud (EU)  │
               │  - Error Dashboard │
               │  - Performance     │
               │  - Session Replay  │
               │  - Alerts          │
               └────────────────────┘
```

---

## Compliance & Data Privacy

**Sentry is fully compliant** with US, UK, and EU data protection regulations:

| Requirement                  | Status                         |
| ---------------------------- | ------------------------------ |
| GDPR                         | ✅ Compliant                   |
| EU-US Data Privacy Framework | ✅ Self-certified              |
| UK Extension                 | ✅ Certified                   |
| SOC 2 Type 2                 | ✅ Certified                   |
| ISO 27001                    | ✅ Certified                   |
| EU Data Residency            | ✅ Available (configurable)    |
| Data Encryption              | ✅ AES-256bit (transit + rest) |

**App-Level Compliance**:

- All data scrubbed via `maskSensitiveData()` before sending
- JWT tokens, emails, passwords, PII automatically masked
- EU data residency configured in Sentry project

---

## User Stories

| ID                                                                    | Title                                    | Priority | Effort | Status   |
| --------------------------------------------------------------------- | ---------------------------------------- | -------- | ------ | -------- |
| [US-068](../stories/US-068-production-crash-error-tracking.md)        | Production Crash & Error Tracking        | Critical | 6h     | 📋 To Do |
| [US-069](../stories/US-069-application-performance-monitoring.md)     | Application Performance Monitoring       | High     | 4h     | 📋 To Do |
| [US-070](../stories/US-070-observability-debugging-infrastructure.md) | Observability & Debugging Infrastructure | High     | 6h     | 📋 To Do |

---

## Tasks Summary

### US-068: Production Crash & Error Tracking (6h)

| Task ID                                                                       | Title                                            | Effort | Status   |
| ----------------------------------------------------------------------------- | ------------------------------------------------ | ------ | -------- |
| [TASK-372](../tasks/TASK-372-install-configure-sentry-sdk.md)                 | Install & Configure Sentry SDK                   | 2h     | 📋 To Do |
| [TASK-399](../tasks/TASK-399-sentry-mask-sensitive-data-wiring.md) ⚠️ Blocking | Wire maskSensitiveData into beforeSend / before​Breadcrumb (same PR as TASK-372) | 1h     | 📋 To Do |
| [TASK-373](../tasks/TASK-373-sentry-configuration-module.md)                  | Create Sentry Configuration Module               | 1.5h   | 📋 To Do |
| [TASK-374](../tasks/TASK-374-enhance-logger-production-forwarding.md)         | Enhance Logger for Production Error Forwarding   | 1.5h   | 📋 To Do |
| [TASK-375](../tasks/TASK-375-integrate-sentry-error-boundary.md)              | Integrate Sentry with ErrorBoundary              | 1h     | 📋 To Do |

### US-069: Application Performance Monitoring (4h)

| Task ID                                                        | Title                                    | Effort | Status   |
| -------------------------------------------------------------- | ---------------------------------------- | ------ | -------- |
| [TASK-376](../tasks/TASK-376-navigation-breadcrumbs.md)        | Add Navigation Breadcrumbs               | 1.5h   | 📋 To Do |
| [TASK-377](../tasks/TASK-377-axios-interceptor-api-logging.md) | Create Axios Interceptor for API Logging | 1.5h   | 📋 To Do |
| [TASK-378](../tasks/TASK-378-enable-performance-monitoring.md) | Enable Performance Monitoring            | 1h     | 📋 To Do |

### US-070: Observability & Debugging Infrastructure (6h)

| Task ID                                                           | Title                                | Effort | Status   |
| ----------------------------------------------------------------- | ------------------------------------ | ------ | -------- |
| [TASK-379](../tasks/TASK-379-redux-breadcrumb-middleware.md)      | Create Redux Breadcrumb Middleware   | 1.5h   | 📋 To Do |
| [TASK-380](../tasks/TASK-380-environment-configuration-sentry.md) | Environment Configuration for Sentry | 1h     | 📋 To Do |
| [TASK-381](../tasks/TASK-381-rntl-tests-enhanced-logger.md)       | RNTL Tests for Enhanced Logger       | 2h     | 📋 To Do |
| [TASK-382](../tasks/TASK-382-logging-strategy-documentation.md)   | Documentation for Logging Strategy   | 1.5h   | 📋 To Do |

---

## Dependencies

### Blocked By

| Dependency | Description           | Status   |
| ---------- | --------------------- | -------- |
| None       | Can start immediately | ✅ Ready |

### Blocks

| Epic/Feature | Description                   |
| ------------ | ----------------------------- |
| None         | Standalone observability epic |

### Integrates With

| Epic         | Description                                                         |
| ------------ | ------------------------------------------------------------------- |
| EPIC-002     | Enhances existing ErrorBoundary                                     |
| EPIC-005     | Adds API request logging to data layer                              |
| **EPIC-033** | **Consent Management - Sentry only initialised after user consent** |
| All Epics    | Provides production error visibility                                |

### Consent Integration (EPIC-033)

**Critical**: Sentry must only be initialised AFTER user consent is granted (GDPR/CCPA/UK GDPR compliance).

- `initSentry(consentGranted: boolean)` - Called from ConsentScreen (TASK-393) and Privacy Settings (TASK-395)
- `shutdownSentry()` - Called when user revokes consent in Settings
- Sentry is NOT initialised on app startup - waits for consent flow
- Both Sentry and PostHog share a single "Analytics & Diagnostics" toggle

---

## Out of Scope (Future Features)

| Feature                  | Priority | Notes                               |
| ------------------------ | -------- | ----------------------------------- |
| User feedback widget     | Medium   | Sentry Feedback SDK integration     |
| Release health tracking  | Low      | Crash-free session metrics          |
| Custom Sentry dashboards | Low      | Tailored views for specific metrics |
| Profiling                | Low      | Deep performance profiling          |
| Session replay video     | Medium   | Visual replay of user sessions      |

---

## Technical Specifications

### Sentry SDK Configuration

```typescript
// Production sampling rates
{
  tracesSampleRate: 0.2,        // 20% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs
}
```

### Data Scrubbing Strategy

Existing `maskSensitiveData()` handles:

- JWT tokens (Bearer, access, refresh)
- Email addresses
- Passwords and secrets
- Phone numbers (UK, US, international)
- Credit card numbers
- SSN / NI numbers
- Address fields

### Environment Configuration

| Environment | Sentry Enabled | Sample Rate | Performance |
| ----------- | -------------- | ----------- | ----------- |
| Development | ❌ Disabled    | N/A         | N/A         |
| Production  | ✅ Enabled     | 100% errors | 20% perf    |

---

## Acceptance Criteria

### Functional

- [ ] Production crashes are captured and visible in Sentry dashboard
- [ ] JS errors include source-mapped stack traces
- [ ] Native crashes (iOS/Android) are captured
- [ ] API errors are logged with masked request/response data
- [ ] Navigation breadcrumbs show user journey before crash
- [ ] Redux actions appear as breadcrumbs
- [ ] Performance metrics show app start time, screen load times

### Technical

- [ ] Sentry SDK installed and configured correctly
- [ ] EU data residency enabled in Sentry project settings
- [ ] `beforeSend` hook uses `maskSensitiveData()` for scrubbing
- [ ] Source maps uploaded during build
- [ ] Development mode disables Sentry completely
- [ ] 100% RNTL test coverage on enhanced logger
- [ ] TypeScript strict mode compliance
- [ ] `yarn validate` passes with 0 errors

### Documentation

- [ ] Logging strategy documented in `.claude/docs/`
- [ ] Sentry dashboard access documented
- [ ] Alert configuration documented

---

## Total Estimated Effort

| User Story                                       | Effort  |
| ------------------------------------------------ | ------- |
| US-068: Production Crash & Error Tracking        | 6h      |
| US-069: Application Performance Monitoring       | 4h      |
| US-070: Observability & Debugging Infrastructure | 6h      |
| **Total**                                        | **16h** |

---

## Implementation Order

1. **SDK Setup** (TASK-372, TASK-373, TASK-380)
2. **Logger Enhancement** (TASK-374, TASK-375)
3. **Breadcrumbs** (TASK-376, TASK-377, TASK-379)
4. **Performance** (TASK-378)
5. **Testing & Docs** (TASK-381, TASK-382)

---

**Last Updated**: 2025-12-09

# US-069: Application Performance Monitoring

**Story ID**: US-069
**Title**: Application Performance Monitoring
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Observability

---

## User Story

As a **developer**,
I want **automatic performance monitoring of app start times, screen loads, and API requests**,
So that **I can identify and fix performance bottlenecks affecting user experience**.

---

## Context & Rationale

### Problem Statement

There is no visibility into how the app performs in production. Slow screen loads, lengthy API calls, and sluggish app starts go unnoticed until users complain.

### Current State

- No performance monitoring
- No API request timing
- No screen load time tracking
- Reactotron only works in development

### Desired State

- App start time automatically tracked
- Screen navigation timing captured
- API request durations logged as breadcrumbs
- Slow transactions highlighted in Sentry Performance
- 20% sampling rate to balance insight with cost

### Why Now

- Performance issues are hard to reproduce locally
- Real-world device performance varies significantly
- Need baseline metrics before optimisation work

---

## Acceptance Criteria

- [ ] Performance monitoring enabled with 20% sample rate
- [ ] App start time (cold/warm) captured automatically
- [ ] Screen load times tracked via navigation instrumentation
- [ ] API requests logged as breadcrumbs with timing
- [ ] Axios interceptor masks sensitive headers/bodies
- [ ] Slow transactions (>3s) highlighted in dashboard
- [ ] Navigation breadcrumbs show user journey
- [ ] API errors include request/response context

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 4 hours
**Actual Effort**: TBD

---

## Tasks

| ID                                                             | Task                                     | Effort | Status   |
| -------------------------------------------------------------- | ---------------------------------------- | ------ | -------- |
| [TASK-376](../tasks/TASK-376-navigation-breadcrumbs.md)        | Add Navigation Breadcrumbs               | 1.5h   | 📋 To Do |
| [TASK-377](../tasks/TASK-377-axios-interceptor-api-logging.md) | Create Axios Interceptor for API Logging | 1.5h   | 📋 To Do |
| [TASK-378](../tasks/TASK-378-enable-performance-monitoring.md) | Enable Performance Monitoring            | 1h     | 📋 To Do |

---

## Technical Notes

### Navigation Instrumentation

```typescript
const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

// In NavigationContainer
<NavigationContainer
  ref={navigationRef}
  onReady={() => routingInstrumentation.registerNavigationContainer(navigationRef)}
>
```

### Axios Interceptor

```typescript
axiosInstance.interceptors.request.use(config => {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${config.method?.toUpperCase()} ${config.url}`,
    level: 'info',
    data: {
      headers: maskSensitiveData(config.headers),
    },
  });
  return config;
});
```

---

## Dependencies

**Blocked By**: TASK-372, TASK-373 (Sentry SDK must be installed first)

**Blocks**: None

---

**Last Updated**: 2025-12-08

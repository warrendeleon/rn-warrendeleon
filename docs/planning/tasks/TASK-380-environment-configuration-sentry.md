# TASK-380: Environment Configuration for Sentry

**Task ID**: TASK-380
**Title**: Environment Configuration for Sentry
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-070: Observability & Debugging Infrastructure](../stories/US-070-observability-debugging-infrastructure.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Configuration

---

## Overview

Configure environment variables for Sentry across development and production environments. Ensure Sentry is completely disabled in development mode and properly configured for production with EU data residency.

---

## Technical Details

### Environment Files

**`.env.development`** (add):

```bash
# Sentry - Disabled in development
SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0
```

**`.env.production`** (add):

```bash
# Sentry - Production configuration
# DSN from EU-hosted Sentry project for GDPR compliance
SENTRY_DSN=https://xxx@xxx.ingest.de.sentry.io/xxx
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.2
```

### TypeScript Types

**`src/types/env.d.ts`** (update):

```typescript
declare module 'react-native-config' {
  export interface NativeConfig {
    // Existing env vars...
    API_BASE_URL: string;

    // Sentry configuration
    SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    SENTRY_TRACES_SAMPLE_RATE?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
```

### Usage in Sentry Config

**`src/config/sentry.ts`**:

```typescript
import Config from 'react-native-config';

Sentry.init({
  dsn: Config.SENTRY_DSN,
  environment: Config.SENTRY_ENVIRONMENT || 'unknown',
  tracesSampleRate: parseFloat(Config.SENTRY_TRACES_SAMPLE_RATE || '0'),
  enabled: !__DEV__ && !!Config.SENTRY_DSN,
});
```

---

## Files to Modify

| File                 | Changes                                |
| -------------------- | -------------------------------------- |
| `.env.development`   | Add Sentry env vars (disabled)         |
| `.env.production`    | Add Sentry env vars (enabled with DSN) |
| `src/types/env.d.ts` | Add Sentry type declarations           |

---

## Acceptance Criteria

- [ ] `.env.development` has Sentry vars with empty DSN
- [ ] `.env.production` has Sentry vars with valid DSN
- [ ] DSN points to EU-hosted Sentry project
- [ ] `SENTRY_TRACES_SAMPLE_RATE` set to 0 in dev, 0.2 in prod
- [ ] TypeScript types updated for new env vars
- [ ] Sentry disabled when `SENTRY_DSN` is empty
- [ ] App builds and runs correctly in both environments
- [ ] `yarn typecheck` passes with 0 errors
- [ ] `yarn lint` passes with 0 warnings

---

## Test Scenarios

**Scenario 1: Development Environment**

```gherkin
Given the app is built with .env.development
When Sentry initialisation runs
Then Sentry should be disabled (no DSN)
And no errors should be sent to Sentry
```

**Scenario 2: Production Environment**

```gherkin
Given the app is built with .env.production
When Sentry initialisation runs
Then Sentry should be enabled with the DSN
And the environment should be 'production'
And the traces sample rate should be 0.2
```

**Scenario 3: Missing DSN Handling**

```gherkin
Given the production build has no SENTRY_DSN set
When Sentry initialisation runs
Then Sentry should be disabled gracefully
And a warning should be logged
And the app should continue to function
```

---

## Dependencies

**Blocked By**: TASK-372 (Sentry SDK installation provides DSN)

**Blocks**: None

---

## Notes

**Security**:

- `.env.production` should NOT be committed to git (already in `.gitignore`)
- DSN is not a secret but should be kept out of public repos
- CI/CD should inject production env vars during build

**EU Data Residency**:
The DSN determines which Sentry region data is sent to. Use a DSN from an EU-hosted project:

- EU DSN format: `https://xxx@xxx.ingest.de.sentry.io/xxx`
- US DSN format: `https://xxx@xxx.ingest.sentry.io/xxx`

**Sample Rate Trade-offs**:

- Higher rates (0.5-1.0): More data, higher costs
- Lower rates (0.1-0.2): Less data, lower costs
- 0.2 is a good starting point for mobile apps

---

**Last Updated**: 2025-12-08

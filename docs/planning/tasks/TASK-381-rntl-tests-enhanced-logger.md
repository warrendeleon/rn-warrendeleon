# TASK-381: RNTL Tests for Enhanced Logger

**Task ID**: TASK-381
**Title**: RNTL Tests for Enhanced Logger
**Epic**: [EPIC-032: Production Logging & Error Tracking](../epics/EPIC-032-production-logging-error-tracking.md)
**User Story**: [US-070: Observability & Debugging Infrastructure](../stories/US-070-observability-debugging-infrastructure.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-08
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Overview

Create unit tests for the enhanced logger utility to verify correct behaviour in both development and production modes. Tests should verify Sentry integration, sensitive data masking, and the new logging functions.

---

## Technical Details

### Test File Structure

**`src/utils/__tests__/logger.rntl.tsx`** (update/expand):

```typescript
import * as Sentry from '@sentry/react-native';
import { logError, logWarning, logDebug, logInfo, logBreadcrumb } from '../logger';
import { maskSensitiveData } from '../logging/maskSensitiveData';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock maskSensitiveData to verify it's called
jest.mock('../logging/maskSensitiveData', () => ({
  maskSensitiveData: jest.fn(data => data),
}));

describe('Logger Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Development Mode (__DEV__ = true)', () => {
    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    it('should log error to console, not Sentry', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      logError('Test error', new Error('Test'), { context: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(Sentry.captureException).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log warning to console, not Sentry', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      logWarning('Test warning', { context: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log debug to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      logDebug('Debug message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log info to console, not Sentry breadcrumb', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      logInfo('Info message', { data: 'test' });

      expect(consoleSpy).toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Production Mode (__DEV__ = false)', () => {
    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = false;
    });

    afterAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    it('should send error to Sentry.captureException', () => {
      const error = new Error('Production error');

      logError('Error message', error, { userId: '123' });

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          extra: expect.any(Object),
        })
      );
    });

    it('should send warning to Sentry.captureMessage', () => {
      logWarning('Warning message', { level: 'low' });

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({
          level: 'warning',
        })
      );
    });

    it('should NOT send debug to Sentry', () => {
      logDebug('Debug in prod', { data: 'test' });

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('should add info as Sentry breadcrumb', () => {
      logInfo('Info breadcrumb', { key: 'value' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'info',
          message: 'Info breadcrumb',
          level: 'info',
        })
      );
    });

    it('should add custom breadcrumb', () => {
      logBreadcrumb('navigation', 'Screen changed', { screen: 'Home' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'navigation',
          message: 'Screen changed',
        })
      );
    });
  });

  describe('Sensitive Data Masking', () => {
    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = false;
    });

    afterAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    it('should mask context data before sending to Sentry', () => {
      const context = { email: 'user@test.com', password: 'secret' };

      logError('Auth error', new Error('Failed'), context);

      expect(maskSensitiveData).toHaveBeenCalledWith(context);
    });

    it('should mask breadcrumb data', () => {
      const data = { token: 'abc123' };

      logInfo('Token received', data);

      expect(maskSensitiveData).toHaveBeenCalledWith(data);
    });
  });
});
```

---

## Files to Create/Modify

| File                                  | Changes                |
| ------------------------------------- | ---------------------- |
| `src/utils/__tests__/logger.rntl.tsx` | Add full test coverage |

---

## Acceptance Criteria

- [ ] Tests verify `logError()` behaviour in dev and prod modes
- [ ] Tests verify `logWarning()` behaviour in dev and prod modes
- [ ] Tests verify `logDebug()` never sends to Sentry
- [ ] Tests verify `logInfo()` adds breadcrumbs in prod
- [ ] Tests verify `logBreadcrumb()` adds custom breadcrumbs
- [ ] Tests verify `maskSensitiveData()` is called for all logged data
- [ ] Tests mock Sentry correctly
- [ ] 100% code coverage on logger.ts
- [ ] `yarn test src/utils/__tests__/logger.rntl.tsx` passes
- [ ] `yarn test:coverage` shows 100% for logger.ts
- [ ] `yarn validate` passes with 0 errors

---

## Test Scenarios

The test file above covers:

1. **Development Mode**
   - logError → console.error only
   - logWarning → console.warn only
   - logDebug → console.log only
   - logInfo → console.info only
   - No Sentry calls

2. **Production Mode**
   - logError → Sentry.captureException
   - logWarning → Sentry.captureMessage (warning)
   - logDebug → No Sentry call
   - logInfo → Sentry.addBreadcrumb
   - logBreadcrumb → Sentry.addBreadcrumb

3. **Data Masking**
   - Context data masked before Sentry
   - Breadcrumb data masked before Sentry

---

## Dependencies

**Blocked By**: TASK-374 (Enhanced logger implementation)

**Blocks**: None

---

## Notes

**Test Setup**:
The `__DEV__` global needs to be mocked differently for dev vs prod test suites. Using `beforeAll` to set `__DEV__` and `afterAll` to reset it.

**Sentry Mocking**:
All Sentry functions are mocked to prevent actual network calls during tests. Tests verify that the correct Sentry functions are called with correct arguments.

**Coverage Target**:
100% code coverage on `logger.ts` is required. The existing `maskSensitiveData` tests should already have high coverage.

---

**Last Updated**: 2025-12-08

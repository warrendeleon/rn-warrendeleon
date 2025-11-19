# TASK-153: RNTL Tests for Logger Utility

**Status**: 📋 To Do
**Priority**: Medium
**Effort**: 0.5h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Create unit tests for the `logger.ts` utility. Test that logging functions work correctly in development mode and are silenced in production.

## Current State

- No tests exist for logger utility
- Contains `logError()`, `logWarning()`, `logDebug()` functions
- Uses `__DEV__` flag for conditional logging

## Acceptance Criteria

- [ ] Test `logError()` logs in dev mode
- [ ] Test `logWarning()` logs in dev mode
- [ ] Test `logDebug()` logs in dev mode
- [ ] Test functions are silent when `__DEV__` is false
- [ ] Test correct console methods are called
- [ ] All tests pass with `yarn test`
- [ ] Coverage threshold met

## Implementation Notes

```typescript
// Test pattern:
describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('when __DEV__ is true', () => {
    it('logError calls console.error', () => {
      logError('test error');
      expect(console.error).toHaveBeenCalledWith('test error');
    });
  });
});
```

## Test File Location

`src/utils/__tests__/logger.rntl.ts`

## Related Files

- `src/utils/logger.ts`

# TASK-152: Explicit Async Thunk Action Tests

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md)

---

## Description

Add explicit unit tests for async thunk actions (`fetchProfile`, `fetchEducation`, `fetchWorkExperience`). Currently these are tested indirectly through reducer tests, but should have dedicated action dispatch tests.

## Current State

- Actions tested indirectly through reducer tests
- No explicit action file tests
- Missing edge case coverage (network errors, timeouts)

## Acceptance Criteria

- [ ] Test `fetchProfile` action dispatch and payload
- [ ] Test `fetchEducation` action dispatch and payload
- [ ] Test `fetchWorkExperience` action dispatch and payload
- [ ] Test pending/fulfilled/rejected action types
- [ ] Test error message extraction
- [ ] Test language parameter passing
- [ ] All tests pass with `yarn test`
- [ ] Coverage threshold met

## Implementation Notes

```typescript
// Test pattern for async thunks:
describe('fetchProfile action', () => {
  it('dispatches pending and fulfilled on success', async () => {
    const store = configureStore({ reducer: { profile: profileReducer } });
    await store.dispatch(fetchProfile());
    const actions = store.getActions();
    expect(actions[0].type).toBe('profile/fetchProfile/pending');
    expect(actions[1].type).toBe('profile/fetchProfile/fulfilled');
  });

  it('dispatches pending and rejected on error', async () => {
    // Mock API to throw error
  });
});
```

## Test File Locations

- `src/features/Profile/store/__tests__/actions.rntl.ts`
- `src/features/Education/store/__tests__/actions.rntl.ts`
- `src/features/WorkExperience/store/__tests__/actions.rntl.ts`

## Related Files

- `src/features/Profile/store/actions.ts`
- `src/features/Education/store/actions.ts`
- `src/features/WorkExperience/store/actions.ts`

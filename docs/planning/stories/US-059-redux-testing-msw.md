# US-059: Redux Testing Infrastructure with MSW

**Story ID**: US-059
**Title**: Redux Testing Infrastructure with Mock Service Worker
**Epic**: [EPIC-030](../epics/EPIC-030-testing-infrastructure.md) - Testing Infrastructure & Quality Improvements
**Status**: ✅ Done
**Priority**: High
**Effort**: 8 hours
**Owner**: Warren de Leon
**Created**: 2025-11-24
**Completed**: 2025-11-24

---

## Story

**As a** developer writing tests for Redux-connected components
**I want** to use Mock Service Worker (MSW) with real Redux store in tests
**So that** I can test real integration behaviour without act() warnings and brittle mocks

---

## Context

Currently, SplashScreen tests mock Redux `dispatch` which causes 16 act() warnings. The problem is that mocking dispatch doesn't prevent components from subscribing to the real Redux store via `useAppSelector`. When mocked thunks resolve, the real store updates happen async and outside test control, triggering act() warnings.

The official Redux team recommendation (Mark Erikson) is to mock at the HTTP layer (not Redux layer) using MSW, and use the real Redux store in tests. This tests actual integration behaviour and eliminates act() warnings.

---

## Acceptance Criteria

- [ ] MSW installed and configured with React Native polyfills
- [ ] Mock handlers created for profile, education, work experience APIs
- [ ] `renderWithProviders` utility created with real Redux store
- [ ] SplashScreen tests refactored to use MSW + real store
- [ ] Zero act() warnings in test output
- [ ] All 743+ tests passing
- [ ] MSW_TESTING_GUIDE.md documentation complete
- [ ] Pattern reusable for all future Redux tests

---

## Tasks

| Task ID                                                           | Title                            | Status         | Effort | Priority |
| ----------------------------------------------------------------- | -------------------------------- | -------------- | ------ | -------- |
| [TASK-328](../tasks/TASK-328-msw-redux-testing-infrastructure.md) | MSW Redux Testing Infrastructure | ⏳ In Progress | 8h     | High     |

**Total Effort**: 8 hours

---

## Technical Details

### Current Problem

```typescript
// Mocking dispatch
mockDispatch.mockResolvedValue({ type: 'fulfilled' });

// Component calls dispatch (mocked)
dispatch(fetchProfile());

// But useAppSelector subscribes to REAL store
// Real store updates happen async, outside test control
// Result: act() warnings
```

### Solution

```typescript
// Mock at HTTP layer with MSW
server.use(
  http.get('/api/profile', () => {
    return HttpResponse.json(mockData, { status: 200 });
  })
);

// Use real Redux store
const { store } = renderWithProviders(<Component />);

// Component calls real dispatch
// Real thunk makes HTTP call
// MSW intercepts and returns mock response
// Store updates within React's control
// Result: No act() warnings
```

---

## Dependencies

### Depends On

- **TASK-191**: 3-Tier Storage Implementation (complete)

### Blocks

- Future Redux integration tests
- Test coverage improvements

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Zero act() warnings in validation output
- [ ] Full test suite passing (yarn validate)
- [ ] Documentation complete and reviewed
- [ ] Code committed and pushed
- [ ] Pattern demonstrated in SplashScreen tests

---

## Notes

- This establishes the testing pattern for all Redux-connected components
- MSW is the official recommendation from Redux team
- Tests integration behaviour, not just mocked behaviour
- Improves test reliability and maintainability

---

**Created**: 2025-11-24
**Last Updated**: 2025-11-24

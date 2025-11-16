# US-018: Work Experience Redux State Management

**User Story ID**: US-018
**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**Status**: ✅ Completed
**Priority**: High
**Estimated Effort**: 4-5 hours
**Progress**: 4/4 tasks completed (100%)
**Created**: 2025-11-15
**Last Updated**: 2025-11-16
**Completed**: 2025-11-16

---

## User Story

**As a** developer
**I want** a Redux slice to manage work experience data state
**So that** the Work Experience screen can reliably fetch, cache, and display work history data

---

## Context & Rationale

The Work Experience feature requires robust state management to handle:

- Async API calls to fetch work experience data
- Loading and error states during data fetching
- Caching to prevent redundant API calls
- Memoized selectors for performance optimisation

This user story establishes the Redux foundation that US-017 (screen display) and US-019 (navigation) will build upon. Following the same pattern as Education Redux slice ensures consistency and maintainability.

---

## Benefits

### Technical

- **Single Source of Truth**: All components read from Redux store
- **Performance**: Memoized selectors prevent unnecessary re-renders
- **Testability**: Business logic isolated in pure functions (100% test coverage)
- **Reusability**: Selectors can be used across multiple screens
- **Error Handling**: Centralised error state management

### Developer Experience

- **Type Safety**: Full TypeScript support with strict typing
- **Predictability**: Redux DevTools integration for debugging
- **Consistency**: Matches Education slice pattern
- **Maintainability**: Clear separation of concerns

---

## Acceptance Criteria

### Functional Requirements

1. **Redux Slice Structure**
   - [ ] WorkExperience slice created with actions, reducers, selectors
   - [ ] State shape includes: `data`, `loading`, `error` properties
   - [ ] Integrated into root reducer
   - [ ] Configured with Redux DevTools

2. **Actions & Thunks**
   - [ ] `fetchWorkExperience()` async thunk to call API
   - [ ] `clearWorkExperience()` action to reset state
   - [ ] Thunks handle pending, fulfilled, rejected cases
   - [ ] Error messages are user-friendly

3. **Selectors**
   - [ ] `selectWorkExperience`: Returns all work experience data
   - [ ] `selectWorkExperienceLoading`: Returns loading state
   - [ ] `selectWorkExperienceError`: Returns error message
   - [ ] `selectWorkExperienceByCompany`: Returns data for specific company
   - [ ] `selectWorkExperienceWithClients`: Returns only positions with clients
   - [ ] All selectors are memoized with `createSelector`

4. **API Integration**
   - [ ] API client function `getWorkExperience()` fetches from backend
   - [ ] Handles multi-language support (passes locale parameter)
   - [ ] Validates response with Zod schema
   - [ ] Throws typed errors for error handling

5. **Type Definitions**
   - [ ] `WorkExperience` interface matches API response
   - [ ] `Client` interface for client data structure
   - [ ] `WorkExperienceState` interface for Redux state shape
   - [ ] All types exported from `src/types/portfolio.ts`

### Technical Requirements

- [ ] Code follows feature-first architecture: `src/features/WorkExperience/store/`
- [ ] All Redux logic is pure functions (no side effects in reducers)
- [ ] Async thunks use Redux Toolkit `createAsyncThunk`
- [ ] Selectors use Reselect `createSelector` for memoization
- [ ] TypeScript strict mode compliance
- [ ] 100% test coverage on all Redux logic

---

## Test Scenarios

### Unit Tests (Jest)

```typescript
describe('Work Experience Redux Slice', () => {
  describe('Actions', () => {
    it('should handle fetchWorkExperience.pending', () => {
      const nextState = workExperienceReducer(initialState, {
        type: fetchWorkExperience.pending.type,
      });
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBe(null);
    });

    it('should handle fetchWorkExperience.fulfilled', () => {
      const mockData = [
        /* work experience data */
      ];
      const nextState = workExperienceReducer(initialState, {
        type: fetchWorkExperience.fulfilled.type,
        payload: mockData,
      });
      expect(nextState.data).toEqual(mockData);
      expect(nextState.loading).toBe(false);
    });

    it('should handle fetchWorkExperience.rejected', () => {
      const error = 'Failed to fetch work experience';
      const nextState = workExperienceReducer(initialState, {
        type: fetchWorkExperience.rejected.type,
        error: { message: error },
      });
      expect(nextState.error).toBe(error);
      expect(nextState.loading).toBe(false);
    });

    it('should handle clearWorkExperience', () => {
      const state = {
        data: [
          /* data */
        ],
        loading: false,
        error: null,
      };
      const nextState = workExperienceReducer(state, clearWorkExperience());
      expect(nextState).toEqual(initialState);
    });
  });

  describe('Selectors', () => {
    it('selectWorkExperience should return all work experience data', () => {
      const state = { workExperience: { data: mockData, loading: false, error: null } };
      expect(selectWorkExperience(state)).toEqual(mockData);
    });

    it('selectWorkExperienceByCompany should filter by company', () => {
      const state = { workExperience: { data: mockData, loading: false, error: null } };
      const result = selectWorkExperienceByCompany(state, 'Company A');
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Company A');
    });

    it('selectWorkExperienceWithClients should return only positions with clients', () => {
      const state = { workExperience: { data: mockData, loading: false, error: null } };
      const result = selectWorkExperienceWithClients(state);
      expect(result.every(item => item.clients && item.clients.length > 0)).toBe(true);
    });
  });
});

describe('Work Experience API', () => {
  it('should fetch work experience data successfully', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockData });
    const result = await getWorkExperience('en');
    expect(result).toEqual(mockData);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/work-experience?lang=en');
  });

  it('should handle API errors', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(getWorkExperience('en')).rejects.toThrow('Network error');
  });

  it('should validate response schema', async () => {
    const invalidData = [{ company: 'Test' }]; // Missing required fields
    mockAxios.get.mockResolvedValueOnce({ data: invalidData });
    await expect(getWorkExperience('en')).rejects.toThrow();
  });
});
```

---

## Dependencies & Blockers

### Dependencies

- **EPIC-005**: API must return work experience data endpoint
- **Redux Toolkit**: Already installed ✅
- **Reselect**: Already installed ✅
- **Zod**: Already installed for validation ✅

### Blockers

None. All dependencies are met.

---

## Tasks

| Task ID                                                           | Title                                   | Status       | Effort | Completed Date |
| ----------------------------------------------------------------- | --------------------------------------- | ------------ | ------ | -------------- |
| [TASK-079](../tasks/TASK-079-work-experience-types.md)            | Define Work Experience TypeScript Types | ✅ Completed | 0.5h   | 2025-11-16     |
| [TASK-084](../tasks/TASK-084-work-experience-api-client.md)       | Create Work Experience API Client       | ✅ Completed | 1.5h   | 2025-11-16     |
| [TASK-085](../tasks/TASK-085-work-experience-redux-slice.md)      | Implement Work Experience Redux Slice   | ✅ Completed | 2h     | 2025-11-16     |
| [TASK-086](../tasks/TASK-086-unit-tests-work-experience-redux.md) | Unit Tests for Work Experience Redux    | ✅ Completed | 2h     | 2025-11-16     |

**Total Estimated Effort**: 6 hours (6h completed)

---

## Success Criteria

1. ✅ Redux slice handles all work experience state correctly
2. ✅ API client fetches data and validates with Zod
3. ✅ All selectors are memoized and performant
4. ✅ 100% test coverage on Redux logic and API client
5. ✅ TypeScript types are strict and complete
6. ✅ Zero Redux DevTools warnings
7. ✅ Error handling is robust and user-friendly

---

## Notes

- Follow Education Redux slice (US-007) as reference implementation
- Consider adding `selectWorkExperienceTotalYears` selector for statistics
- May need `selectWorkExperienceByDateRange` for timeline features
- Ensure API endpoint returns data sorted by date (backend responsibility)
- Client data structure should match what MenuButtonGroupSvg expects

# TASK-086: Unit Tests for Work Experience Redux

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-018: Work Experience Redux State Management](../stories/US-018-work-experience-redux-state.md)
**Status**: ✅ Done
**Priority**: Medium
**Estimated Effort**: 2 hours
**Created**: 2025-11-16
**Completed**: 2025-11-16

---

## Context

Create full unit tests for the work experience Redux slice, including actions, reducers, async thunks, and memoized selectors. Tests should achieve 100% coverage on all Redux logic to ensure reliability and prevent regressions.

## Technical Details

### Test File Structure

**Location**: `src/features/WorkExperience/store/__tests__/index.test.ts`

```typescript
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import workExperienceReducer, { fetchWorkExperience, clearWorkExperience } from '../index';
import { getWorkExperience } from '../../api/api';
import type { WorkExperience, WorkExperienceState } from '@app/types/portfolio';

// Mock API client
jest.mock('../../api/api');
const mockGetWorkExperience = getWorkExperience as jest.MockedFunction<typeof getWorkExperience>;

const mockStore = configureStore([thunk]);

describe('Work Experience Redux Slice', () => {
  const mockWorkExperienceData: WorkExperience[] = [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      logo: 'techcorp.svg',
      start: '2020-01-01',
      end: '2023-06-30',
      clients: [
        { id: 'c1', name: 'Client A' },
        { id: 'c2', name: 'Client B' },
      ],
    },
    {
      id: '2',
      company: 'Startup Inc',
      position: 'Lead Engineer',
      logo: 'startup.svg',
      start: '2018-03-15',
      end: null, // Current position
    },
  ];

  const initialState: WorkExperienceState = {
    data: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reducer', () => {
    it('should return initial state', () => {
      expect(workExperienceReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearWorkExperience', () => {
      const previousState: WorkExperienceState = {
        data: mockWorkExperienceData,
        loading: false,
        error: null,
      };

      expect(workExperienceReducer(previousState, clearWorkExperience())).toEqual({
        data: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('Async Thunks', () => {
    describe('fetchWorkExperience', () => {
      it('should handle fetchWorkExperience.pending', () => {
        const action = { type: fetchWorkExperience.pending.type };
        const state = workExperienceReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);
      });

      it('should handle fetchWorkExperience.fulfilled', () => {
        const action = {
          type: fetchWorkExperience.fulfilled.type,
          payload: mockWorkExperienceData,
        };
        const state = workExperienceReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.data).toEqual(mockWorkExperienceData);
        expect(state.error).toBe(null);
      });

      it('should handle fetchWorkExperience.rejected', () => {
        const errorMessage = 'Failed to load work experience';
        const action = {
          type: fetchWorkExperience.rejected.type,
          payload: errorMessage,
        };
        const state = workExperienceReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.data).toBe(null);
      });

      it('should fetch work experience data successfully', async () => {
        mockGetWorkExperience.mockResolvedValueOnce(mockWorkExperienceData);

        const store = mockStore({
          workExperience: initialState,
          settings: { language: 'en' },
        });

        await store.dispatch(fetchWorkExperience() as any);

        const actions = store.getActions();
        expect(actions[0].type).toBe(fetchWorkExperience.pending.type);
        expect(actions[1].type).toBe(fetchWorkExperience.fulfilled.type);
        expect(actions[1].payload).toEqual(mockWorkExperienceData);
      });

      it('should use current language from settings', async () => {
        mockGetWorkExperience.mockResolvedValueOnce(mockWorkExperienceData);

        const store = mockStore({
          workExperience: initialState,
          settings: { language: 'es' },
        });

        await store.dispatch(fetchWorkExperience() as any);

        expect(mockGetWorkExperience).toHaveBeenCalledWith('es');
      });

      it('should handle API errors', async () => {
        const errorMessage = 'Network error';
        mockGetWorkExperience.mockRejectedValueOnce(new Error(errorMessage));

        const store = mockStore({
          workExperience: initialState,
          settings: { language: 'en' },
        });

        await store.dispatch(fetchWorkExperience() as any);

        const actions = store.getActions();
        expect(actions[0].type).toBe(fetchWorkExperience.pending.type);
        expect(actions[1].type).toBe(fetchWorkExperience.rejected.type);
        expect(actions[1].payload).toBe(errorMessage);
      });

      it('should default to "en" if language not set', async () => {
        mockGetWorkExperience.mockResolvedValueOnce(mockWorkExperienceData);

        const store = mockStore({
          workExperience: initialState,
          settings: { language: undefined },
        });

        await store.dispatch(fetchWorkExperience() as any);

        expect(mockGetWorkExperience).toHaveBeenCalledWith('en');
      });
    });
  });
});
```

### Selectors Tests

**Location**: `src/features/WorkExperience/store/__tests__/selectors.test.ts`

```typescript
import {
  selectWorkExperience,
  selectWorkExperienceLoading,
  selectWorkExperienceError,
  selectWorkExperienceById,
  selectWorkExperienceByCompany,
  selectWorkExperienceWithClients,
  selectCurrentWorkExperience,
  selectTotalYearsExperience,
} from '../selectors';
import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

describe('Work Experience Selectors', () => {
  const mockWorkExperienceData: WorkExperience[] = [
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      logo: 'techcorp.svg',
      start: '2020-01-01',
      end: '2023-06-30',
      clients: [
        { id: 'c1', name: 'Client A' },
        { id: 'c2', name: 'Client B' },
        { id: 'c3', name: 'Client C' },
      ],
    },
    {
      id: '2',
      company: 'Startup Inc',
      position: 'Lead Engineer',
      logo: 'startup.svg',
      start: '2018-03-15',
      end: '2019-12-31',
    },
    {
      id: '3',
      company: 'Current Company',
      position: 'Tech Lead',
      logo: 'current.svg',
      start: '2023-07-01',
      end: null, // Current position
      clients: [{ id: 'c4', name: 'Client D' }],
    },
  ];

  const mockState: Partial<RootState> = {
    workExperience: {
      data: mockWorkExperienceData,
      loading: false,
      error: null,
    },
  };

  describe('selectWorkExperience', () => {
    it('should return all work experience data', () => {
      const result = selectWorkExperience(mockState as RootState);
      expect(result).toEqual(mockWorkExperienceData);
    });

    it('should return null when no data', () => {
      const stateWithNoData: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: null },
      };
      const result = selectWorkExperience(stateWithNoData as RootState);
      expect(result).toBeNull();
    });
  });

  describe('selectWorkExperienceLoading', () => {
    it('should return loading state', () => {
      const result = selectWorkExperienceLoading(mockState as RootState);
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const loadingState: Partial<RootState> = {
        workExperience: { data: null, loading: true, error: null },
      };
      const result = selectWorkExperienceLoading(loadingState as RootState);
      expect(result).toBe(true);
    });
  });

  describe('selectWorkExperienceError', () => {
    it('should return error state', () => {
      const result = selectWorkExperienceError(mockState as RootState);
      expect(result).toBeNull();
    });

    it('should return error message when error exists', () => {
      const errorState: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: 'Network error' },
      };
      const result = selectWorkExperienceError(errorState as RootState);
      expect(result).toBe('Network error');
    });
  });

  describe('selectWorkExperienceById', () => {
    it('should return work experience by ID', () => {
      const result = selectWorkExperienceById(mockState as RootState, '1');
      expect(result?.company).toBe('Tech Corp');
      expect(result?.id).toBe('1');
    });

    it('should return null when ID not found', () => {
      const result = selectWorkExperienceById(mockState as RootState, 'non-existent');
      expect(result).toBeNull();
    });

    it('should return null when no data', () => {
      const stateWithNoData: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: null },
      };
      const result = selectWorkExperienceById(stateWithNoData as RootState, '1');
      expect(result).toBeNull();
    });
  });

  describe('selectWorkExperienceByCompany', () => {
    it('should return work experiences by company name', () => {
      const result = selectWorkExperienceByCompany(mockState as RootState, 'Tech Corp');
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Tech Corp');
    });

    it('should return empty array when company not found', () => {
      const result = selectWorkExperienceByCompany(mockState as RootState, 'Non-existent Company');
      expect(result).toEqual([]);
    });

    it('should return empty array when no data', () => {
      const stateWithNoData: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: null },
      };
      const result = selectWorkExperienceByCompany(stateWithNoData as RootState, 'Tech Corp');
      expect(result).toEqual([]);
    });
  });

  describe('selectWorkExperienceWithClients', () => {
    it('should return only work experiences with clients', () => {
      const result = selectWorkExperienceWithClients(mockState as RootState);
      expect(result).toHaveLength(2);
      expect(result[0].clients).toBeDefined();
      expect(result[0].clients!.length).toBeGreaterThan(0);
      expect(result[1].clients).toBeDefined();
      expect(result[1].clients!.length).toBeGreaterThan(0);
    });

    it('should exclude work experiences without clients', () => {
      const result = selectWorkExperienceWithClients(mockState as RootState);
      const withoutClients = result.find(item => item.id === '2');
      expect(withoutClients).toBeUndefined();
    });

    it('should return empty array when no data', () => {
      const stateWithNoData: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: null },
      };
      const result = selectWorkExperienceWithClients(stateWithNoData as RootState);
      expect(result).toEqual([]);
    });
  });

  describe('selectCurrentWorkExperience', () => {
    it('should return only current positions (end date is null)', () => {
      const result = selectCurrentWorkExperience(mockState as RootState);
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Current Company');
      expect(result[0].end).toBeNull();
    });

    it('should return empty array when no current positions', () => {
      const stateWithNoCurrent: Partial<RootState> = {
        workExperience: {
          data: mockWorkExperienceData.filter(item => item.end !== null),
          loading: false,
          error: null,
        },
      };
      const result = selectCurrentWorkExperience(stateWithNoCurrent as RootState);
      expect(result).toEqual([]);
    });
  });

  describe('selectTotalYearsExperience', () => {
    it('should calculate total years of experience', () => {
      const result = selectTotalYearsExperience(mockState as RootState);
      // Tech Corp: 2020-01 to 2023-06 = ~3.5 years
      // Startup Inc: 2018-03 to 2019-12 = ~1.75 years
      // Current: 2023-07 to now = varies
      // Total should be at least 5 years
      expect(result).toBeGreaterThanOrEqual(5);
    });

    it('should return 0 when no data', () => {
      const stateWithNoData: Partial<RootState> = {
        workExperience: { data: null, loading: false, error: null },
      };
      const result = selectTotalYearsExperience(stateWithNoData as RootState);
      expect(result).toBe(0);
    });

    it('should return 0 when empty array', () => {
      const stateWithEmptyData: Partial<RootState> = {
        workExperience: { data: [], loading: false, error: null },
      };
      const result = selectTotalYearsExperience(stateWithEmptyData as RootState);
      expect(result).toBe(0);
    });
  });

  describe('Memoization', () => {
    it('should memoize selector results', () => {
      const result1 = selectWorkExperience(mockState as RootState);
      const result2 = selectWorkExperience(mockState as RootState);
      expect(result1).toBe(result2); // Same reference
    });

    it('should recompute when state changes', () => {
      const result1 = selectWorkExperience(mockState as RootState);

      const newState: Partial<RootState> = {
        workExperience: {
          data: [...mockWorkExperienceData, { ...mockWorkExperienceData[0], id: '999' }],
          loading: false,
          error: null,
        },
      };

      const result2 = selectWorkExperience(newState as RootState);
      expect(result1).not.toBe(result2); // Different reference
    });
  });
});
```

### Test Coverage Requirements

- **Branches**: 100%
- **Statements**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Files Affected

- `src/features/WorkExperience/store/__tests__/index.test.ts` - New reducer/actions tests
- `src/features/WorkExperience/store/__tests__/selectors.test.ts` - New selectors tests

## Acceptance Criteria

- ✅ All reducers tested (initial state, clearWorkExperience)
- ✅ All async thunks tested (pending, fulfilled, rejected)
- ✅ Thunk uses correct locale from settings state
- ✅ Thunk handles API errors gracefully
- ✅ All selectors tested with data and empty states
- ✅ `selectWorkExperienceById` tested with valid/invalid IDs
- ✅ `selectWorkExperienceByCompany` tested with matching/non-matching companies
- ✅ `selectWorkExperienceWithClients` filters correctly
- ✅ `selectCurrentWorkExperience` filters current positions
- ✅ `selectTotalYearsExperience` calculation tested
- ✅ Selector memoization verified
- ✅ 100% test coverage achieved
- ✅ All tests pass with `yarn test`
- ✅ No console warnings or errors during tests

## Test Scenarios

### Reducer Tests

1. ✅ Returns initial state
2. ✅ Handles clearWorkExperience action

### Async Thunk Tests

3. ✅ Handles fetchWorkExperience.pending (sets loading, clears error)
4. ✅ Handles fetchWorkExperience.fulfilled (sets data, clears loading)
5. ✅ Handles fetchWorkExperience.rejected (sets error, clears loading)
6. ✅ Fetches work experience data successfully
7. ✅ Uses current language from settings state
8. ✅ Handles API errors
9. ✅ Defaults to "en" if language not set

### Selector Tests

10. ✅ selectWorkExperience returns all data
11. ✅ selectWorkExperience returns null when no data
12. ✅ selectWorkExperienceLoading returns loading state
13. ✅ selectWorkExperienceError returns error state
14. ✅ selectWorkExperienceById filters by ID
15. ✅ selectWorkExperienceById returns null when not found
16. ✅ selectWorkExperienceByCompany filters by company
17. ✅ selectWorkExperienceWithClients filters positions with clients
18. ✅ selectCurrentWorkExperience filters current positions (end = null)
19. ✅ selectTotalYearsExperience calculates total years
20. ✅ Selectors are memoized (same reference for same state)
21. ✅ Selectors recompute when state changes

## Dependencies

**Prerequisites**:

- ✅ TASK-085: Work Experience Redux slice implemented
- ✅ TASK-084: Work Experience API client created
- ✅ Jest configured
- ✅ redux-mock-store installed

**Enables**:

- Full confidence in Redux logic quality
- Production-ready work experience state management

## Success Criteria

- All Redux logic fully tested
- 100% test coverage achieved
- All edge cases covered
- Memoization verified
- Professional test quality matching project standards
- Tests serve as documentation for Redux behaviour

## Notes

- Mock API client to isolate Redux logic
- Use redux-mock-store for testing async thunks
- Test both happy paths and error cases
- Verify selector memoization (same reference for same input)
- Test date calculations in selectTotalYearsExperience
- Ensure locale fallback to "en" works correctly
- Follow Education Redux test pattern (TASK-036) for consistency

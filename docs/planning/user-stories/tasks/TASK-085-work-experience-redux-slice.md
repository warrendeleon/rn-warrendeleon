# TASK-085: Implement Work Experience Redux Slice

**Epic**: [EPIC-010: Work Experience Display Enhancement](../epics/EPIC-010-work-experience-display.md)
**User Story**: [US-018: Work Experience Redux State Management](../stories/US-018-work-experience-redux-state.md)
**Status**: ✅ Done
**Priority**: High
**Estimated Effort**: 2 hours
**Created**: 2025-11-16
**Completed**: 2025-11-16

---

## Context

Implement a Redux Toolkit slice for managing work experience state, including async thunks for data fetching, reducers for state updates, and memoized selectors for efficient data access. This slice follows the same pattern as the Education and Profile slices for consistency.

## Technical Details

### Redux Slice Implementation

**Location**: `src/features/WorkExperience/store/index.ts`

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getWorkExperience } from '../api/api';
import type { WorkExperience, WorkExperienceState } from '@app/types/portfolio';
import type { RootState } from '@app/store';

// Initial state
const initialState: WorkExperienceState = {
  data: null,
  loading: false,
  error: null,
};

// Async thunk to fetch work experience data
export const fetchWorkExperience = createAsyncThunk<
  WorkExperience[],
  void,
  { state: RootState; rejectValue: string }
>('workExperience/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    // Get current language from settings
    const state = getState();
    const locale = state.settings.language || 'en';

    // Fetch work experience data
    const data = await getWorkExperience(locale);

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue('Failed to load work experience');
  }
});

// Redux slice
const workExperienceSlice = createSlice({
  name: 'workExperience',
  initialState,
  reducers: {
    // Clear work experience data
    clearWorkExperience: state => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // fetchWorkExperience.pending
      .addCase(fetchWorkExperience.pending, state => {
        state.loading = true;
        state.error = null;
      })
      // fetchWorkExperience.fulfilled
      .addCase(fetchWorkExperience.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      // fetchWorkExperience.rejected
      .addCase(fetchWorkExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load work experience';
      });
  },
});

// Export actions
export const { clearWorkExperience } = workExperienceSlice.actions;

// Export reducer
export default workExperienceSlice.reducer;
```

### Selectors

**Location**: `src/features/WorkExperience/store/selectors.ts`

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@app/store';
import type { WorkExperience } from '@app/types/portfolio';

// Base selectors
export const selectWorkExperienceState = (state: RootState) => state.workExperience;

// Select all work experience data
export const selectWorkExperience = createSelector(
  [selectWorkExperienceState],
  workExperienceState => workExperienceState.data
);

// Select loading state
export const selectWorkExperienceLoading = createSelector(
  [selectWorkExperienceState],
  workExperienceState => workExperienceState.loading
);

// Select error state
export const selectWorkExperienceError = createSelector(
  [selectWorkExperienceState],
  workExperienceState => workExperienceState.error
);

// Select work experience by company ID
export const selectWorkExperienceById = createSelector(
  [selectWorkExperience, (_state: RootState, workExperienceId: string) => workExperienceId],
  (workExperience, workExperienceId) => {
    if (!workExperience) return null;
    return workExperience.find(item => item.id === workExperienceId) || null;
  }
);

// Select work experience by company name
export const selectWorkExperienceByCompany = createSelector(
  [selectWorkExperience, (_state: RootState, companyName: string) => companyName],
  (workExperience, companyName) => {
    if (!workExperience) return [];
    return workExperience.filter(item => item.company === companyName);
  }
);

// Select only work experiences with clients
export const selectWorkExperienceWithClients = createSelector(
  [selectWorkExperience],
  workExperience => {
    if (!workExperience) return [];
    return workExperience.filter(item => item.clients && item.clients.length > 0);
  }
);

// Select current positions (end date is null)
export const selectCurrentWorkExperience = createSelector(
  [selectWorkExperience],
  workExperience => {
    if (!workExperience) return [];
    return workExperience.filter(item => item.end === null);
  }
);

// Calculate total years of experience
export const selectTotalYearsExperience = createSelector([selectWorkExperience], workExperience => {
  if (!workExperience || workExperience.length === 0) return 0;

  const totalMonths = workExperience.reduce((sum, item) => {
    const start = new Date(item.start);
    const end = item.end ? new Date(item.end) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return sum + months;
  }, 0);

  return Math.floor(totalMonths / 12);
});
```

### Root Reducer Integration

**Location**: `src/store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@app/features/Settings/store';
import profileReducer from '@app/features/Profile/store';
import educationReducer from '@app/features/Education/store';
import workExperienceReducer from '@app/features/WorkExperience/store';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    profile: profileReducer,
    education: educationReducer,
    workExperience: workExperienceReducer, // Add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Files Affected

- `src/features/WorkExperience/store/index.ts` - New Redux slice
- `src/features/WorkExperience/store/selectors.ts` - New selectors
- `src/store/index.ts` - Add workExperience reducer to root store

## Acceptance Criteria

- ✅ Work experience Redux slice created with Redux Toolkit
- ✅ `fetchWorkExperience` async thunk implemented
- ✅ Thunk uses current language from settings state
- ✅ Thunk handles pending, fulfilled, rejected states
- ✅ `clearWorkExperience` action implemented
- ✅ Initial state defined with correct shape
- ✅ Memoized selectors created with Reselect
- ✅ `selectWorkExperience` selector returns all data
- ✅ `selectWorkExperienceLoading` selector returns loading state
- ✅ `selectWorkExperienceError` selector returns error state
- ✅ `selectWorkExperienceById` selector filters by ID
- ✅ `selectWorkExperienceByCompany` selector filters by company
- ✅ `selectWorkExperienceWithClients` selector filters positions with clients
- ✅ `selectCurrentWorkExperience` selector filters current positions
- ✅ `selectTotalYearsExperience` selector calculates total years
- ✅ Reducer integrated into root store
- ✅ TypeScript strict mode compliance
- ✅ No lint errors or warnings

## Test Scenarios

See TASK-086 for comprehensive unit tests. Key scenarios include:

1. **fetchWorkExperience.pending**: Sets loading to true, clears error
2. **fetchWorkExperience.fulfilled**: Sets data, loading to false
3. **fetchWorkExperience.rejected**: Sets error, loading to false
4. **clearWorkExperience**: Resets state to initial
5. **Selectors**: All selectors return correct data

## Dependencies

**Prerequisites**:

- ✅ TASK-079: Work Experience TypeScript types defined
- ✅ TASK-084: Work Experience API client created
- ✅ Redux Toolkit installed and configured
- ✅ Reselect installed for memoized selectors

**Enables**:

- TASK-080: Create WorkExperienceScreen Component
- TASK-086: Unit Tests for Work Experience Redux

## Success Criteria

- Redux slice handles all work experience state correctly
- Async thunk fetches data using correct locale
- Selectors are memoized and performant
- Error handling is robust
- Type safety throughout (no `any` types)
- Consistent with Education and Profile slice patterns
- Zero Redux DevTools warnings

## Notes

- Follow Education Redux slice pattern for consistency
- Memoized selectors prevent unnecessary re-renders
- `selectTotalYearsExperience` could be used for profile statistics
- `selectCurrentWorkExperience` useful for highlighting current roles
- Consider adding `selectWorkExperienceByDateRange` in future
- Ensure locale is read from settings state in thunk
- Error messages should be user-friendly
- Redux DevTools should show clean state history

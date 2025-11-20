# TASK-181: Update Redux Selectors for New Structure

**Status**: ✅ Completed
**Priority**: High
**Effort**: 2h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update all Redux selectors across Profile, Education, and WorkExperience features to work with the new data structure. This includes updating field references, removing client-specific selectors, and adding new selectors for the technologies object.

---

## Selectors to Update

### Profile Selectors

**File**: `src/features/Profile/store/selectors.ts`

| Selector                | Change                                                         |
| ----------------------- | -------------------------------------------------------------- |
| `selectProfileCarousel` | Rename to `selectProfileGalleryImages`, update field reference |

### Education Selectors

**File**: `src/features/Education/store/selectors.ts`

| Selector                          | Change                                 |
| --------------------------------- | -------------------------------------- |
| `selectEducationById`             | Update to use `id` field (newly added) |
| Any selectors using `location`    | Update to `institution`                |
| Any selectors using `start`/`end` | Update to `startDate`/`endDate`        |
| Any selectors using `certificate` | Update to `certificateUrl`             |

### WorkExperience Selectors

**File**: `src/features/WorkExperience/store/selectors.ts`

| Selector                            | Change                                      |
| ----------------------------------- | ------------------------------------------- |
| `selectWorkExperienceOrClientById`  | Simplify - no more separate client lookup   |
| `selectPositionById`                | Update to use new position structure        |
| Any selectors using `start`/`end`   | Update to `startDate`/`endDate`             |
| Any selectors accessing tech fields | Update to use `technologies` object         |
| Client-related selectors            | Remove or refactor to use `position.client` |

---

## Step-by-Step Instructions

### Step 1: Update Profile Selectors

**File**: `src/features/Profile/store/selectors.ts`

```typescript
// Before
export const selectProfileCarousel = (state: RootState) => state.profile.data?.carousel;

// After
export const selectProfileGalleryImages = (state: RootState) => state.profile.data?.galleryImages;
```

### Step 2: Update Education Selectors

**File**: `src/features/Education/store/selectors.ts`

```typescript
// Before
export const selectEducationByTitle = (title: string) => (state: RootState) =>
  state.education.data?.find(item => item.title === title);

// After - can now use ID
export const selectEducationById = (id: string) => (state: RootState) =>
  state.education.data?.find(item => item.id === id);

// Update any field references
// location → institution
// start → startDate
// end → endDate
// certificate → certificateUrl
```

### Step 3: Update WorkExperience Selectors

**File**: `src/features/WorkExperience/store/selectors.ts`

The most significant changes are here:

```typescript
// Before - separate client lookup
export const selectWorkExperienceOrClientById = (id: string) => (state: RootState) => {
  const workExperiences = state.workExperience.data;
  // Check work experiences
  const workExp = workExperiences?.find(we => we.id === id);
  if (workExp) return { type: 'workExperience', data: workExp };

  // Check clients
  for (const we of workExperiences || []) {
    const client = we.clients?.find(c => c.id === id);
    if (client) return { type: 'client', data: client };
  }
  return null;
};

// After - simplified, clients are now positions
export const selectWorkExperienceById = (id: string) => (state: RootState) =>
  state.workExperience.data?.find(we => we.id === id);

export const selectPositionById = (companyId: string, positionId: string) => (state: RootState) => {
  const company = state.workExperience.data?.find(we => we.id === companyId);
  return company?.positions.find(p => p.id === positionId);
};

// New selector for positions with clients
export const selectClientPositions = (state: RootState) => {
  const allPositions: Array<{ company: string; position: Position }> = [];

  state.workExperience.data?.forEach(we => {
    we.positions.forEach(position => {
      if (position.client) {
        allPositions.push({ company: we.company, position });
      }
    });
  });

  return allPositions;
};

// New selector for position technologies
export const selectPositionTechnologies =
  (companyId: string, positionId: string) => (state: RootState) => {
    const position = selectPositionById(companyId, positionId)(state);
    return position?.technologies;
  };
```

### Step 4: Update Date Field References

Search and replace across all selectors:

```typescript
// Before
position.start;
position.end;
education.start;
education.end;

// After
position.startDate;
position.endDate;
education.startDate;
education.endDate;
```

### Step 5: Remove Deprecated Selectors

Remove any selectors that are no longer needed:

- `selectClientById` - clients are now positions
- `selectWorkExperienceClients` - use `position.client` instead

### Step 6: Update Memoization

Ensure selectors using `createSelector` are updated:

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectSortedEducation = createSelector(selectEducationData, education => {
  if (!education) return [];
  return [...education].sort((a, b) => {
    // Use new field names
    const dateA = a.startDate;
    const dateB = b.startDate;
    return dateB.localeCompare(dateA); // Descending
  });
});
```

### Step 7: Verification

```bash
yarn typecheck
yarn test src/features/*/store
```

---

## Files to Modify

- `src/features/Profile/store/selectors.ts`
- `src/features/Education/store/selectors.ts`
- `src/features/WorkExperience/store/selectors.ts`

---

## Acceptance Criteria

- [x] `selectProfileGalleryImages` replaces `selectProfileCarousel`
- [x] `selectEducationById` works with new `id` field
- [x] All education selectors use new field names
- [x] Work experience client selectors simplified or removed
- [x] All date field references updated
- [x] New technology-related selectors added
- [x] Memoized selectors updated
- [x] All selector tests pass
- [x] No TypeScript errors

---

## Implementation Notes

- **Selector naming**: Keep selector names descriptive and consistent. Use `select[Feature][Field/Action]` pattern.
- **Breaking changes**: Renaming `selectProfileCarousel` to `selectProfileGalleryImages` will break components that use it. Update in TASK-183.
- **Performance**: Memoized selectors (using `createSelector`) should recompute correctly with new structure.

---

## Dependencies

- [TASK-179](./TASK-179-update-typescript-types.md) - Types must be updated first
- [TASK-180](./TASK-180-update-zod-schemas.md) - Schemas must be updated first

---

## Next Steps

- [TASK-182](./TASK-182-update-api-clients.md) - Update API Client Functions

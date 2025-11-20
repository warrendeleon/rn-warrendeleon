# TASK-182: Update API Client Functions

**Status**: ✅ Completed
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-020](../epics/EPIC-020-fixture-data-structure-improvements.md)

---

## Description

Update the API client functions to handle the new data structure. This includes updating type imports, ensuring Zod validation works with new schemas, and updating any data transformation logic.

---

## Files to Update

### API Client Files

- `src/features/Profile/api/profileApi.ts`
- `src/features/Education/api/educationApi.ts`
- `src/features/WorkExperience/api/workExperienceApi.ts`

### API Configuration

- `src/config/api.ts` (if any changes needed)

---

## Step-by-Step Instructions

### Step 1: Update Type Imports

Update imports in all API files to use new types:

```typescript
// Before
import { Profile, Education, WorkExperience, Client } from '@app/types/portfolio';

// After
import {
  Profile,
  Education,
  WorkExperience,
  Position,
  Technologies,
  ClientReference,
} from '@app/types/portfolio';
```

### Step 2: Update Profile API

**File**: `src/features/Profile/api/profileApi.ts`

The profile API should work with minimal changes since only `carousel` → `galleryImages` changed:

```typescript
import { ProfileSchema } from '@app/schemas';

export const fetchProfile = async (locale: string): Promise<Profile> => {
  const response = await GithubApiClient.get<unknown>(`${locale}/profile.json`);

  // Zod validation will now expect galleryImages
  return ProfileSchema.parse(response);
};
```

### Step 3: Update Education API

**File**: `src/features/Education/api/educationApi.ts`

```typescript
import { EducationSchema } from '@app/schemas';
import { Education } from '@app/types/portfolio';

export const fetchEducation = async (locale: string): Promise<Education[]> => {
  const response = await GithubApiClient.get<unknown>(`${locale}/education.json`);

  // Zod validation will now expect:
  // - id (required)
  // - institution (not location)
  // - startDate/endDate (not start/end)
  // - certificateUrl (not certificate)
  return EducationSchema.parse(response);
};
```

### Step 4: Update WorkExperience API

**File**: `src/features/WorkExperience/api/workExperienceApi.ts`

```typescript
import { WorkExperienceSchema } from '@app/schemas';
import { WorkExperience } from '@app/types/portfolio';

export const fetchWorkExperience = async (locale: string): Promise<WorkExperience[]> => {
  const response = await GithubApiClient.get<unknown>(`${locale}/workxp.json`);

  // Zod validation will now expect:
  // - No clients array
  // - Positions with technologies object
  // - Positions with client reference
  // - startDate/endDate instead of start/end
  return WorkExperienceSchema.parse(response);
};
```

### Step 5: Update Mock API for E2E Tests

If there's mock API logic for E2E tests, update it:

**File**: `src/test-utils/mocks/` or similar

```typescript
// Ensure mock responses match new structure
export const mockProfile = {
  // ...
  galleryImages: ['url1', 'url2'], // Not carousel
  // ...
};

export const mockEducation = [
  {
    id: 'uuid-here',
    institution: 'Udemy', // Not location
    startDate: '2021-04', // Not start
    endDate: null,
    certificateUrl: 'https://...', // Not certificate
    // ...
  },
];
```

### Step 6: Update Error Handling

Ensure error messages reflect new field names:

```typescript
try {
  return EducationSchema.parse(response);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Error messages will now reference new field names
    // e.g., "institution is required" not "location is required"
    console.error('Validation error:', error.errors);
  }
  throw error;
}
```

### Step 7: Verification

```bash
yarn typecheck
yarn test src/features/*/api
```

---

## Files to Modify

- `src/features/Profile/api/profileApi.ts`
- `src/features/Education/api/educationApi.ts`
- `src/features/WorkExperience/api/workExperienceApi.ts`
- `src/test-utils/mocks/` (if applicable)

---

## Acceptance Criteria

- [x] All API files import updated types
- [x] Profile API handles `galleryImages`
- [x] Education API handles new field names
- [x] WorkExperience API handles new structure (no clients)
- [x] Zod validation works with new schemas
- [x] Mock API responses updated (if applicable)
- [x] All API tests pass
- [x] No TypeScript errors

---

## Implementation Notes

- **Minimal code changes**: The API client functions themselves should need minimal changes - most of the work is in the schemas and types. The main job here is ensuring imports are correct.
- **Zod validation**: The Zod `.parse()` calls will automatically use the updated schemas, providing validation for the new structure.
- **Error messages**: Zod error messages will automatically reflect new field names since schemas are updated.

---

## Dependencies

- [TASK-179](./TASK-179-update-typescript-types.md) - Types must be updated first
- [TASK-180](./TASK-180-update-zod-schemas.md) - Schemas must be updated first
- [TASK-181](./TASK-181-update-redux-selectors.md) - Selectors should be updated

---

## Next Steps

- [TASK-183](./TASK-183-update-ui-components.md) - Update UI Components for New Field Names

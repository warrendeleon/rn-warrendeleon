# TASK-162: Integrate Validation into API Layer

**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1.5h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Add Zod validation to API fetch functions so data is validated before being stored in Redux.

---

## Prerequisites

- [ ] TASK-159, TASK-160, TASK-161 completed (all schemas exist)

---

## Step-by-Step Instructions

### Step 1: Update Profile API

**File: `src/features/Profile/api/api.ts`**

Add validation after fetching:

```typescript
import { ProfileSchema } from '@app/schemas';

export const fetchProfileData = async (language: string): Promise<AxiosResponse<Profile>> => {
  if (isE2EMockEnabled) {
    // ... existing mock code ...
  }

  const response = await GithubApiClient.get<unknown>(`/${language}/profile.json`);

  // Validate response data
  const validatedData = ProfileSchema.parse(response.data);

  return {
    ...response,
    data: validatedData,
  };
};
```

---

### Step 2: Update Education API

**File: `src/features/Education/api/api.ts`**

```typescript
import { EducationSchema } from '@app/schemas';

export const fetchEducationData = async (language: string): Promise<AxiosResponse<Education[]>> => {
  if (isE2EMockEnabled) {
    // ... existing mock code ...
  }

  const response = await GithubApiClient.get<unknown>(`/${language}/education.json`);

  // Validate response data
  const validatedData = EducationSchema.parse(response.data);

  return {
    ...response,
    data: validatedData,
  };
};
```

---

### Step 3: Update Work Experience API

**File: `src/features/WorkExperience/api/api.ts`**

```typescript
import { WorkExperienceSchema } from '@app/schemas';

export const fetchWorkExperienceData = async (
  language: string
): Promise<AxiosResponse<WorkExperience[]>> => {
  if (isE2EMockEnabled) {
    // ... existing mock code ...
  }

  const response = await GithubApiClient.get<unknown>(`/${language}/work-experience.json`);

  // Validate response data
  const validatedData = WorkExperienceSchema.parse(response.data);

  return {
    ...response,
    data: validatedData,
  };
};
```

---

### Step 4: Handle Validation Errors

Update Redux thunks to handle Zod errors gracefully:

```typescript
// In actions.ts files
import { ZodError } from 'zod';

// In the catch block:
if (error instanceof ZodError) {
  const message = error.errors.map(e => `${e.path}: ${e.message}`).join(', ');
  return rejectWithValue(`Invalid data: ${message}`);
}
```

---

### Step 5: Test All APIs

```bash
yarn ios
```

Navigate through the app and verify:

- Profile data loads correctly
- Education data loads correctly
- Work experience data loads correctly

---

### Step 6: Run Tests

```bash
yarn test
```

Update any failing tests to handle the new validation.

---

### Step 7: Commit

```bash
git add src/features/*/api/api.ts
git commit -m "✨ feat(api): integrate Zod validation into API layer

- Validate Profile API response with ProfileSchema
- Validate Education API response with EducationSchema
- Validate WorkExperience API response with WorkExperienceSchema
- Data is validated before storing in Redux

Part of EPIC-018: Zod Schema Validation Integration
TASK-162"
```

---

## Verification Checklist

- [ ] Profile API validates response
- [ ] Education API validates response
- [ ] Work Experience API validates response
- [ ] App runs without errors
- [ ] Tests pass

---

## What Success Looks Like

When validation fails (e.g., missing field in GitHub JSON):

```
Error: Invalid data: email: Invalid email address, location.city: City is required
```

Instead of:

```
TypeError: Cannot read property 'city' of undefined
```

---

## Next Steps

- [TASK-163](./TASK-163-test-zod-schemas.md) - Add Tests for Zod Schemas

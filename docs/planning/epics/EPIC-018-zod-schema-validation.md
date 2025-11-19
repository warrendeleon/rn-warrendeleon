# EPIC-018: Zod Schema Validation Integration

**Status**: ✅ Done
**Priority**: Medium
**Estimated Effort**: 8h
**Complexity**: Moderate

---

## What is Zod?

Zod is a **schema validation library** for TypeScript. Think of it like a spell-checker, but for data instead of words. It checks that the data your app receives (from APIs, user input, config files) matches the shape you expect.

### Simple Example

```typescript
// Without Zod - TypeScript only checks at compile time
type User = { name: string; age: number };
const user: User = JSON.parse(response); // ⚠️ No runtime check!

// With Zod - checks at runtime too
const UserSchema = z.object({ name: z.string(), age: z.number() });
const user = UserSchema.parse(JSON.parse(response)); // ✅ Validates data!
```

---

## Why Add Zod to This Project?

### The Problem

Currently, our app **trusts** that data from external sources matches our TypeScript types:

1. **GitHub API responses** - We fetch JSON files and assume they're correct
2. **Environment variables** - We manually check each one in `env.ts`
3. **Navigation parameters** - We trust route params match expected types

TypeScript only validates at **compile time** (when you write code). It cannot check data at **runtime** (when the app runs). This means:

- If a GitHub JSON file has a typo, the app might crash
- If an environment variable is missing, we get unhelpful errors
- If data structure changes, we won't know until something breaks

### The Solution

Zod validates data at **runtime**, catching errors before they cause problems:

- ✅ Clear error messages: "Expected string, received number at path: profile.email"
- ✅ Single source of truth: Schema defines both validation AND TypeScript types
- ✅ Better developer experience: Errors are caught early with helpful messages

---

## Pros and Cons

### ✅ Pros (Benefits)

| Benefit                    | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| **Runtime Validation**     | Catches errors that TypeScript misses when app is running                                  |
| **Single Source of Truth** | One schema generates both validation rules AND TypeScript types                            |
| **Better Error Messages**  | Instead of "Cannot read property of undefined", you get "Expected string at profile.email" |
| **Type Inference**         | TypeScript types are automatically created from schemas                                    |
| **Composable**             | Build complex schemas from simple building blocks                                          |
| **Transform Data**         | Clean/modify data during validation (trim strings, parse dates)                            |
| **Well Maintained**        | Active development, large community, excellent documentation                               |
| **Zero Dependencies**      | Zod has no dependencies, reducing security risks                                           |

### ❌ Cons (Drawbacks)

| Drawback                     | Description                          | Mitigation                               |
| ---------------------------- | ------------------------------------ | ---------------------------------------- |
| **Bundle Size**              | Adds ~12-50KB to app size            | Tree-shaking removes unused code         |
| **Learning Curve**           | New syntax to learn                  | Good documentation, many examples        |
| **Slightly Verbose**         | More code than raw types             | Better safety is worth it                |
| **Migration Effort**         | Need to convert existing types       | Do it incrementally                      |
| **Overkill for Simple Apps** | May be unnecessary for tiny projects | This project has grown enough to benefit |

---

## What Will Be Validated

### 1. Environment Configuration

**Current**: Manual `if` checks in `src/config/env.ts`
**With Zod**: Single schema validates all env vars at app startup

### 2. Profile API Response

**Current**: Trust `GithubApiClient.get<Profile>()` returns correct shape
**With Zod**: Validate every field before storing in Redux

### 3. Education API Response

**Current**: Trust API returns array of education items
**With Zod**: Validate each education entry has required fields

### 4. Work Experience API Response

**Current**: Trust API returns array of work experience items
**With Zod**: Validate company names, dates, descriptions exist

---

## Tasks

| Task ID                                                        | Title                               | Effort | Priority | Description                             |
| -------------------------------------------------------------- | ----------------------------------- | ------ | -------- | --------------------------------------- |
| [TASK-157](../tasks/TASK-157-install-configure-zod.md)         | Install and Configure Zod           | 0.5h   | High     | Add Zod to project dependencies         |
| [TASK-158](../tasks/TASK-158-create-env-schema.md)             | Create Environment Config Schema    | 1h     | High     | Replace manual env validation with Zod  |
| [TASK-159](../tasks/TASK-159-create-profile-schema.md)         | Create Profile Schema               | 1.5h   | High     | Schema for profile API response         |
| [TASK-160](../tasks/TASK-160-create-education-schema.md)       | Create Education Schema             | 1h     | High     | Schema for education API response       |
| [TASK-161](../tasks/TASK-161-create-work-experience-schema.md) | Create Work Experience Schema       | 1h     | High     | Schema for work experience API response |
| [TASK-162](../tasks/TASK-162-integrate-api-validation.md)      | Integrate Validation into API Layer | 1.5h   | High     | Add validation to API fetch functions   |
| [TASK-163](../tasks/TASK-163-test-zod-schemas.md)              | Add Tests for Zod Schemas           | 1h     | Medium   | Unit tests for all schemas              |
| [TASK-164](../tasks/TASK-164-update-zod-documentation.md)      | Update Documentation                | 0.5h   | Low      | Document Zod usage patterns             |

---

## Acceptance Criteria

- [x] Zod is installed and configured
- [x] All environment variables validated with Zod schema
- [x] All API responses validated before storing in Redux
- [x] TypeScript types inferred from Zod schemas
- [x] All tests pass with `yarn test`
- [x] No TypeScript errors with `yarn typecheck`
- [x] No ESLint errors with `yarn lint`
- [x] Bundle size increase documented

---

## Technical Architecture

### Directory Structure

```
src/
├── schemas/                    # NEW: Zod schemas
│   ├── index.ts               # Export all schemas
│   ├── env.schema.ts          # Environment config schema
│   ├── profile.schema.ts      # Profile data schema
│   ├── education.schema.ts    # Education data schema
│   └── workExperience.schema.ts # Work experience schema
├── types/
│   └── portfolio.ts           # UPDATED: Import types from schemas
└── config/
    └── env.ts                 # UPDATED: Use Zod schema
```

### Type Inference Pattern

```typescript
// schemas/profile.schema.ts
import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  // ... more fields
});

// TypeScript type is automatically created
export type Profile = z.infer<typeof ProfileSchema>;
```

---

## Expected Bundle Size Impact

| Metric               | Before | After   | Change      |
| -------------------- | ------ | ------- | ----------- |
| JS Bundle (minified) | ~1.2MB | ~1.25MB | +50KB (~4%) |
| Gzipped              | ~350KB | ~365KB  | +15KB (~4%) |

This is acceptable for the validation benefits gained.

---

## Dependencies

- None (Zod has zero dependencies)

## Related

- [TASK-123](../tasks/TASK-123-implement-rtk-query.md) - RTK Query would benefit from Zod integration
- [EPIC-017](../epics/EPIC-017-test-coverage-improvements.md) - Schema tests improve coverage

---

## Glossary

| Term               | Definition                                                    |
| ------------------ | ------------------------------------------------------------- |
| **Schema**         | A blueprint that describes the structure of data              |
| **Validation**     | Checking if data matches expected structure                   |
| **Runtime**        | When the app is actually running (vs when code is written)    |
| **Compile time**   | When TypeScript checks your code before it runs               |
| **Type inference** | Automatically creating TypeScript types from schemas          |
| **Parse**          | Validate data and return it if valid, throw error if not      |
| **SafeParse**      | Validate data and return success/error object (doesn't throw) |

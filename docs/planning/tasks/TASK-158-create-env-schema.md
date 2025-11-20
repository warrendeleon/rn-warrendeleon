# TASK-158: Create Environment Config Schema

**Status**: ✅ Done
**Priority**: High
**Effort**: 1h
**Epic**: [EPIC-018](../epics/EPIC-018-zod-schema-validation.md)

---

## What You'll Do

Replace the manual environment variable validation in `src/config/env.ts` with a Zod schema. This gives us:

- Cleaner, more readable validation code
- Better error messages when env vars are missing
- Single source of truth for env config types

---

## Prerequisites

- [x] TASK-157 completed (Zod installed)
- [x] Understanding of current env.ts file

---

## Background: Current Implementation

The current `src/config/env.ts` validates environment variables manually:

```typescript
// Current approach - manual validation
const validateEnv = (): EnvConfig => {
  const { APP_ENV, API_URL } = Config;

  if (!APP_ENV) {
    throw new Error('APP_ENV is not defined');
  }

  if (!APP_ENV_VALUES.includes(APP_ENV as AppEnv)) {
    throw new Error(`APP_ENV must be one of ${APP_ENV_VALUES.join(', ')}`);
  }

  if (!API_URL) {
    throw new Error('API_URL is not defined');
  }

  return { APP_ENV: APP_ENV as AppEnv, API_URL };
};
```

**Problems with this approach**:

- Repetitive `if` statements
- Type assertions (`as AppEnv`) feel hacky
- Error messages are inconsistent
- Adding new env vars requires lots of boilerplate

---

## Step-by-Step Instructions

### Step 1: Create the Environment Schema File

Create a new file for the environment schema:

**File: `src/schemas/env.schema.ts`**

```typescript
/**
 * Environment Configuration Schema
 *
 * Validates environment variables loaded from .env files via react-native-config.
 * This schema ensures all required variables are present and have correct types.
 *
 * Usage:
 * import { EnvSchema } from '@app/schemas';
 * const env = EnvSchema.parse(Config);
 */

import { z } from 'zod';

/**
 * Valid application environment values
 */
export const APP_ENV_VALUES = ['development', 'production'] as const;

/**
 * Environment Configuration Schema
 *
 * Defines and validates all environment variables:
 * - APP_ENV: The current environment (development or production)
 * - API_URL: The base URL for API requests
 */
export const EnvSchema = z.object({
  /**
   * Application environment
   * Must be either 'development' or 'production'
   */
  APP_ENV: z
    .enum(APP_ENV_VALUES, {
      errorMap: () => ({
        message: `APP_ENV must be one of: ${APP_ENV_VALUES.join(', ')}`,
      }),
    })
    .describe('Application environment (development or production)'),

  /**
   * API base URL
   * Must be a valid URL starting with http:// or https://
   */
  API_URL: z
    .string({
      required_error: 'API_URL is not defined in environment',
    })
    .url({
      message: 'API_URL must be a valid URL',
    })
    .describe('Base URL for API requests'),
});

/**
 * TypeScript type inferred from the schema
 * This replaces the manual EnvConfig interface
 */
export type EnvConfig = z.infer<typeof EnvSchema>;

/**
 * App environment type (union of valid values)
 */
export type AppEnv = EnvConfig['APP_ENV'];
```

---

### Step 2: Update the Schemas Index

Update the index file to export the new schema:

**File: `src/schemas/index.ts`**

```typescript
/**
 * Zod Schema Exports
 */

// Environment configuration schema
export { EnvSchema, APP_ENV_VALUES, type EnvConfig, type AppEnv } from './env.schema';

// Portfolio data schemas (uncomment as they are created)
// export { ProfileSchema, type Profile } from './profile.schema';
// export { EducationSchema, type Education } from './education.schema';
// export { WorkExperienceSchema, type WorkExperience } from './workExperience.schema';
```

---

### Step 3: Update env.ts to Use Zod

Replace the manual validation in `src/config/env.ts`:

**File: `src/config/env.ts`**

```typescript
import Config from 'react-native-config';

import { EnvSchema, type EnvConfig, type AppEnv, APP_ENV_VALUES } from '@app/schemas';

// Re-export types and constants for backward compatibility
export { APP_ENV_VALUES };
export type { EnvConfig, AppEnv };

/**
 * Validate environment configuration using Zod schema
 *
 * This function validates all environment variables at app startup.
 * If any variable is missing or invalid, it throws an error with
 * a detailed message explaining what's wrong.
 */
const validateEnv = (): EnvConfig => {
  // Parse and validate environment variables
  // This throws ZodError if validation fails
  const result = EnvSchema.safeParse(Config);

  if (!result.success) {
    // Format error messages for readability
    const errorMessages = result.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\n` +
        'Check your .env file has all required variables.'
    );
  }

  return result.data;
};

// Cache the validated environment
let cachedEnv: EnvConfig | null = null;

/**
 * Get validated environment configuration
 * Validates once on first call, then returns cached result
 */
export const getEnv = (): EnvConfig => {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
};

// Single source of truth for the resolved env
export const env = getEnv();

// Convenient named exports
export const { APP_ENV, API_URL } = env;

// Optional default export for flexibility
export default env;
```

---

### Step 4: Understand What Changed

#### Before (Manual Validation)

```typescript
if (!APP_ENV) {
  throw new Error('APP_ENV is not defined');
}
if (!APP_ENV_VALUES.includes(APP_ENV as AppEnv)) {
  throw new Error(`APP_ENV must be one of...`);
}
```

#### After (Zod Validation)

```typescript
const result = EnvSchema.safeParse(Config);
if (!result.success) {
  throw new Error(`Environment validation failed:\n${errorMessages}`);
}
return result.data;
```

**Benefits**:

- Less code
- Consistent error format
- Type safety without assertions
- Easy to add new env vars

---

### Step 5: Test the Schema

Run TypeScript to check for errors:

```bash
yarn typecheck
```

**Expected**: No errors.

Run the app to verify env validation works:

```bash
yarn ios
```

**Expected**: App starts normally (env vars are valid).

---

### Step 6: Test Error Handling

Temporarily break the `.env.development` file to test error messages:

1. Open `.env.development`
2. Comment out `API_URL`:
   ```
   APP_ENV=development
   # API_URL=https://...
   ```
3. Run the app: `yarn ios`
4. **Expected error**:

   ```
   Environment validation failed:
     - API_URL: API_URL is not defined in environment

   Check your .env file has all required variables.
   ```

5. Restore `API_URL` in `.env.development`

---

### Step 7: Run Tests

Run the test suite to ensure nothing broke:

```bash
yarn test
```

**Expected**: All tests pass.

If env-related tests fail, they may need to be updated to use the new schema.

---

### Step 8: Commit Changes

```bash
git add src/schemas/env.schema.ts src/schemas/index.ts src/config/env.ts
git commit -m "✨ feat(schemas): add Zod schema for environment validation

- Create EnvSchema with APP_ENV and API_URL validation
- Replace manual if-checks with Zod safeParse
- Export inferred types (EnvConfig, AppEnv)
- Improve error messages with detailed field paths

Part of EPIC-018: Zod Schema Validation Integration
TASK-158"
```

---

## Verification Checklist

- [x] `src/schemas/env.schema.ts` exists with EnvSchema
- [x] `src/schemas/index.ts` exports the schema and types
- [x] `src/config/env.ts` uses EnvSchema.safeParse()
- [x] `yarn typecheck` passes
- [x] `yarn test` passes
- [x] App runs without errors
- [x] Error messages are clear when env vars missing

---

## What Success Looks Like

### Good Error Message (Zod)

```
Environment validation failed:
  - APP_ENV: APP_ENV must be one of: development, production
  - API_URL: API_URL is not defined in environment

Check your .env file has all required variables.
```

### vs. Old Error Message (Manual)

```
APP_ENV is not defined
```

---

## Troubleshooting

### Error: "Cannot find module '@app/schemas'"

**Cause**: Path alias not working.
**Fix**: Ensure `tsconfig.json` has `"@app/*": ["src/*"]` in paths.

### Error: "EnvSchema is not exported"

**Cause**: Forgot to export from index.ts.
**Fix**: Add export in `src/schemas/index.ts`.

### Error: "API_URL must be a valid URL"

**Cause**: API_URL doesn't start with `http://` or `https://`.
**Fix**: Check `.env.development` has full URL like `https://raw.githubusercontent.com/...`

### Tests Fail After Changes

**Cause**: Tests may mock env.ts differently.
**Fix**: Update test mocks to match new export structure.

---

## Adding New Environment Variables

To add a new env var in the future:

1. **Add to schema** (`src/schemas/env.schema.ts`):

   ```typescript
   export const EnvSchema = z.object({
     APP_ENV: z.enum(APP_ENV_VALUES),
     API_URL: z.string().url(),
     NEW_VAR: z.string().optional(), // Add here
   });
   ```

2. **Add to .env files** (`.env.development`, `.env.production`):

   ```
   NEW_VAR=some-value
   ```

3. **TypeScript type updates automatically** (inferred from schema)

That's it! No need to update multiple places.

---

## Next Steps

After completing this task, proceed to:

- [TASK-159](./TASK-159-create-profile-schema.md) - Create Profile Schema

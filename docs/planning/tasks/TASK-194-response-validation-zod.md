# TASK-194: Response Validation with Zod

**Task ID**: TASK-194
**Title**: Response Validation with Zod (All API Responses)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

API responses can be malformed, malicious, or change structure without notice. Validating responses at runtime prevents crashes and security issues caused by unexpected data shapes.

**Why Zod for Response Validation?**:

- Runtime type checking (TypeScript only checks at compile time)
- Automatic type inference (TypeScript types derived from Zod schemas)
- Detailed error messages for debugging
- Transformation and coercion
- Industry standard for runtime validation

**Security Benefits**:

- Prevents injection attacks via malformed responses
- Detects backend compromises (unexpected response structure)
- Fails safely with clear error messages
- Validates data before storing in storage tiers

This task extends TASK-192's Zod schemas to cover all API responses (Supabase Auth, Storage, profile endpoints).

---

## Objective

Expand Zod validation schemas:

1. Create comprehensive schemas for all Supabase endpoints
2. Add validation to all API client methods
3. Create generic validation utilities
4. Add error handling for validation failures
5. Test validation with malformed responses
6. Document schema maintenance process

**Deliverable**: All API responses validated with Zod before use in app.

---

## Implementation Guide

### Schemas Already Created

From TASK-192 (in `src/features/Auth/api/api.ts`):

- ✅ `UserSchema`
- ✅ `SessionSchema`
- ✅ `SignUpRequestSchema` / `SignUpResponseSchema`
- ✅ `SignInRequestSchema` / `SignInResponseSchema`
- ✅ `RefreshTokenResponseSchema`
- ✅ `ErrorResponseSchema`

### Additional Schemas Needed

Create `src/features/Auth/api/schemas.ts`:

```typescript
import { z } from 'zod';

/**
 * Supabase Storage API Schemas (Auth feature)
 */

// Upload Response
export const UploadResponseSchema = z.object({
  Key: z.string(),
  path: z.string().optional(),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;

// File Object
export const FileObjectSchema = z.object({
  name: z.string(),
  id: z.string().uuid().optional(),
  updated_at: z.string().optional(),
  created_at: z.string().optional(),
  last_accessed_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type FileObject = z.infer<typeof FileObjectSchema>;

// Public URL Response
export const PublicURLSchema = z.object({
  publicURL: z.string().url().nullable(),
});

export type PublicURL = z.infer<typeof PublicURLSchema>;

// Profile Update Schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  profilePicture: z.string().url().nullable(),
  authProvider: z.enum(['email', 'linkedin', 'magic_link']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
```

### Generic Validation Utility

Create `/Users/warrendeleon/Developer/warrendeleon/src/utils/validation/validateResponse.ts`:

```typescript
import { z, ZodError } from 'zod';

/**
 * Validate API response with Zod schema
 *
 * @param schema - Zod schema
 * @param data - Response data to validate
 * @param context - Context for error messages (e.g., 'Supabase Auth signUp')
 * @returns Validated and typed data
 * @throws Error if validation fails
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(`[${context}] Response validation failed:`, error.errors);

      // Create user-friendly error message
      const firstError = error.errors[0];
      const fieldPath = firstError.path.join('.');
      throw new Error(`Invalid response from server: ${fieldPath} ${firstError.message}`);
    }

    throw error;
  }
}

/**
 * Validate response and return null on failure (non-critical validation)
 *
 * @param schema - Zod schema
 * @param data - Response data to validate
 * @param context - Context for error messages
 * @returns Validated data or null if validation fails
 */
export function validateResponseSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.warn(`[${context}] Response validation failed (non-critical):`, error);
    return null;
  }
}
```

---

## Updated Auth Client with Validation

Update `src/features/Auth/api/api.ts`:

```typescript
import { validateResponse } from '@app/utils/validation/validateResponse';
import {
  SignUpResponseSchema,
  SignInResponseSchema,
  RefreshTokenResponseSchema,
} from './schemas';

// In signUp method:
async signUp(request: SignUpRequest): Promise<SignUpResponse> {
  try {
    const { data } = await supabase.post('/auth/v1/signup', request);

    // Validate with context
    const validatedData = validateResponse(
      SignUpResponseSchema,
      data,
      'Supabase Auth signUp'
    );

    // Rest of logic...
    return validatedData;
  } catch (error) {
    throw this.handleError(error);
  }
}

// Similar updates for signIn, refreshSession, etc.
```

**Note**: The Auth API client is co-located in `src/features/Auth/api/api.ts` following feature-first architecture (established in TASK-196).

---

## Test Validation

Create `src/utils/validation/__tests__/validateResponse.test.ts` (generic utility test):

Create `src/features/Auth/api/__tests__/schemas.rntl.ts` (Auth-specific schemas test):

```typescript
import { z } from 'zod';
import { validateResponse, validateResponseSafe } from '../validateResponse';

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe('validateResponse', () => {
  it('should validate correct data', () => {
    const data = { name: 'Warren', age: 30 };
    const result = validateResponse(TestSchema, data, 'Test');
    expect(result).toEqual(data);
  });

  it('should throw on invalid data', () => {
    const data = { name: 'Warren', age: 'thirty' }; // age should be number
    expect(() => validateResponse(TestSchema, data, 'Test')).toThrow(
      'Invalid response from server'
    );
  });

  it('should throw on missing required field', () => {
    const data = { name: 'Warren' }; // missing age
    expect(() => validateResponse(TestSchema, data, 'Test')).toThrow(
      'Invalid response from server'
    );
  });
});

describe('validateResponseSafe', () => {
  it('should return null on invalid data', () => {
    const data = { name: 'Warren', age: 'thirty' };
    const result = validateResponseSafe(TestSchema, data, 'Test');
    expect(result).toBeNull();
  });

  it('should return data on valid input', () => {
    const data = { name: 'Warren', age: 30 };
    const result = validateResponseSafe(TestSchema, data, 'Test');
    expect(result).toEqual(data);
  });
});
```

---

## Security Checklist

- [ ] **All API responses** validated before use
- [ ] **Validation failures** logged (without sensitive data)
- [ ] **User-friendly errors** shown on validation failure
- [ ] **Schemas kept up-to-date** with API changes
- [ ] **Tests cover** invalid, missing, and malformed data

---

**Estimated Time**: 2 hours

**Last Updated**: 2025-11-21

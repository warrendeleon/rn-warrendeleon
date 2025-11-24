# TASK-331: Token and Code Validation Schemas

**Task ID**: TASK-331
**Title**: Add Validation Schemas for Tokens, 2FA Codes, and Security Codes
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: High
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-24

---

## Context

As authentication features expand (2FA, password reset, magic links, CSRF protection), we need robust validation for various token and code formats. Currently, we only validate user input (emails, passwords) but not security codes or tokens.

**Security Risk**: Invalid or malformed tokens/codes can lead to:

- Authentication bypasses
- Token confusion attacks
- CSRF vulnerabilities
- Brute-force attacks (weak code formats)

**Missing Validations**:

1. **2FA/TOTP Codes**: 6-digit numeric codes
2. **Password Reset Tokens**: UUID or base64 tokens from email links
3. **Email Verification Tokens**: UUID tokens from verification emails
4. **Session Tokens**: JWT format validation
5. **CSRF Tokens**: Random hex/base64 strings
6. **Magic Link Tokens**: One-time use codes

This task creates Yup validation schemas for all security codes and tokens used in authentication flows.

---

## Objective

Create validation schemas for authentication tokens and security codes:

1. **2FA/TOTP schema** - 6-digit numeric codes
2. **Password reset token schema** - UUID or base64 tokens
3. **Email verification token schema** - UUID tokens
4. **Session token schema** - JWT format validation
5. **CSRF token schema** - Hex/base64 validation
6. **Magic link schema** - One-time code format
7. **PIN code schema** - 6-digit numeric PINs (for biometric fallback)
8. Add tests for all schemas
9. Document usage examples

**Deliverable**: Comprehensive validation schemas for all authentication tokens and codes with clear error messages.

---

## Implementation Guide

### Create Token Validation File

Create `src/features/Auth/validation/tokenSchema.ts`:

```typescript
import * as yup from 'yup';

/**
 * 2FA/TOTP Code Validation Schema
 *
 * Validates 6-digit numeric codes from authenticator apps (Google Authenticator, Authy)
 * Format: 000000-999999
 */
export const totpCodeSchema = yup.object({
  code: yup
    .string()
    .required('2FA code is required')
    .matches(/^\d{6}$/, '2FA code must be exactly 6 digits')
    .length(6, '2FA code must be exactly 6 digits'),
});

export type TotpCodeData = yup.InferType<typeof totpCodeSchema>;

/**
 * Password Reset Token Validation Schema
 *
 * Validates password reset tokens from email links
 * Format: UUID v4 (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
 */
export const passwordResetTokenSchema = yup.object({
  token: yup
    .string()
    .required('Reset token is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Invalid reset token format'
    )
    .length(36, 'Invalid reset token format'),
});

export type PasswordResetTokenData = yup.InferType<typeof passwordResetTokenSchema>;

/**
 * Email Verification Token Validation Schema
 *
 * Validates email verification tokens from confirmation emails
 * Format: UUID v4
 */
export const emailVerificationTokenSchema = yup.object({
  token: yup
    .string()
    .required('Verification token is required')
    .matches(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Invalid verification token format'
    )
    .length(36, 'Invalid verification token format'),
});

export type EmailVerificationTokenData = yup.InferType<typeof emailVerificationTokenSchema>;

/**
 * Session Token (JWT) Validation Schema
 *
 * Validates JWT format (header.payload.signature)
 * Format: Base64.Base64.Base64
 */
export const sessionTokenSchema = yup.object({
  token: yup
    .string()
    .required('Session token is required')
    .matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, 'Invalid session token format')
    .min(50, 'Session token too short')
    .max(2048, 'Session token too long'),
});

export type SessionTokenData = yup.InferType<typeof sessionTokenSchema>;

/**
 * CSRF Token Validation Schema
 *
 * Validates CSRF tokens for state-changing operations
 * Format: 32 character hex string or base64
 */
export const csrfTokenSchema = yup.object({
  token: yup
    .string()
    .required('CSRF token is required')
    .matches(/^[A-Za-z0-9+/=_-]{32,64}$/, 'Invalid CSRF token format')
    .min(32, 'CSRF token too short')
    .max(64, 'CSRF token too long'),
});

export type CsrfTokenData = yup.InferType<typeof csrfTokenSchema>;

/**
 * Magic Link Code Validation Schema
 *
 * Validates magic link one-time codes (passwordless login)
 * Format: 8 character alphanumeric code (e.g., ABC12XYZ)
 */
export const magicLinkCodeSchema = yup.object({
  code: yup
    .string()
    .required('Magic link code is required')
    .matches(/^[A-Z0-9]{8}$/, 'Magic link code must be 8 alphanumeric characters')
    .length(8, 'Magic link code must be exactly 8 characters')
    .uppercase(),
});

export type MagicLinkCodeData = yup.InferType<typeof magicLinkCodeSchema>;

/**
 * PIN Code Validation Schema
 *
 * Validates 6-digit PIN codes (biometric fallback)
 * Format: 000000-999999
 */
export const pinCodeSchema = yup.object({
  pin: yup
    .string()
    .required('PIN is required')
    .matches(/^\d{6}$/, 'PIN must be exactly 6 digits')
    .length(6, 'PIN must be exactly 6 digits')
    .test('not-sequential', 'PIN cannot be sequential (e.g., 123456)', function (value) {
      if (!value) return true;

      // Check for ascending sequential (123456, 234567, etc.)
      const isAscending = value
        .split('')
        .every((digit, i, arr) => i === 0 || parseInt(digit) === parseInt(arr[i - 1]) + 1);

      // Check for descending sequential (654321, 543210, etc.)
      const isDescending = value
        .split('')
        .every((digit, i, arr) => i === 0 || parseInt(digit) === parseInt(arr[i - 1]) - 1);

      return !(isAscending || isDescending);
    })
    .test('not-repeated', 'PIN cannot be all the same digit (e.g., 111111)', function (value) {
      if (!value) return true;
      return !value.split('').every((digit, _, arr) => digit === arr[0]);
    }),
});

export type PinCodeData = yup.InferType<typeof pinCodeSchema>;

/**
 * Refresh Token Validation Schema
 *
 * Validates refresh tokens for obtaining new access tokens
 * Format: Base64 string (longer than access token)
 */
export const refreshTokenSchema = yup.object({
  token: yup
    .string()
    .required('Refresh token is required')
    .matches(/^[A-Za-z0-9+/=_-]+$/, 'Invalid refresh token format')
    .min(64, 'Refresh token too short')
    .max(512, 'Refresh token too long'),
});

export type RefreshTokenData = yup.InferType<typeof refreshTokenSchema>;
```

### Update Index Exports

Modify `src/features/Auth/validation/index.ts`:

```typescript
// Existing exports...

// Token & Code Validation (NEW)
export type {
  TotpCodeData,
  PasswordResetTokenData,
  EmailVerificationTokenData,
  SessionTokenData,
  CsrfTokenData,
  MagicLinkCodeData,
  PinCodeData,
  RefreshTokenData,
} from './tokenSchema';

export {
  totpCodeSchema,
  passwordResetTokenSchema,
  emailVerificationTokenSchema,
  sessionTokenSchema,
  csrfTokenSchema,
  magicLinkCodeSchema,
  pinCodeSchema,
  refreshTokenSchema,
} from './tokenSchema';
```

---

## Files Created/Modified

```
src/features/Auth/validation/
├── tokenSchema.ts                                    # Created (all token/code schemas)
├── index.ts                                          # Modified (export token schemas)
└── __tests__/
    └── tokenSchema.rntl.ts                           # Created (comprehensive tests)
```

---

## Tests

Create `tokenSchema.rntl.ts`:

```typescript
import {
  totpCodeSchema,
  passwordResetTokenSchema,
  emailVerificationTokenSchema,
  sessionTokenSchema,
  csrfTokenSchema,
  magicLinkCodeSchema,
  pinCodeSchema,
  refreshTokenSchema,
} from '../tokenSchema';

describe('tokenSchema', () => {
  describe('totpCodeSchema', () => {
    it('should accept valid 6-digit TOTP code', async () => {
      const data = { code: '123456' };
      await expect(totpCodeSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject code with letters', async () => {
      const data = { code: '12345A' };
      await expect(totpCodeSchema.validate(data)).rejects.toThrow(
        '2FA code must be exactly 6 digits'
      );
    });

    it('should reject code shorter than 6 digits', async () => {
      const data = { code: '12345' };
      await expect(totpCodeSchema.validate(data)).rejects.toThrow(
        '2FA code must be exactly 6 digits'
      );
    });

    it('should reject code longer than 6 digits', async () => {
      const data = { code: '1234567' };
      await expect(totpCodeSchema.validate(data)).rejects.toThrow(
        '2FA code must be exactly 6 digits'
      );
    });
  });

  describe('passwordResetTokenSchema', () => {
    it('should accept valid UUID v4 token', async () => {
      const data = { token: '550e8400-e29b-41d4-a716-446655440000' };
      await expect(passwordResetTokenSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject non-UUID format', async () => {
      const data = { token: 'not-a-uuid' };
      await expect(passwordResetTokenSchema.validate(data)).rejects.toThrow(
        'Invalid reset token format'
      );
    });

    it('should reject UUID v1 (wrong version)', async () => {
      const data = { token: '550e8400-e29b-11d4-a716-446655440000' }; // Version 1
      await expect(passwordResetTokenSchema.validate(data)).rejects.toThrow(
        'Invalid reset token format'
      );
    });
  });

  describe('sessionTokenSchema (JWT)', () => {
    it('should accept valid JWT format', async () => {
      const data = {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
      };
      await expect(sessionTokenSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject malformed JWT (missing parts)', async () => {
      const data = { token: 'header.payload' }; // Missing signature
      await expect(sessionTokenSchema.validate(data)).rejects.toThrow('Session token too short');
    });

    it('should reject token with invalid characters', async () => {
      const data = { token: 'header@.payload#.signature!' };
      await expect(sessionTokenSchema.validate(data)).rejects.toThrow(
        'Invalid session token format'
      );
    });
  });

  describe('pinCodeSchema', () => {
    it('should accept valid 6-digit PIN', async () => {
      const data = { pin: '159357' };
      await expect(pinCodeSchema.validate(data)).resolves.toMatchObject(data);
    });

    it('should reject sequential ascending PIN', async () => {
      const data = { pin: '123456' };
      await expect(pinCodeSchema.validate(data)).rejects.toThrow('PIN cannot be sequential');
    });

    it('should reject sequential descending PIN', async () => {
      const data = { pin: '654321' };
      await expect(pinCodeSchema.validate(data)).rejects.toThrow('PIN cannot be sequential');
    });

    it('should reject repeated digit PIN', async () => {
      const data = { pin: '111111' };
      await expect(pinCodeSchema.validate(data)).rejects.toThrow(
        'PIN cannot be all the same digit'
      );
    });

    it('should reject PIN with letters', async () => {
      const data = { pin: '12345A' };
      await expect(pinCodeSchema.validate(data)).rejects.toThrow('PIN must be exactly 6 digits');
    });
  });

  describe('magicLinkCodeSchema', () => {
    it('should accept valid 8-character alphanumeric code', async () => {
      const data = { code: 'ABC12XYZ' };
      await expect(magicLinkCodeSchema.validate(data)).resolves.toMatchObject({ code: 'ABC12XYZ' });
    });

    it('should uppercase lowercase input', async () => {
      const data = { code: 'abc12xyz' };
      const result = await magicLinkCodeSchema.validate(data);
      expect(result.code).toBe('ABC12XYZ');
    });

    it('should reject code with special characters', async () => {
      const data = { code: 'ABC12!@#' };
      await expect(magicLinkCodeSchema.validate(data)).rejects.toThrow(
        'Magic link code must be 8 alphanumeric characters'
      );
    });

    it('should reject code shorter than 8 characters', async () => {
      const data = { code: 'ABC123' };
      await expect(magicLinkCodeSchema.validate(data)).rejects.toThrow(
        'Magic link code must be exactly 8 characters'
      );
    });
  });
});
```

---

## Usage Examples

### 2FA Code Validation

```typescript
import { totpCodeSchema } from '@app/features/Auth/validation';

const TwoFactorScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(totpCodeSchema),
  });

  const onSubmit = async (data: TotpCodeData) => {
    // Data validated: { code: '123456' }
    await verifyTOTP(data.code);
  };

  return (
    <Controller
      control={control}
      name="code"
      render={({ field }) => (
        <TextInput
          {...field}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
        />
      )}
    />
  );
};
```

### Password Reset Token Validation

```typescript
import { passwordResetTokenSchema } from '@app/features/Auth/validation';

const ResetPasswordScreen = ({ route }) => {
  const { token } = route.params;

  useEffect(() => {
    // Validate token from deep link
    passwordResetTokenSchema
      .validate({ token })
      .then(() => console.log('Token valid'))
      .catch(() => navigation.navigate('InvalidLink'));
  }, [token]);
};
```

---

## Security Checklist

- [ ] **All token formats validated** (UUID, JWT, base64, hex)
- [ ] **Code lengths enforced** (6 digits for TOTP, 8 chars for magic links)
- [ ] **Weak PINs rejected** (sequential, repeated digits)
- [ ] **Input sanitized** (trim, uppercase where appropriate)
- [ ] **Error messages generic** (don't reveal expected format to attackers)
- [ ] **Tests cover edge cases** (too short, too long, invalid characters)

---

**Estimated Time**: 2 hours

**Last Updated**: 2025-11-24

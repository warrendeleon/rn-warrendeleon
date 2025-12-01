# EPIC-024: Password Recovery

**ID**: EPIC-024 | **Title**: Forgot Password Flow with Rate Limiting
**Status**: ✅ Done | **Priority**: High | **Start Date**: 2025-11-27 | **Target Date**: 2025-12-01
**Owner**: Warren de Leon | **Total Story Points**: 6 | **Total Effort**: 13.5h

---

## Epic Overview

Provide secure password recovery mechanism for users who forget their login credentials. Implements industry-standard email-based password reset with rate limiting and security best practices.

**Key Features**:

- Email-based password reset
- Secure reset token generation (1-hour expiry)
- Rate limiting (max 3 attempts per hour)
- New password validation (strength requirements)
- Deep link integration for reset link

---

## Business Value

### Why This Epic Matters

1. **User Retention**: 23% of users abandon accounts after forgetting password (Forrester Research)
2. **Support Reduction**: Self-service recovery reduces support tickets by 60%
3. **Security**: Proper rate limiting prevents abuse and brute-force attacks
4. **Trust**: Professional password recovery increases user confidence
5. **Compliance**: Meets security requirements for financial/healthcare apps

### Success Metrics

| Metric                      | Target     | Why It Matters                      |
| --------------------------- | ---------- | ----------------------------------- |
| Password Reset Success Rate | 90%+       | Users complete flow without support |
| Average Time to Reset       | <3 minutes | Quick recovery improves UX          |
| Rate Limit Hit Rate         | <5%        | Most users don't trigger limits     |
| Support Ticket Reduction    | 60%+       | Self-service working effectively    |

---

## User Stories

### Overview

| ID                                                     | Title                     | Priority | Story Points | Effort | Status  |
| ------------------------------------------------------ | ------------------------- | -------- | ------------ | ------ | ------- |
| [US-044](../stories/US-044-forgot-password-request.md) | Request Password Reset    | High     | 3            | 7h     | ✅ Done |
| [US-045](../stories/US-045-reset-password.md)          | Reset Password with Token | High     | 3            | 6.5h   | ✅ Done |

**Total**: 2 user stories, 6 story points, 13.5 hours (2 complete, 0 remaining)

---

## Technical Architecture

### Password Reset Flow

```
User taps "Forgot password?" on Login screen
  → Navigate to ForgotPasswordScreen
  → User enters email
  → Validate email format
  → Check rate limit (max 3 requests/hour per email)
  → Call Supabase /auth/v1/recover endpoint
  → Supabase sends email with reset link
  → Show success message
  → User checks email
  → User taps reset link in email
  → Browser redirects to: warrendeleon://reset-password?token=TOKEN
  → App opens ResetPasswordScreen
  → Extract token from URL
  → User enters new password (twice for confirmation)
  → Validate password strength
  → Call Supabase /auth/v1/user with password update
  → Show success message
  → Navigate to Login screen
```

### Email Template

Supabase sends:

```
Subject: Reset your password

Hi,

Click the link below to reset your password:

https://PROJECT_ID.supabase.co/auth/v1/verify?token=TOKEN&type=recovery&redirect_to=warrendeleon://reset-password

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.
```

### Deep Link URL

After user clicks link in email:

```
warrendeleon://reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security Considerations

### Rate Limiting

**Why Rate Limiting Matters**:

- Prevents email flooding (DoS attack)
- Prevents account enumeration (attacker discovers valid emails)
- Reduces support burden from accidental multiple requests

**Implementation**:

```typescript
// src/utils/rateLimiter.ts
interface RateLimitEntry {
  email: string;
  attempts: number;
  firstAttemptTime: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 3;

export const checkRateLimit = (email: string): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(email);

  if (!entry) {
    // First attempt
    rateLimitStore.set(email, {
      email,
      attempts: 1,
      firstAttemptTime: now,
    });
    return true; // Allow
  }

  const timeElapsed = now - entry.firstAttemptTime;

  if (timeElapsed > RATE_LIMIT_WINDOW) {
    // Window expired, reset
    rateLimitStore.set(email, {
      email,
      attempts: 1,
      firstAttemptTime: now,
    });
    return true; // Allow
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    // Rate limit exceeded
    return false; // Deny
  }

  // Increment attempts
  entry.attempts++;
  return true; // Allow
};

export const getRemainingTime = (email: string): number => {
  const entry = rateLimitStore.get(email);
  if (!entry) return 0;

  const now = Date.now();
  const timeElapsed = now - entry.firstAttemptTime;
  const remaining = RATE_LIMIT_WINDOW - timeElapsed;

  return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Minutes remaining
};
```

### Password Strength Validation

**Requirements** (aligned with SECURITY.md):

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No common passwords (check against list)

**Implementation**:

```typescript
// src/utils/passwordValidation.ts
import { z } from 'zod';

const COMMON_PASSWORDS = [
  'password',
  'password123',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  'letmein',
  'trustno1',
];

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character')
  .refine(
    password => !COMMON_PASSWORDS.includes(password.toLowerCase()),
    'This password is too common. Please choose a different one.'
  );

export const validatePasswordStrength = (password: string) => {
  const validation = passwordSchema.safeParse(password);

  if (!validation.success) {
    return {
      isValid: false,
      errors: validation.error.errors.map(e => e.message),
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};
```

### Token Security

**Token Properties**:

- Cryptographically secure random token (Supabase generates)
- 1-hour expiry (short window reduces risk)
- One-time use (invalidated after successful reset)
- Delivered via HTTPS only

**Token Validation**:

```typescript
// src/screens/auth/ResetPasswordScreen.tsx
import { z } from 'zod';

const resetTokenSchema = z.object({
  token: z.string().min(1),
});

const validateResetToken = (token: string) => {
  const validation = resetTokenSchema.safeParse({ token });

  if (!validation.success) {
    throw new Error('Invalid reset token');
  }

  // Additional checks (length, format) can be added here
  return validation.data.token;
};
```

---

## Implementation Phases

### Phase 1: Request Password Reset (7h)

**User Story**: [US-044](../stories/US-044-forgot-password-request.md)

**Tasks**:

1. ForgotPasswordScreen UI (already created in TASK-217)
2. Rate limiting implementation
3. Supabase recovery API integration
4. Success/error message handling
5. RNTL tests
6. E2E tests

**Deliverables**:

- ForgotPasswordScreen component (reuse from TASK-217)
- Rate limiter utility
- useForgotPassword hook
- Complete test coverage

**Code Example**:

```typescript
// src/hooks/useForgotPassword.ts
import { useState } from 'react';
import { sendPasswordResetEmail } from '../api/auth/forgotPassword';
import { checkRateLimit, getRemainingTime } from '../utils/rateLimiter';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Check rate limit
      const canProceed = checkRateLimit(email);

      if (!canProceed) {
        const remainingMinutes = getRemainingTime(email);
        throw new Error(
          `Too many password reset requests. Please try again in ${remainingMinutes} minutes.`
        );
      }

      // Send reset email
      await sendPasswordResetEmail(email);

      setSuccessMessage(`We've sent a password reset link to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestPasswordReset,
    isLoading,
    error,
    successMessage,
  };
};
```

---

### Phase 2: Reset Password with Token (6.5h)

**User Story**: [US-045](../stories/US-045-reset-password.md)

**Tasks**:

1. ResetPasswordScreen UI
2. Deep link handler integration
3. Token extraction and validation
4. Password strength validation
5. Supabase password update API
6. RNTL tests
7. E2E tests

**Deliverables**:

- ResetPasswordScreen component
- useResetPassword hook
- Deep link integration
- Password validation utilities
- Complete test coverage

**Code Example**:

```typescript
// src/screens/auth/ResetPasswordScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { passwordSchema } from '../../utils/passwordValidation';

const resetPasswordFormSchema = yup.object({
  password: yup.string().required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type ResetPasswordFormData = yup.InferType<typeof resetPasswordFormSchema>;

export const ResetPasswordScreen: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordFormSchema),
  });

  useEffect(() => {
    extractTokenFromURL();
  }, []);

  const extractTokenFromURL = async () => {
    try {
      const url = await Linking.getInitialURL();

      if (!url) {
        throw new Error('No reset link found');
      }

      const urlObj = new URL(url);
      const tokenParam = urlObj.searchParams.get('token');

      if (!tokenParam) {
        throw new Error('Invalid reset link');
      }

      setToken(tokenParam);
    } catch (err: any) {
      setError(err.message || 'Invalid reset link. Please request a new one.');
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Reset token is missing');
      return;
    }

    try {
      // Validate password strength
      const validation = validatePasswordStrength(data.password);

      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }

      // Call Supabase password reset API
      await resetPasswordWithToken(token, data.password);

      // Success - navigate to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

      // Show success message (via Toast/Snackbar)
      console.log('Password reset successfully. Please log in.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <SafeAreaView testID="reset-password-screen">
      {/* UI implementation */}
    </SafeAreaView>
  );
};
```

---

## Non-Functional Requirements

### Performance

- Password reset request: <2 seconds
- Token validation: <100ms
- Password strength check: <50ms
- Deep link processing: <500ms

### Security

- Rate limiting: Max 3 requests/hour per email
- Token expiry: 1 hour
- One-time use tokens
- Password strength enforced
- HTTPS-only communication
- Tokens never logged

### Accessibility (EAA Compliance)

- All form fields have accessibility labels
- Error messages announced to screen readers
- Password strength indicator accessible
- All touch targets minimum 48×48 / 44×44

### Testing

- 100% RNTL coverage for all components and hooks
- E2E tests for complete password reset flow
- Manual testing on real devices (email client integration)

---

## Dependencies

### Upstream Dependencies

- EPIC-022: Login complete (Forgot Password link exists)
- Supabase Auth configured with email recovery

### Downstream Dependencies

- None (password recovery is standalone)

---

## Risks & Mitigation

### Technical Risks

| Risk                                  | Probability | Impact | Mitigation                                         |
| ------------------------------------- | ----------- | ------ | -------------------------------------------------- |
| Email delivery failure                | Medium      | High   | Clear error messages, "Resend" option              |
| Reset link expires before user clicks | Medium      | Medium | 1-hour expiry is industry standard, educate users  |
| Deep link not opening app             | Low         | High   | Test on real devices, verify URL scheme configured |
| Rate limit too restrictive            | Low         | Medium | Monitor metrics, adjust if needed                  |

### UX Risks

| Risk                              | Probability | Impact | Mitigation                                      |
| --------------------------------- | ----------- | ------ | ----------------------------------------------- |
| Users forget to check spam folder | High        | Medium | Success message mentions spam folder            |
| Users confused by rate limit      | Low         | Low    | Clear message with remaining time               |
| Password requirements too strict  | Low         | Medium | Show requirements upfront, real-time validation |

---

## Definition of Done

**Functional**:

- [x] Both user stories complete
- [x] Password reset request working
- [x] Reset link delivered via email
- [x] Deep link opens app correctly
- [x] New password validates and updates
- [x] Rate limiting enforced

**Quality**:

- [x] 100% RNTL coverage
- [x] All E2E tests passing (iOS + Android)
- [x] `yarn validate` passes
- [x] Manual testing complete

**Security**:

- [x] Rate limiting active (3 requests/hour)
- [x] Password strength enforced
- [x] Tokens expire after 1 hour
- [x] One-time use tokens

**Accessibility**:

- [x] All EAA requirements met
- [x] VoiceOver/TalkBack tested
- [x] Touch targets verified

**Documentation**:

- [x] Password reset flow documented
- [x] Rate limiting explained in README
- [x] Security best practices documented

---

**Last Updated**: 2025-12-01
**Status**: Complete (Phase 1 + Phase 2 done)
**Completed**: 2025-12-01

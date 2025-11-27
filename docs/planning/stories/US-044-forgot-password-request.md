# US-044: Request Password Reset

**ID**: US-044 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **Title**: Forgot Password - Request Reset Link
**Status**: ⏳ In Progress | **Priority**: High | **Story Points**: 3 | **Effort**: 7h

---

## User Story

**As a** registered user who forgot my password
**I want to** request a password reset link via email
**So that** I can regain access to my account without contacting support

---

## Acceptance Criteria

### Functional Requirements

1. **Forgot Password Access**
   - [ ] "Forgot password?" link visible on LoginScreen
   - [ ] Link styled as blue, underlined text below password field
   - [ ] Tapping link navigates to ForgotPasswordScreen

2. **ForgotPasswordScreen**
   - [ ] Screen title: "Reset Password"
   - [ ] Email input field with validation
   - [ ] "Send Reset Link" submit button
   - [ ] Back button to return to LoginScreen

3. **Email Validation**
   - [ ] Email field validates format: `name@domain.com`
   - [ ] Real-time validation on blur (debounced 500ms)
   - [ ] Error shown if invalid: "Please enter a valid email address"
   - [ ] Submit button disabled until email is valid

4. **Rate Limiting**
   - [ ] Max 3 reset requests per email per hour
   - [ ] If limit exceeded: Show error "Too many password reset requests. Please try again in X minutes."
   - [ ] Rate limit window: 60 minutes (sliding window)
   - [ ] Rate limit stored client-side (memory, resets on app close)

5. **Password Reset Request**
   - [ ] On submit:
     - Check rate limit for email
     - Call Supabase `/auth/v1/recover` endpoint
     - Show loading indicator during API call
     - On success: Show success message, disable submit button
     - On failure: Show error message
   - [ ] Success message:
     ```
     We've sent a password reset link to {email}.
     Please check your inbox and spam folder.
     The link will expire in 1 hour.
     ```
   - [ ] Success UI: Green checkmark icon, message, "Back to Login" button

6. **Security Considerations**
   - [ ] No account enumeration (same message for valid/invalid emails)
   - [ ] Rate limiting enforced (3 requests/hour)
   - [ ] Email sent via Supabase (secure, HTTPS)
   - [ ] Reset token expires in 1 hour

### Non-Functional Requirements

1. **Performance**
   - [ ] Email validation: <50ms
   - [ ] API call: <2 seconds
   - [ ] Rate limit check: <10ms

2. **Accessibility (EAA)**
   - [ ] Email field has `accessibilityLabel="Email address"`
   - [ ] Submit button has `accessibilityHint="Send password reset link"`
   - [ ] Success/error messages have `accessibilityRole="alert"`
   - [ ] Loading state announced: "Sending reset link"

3. **Testing**
   - [ ] 100% RNTL coverage for ForgotPasswordScreen
   - [ ] E2E test for complete forgot password flow
   - [ ] Security test: Verify rate limiting works

---

## Technical Implementation

### Component Structure

```typescript
// src/screens/auth/ForgotPasswordScreen.tsx

ForgotPasswordScreen
├── Header (Back button, "Reset Password" title)
├── Description ("Enter your email to receive a reset link")
├── Form (React Hook Form)
│   ├── EmailInput (validated, real-time feedback)
│   └── ErrorMessage (validation errors)
├── SubmitButton ("Send Reset Link", disabled until valid)
├── LoadingIndicator (during API call)
└── SuccessMessage (green checkmark, message, "Back to Login" button)
```

### Data Flow

```
User taps "Forgot password?" on LoginScreen
  → Navigate to ForgotPasswordScreen
  → User enters email address
  → Real-time validation (onBlur, debounced 500ms)
  → User taps "Send Reset Link"
  → Check rate limit (max 3 requests/hour for this email)
  → If rate limit exceeded:
    → Show error: "Too many requests. Try again in X minutes."
    → Abort
  → If rate limit OK:
    → Increment rate limit counter
    → Show loading indicator
    → Call Supabase /auth/v1/recover endpoint
    → On success:
      → Hide form
      → Show success message with green checkmark
      → Disable submit button
      → User taps "Back to Login" → Navigate to LoginScreen
    → On failure:
      → Show error message (generic for security)
      → Allow retry
```

### Rate Limiter Implementation

```typescript
// src/utils/rateLimiter.ts

interface RateLimitEntry {
  email: string;
  attempts: number;
  firstAttemptTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

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

### Supabase Password Recovery API

```typescript
// src/api/auth/forgotPassword.ts

import axios from 'axios';
import Config from 'react-native-config';
import { z } from 'zod';

const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const forgotPasswordResponseSchema = z.object({
  // Supabase returns empty response on success
});

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    // Validate input
    const validatedData = forgotPasswordRequestSchema.parse({ email });

    // Call Supabase recovery endpoint
    const response = await axios.post(
      `${Config.SUPABASE_URL}/auth/v1/recover`,
      {
        email: validatedData.email,
        options: {
          redirectTo: 'warrendeleon://reset-password', // Deep link to app
        },
      },
      {
        headers: {
          apikey: Config.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Supabase returns 200 for both valid and invalid emails (prevent enumeration)
    if (response.status !== 200) {
      throw new Error('Failed to send reset email');
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
    throw error;
  }
};
```

### useForgotPassword Hook

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

      setSuccessMessage(
        `We've sent a password reset link to ${email}. Please check your inbox and spam folder. The link will expire in 1 hour.`
      );
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

## Tasks Breakdown

| Task ID  | Description                       | Effort |
| -------- | --------------------------------- | ------ |
| TASK-252 | ForgotPasswordScreen UI           | 1.5h   |
| TASK-253 | Rate Limiter Implementation       | 1.5h   |
| TASK-254 | Supabase Recovery API Integration | 2h     |
| TASK-255 | Forgot Password RNTL Tests        | 1.5h   |
| TASK-256 | Forgot Password E2E Tests         | 0.5h   |

**Total**: 5 tasks, 7 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/screens/auth/__tests__/ForgotPasswordScreen.test.tsx`

```typescript
describe('ForgotPasswordScreen', () => {
  it('should render email input and submit button', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('send-reset-link-button')).toBeTruthy();
  });

  it('should disable submit button when email is invalid', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'invalid-email');

    expect(getByTestId('send-reset-link-button')).toBeDisabled();
  });

  it('should enable submit button when email is valid', () => {
    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    expect(getByTestId('send-reset-link-button')).toBeEnabled();
  });

  it('should call sendPasswordResetEmail when form is submitted', async () => {
    mockForgotPasswordAPI.sendPasswordResetEmail.mockResolvedValue();

    const { getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-reset-link-button'));

    await waitFor(() => {
      expect(mockForgotPasswordAPI.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('should show success message after sending reset link', async () => {
    mockForgotPasswordAPI.sendPasswordResetEmail.mockResolvedValue();

    const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-reset-link-button'));

    await waitFor(() => {
      expect(
        getByText(/We've sent a password reset link to user@example.com/)
      ).toBeTruthy();
    });
  });

  it('should enforce rate limiting (3 requests per hour)', async () => {
    mockForgotPasswordAPI.sendPasswordResetEmail.mockResolvedValue();

    const { getByTestId } = render(<ForgotPasswordScreen />);

    // Make 3 successful requests
    for (let i = 0; i < 3; i++) {
      fireEvent.changeText(getByTestId('email-input'), 'user@example.com');
      fireEvent.press(getByTestId('send-reset-link-button'));
      await waitFor(() => {
        expect(mockForgotPasswordAPI.sendPasswordResetEmail).toHaveBeenCalled();
      });
    }

    // 4th request should be blocked
    fireEvent.press(getByTestId('send-reset-link-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent(
        /Too many password reset requests/
      );
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `e2e/features/forgot-password.feature`

```gherkin
Feature: Forgot Password

  Background:
    Given I am on the Login screen

  Scenario: Request password reset
    When I tap "Forgot password?"
    Then I should see the Forgot Password screen
    When I enter email "user@example.com"
    And I tap "Send Reset Link"
    Then I should see "We've sent a password reset link to user@example.com"
    And I should see "Back to Login" button

  Scenario: Invalid email format
    When I tap "Forgot password?"
    And I enter email "invalid-email"
    And I tap "Send Reset Link"
    Then I should see "Please enter a valid email address"

  Scenario: Rate limiting
    When I tap "Forgot password?"
    And I enter email "user@example.com"
    And I tap "Send Reset Link" 3 times
    Then I should see "Too many password reset requests"
```

---

## Dependencies

**Upstream**:

- EPIC-022: Login (ForgotPasswordScreen linked from LoginScreen)
- Supabase Auth configured with email recovery

**Downstream**:

- US-045: Reset Password (uses reset token from email)

---

## Risks & Mitigation

| Risk                              | Probability | Impact | Mitigation                                             |
| --------------------------------- | ----------- | ------ | ------------------------------------------------------ |
| Email not delivered (spam folder) | Medium      | High   | Success message mentions spam folder                   |
| Rate limit too restrictive        | Low         | Medium | Monitor metrics, adjust if needed (3/hour is standard) |
| Users forget to check email       | Medium      | Medium | Clear instructions, "Resend" option after 5 minutes    |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Flow working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] Rate limiting enforced (3 requests/hour)
- [ ] No account enumeration
- [ ] Reset tokens expire after 1 hour

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-024](../epics/EPIC-024-password-recovery.md), [US-045](US-045-reset-password.md)

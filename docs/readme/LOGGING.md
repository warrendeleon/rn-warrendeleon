# Logging Guide

Use the logger utility instead of `console.log`. It masks sensitive data automatically.

## Table of Contents

- [Overview](#overview)
- [Logger Utility](#logger-utility)
- [Automatic PII Masking](#automatic-pii-masking)
- [Usage Examples](#usage-examples)
- [ESLint Enforcement](#eslint-enforcement)
- [Direct Masking](#direct-masking)
- [Why This Matters](#why-this-matters)

---

## Overview

Direct `console.*` calls are blocked by ESLint. Try it and you'll see:

```
Use logError/logWarning/logDebug from @app/utils/logger instead of console.* for automatic PII masking.
```

---

## Logger Utility

### Location

```
src/utils/logger.ts
```

### Available Functions

```typescript
import { logError, logWarning, logDebug } from '@app/utils/logger';

// Error logging (console.error equivalent)
logError('Authentication failed', error, { userId: '123' });

// Warning logging (console.warn equivalent)
logWarning('Rate limit approaching', { remaining: 10 });

// Debug logging (console.log equivalent)
logDebug('User action', { action: 'button_click', screen: 'Home' });
```

### Behaviour

| Mode        | Output                               |
| ----------- | ------------------------------------ |
| Development | Logs to console with `[DEV]` prefix  |
| Production  | Silently ignored (no console output) |
| All modes   | Sensitive data automatically masked  |

---

## Automatic PII Masking

The logger sanitises everything before it hits the console:

### Tokens and Secrets

| Data Type     | Example Input               | Masked Output              |
| ------------- | --------------------------- | -------------------------- |
| JWT tokens    | `eyJhbGciOiJIUzI1NiIs...`   | `[MASKED_TOKEN]`           |
| Bearer tokens | `Bearer eyJhbGc...`         | `Bearer [MASKED_TOKEN]`    |
| `password`    | `{ password: 'secret' }`    | `{ password: '[MASKED]' }` |
| `token`       | `{ token: 'abc123' }`       | `{ token: '[MASKED]' }`    |
| `apiKey`      | `{ apiKey: 'sk_live_...' }` | `{ apiKey: '[MASKED]' }`   |

### Personal Information

| Data Type       | Example Input                | Masked Output                     |
| --------------- | ---------------------------- | --------------------------------- |
| Email addresses | `user@example.com`           | `[MASKED_EMAIL]`                  |
| Phone numbers   | `+447123456789`              | `[MASKED_PHONE]`                  |
| Addresses       | `{ address: '123 Main St' }` | `{ address: '[MASKED_ADDRESS]' }` |
| Credit cards    | `4111-1111-1111-1111`        | `[MASKED_CARD]`                   |
| SSN/NI numbers  | `123-45-6789`                | `[MASKED_SSN]`                    |

### Sensitive Field Names

Any field with these names gets masked, regardless of content:

**Authentication:**

- `password`, `newPassword`, `currentPassword`, `confirmPassword`, `oldPassword`
- `token`, `accessToken`, `refreshToken`, `authToken`, `bearerToken`, `idToken`, `sessionToken`
- `secret`, `apiKey`, `apiSecret`, `pin`

**Personal Data:**

- `email`, `emailAddress`, `userEmail`, `contactEmail`
- `phone`, `phoneNumber`, `mobile`, `mobileNumber`, `telephone`, `cell`, `cellPhone`
- `address`, `streetAddress`, `street`, `addressLine1`, `addressLine2`, `fullAddress`, `homeAddress`, `billingAddress`, `shippingAddress`

**Financial:**

- `cvv`, `cvc`, `securityCode`, `creditCard`, `cardNumber`, `accountNumber`
- `ssn`, `socialSecurityNumber`, `taxId`

---

## Usage Examples

### Basic Logging

```typescript
import { logError, logWarning, logDebug } from '@app/utils/logger';

// Simple message
logDebug('Component mounted');

// With data (email automatically masked)
logDebug('User logged in', { userId: '123', email: 'user@test.com' });
// Output: [DEV] User logged in { userId: '123', email: '[MASKED_EMAIL]' }
```

### Error Handling

```typescript
try {
  await authenticateUser(email, password);
} catch (error) {
  logError('Authentication failed', error, { email, attemptedAt: new Date() });
  // Output: [DEV] Authentication failed [Error] { email: '[MASKED_EMAIL]', attemptedAt: ... }
}
```

### API Response Logging

```typescript
const response = await fetchUserProfile();
logDebug('Profile fetched', response);
// Sensitive fields in response are automatically masked
```

### Nested Data

```typescript
const userData = {
  user: {
    email: 'test@example.com',
    profile: {
      address: '123 Main Street',
      phone: '+447123456789',
    },
  },
  action: 'update',
};

logWarning('Profile update', userData);
// Output: [DEV] Profile update {
//   user: {
//     email: '[MASKED_EMAIL]',
//     profile: {
//       address: '[MASKED_ADDRESS]',
//       phone: '[MASKED_PHONE]'
//     }
//   },
//   action: 'update'
// }
```

---

## ESLint Enforcement

The `no-restricted-syntax` rule blocks direct console usage:

```typescript
// Will fail linting
console.log('Debug info');
console.error('Error occurred');

// Correct approach
logDebug('Debug info');
logError('Error occurred');
```

### Exceptions

The following files are exempt from the rule:

| File/Pattern          | Reason                    |
| --------------------- | ------------------------- |
| `src/utils/logger.ts` | The logger utility itself |
| `jest.setup.ts`       | Test setup                |
| `scripts/**/*.js`     | CLI scripts               |
| `src/test-utils/**`   | Test utilities            |
| `**/__tests__/**`     | Test files                |

---

## Direct Masking

If you need to mask data without logging it:

```typescript
import { maskSensitiveData, maskAndStringify } from '@app/utils/logging/maskSensitiveData';

// Mask and return same structure
const masked = maskSensitiveData({ email: 'user@test.com', name: 'John' });
// Result: { email: '[MASKED_EMAIL]', name: 'John' }

// Mask and convert to string
const maskedString = maskAndStringify(sensitiveObject);
```

---

## Why This Matters

### GDPR Compliance

PII must not appear in logs that could be accessed or exported. Automatic masking ensures compliance even if developers forget.

### Security

Tokens and passwords in logs are a security vulnerability. If logs are compromised, masked data remains protected.

### Production Safety

Even if logs leak (error reporting services, log aggregators), sensitive data is already masked.

### Consistency

All developers use the same logging approach, ensuring uniform protection across the codebase.

---

## Quick Reference

```typescript
import { logError, logWarning, logDebug } from '@app/utils/logger';

// Instead of console.log
logDebug('message', data);

// Instead of console.warn
logWarning('message', context);

// Instead of console.error
logError('message', error, context);
```

**Remember:** The logger only outputs in development mode (`__DEV__`). Production builds produce no console output.

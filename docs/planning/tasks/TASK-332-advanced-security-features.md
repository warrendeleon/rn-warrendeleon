# TASK-332: Advanced Security Features

**Task ID**: TASK-332
**Title**: Implement Advanced Security Features (Optional)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: Low (Optional)
**Effort**: 6 hours
**Owner**: Warren de Leon
**Created**: 2025-11-24

---

## Context

This task covers **advanced security features** that go beyond basic validation. These are optional enhancements that significantly improve security but require additional libraries, API integrations, or complex implementations.

**Features in Scope**:

1. **Password Strength Meter** - Real-time visual feedback (zxcvbn)
2. **Breach Detection** - Have I Been Pwned API integration
3. **Password Expiry Policies** - Force password change after N days
4. **Account Lockout Validation** - Prevent brute-force attempts
5. **Device Fingerprinting** - Detect suspicious login patterns
6. **Biometric Validation Schemas** - TouchID/FaceID result validation

**Security Benefits**:

- Educates users about password strength in real-time
- Prevents compromised passwords (850M+ breaches in HIBP database)
- Enforces password rotation policies
- Detects and blocks brute-force attacks
- Identifies account takeover attempts

**Trade-offs**: Higher implementation complexity, external dependencies, potential UX friction (password expiry, lockouts).

This task is marked **optional** and can be implemented incrementally or deferred to post-MVP.

---

## Objective

Implement advanced security features to enhance authentication security:

1. **Password Strength Meter** (Priority: High)
   - Integrate zxcvbn for real-time strength calculation
   - Display visual meter (weak/fair/strong/very strong)
   - Show actionable suggestions to improve password

2. **Breach Detection** (Priority: Medium)
   - Integrate Have I Been Pwned (HIBP) Pwned Passwords API
   - Check passwords against 850M+ breached passwords
   - Use k-anonymity to protect user privacy

3. **Password Expiry** (Priority: Low)
   - Add `passwordExpiresAt` field to user schema
   - Force password change after configurable period (e.g., 90 days)
   - Show "password expires in X days" warning

4. **Account Lockout** (Priority: Medium)
   - Track failed login attempts (Redis or Supabase)
   - Lockout after N failed attempts (e.g., 5)
   - Implement exponential backoff
   - Email user about suspicious activity

5. **Device Fingerprinting** (Priority: Low)
   - Generate device fingerprint (device ID + app version + IP)
   - Detect new devices and require additional verification
   - Store trusted devices per user

6. **Biometric Validation** (Priority: Medium)
   - Create schemas for biometric results
   - Validate TouchID/FaceID authentication responses
   - Handle biometric fallback scenarios

**Deliverable**: Advanced security features integrated with clear documentation and configuration options.

---

## Implementation Guide

### 1. Password Strength Meter (zxcvbn)

#### Install zxcvbn

```bash
yarn add zxcvbn
yarn add -D @types/zxcvbn
```

#### Create Strength Meter Component

Create `src/features/Auth/components/PasswordStrengthMeter.tsx`:

```typescript
import React from 'react';
import zxcvbn from 'zxcvbn';
import { Box, Text, HStack } from '@gluestack-ui/themed';

interface PasswordStrengthMeterProps {
  password: string;
  userInputs?: string[]; // User's name, email for personalized checking
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  userInputs = [],
}) => {
  if (!password) return null;

  const result = zxcvbn(password, userInputs);
  const { score, feedback } = result;

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['red', 'orange', 'yellow', 'lime', 'green'];

  return (
    <Box mt="$2">
      <HStack space="xs">
        {[0, 1, 2, 3, 4].map(level => (
          <Box
            key={level}
            flex={1}
            h="$1"
            bg={level <= score ? strengthColors[score] : 'gray'}
            borderRadius="$sm"
          />
        ))}
      </HStack>
      <Text size="sm" color="$textLight600" mt="$1">
        Strength: {strengthLabels[score]}
      </Text>
      {feedback.suggestions.length > 0 && (
        <Text size="xs" color="$textLight500" mt="$1">
          Tip: {feedback.suggestions[0]}
        </Text>
      )}
    </Box>
  );
};
```

#### Usage in Registration Form

```typescript
<Controller
  control={control}
  name="password"
  render={({ field: { onChange, value } }) => (
    <>
      <InputField
        placeholder="Password"
        secureTextEntry
        onChangeText={onChange}
        value={value}
      />
      <PasswordStrengthMeter
        password={value}
        userInputs={[watch('firstName'), watch('lastName'), watch('email')]}
      />
    </>
  )}
/>
```

---

### 2. Have I Been Pwned Integration

#### Create HIBP API Client

Create `src/services/hibpClient.ts`:

```typescript
import axios from 'axios';
import { sha1 } from 'crypto-js';

/**
 * Check if password has been compromised using HIBP Pwned Passwords API
 *
 * Uses k-anonymity model: Only sends first 5 chars of SHA-1 hash,
 * searches locally for full hash in response
 *
 * @param password - Password to check
 * @returns Number of times password appears in breaches (0 = safe)
 */
export async function checkPwnedPassword(password: string): Promise<number> {
  // Hash password with SHA-1
  const hash = sha1(password).toString().toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  try {
    // Send only first 5 chars to HIBP
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);

    // Response format: "SUFFIX:COUNT\n" for each matching hash
    const hashes = response.data.split('\n');

    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return parseInt(count, 10);
      }
    }

    return 0; // Not found in breaches
  } catch (error) {
    console.error('[HIBP] API error:', error);
    return 0; // Fail open (don't block registration on API error)
  }
}
```

#### Add Custom Yup Method

```typescript
yup.addMethod<yup.StringSchema>(
  yup.string,
  'notPwned',
  function (
    message = 'This password has been compromised in a data breach. Please choose a different one.'
  ) {
    return this.test('not-pwned', message, async function (value) {
      const { path, createError } = this;

      if (!value) return true;

      const pwnCount = await checkPwnedPassword(value);

      if (pwnCount > 0) {
        return createError({
          path,
          message: `This password has appeared in ${pwnCount.toLocaleString()} data breaches`,
        });
      }

      return true;
    });
  }
);
```

**Note**: Use `.notPwned()` in registration schema (async validation).

---

### 3. Password Expiry Policies

#### Add to Registration Schema

```typescript
export const passwordExpirySchema = yup.object({
  passwordExpiresAt: yup
    .date()
    .required('Password expiry date is required')
    .min(new Date(), 'Password expiry date must be in the future'),

  daysSinceLastChange: yup
    .number()
    .required()
    .min(0)
    .max(90, 'Password must be changed every 90 days'),
});
```

#### Add Warning Component

```typescript
const PasswordExpiryWarning: React.FC<{ expiresAt: Date }> = ({ expiresAt }) => {
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysRemaining > 14) return null;

  return (
    <Alert status="warning">
      <AlertIcon />
      <AlertText>Your password expires in {daysRemaining} days. Please change it soon.</AlertText>
    </Alert>
  );
};
```

---

### 4. Account Lockout Validation

#### Create Lockout Schema

```typescript
export const accountLockoutSchema = yup.object({
  failedAttempts: yup.number().required().min(0).max(5, 'Account locked after 5 failed attempts'),

  lockedUntil: yup
    .date()
    .nullable()
    .test('is-locked', 'Account is temporarily locked', function (value) {
      if (!value) return true; // Not locked
      return value <= new Date(); // Lock expired
    }),

  lockoutDuration: yup
    .number()
    .required()
    .positive()
    .integer()
    .max(3600, 'Lockout cannot exceed 1 hour'),
});
```

---

### 5. Device Fingerprinting

#### Generate Device Fingerprint

```typescript
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export async function generateDeviceFingerprint(): Promise<string> {
  const deviceId = await DeviceInfo.getUniqueId();
  const deviceModel = await DeviceInfo.getModel();
  const systemVersion = await DeviceInfo.getSystemVersion();
  const appVersion = DeviceInfo.getVersion();

  const fingerprint = {
    deviceId,
    deviceModel,
    systemVersion,
    appVersion,
    platform: Platform.OS,
  };

  // Create hash of fingerprint components
  return sha256(JSON.stringify(fingerprint)).toString();
}
```

#### Trusted Device Schema

```typescript
export const trustedDeviceSchema = yup.object({
  deviceFingerprint: yup.string().required().length(64, 'Invalid device fingerprint'),
  deviceName: yup.string().required().max(100),
  lastSeenAt: yup.date().required(),
  isTrusted: yup.boolean().required(),
});
```

---

### 6. Biometric Validation Schemas

```typescript
export const biometricResultSchema = yup.object({
  success: yup.boolean().required(),
  biometryType: yup
    .string()
    .oneOf(['FaceID', 'TouchID', 'Fingerprint', 'Iris'], 'Invalid biometry type'),
  error: yup.string().when('success', {
    is: false,
    then: schema => schema.required('Error message required when authentication fails'),
  }),
});
```

---

## Files Created/Modified

```
src/features/Auth/
├── components/
│   └── PasswordStrengthMeter.tsx                     # Created
├── validation/
│   ├── customRules.ts                                # Modified (add notPwned)
│   ├── advancedSecuritySchema.ts                     # Created
│   └── __tests__/
│       └── advancedSecuritySchema.rntl.ts            # Created
└── services/
    ├── hibpClient.ts                                 # Created
    ├── deviceFingerprint.ts                          # Created
    └── __tests__/
        ├── hibpClient.test.ts                        # Created
        └── deviceFingerprint.test.ts                 # Created
```

---

## Tests

Test HIBP integration:

```typescript
import { checkPwnedPassword } from '../hibpClient';

describe('checkPwnedPassword', () => {
  it('should detect commonly breached password', async () => {
    const count = await checkPwnedPassword('password123');
    expect(count).toBeGreaterThan(0);
  }, 10000); // Allow 10s timeout for API call

  it('should return 0 for strong unique password', async () => {
    const count = await checkPwnedPassword('Xq9#mK2$zR7!wP3@vF8%jL4');
    expect(count).toBe(0);
  });
});
```

---

## Security Checklist

- [ ] **Password strength meter** integrated with zxcvbn
- [ ] **HIBP API** uses k-anonymity (only sends hash prefix)
- [ ] **Password expiry** enforced after 90 days (configurable)
- [ ] **Account lockout** after 5 failed attempts
- [ ] **Device fingerprinting** detects new devices
- [ ] **Biometric results** validated before granting access
- [ ] **Error handling** graceful (fail open on API errors)
- [ ] **Privacy preserved** (no passwords sent to HIBP)

---

## Alternative Approaches

### Alternative 1: Skip HIBP Integration

Rely only on common password list (TASK-329).

**Pros**: No external dependency, faster, no privacy concerns
**Cons**: Only blocks top 10K, HIBP has 850M+ passwords

**Decision**: Implement HIBP as optional feature (can be disabled via config).

### Alternative 2: Client-Side Password Expiry Only

Don't enforce server-side expiry, only show warnings.

**Pros**: Simpler implementation
**Cons**: Not enforceable, users can ignore

**Decision**: Implement server-side enforcement for production apps.

---

**Estimated Time**: 6 hours (incremental implementation recommended)

**Last Updated**: 2025-11-24

# US-040: Change PIN

**ID**: US-040 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **Title**: Change 6-Digit PIN
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 4 | **Effort**: 9h

---

## User Story

**As a** registered user
**I want to** change my 6-digit PIN
**So that** I can update my security credentials if I suspect my PIN has been compromised or I want a more memorable PIN

---

## Acceptance Criteria

### Functional Requirements

1. **Current PIN Verification**
   - [ ] User must enter current PIN before changing
   - [ ] Current PIN is validated against bcrypt hash in Keychain
   - [ ] Invalid current PIN shows error message: "Current PIN is incorrect"
   - [ ] After 5 failed attempts, user is locked out for 15 minutes

2. **New PIN Validation**
   - [ ] New PIN must be exactly 6 digits
   - [ ] New PIN cannot be weak (000000, 123456, 111111, etc.)
   - [ ] New PIN cannot match current PIN
   - [ ] User must enter new PIN twice for confirmation
   - [ ] Confirmation PIN must match new PIN

3. **PIN Change Flow**
   - [ ] User navigates to Settings → Security → Change PIN
   - [ ] ChangePINScreen displays three input fields:
     - Current PIN (secured, dots)
     - New PIN (secured, dots)
     - Confirm New PIN (secured, dots)
   - [ ] Submit button disabled until all three fields are valid
   - [ ] On submit:
     - Verify current PIN
     - Validate new PIN (strength checks)
     - Hash new PIN with bcrypt (10 rounds)
     - Store new hash in Keychain
     - Clear Redux state (force re-authentication if needed)
     - Show success message: "PIN changed successfully"
     - Navigate back to SettingsScreen

4. **Security**
   - [ ] All PIN operations use bcrypt hashing (10 rounds)
   - [ ] PINs never logged or exposed in Redux
   - [ ] Old PIN hash backed up before change (rollback on error)
   - [ ] Keychain storage uses `WHEN_UNLOCKED_THIS_DEVICE_ONLY`

### Non-Functional Requirements

1. **Performance**
   - [ ] bcrypt hashing completes in <100ms
   - [ ] PIN validation completes in <50ms
   - [ ] Total PIN change operation: <500ms

2. **Accessibility (EAA)**
   - [ ] All input fields have `accessibilityLabel` and `accessibilityHint`
   - [ ] Error messages have `accessibilityRole="alert"`
   - [ ] Success message announced to screen readers
   - [ ] Submit button has `accessibilityState` reflecting disabled state

3. **Testing**
   - [ ] 100% RNTL coverage for ChangePINScreen
   - [ ] E2E test for complete PIN change flow
   - [ ] Security test: Verify old PIN cannot be reused

---

## Technical Implementation

### Component Structure

```typescript
// src/features/Settings/screens/ChangePINScreen.tsx

ChangePINScreen
├── Header (Back button, "Change PIN" title)
├── Form (React Hook Form)
│   ├── CurrentPINInput (secured, 6 digits)
│   ├── NewPINInput (secured, 6 digits, validation)
│   ├── ConfirmNewPINInput (secured, must match new PIN)
│   └── ErrorMessage (validation feedback)
└── SubmitButton ("Change PIN")
```

### Data Flow

```
User navigates to Settings → Change PIN
  → ChangePINScreen mounted
  → User enters current PIN
  → User enters new PIN
  → Real-time validation (weak PIN detection)
  → User confirms new PIN
  → User taps "Change PIN" button
  → Validate current PIN (bcrypt.compare)
  → If invalid: Show error, increment failed attempts
  → If valid: Validate new PIN strength
  → Hash new PIN with bcrypt (10 rounds)
  → Backup old PIN hash (for rollback)
  → Store new PIN hash in Keychain
  → Success: Clear form, show success toast
  → Navigate back to SettingsScreen
```

### Weak PIN Detection

```typescript
// src/utils/pinValidation.ts

const WEAK_PINS = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
  '123123',
  '111222',
  '000123',
  '121212',
  '131313',
  '141414',
  '151515',
  '161616',
  '171717',
  '181818',
  '191919',
  '202020',
];

export const validatePIN = (pin: string): { isValid: boolean; error: string | null } => {
  // Length check
  if (pin.length !== 6) {
    return { isValid: false, error: 'PIN must be exactly 6 digits' };
  }

  // Digit-only check
  if (!/^\d{6}$/.test(pin)) {
    return { isValid: false, error: 'PIN must contain only digits' };
  }

  // Weak PIN check
  if (WEAK_PINS.includes(pin)) {
    return {
      isValid: false,
      error: 'This PIN is too easy to guess. Please choose a different one.',
    };
  }

  // Sequential digits (123456, 234567, etc.)
  const isSequential = /012345|123456|234567|345678|456789|987654|876543|765432|654321|543210/.test(
    pin
  );
  if (isSequential) {
    return { isValid: false, error: 'PIN cannot contain sequential digits' };
  }

  // Repeating patterns (121212, 131313, etc.)
  const isRepeating = /^(\d{2})\1{2}$/.test(pin);
  if (isRepeating) {
    return { isValid: false, error: 'PIN cannot contain repeating patterns' };
  }

  return { isValid: true, error: null };
};
```

### Keychain Storage

```typescript
// src/services/storage/keychainService.ts

import * as Keychain from 'react-native-keychain';
import bcrypt from 'bcryptjs';

export const changePIN = async (currentPIN: string, newPIN: string): Promise<void> => {
  // 1. Get current PIN hash from Keychain
  const credentials = await Keychain.getGenericPassword({
    service: 'auth_pin_hash',
  });

  if (!credentials) {
    throw new Error('No PIN found. Please set up a PIN first.');
  }

  const currentPINHash = credentials.password;

  // 2. Verify current PIN
  const isCurrentPINValid = await bcrypt.compare(currentPIN, currentPINHash);

  if (!isCurrentPINValid) {
    throw new Error('Current PIN is incorrect');
  }

  // 3. Validate new PIN
  const validation = validatePIN(newPIN);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 4. Check new PIN is different from current PIN
  const isSameAsCurrent = await bcrypt.compare(newPIN, currentPINHash);
  if (isSameAsCurrent) {
    throw new Error('New PIN must be different from current PIN');
  }

  // 5. Backup old PIN hash (for rollback on error)
  await Keychain.setGenericPassword('auth_pin_hash_backup', currentPINHash, {
    service: 'auth_pin_hash_backup',
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

  try {
    // 6. Hash new PIN
    const newPINHash = await bcrypt.hash(newPIN, 10);

    // 7. Store new PIN hash in Keychain
    await Keychain.setGenericPassword('auth_pin_hash', newPINHash, {
      service: 'auth_pin_hash',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // 8. Success - delete backup
    await Keychain.resetGenericPassword({ service: 'auth_pin_hash_backup' });
  } catch (error) {
    // Rollback on error
    await Keychain.setGenericPassword('auth_pin_hash', currentPINHash, {
      service: 'auth_pin_hash',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    throw new Error('Failed to change PIN. Please try again.');
  }
};
```

### Rate Limiting (Failed Attempts)

```typescript
// src/utils/pinRateLimiter.ts

interface RateLimitEntry {
  attempts: number;
  firstAttemptTime: number;
  lockoutUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const checkPINAttemptLimit = (
  userId: string
): { allowed: boolean; remainingMinutes?: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry) {
    // First attempt
    rateLimitStore.set(userId, {
      attempts: 1,
      firstAttemptTime: now,
      lockoutUntil: null,
    });
    return { allowed: true };
  }

  // Check if still locked out
  if (entry.lockoutUntil && now < entry.lockoutUntil) {
    const remainingMs = entry.lockoutUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 1000 / 60);
    return { allowed: false, remainingMinutes };
  }

  // Reset lockout if expired
  if (entry.lockoutUntil && now >= entry.lockoutUntil) {
    entry.attempts = 1;
    entry.firstAttemptTime = now;
    entry.lockoutUntil = null;
    return { allowed: true };
  }

  // Increment attempts
  entry.attempts++;

  if (entry.attempts >= MAX_ATTEMPTS) {
    // Lock out user
    entry.lockoutUntil = now + LOCKOUT_DURATION;
    return { allowed: false, remainingMinutes: 15 };
  }

  return { allowed: true };
};

export const resetPINAttempts = (userId: string): void => {
  rateLimitStore.delete(userId);
};
```

---

## Tasks Breakdown

| Task ID  | Description           | Effort |
| -------- | --------------------- | ------ |
| TASK-232 | ChangePINScreen UI    | 2h     |
| TASK-233 | PIN Validation Logic  | 1.5h   |
| TASK-234 | bcrypt Integration    | 1.5h   |
| TASK-235 | Rate Limiting         | 1h     |
| TASK-236 | Change PIN RNTL Tests | 2h     |
| TASK-237 | Change PIN E2E Tests  | 1h     |

**Total**: 6 tasks, 9 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/features/Settings/screens/__tests__/ChangePINScreen.rntl.tsx`

```typescript
describe('ChangePINScreen', () => {
  it('should render all three PIN input fields', () => {
    const { getByTestId } = render(<ChangePINScreen />);

    expect(getByTestId('current-pin-input')).toBeTruthy();
    expect(getByTestId('new-pin-input')).toBeTruthy();
    expect(getByTestId('confirm-new-pin-input')).toBeTruthy();
  });

  it('should disable submit button until all fields are filled', () => {
    const { getByTestId } = render(<ChangePINScreen />);
    const submitButton = getByTestId('change-pin-submit-button');

    expect(submitButton).toBeDisabled();

    // Fill all fields
    fireEvent.changeText(getByTestId('current-pin-input'), '123456');
    fireEvent.changeText(getByTestId('new-pin-input'), '654321');
    fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

    expect(submitButton).toBeEnabled();
  });

  it('should show error when current PIN is incorrect', async () => {
    mockKeychainService.getGenericPassword.mockResolvedValue({
      username: 'auth_pin_hash',
      password: await bcrypt.hash('123456', 10),
    });

    const { getByTestId } = render(<ChangePINScreen />);

    fireEvent.changeText(getByTestId('current-pin-input'), '000000'); // Wrong PIN
    fireEvent.changeText(getByTestId('new-pin-input'), '654321');
    fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
    fireEvent.press(getByTestId('change-pin-submit-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Current PIN is incorrect');
    });
  });

  it('should show error when new PIN is weak', () => {
    const { getByTestId } = render(<ChangePINScreen />);

    fireEvent.changeText(getByTestId('new-pin-input'), '123456'); // Weak PIN

    expect(getByTestId('error-message')).toHaveTextContent('This PIN is too easy to guess');
  });

  it('should show error when PINs do not match', () => {
    const { getByTestId } = render(<ChangePINScreen />);

    fireEvent.changeText(getByTestId('new-pin-input'), '654321');
    fireEvent.changeText(getByTestId('confirm-new-pin-input'), '123456'); // Mismatch

    expect(getByTestId('error-message')).toHaveTextContent('PINs must match');
  });

  it('should successfully change PIN when all validations pass', async () => {
    mockKeychainService.changePIN.mockResolvedValue();

    const { getByTestId } = render(<ChangePINScreen />);

    fireEvent.changeText(getByTestId('current-pin-input'), '123456');
    fireEvent.changeText(getByTestId('new-pin-input'), '654321');
    fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');
    fireEvent.press(getByTestId('change-pin-submit-button'));

    await waitFor(() => {
      expect(mockKeychainService.changePIN).toHaveBeenCalledWith('123456', '654321');
      expect(getByTestId('success-message')).toHaveTextContent('PIN changed successfully');
    });
  });

  it('should lock out user after 5 failed attempts', async () => {
    const { getByTestId } = render(<ChangePINScreen />);

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      fireEvent.changeText(getByTestId('current-pin-input'), '000000');
      fireEvent.press(getByTestId('change-pin-submit-button'));
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    }

    // 6th attempt should be blocked
    fireEvent.changeText(getByTestId('current-pin-input'), '000000');
    fireEvent.press(getByTestId('change-pin-submit-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent(
        'Too many failed attempts. Please try again in 15 minutes.'
      );
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `src/features/Settings/__tests__/ChangePIN/change-pin.feature`

```gherkin
Feature: Change PIN

  Background:
    Given I am logged in with PIN "123456"
    And I am on the Settings screen

  Scenario: Successfully change PIN
    When I tap "Change PIN"
    Then I should see the Change PIN screen
    When I enter current PIN "123456"
    And I enter new PIN "654321"
    And I enter confirm PIN "654321"
    And I tap "Submit"
    Then I should see "PIN changed successfully"
    And I should be navigated back to Settings

  Scenario: Current PIN is incorrect
    When I tap "Change PIN"
    And I enter current PIN "000000"
    And I enter new PIN "654321"
    And I enter confirm PIN "654321"
    And I tap "Submit"
    Then I should see "Current PIN is incorrect"

  Scenario: New PIN is weak
    When I tap "Change PIN"
    And I enter current PIN "123456"
    And I enter new PIN "111111"
    And I enter confirm PIN "111111"
    And I tap "Submit"
    Then I should see "This PIN is too easy to guess"

  Scenario: PINs do not match
    When I tap "Change PIN"
    And I enter current PIN "123456"
    And I enter new PIN "654321"
    And I enter confirm PIN "123456"
    And I tap "Submit"
    Then I should see "PINs must match"

  Scenario: Lockout after 5 failed attempts
    When I tap "Change PIN"
    And I enter incorrect current PIN 5 times
    Then I should see "Too many failed attempts. Please try again in 15 minutes."
    And the Submit button should be disabled
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (PIN setup complete)
- Keychain storage configured

**Downstream**:

- None (Change PIN is standalone)

---

## Risks & Mitigation

| Risk                               | Probability | Impact | Mitigation                                             |
| ---------------------------------- | ----------- | ------ | ------------------------------------------------------ |
| User forgets current PIN           | Medium      | High   | Provide "Forgot PIN?" link → Reset via email           |
| bcrypt hashing slow on old devices | Low         | Medium | Optimize rounds (10 is standard), test on real devices |
| Keychain backup fails              | Low         | High   | Rollback to old PIN hash on error                      |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 6 tasks complete
- [ ] PIN change flow working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] bcrypt hashing (10 rounds)
- [ ] PINs never logged
- [ ] Rate limiting enforced
- [ ] Keychain storage verified

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-023](../epics/EPIC-023-security-settings.md), [US-041](US-041-toggle-biometrics.md)

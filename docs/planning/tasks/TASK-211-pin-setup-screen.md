# TASK-211: 6-Digit PIN Setup Screen

**ID**: TASK-211 | **US**: [US-035](../stories/US-035-biometric-security-setup.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2.5h | **Created**: 2025-11-21

## File Structure

```
src/features/Auth/
└── screens/
    ├── PINSetupScreen.tsx
    └── __tests__/
        └── PINSetupScreen.rntl.tsx
```

**Note**: Screen co-located with Auth feature following feature-first architecture (established in TASK-196).

---

## Context & Background

The 6-digit PIN provides a critical security fallback when biometric authentication is unavailable or declined. Unlike 4-digit PINs (10,000 combinations), 6-digit PINs offer 1,000,000 possible combinations, significantly increasing security.

**Why This Task Matters:**

PIN-based authentication serves multiple purposes:

- **Biometric fallback**: When Face ID/Fingerprint fails or is unavailable
- **Device-agnostic**: Works on all devices regardless of biometric support
- **User preference**: Some users prefer PIN over biometrics
- **Security baseline**: Provides minimum security layer for all users

**Security Considerations:**

1. **Weak PIN detection**: Reject sequential (123456, 654321) and repeated (000000, 111111) patterns
2. **bcrypt hashing**: Never store plain-text PINs (10 rounds, secure salt)
3. **Keychain storage**: Store hashed PIN in hardware-backed Keychain
4. **Rate limiting**: Prevent brute-force attacks (lock after 5 failed attempts)
5. **Secure input**: Display dots instead of numbers during entry

**User Flow:**

1. User navigates to PIN setup (from BiometricSetup or direct navigation)
2. Enters 6-digit PIN
3. System validates PIN strength (rejects weak patterns)
4. User confirms PIN by re-entering
5. System verifies both PINs match
6. PIN hashed with bcrypt (10 rounds)
7. Hashed PIN stored in Keychain
8. Navigate to Home

**Weak PIN Patterns (Must Reject):**

| Pattern               | Examples               | Reason           |
| --------------------- | ---------------------- | ---------------- |
| Sequential ascending  | 123456, 234567, 012345 | Easily guessable |
| Sequential descending | 654321, 543210, 987654 | Easily guessable |
| Repeated digits       | 000000, 111111, 555555 | No entropy       |
| Repeated pairs        | 121212, 454545         | Predictable      |
| Common patterns       | 112233, 123123         | Frequently used  |

---

## Objective

Build secure 6-digit PIN setup screen with:

1. **Custom PIN input**: 6 individual input fields with secure entry
2. **Weak PIN validation**: Reject sequential, repeated, and common patterns
3. **Confirmation flow**: Two-step entry to prevent typos
4. **bcrypt hashing**: Hash PIN with bcrypt (10 rounds) before storage
5. **Keychain storage**: Store hashed PIN securely
6. **Error handling**: Clear error messages for weak/mismatched PINs
7. **Auto-focus**: Automatic field progression during entry
8. **EAA compliance**: Full accessibility support
9. **Testing**: 100% RNTL coverage with all validation scenarios

---

## Detailed Implementation Guide

### Phase 1: PIN Input Component (45 minutes)

**File**: `src/components/auth/PINInput.tsx`

```typescript
import React, { useRef, useState, useEffect } from 'react';
import { HStack, Input, InputField } from '@gluestack-ui/themed';
import { TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

interface PINInputProps {
  /** Number of PIN digits (default: 6) */
  length?: number;
  /** Called when all digits are entered */
  onComplete: (pin: string) => void;
  /** Current PIN value (controlled) */
  value: string;
  /** Called when PIN value changes */
  onChange: (pin: string) => void;
  /** Whether inputs are disabled */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Test ID for E2E tests */
  testID?: string;
}

/**
 * PINInput Component
 *
 * Custom 6-digit PIN input with auto-focus and secure entry.
 *
 * Features:
 * - Individual input fields for each digit
 * - Automatic focus progression
 * - Backspace handling across fields
 * - Secure entry (shows dots)
 * - Paste support (paste 6 digits at once)
 * - Error state styling
 * - EAA compliance
 */
export const PINInput: React.FC<PINInputProps> = ({
  length = 6,
  onComplete,
  value,
  onChange,
  disabled = false,
  error = false,
  testID = 'pin-input',
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));

  // Update digits when value prop changes
  useEffect(() => {
    const newDigits = value.split('').concat(Array(length).fill('')).slice(0, length);
    setDigits(newDigits);
  }, [value, length]);

  /**
   * Handle digit change at specific index
   */
  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow single digit
    const sanitized = digit.replace(/[^0-9]/g, '').slice(0, 1);

    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);

    const newPin = newDigits.join('');
    onChange(newPin);

    // Auto-focus next field
    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits entered
    if (newPin.length === length && newPin.split('').every(d => d !== '')) {
      onComplete(newPin);
    }
  };

  /**
   * Handle backspace key press
   */
  const handleKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      // Move to previous field on backspace if current field is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Handle paste (paste entire PIN at once)
   */
  const handlePaste = (index: number, pastedText: string) => {
    if (disabled) return;

    const sanitized = pastedText.replace(/[^0-9]/g, '').slice(0, length);

    if (sanitized.length === length) {
      const newDigits = sanitized.split('');
      setDigits(newDigits);
      onChange(sanitized);
      onComplete(sanitized);

      // Focus last field
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <HStack space="sm" justifyContent="center" testID={testID}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          width={48}
          height={56}
          borderColor={error ? '$error500' : '$borderLight300'}
          borderWidth={2}
          borderRadius="$md"
          backgroundColor="$backgroundLight0"
          focusStyle={{
            borderColor: error ? '$error500' : '$primary500',
          }}
          isDisabled={disabled}
          testID={`${testID}-digit-${index}`}
        >
          <InputField
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digits[index]}
            onChangeText={(text) => handleChange(index, text)}
            onKeyPress={(e) => handleKeyPress(index, e)}
            onPaste={(e) => {
              if (index === 0) {
                handlePaste(index, e.nativeEvent.text);
              }
            }}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
            textAlign="center"
            fontSize="$2xl"
            fontWeight="$bold"
            accessibilityLabel={`PIN digit ${index + 1} of ${length}`}
            accessibilityRole="none"
            style={{ minHeight: 48 }}
          />
        </Input>
      ))}
    </HStack>
  );
};
```

### Phase 2: PIN Validation Logic (30 minutes)

**File**: `src/utils/pinValidation.ts`

```typescript
/**
 * PIN validation utilities
 *
 * Detects weak PIN patterns:
 * - Sequential ascending (123456)
 * - Sequential descending (654321)
 * - Repeated digits (000000)
 * - Repeated pairs (121212)
 * - Common patterns (112233)
 */

export interface PINValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Check if PIN is sequential ascending
 */
const isSequentialAscending = (pin: string): boolean => {
  const digits = pin.split('').map(Number);

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== (digits[i - 1] + 1) % 10) {
      return false;
    }
  }

  return true;
};

/**
 * Check if PIN is sequential descending
 */
const isSequentialDescending = (pin: string): boolean => {
  const digits = pin.split('').map(Number);

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== (digits[i - 1] - 1 + 10) % 10) {
      return false;
    }
  }

  return true;
};

/**
 * Check if all digits are the same
 */
const isRepeatedDigits = (pin: string): boolean => {
  return new Set(pin.split('')).size === 1;
};

/**
 * Check if PIN is repeated pairs (e.g., 121212, 454545)
 */
const isRepeatedPairs = (pin: string): boolean => {
  if (pin.length % 2 !== 0) return false;

  const pair = pin.slice(0, 2);
  const expectedPin = pair.repeat(pin.length / 2);

  return pin === expectedPin;
};

/**
 * Check if PIN has common weak pattern
 */
const hasCommonPattern = (pin: string): boolean => {
  const commonPatterns = ['112233', '123123', '111222', '000111', '999888'];

  return commonPatterns.includes(pin);
};

/**
 * Validate PIN strength
 *
 * @param pin - 6-digit PIN string
 * @returns Validation result with error message if invalid
 */
export const validatePIN = (pin: string): PINValidationResult => {
  // Check length
  if (pin.length !== 6) {
    return {
      isValid: false,
      error: 'PIN must be exactly 6 digits',
    };
  }

  // Check if all digits
  if (!/^\d{6}$/.test(pin)) {
    return {
      isValid: false,
      error: 'PIN must contain only numbers',
    };
  }

  // Check sequential ascending
  if (isSequentialAscending(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be sequential (e.g., 123456)',
    };
  }

  // Check sequential descending
  if (isSequentialDescending(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be sequential (e.g., 654321)',
    };
  }

  // Check repeated digits
  if (isRepeatedDigits(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be all the same digit (e.g., 000000)',
    };
  }

  // Check repeated pairs
  if (isRepeatedPairs(pin)) {
    return {
      isValid: false,
      error: 'PIN cannot be repeated pairs (e.g., 121212)',
    };
  }

  // Check common patterns
  if (hasCommonPattern(pin)) {
    return {
      isValid: false,
      error: 'PIN is too common. Please choose a different PIN.',
    };
  }

  return { isValid: true };
};

/**
 * Compare two PINs for confirmation
 */
export const comparePINs = (pin1: string, pin2: string): PINValidationResult => {
  if (pin1 !== pin2) {
    return {
      isValid: false,
      error: 'PINs do not match. Please try again.',
    };
  }

  return { isValid: true };
};
```

### Phase 3: bcrypt Hashing Utility (20 minutes)

**File**: `src/utils/pinHashing.ts`

```typescript
import bcrypt from 'react-native-bcrypt';
import * as Keychain from 'react-native-keychain';

const BCRYPT_ROUNDS = 10;
const KEYCHAIN_SERVICE = 'pin_hash';

/**
 * Hash PIN with bcrypt
 *
 * Uses 10 rounds for balance between security and performance.
 * Each round doubles the computation time.
 *
 * @param pin - Plain-text 6-digit PIN
 * @returns Bcrypt hash string
 */
export const hashPIN = async (pin: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hash = await bcrypt.hash(pin, salt);

    console.log('[PIN] PIN hashed successfully');
    return hash;
  } catch (error) {
    console.error('[PIN] Failed to hash PIN:', error);
    throw new Error('Failed to hash PIN');
  }
};

/**
 * Verify PIN against stored hash
 *
 * @param pin - Plain-text PIN to verify
 * @param hash - Stored bcrypt hash
 * @returns True if PIN matches hash
 */
export const verifyPIN = async (pin: string, hash: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(pin, hash);
    return isMatch;
  } catch (error) {
    console.error('[PIN] Failed to verify PIN:', error);
    return false;
  }
};

/**
 * Store hashed PIN in Keychain
 *
 * @param hashedPin - bcrypt hash to store
 */
export const storePINHash = async (hashedPin: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('pin_hash', hashedPin, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    console.log('[PIN] PIN hash stored in Keychain');
  } catch (error) {
    console.error('[PIN] Failed to store PIN hash:', error);
    throw new Error('Failed to store PIN hash');
  }
};

/**
 * Retrieve hashed PIN from Keychain
 *
 * @returns Stored PIN hash or null if not found
 */
export const retrievePINHash = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }

    return null;
  } catch (error) {
    console.error('[PIN] Failed to retrieve PIN hash:', error);
    return null;
  }
};

/**
 * Delete PIN hash from Keychain
 */
export const deletePINHash = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    console.log('[PIN] PIN hash deleted from Keychain');
  } catch (error) {
    console.error('[PIN] Failed to delete PIN hash:', error);
  }
};
```

### Phase 4: PIN Setup Screen Component (45 minutes)

**File**: `src/screens/auth/PINSetupScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  VStack,
  Text,
  Button,
  ButtonText,
  Heading,
  Box,
} from '@gluestack-ui/themed';
import { SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PINInput } from '@/components/auth/PINInput';
import { validatePIN, comparePINs } from '@/utils/pinValidation';
import { hashPIN, storePINHash } from '@/utils/pinHashing';

type PINSetupStep = 'enter' | 'confirm';

/**
 * PINSetupScreen
 *
 * Guides user through 6-digit PIN creation with confirmation.
 *
 * Flow:
 * 1. User enters 6-digit PIN
 * 2. Validate PIN strength (reject weak patterns)
 * 3. Show confirmation screen
 * 4. User re-enters PIN
 * 5. Verify PINs match
 * 6. Hash PIN with bcrypt (10 rounds)
 * 7. Store hashed PIN in Keychain
 * 8. Navigate to Home
 */
export const PINSetupScreen: React.FC = () => {
  const navigation = useNavigation();

  const [step, setStep] = useState<PINSetupStep>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle PIN entry completion (first step)
   */
  const handlePINEnter = (enteredPin: string) => {
    setError(null);

    const validation = validatePIN(enteredPin);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid PIN');
      setPin('');
      return;
    }

    // PIN is strong, proceed to confirmation
    console.log('[PINSetup] PIN validated, moving to confirmation');
    setPin(enteredPin);
    setStep('confirm');
  };

  /**
   * Handle PIN confirmation (second step)
   */
  const handlePINConfirm = async (enteredPin: string) => {
    setError(null);

    const comparison = comparePINs(pin, enteredPin);

    if (!comparison.isValid) {
      setError(comparison.error || 'PINs do not match');
      setConfirmPin('');
      return;
    }

    // PINs match, hash and store
    setIsSubmitting(true);

    try {
      console.log('[PINSetup] Hashing PIN...');
      const hashedPin = await hashPIN(pin);

      console.log('[PINSetup] Storing PIN hash...');
      await storePINHash(hashedPin);

      console.log('[PINSetup] PIN setup complete, navigating to Home');
      navigation.navigate('Home');
    } catch (err) {
      console.error('[PINSetup] Failed to setup PIN:', err);
      setError('Failed to set up PIN. Please try again.');
      setIsSubmitting(false);
    }
  };

  /**
   * Handle back button (return to first step)
   */
  const handleBack = () => {
    setStep('enter');
    setConfirmPin('');
    setError(null);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '$backgroundLight0' }}
      testID="pin-setup-screen"
      accessibilityLabel="PIN setup screen"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <VStack flex={1} padding="$6" space="xl" justifyContent="center">
          {/* Heading */}
          <VStack space="sm" alignItems="center">
            <Heading
              size="2xl"
              textAlign="center"
              accessibilityRole="header"
              accessibilityLabel={step === 'enter' ? 'Create a PIN' : 'Confirm your PIN'}
            >
              {step === 'enter' ? 'Create a PIN' : 'Confirm Your PIN'}
            </Heading>

            <Text
              size="md"
              textAlign="center"
              color="$textLight600"
              paddingHorizontal="$4"
            >
              {step === 'enter'
                ? 'Enter a 6-digit PIN to secure your account'
                : 'Re-enter your PIN to confirm'}
            </Text>
          </VStack>

          {/* PIN Input */}
          <VStack space="md" marginTop="$8">
            <PINInput
              value={step === 'enter' ? pin : confirmPin}
              onChange={step === 'enter' ? setPin : setConfirmPin}
              onComplete={step === 'enter' ? handlePINEnter : handlePINConfirm}
              error={!!error}
              disabled={isSubmitting}
              testID={step === 'enter' ? 'pin-input-enter' : 'pin-input-confirm'}
            />

            {/* Error Message */}
            {error && (
              <Box
                padding="$3"
                backgroundColor="$error50"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$error200"
              >
                <Text color="$error700" size="sm" textAlign="center">
                  {error}
                </Text>
              </Box>
            )}

            {/* Success Message (confirmation step only) */}
            {step === 'confirm' && !error && (
              <Box
                padding="$3"
                backgroundColor="$success50"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$success200"
              >
                <Text color="$success700" size="sm" textAlign="center">
                  ✓ PIN is strong and secure
                </Text>
              </Box>
            )}
          </VStack>

          {/* Back Button (confirmation step only) */}
          {step === 'confirm' && (
            <Button
              onPress={handleBack}
              variant="link"
              isDisabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Go back and change PIN"
              accessibilityHint="Returns to PIN entry screen"
              testID="back-button"
              style={{ minHeight: 48 }}
            >
              <ButtonText>Change PIN</ButtonText>
            </Button>
          )}

          {/* Info Box */}
          <Box
            marginTop="$6"
            padding="$4"
            backgroundColor="$info50"
            borderRadius="$md"
            borderWidth={1}
            borderColor="$info200"
          >
            <Text size="sm" color="$textLight700">
              💡 Avoid sequential (123456) or repeated (000000) digits. Your PIN should be
              unique and memorable.
            </Text>
          </Box>

          {/* Submitting State */}
          {isSubmitting && (
            <Text size="sm" color="$textLight500" textAlign="center">
              Setting up your PIN...
            </Text>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};
```

### Phase 5: Navigation Integration (10 minutes)

**File**: `src/navigation/AppNavigator.tsx`

```typescript
// Add PINSetupScreen to navigation stack
import { PINSetupScreen } from '@/screens/auth/PINSetupScreen';

// In stack navigator
<Stack.Screen
  name="PINSetup"
  component={PINSetupScreen}
  options={{
    headerShown: false,
    gestureEnabled: false, // Prevent back swipe
  }}
/>
```

**File**: `src/types/navigation.ts`

```typescript
export type AuthStackParamList = {
  // ... other screens
  BiometricSetup: undefined;
  PINSetup: undefined;
  Home: undefined;
};
```

---

## Acceptance Criteria

- [ ] 6 individual PIN input fields displayed
- [ ] Secure entry (displays dots instead of numbers)
- [ ] Auto-focus progression across fields
- [ ] Backspace navigates to previous field
- [ ] Paste support (paste entire 6-digit PIN at once)
- [ ] Validates weak PINs:
  - [ ] Rejects sequential ascending (123456)
  - [ ] Rejects sequential descending (654321)
  - [ ] Rejects repeated digits (000000)
  - [ ] Rejects repeated pairs (121212)
  - [ ] Rejects common patterns (112233, 123123)
- [ ] Confirmation screen after initial entry
- [ ] Verifies both PINs match
- [ ] Shows error message for weak PINs
- [ ] Shows error message for mismatched PINs
- [ ] "Change PIN" button returns to first step
- [ ] Hashes PIN with bcrypt (10 rounds) before storage
- [ ] Stores hashed PIN in Keychain (not plain-text)
- [ ] Navigates to Home on successful setup
- [ ] All inputs have minimum 48×48 touch targets (EAA compliance)
- [ ] All elements have proper accessibility labels/hints/roles
- [ ] Screen navigable with screen reader (VoiceOver/TalkBack)
- [ ] 100% RNTL test coverage for all validation scenarios

---

## Testing

**Test File**: `src/screens/auth/__tests__/PINSetupScreen.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { PINSetupScreen } from '../PINSetupScreen';
import { hashPIN, storePINHash } from '@/utils/pinHashing';
import { useNavigation } from '@react-navigation/native';

// Mocks
jest.mock('@/utils/pinHashing');
jest.mock('@react-navigation/native');

const mockHashPIN = hashPIN as jest.MockedFunction<typeof hashPIN>;
const mockStorePINHash = storePINHash as jest.MockedFunction<typeof storePINHash>;
const mockNavigate = jest.fn();

(useNavigation as jest.Mock).mockReturnValue({
  navigate: mockNavigate,
});

describe('PINSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHashPIN.mockResolvedValue('$2a$10$mockHashedPIN');
    mockStorePINHash.mockResolvedValue();
  });

  describe('Initial render', () => {
    it('renders PIN entry screen correctly', () => {
      render(<PINSetupScreen />);

      expect(screen.getByText('Create a PIN')).toBeOnTheScreen();
      expect(screen.getByText('Enter a 6-digit PIN to secure your account')).toBeOnTheScreen();
      expect(screen.getByTestId('pin-input-enter')).toBeOnTheScreen();
    });

    it('renders 6 input fields', () => {
      render(<PINSetupScreen />);

      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`pin-input-enter-digit-${i}`)).toBeOnTheScreen();
      }
    });
  });

  describe('PIN validation', () => {
    it('rejects sequential ascending PIN (123456)', async () => {
      render(<PINSetupScreen />);

      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');
      fireEvent.changeText(inputs[2], '3');
      fireEvent.changeText(inputs[3], '4');
      fireEvent.changeText(inputs[4], '5');
      fireEvent.changeText(inputs[5], '6');

      await waitFor(() => {
        expect(
          screen.getByText('PIN cannot be sequential (e.g., 123456)'),
        ).toBeOnTheScreen();
      });
    });

    it('rejects sequential descending PIN (654321)', async () => {
      render(<PINSetupScreen />);

      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(inputs[0], '6');
      fireEvent.changeText(inputs[1], '5');
      fireEvent.changeText(inputs[2], '4');
      fireEvent.changeText(inputs[3], '3');
      fireEvent.changeText(inputs[4], '2');
      fireEvent.changeText(inputs[5], '1');

      await waitFor(() => {
        expect(
          screen.getByText('PIN cannot be sequential (e.g., 654321)'),
        ).toBeOnTheScreen();
      });
    });

    it('rejects repeated digits (000000)', async () => {
      render(<PINSetupScreen />);

      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      inputs.forEach(input => fireEvent.changeText(input, '0'));

      await waitFor(() => {
        expect(
          screen.getByText('PIN cannot be all the same digit (e.g., 000000)'),
        ).toBeOnTheScreen();
      });
    });

    it('rejects repeated pairs (121212)', async () => {
      render(<PINSetupScreen />);

      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');
      fireEvent.changeText(inputs[2], '1');
      fireEvent.changeText(inputs[3], '2');
      fireEvent.changeText(inputs[4], '1');
      fireEvent.changeText(inputs[5], '2');

      await waitFor(() => {
        expect(
          screen.getByText('PIN cannot be repeated pairs (e.g., 121212)'),
        ).toBeOnTheScreen();
      });
    });

    it('accepts strong PIN (e.g., 159487)', async () => {
      render(<PINSetupScreen />);

      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '5');
      fireEvent.changeText(inputs[2], '9');
      fireEvent.changeText(inputs[3], '4');
      fireEvent.changeText(inputs[4], '8');
      fireEvent.changeText(inputs[5], '7');

      await waitFor(() => {
        expect(screen.getByText('Confirm Your PIN')).toBeOnTheScreen();
        expect(screen.getByText('Re-enter your PIN to confirm')).toBeOnTheScreen();
      });
    });
  });

  describe('PIN confirmation', () => {
    beforeEach(async () => {
      render(<PINSetupScreen />);

      // Enter strong PIN
      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '5');
      fireEvent.changeText(inputs[2], '9');
      fireEvent.changeText(inputs[3], '4');
      fireEvent.changeText(inputs[4], '8');
      fireEvent.changeText(inputs[5], '7');

      await waitFor(() => {
        expect(screen.getByText('Confirm Your PIN')).toBeOnTheScreen();
      });
    });

    it('shows confirmation screen after valid PIN entry', () => {
      expect(screen.getByText('Confirm Your PIN')).toBeOnTheScreen();
      expect(screen.getByTestId('pin-input-confirm')).toBeOnTheScreen();
      expect(screen.getByTestId('back-button')).toBeOnTheScreen();
    });

    it('rejects mismatched PIN', async () => {
      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-confirm-digit-${i}`),
      );

      // Enter different PIN
      fireEvent.changeText(inputs[0], '9');
      fireEvent.changeText(inputs[1], '8');
      fireEvent.changeText(inputs[2], '7');
      fireEvent.changeText(inputs[3], '6');
      fireEvent.changeText(inputs[4], '5');
      fireEvent.changeText(inputs[5], '4');

      await waitFor(() => {
        expect(screen.getByText('PINs do not match. Please try again.')).toBeOnTheScreen();
      });
    });

    it('completes setup when PINs match', async () => {
      const inputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-confirm-digit-${i}`),
      );

      // Enter matching PIN
      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '5');
      fireEvent.changeText(inputs[2], '9');
      fireEvent.changeText(inputs[3], '4');
      fireEvent.changeText(inputs[4], '8');
      fireEvent.changeText(inputs[5], '7');

      await waitFor(() => {
        expect(mockHashPIN).toHaveBeenCalledWith('159487');
        expect(mockStorePINHash).toHaveBeenCalledWith('$2a$10$mockHashedPIN');
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('allows changing PIN via back button', async () => {
      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);

      await waitFor(() => {
        expect(screen.getByText('Create a PIN')).toBeOnTheScreen();
        expect(screen.getByTestId('pin-input-enter')).toBeOnTheScreen();
      });
    });
  });

  describe('Error handling', () => {
    it('shows error when hashing fails', async () => {
      mockHashPIN.mockRejectedValueOnce(new Error('Hashing failed'));

      render(<PINSetupScreen />);

      // Enter and confirm PIN
      const enterInputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-enter-digit-${i}`),
      );

      fireEvent.changeText(enterInputs[0], '1');
      fireEvent.changeText(enterInputs[1], '5');
      fireEvent.changeText(enterInputs[2], '9');
      fireEvent.changeText(enterInputs[3], '4');
      fireEvent.changeText(enterInputs[4], '8');
      fireEvent.changeText(enterInputs[5], '7');

      await waitFor(() => {
        expect(screen.getByText('Confirm Your PIN')).toBeOnTheScreen();
      });

      const confirmInputs = [0, 1, 2, 3, 4, 5].map(i =>
        screen.getByTestId(`pin-input-confirm-digit-${i}`),
      );

      fireEvent.changeText(confirmInputs[0], '1');
      fireEvent.changeText(confirmInputs[1], '5');
      fireEvent.changeText(confirmInputs[2], '9');
      fireEvent.changeText(confirmInputs[3], '4');
      fireEvent.changeText(confirmInputs[4], '8');
      fireEvent.changeText(confirmInputs[5], '7');

      await waitFor(() => {
        expect(screen.getByText('Failed to set up PIN. Please try again.')).toBeOnTheScreen();
      });
    });
  });

  describe('EAA compliance', () => {
    it('has proper accessibility labels on screen', () => {
      render(<PINSetupScreen />);

      const screen = screen.getByTestId('pin-setup-screen');
      expect(screen).toHaveAccessibilityLabel('PIN setup screen');
    });

    it('has proper accessibility on heading', () => {
      render(<PINSetupScreen />);

      const heading = screen.getByText('Create a PIN');
      expect(heading).toHaveAccessibilityRole('header');
      expect(heading).toHaveAccessibilityLabel('Create a PIN');
    });

    it('has proper accessibility on PIN inputs', () => {
      render(<PINSetupScreen />);

      for (let i = 0; i < 6; i++) {
        const input = screen.getByTestId(`pin-input-enter-digit-${i}`);
        expect(input).toHaveAccessibilityLabel(`PIN digit ${i + 1} of 6`);
      }
    });
  });
});
```

---

## Troubleshooting

### Issue: "Auto-focus doesn't work on Android"

**Cause**: Android requires explicit focus management

**Solution**: Ensure `ref` is properly set and `focus()` is called:

```typescript
inputRefs.current[index + 1]?.focus();
```

### Issue: "bcrypt hashing is slow"

**Cause**: bcrypt is intentionally slow for security (10 rounds)

**Solution**: This is expected. Show loading state during hashing:

```typescript
{isSubmitting && <Text>Setting up your PIN...</Text>}
```

### Issue: "Paste doesn't work"

**Cause**: Paste handler only on first input

**Solution**: Ensure paste handler is only attached to first field:

```typescript
if (index === 0) {
  handlePaste(index, e.nativeEvent.text);
}
```

### Issue: "Keychain storage fails on simulator"

**Cause**: Simulator Keychain limitations

**Solution**: Test on real device or reset simulator:

```bash
Device → Erase All Content and Settings
```

### Issue: "PIN validation not working"

**Cause**: Incorrect validation logic

**Solution**: Verify PIN length before validation:

```typescript
if (pin.length !== 6) return;
```

---

**Effort**: 2.5h | **Last Updated**: 2025-11-21

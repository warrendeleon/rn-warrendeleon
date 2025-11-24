# TASK-233: PIN Validation Logic Implementation

**ID**: TASK-233 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## File Structure

```
src/features/Auth/
└── utils/
    ├── pinValidation.ts
    └── __tests__/
        └── pinValidation.test.ts
```

**Note**: PIN validation is Auth-specific functionality (used only for Auth PIN features), so it's co-located with the Auth feature following feature-first architecture (established in TASK-196).

---

## Task Description

Create a comprehensive PIN validation utility that checks for weak/common PIN patterns, sequential digits, repeated digits, and common number sequences. The validator must provide detailed feedback for why a PIN is rejected to help users create secure PINs.

---

## Acceptance Criteria

- [ ] `validatePIN` utility created in `src/features/Auth/utils/pinValidation.ts`
- [ ] Detects sequential patterns (123456, 654321)
- [ ] Detects repeated digits (111111, 000000)
- [ ] Detects common PINs (birthdays like 010190, keyboard patterns like 159753)
- [ ] Returns structured validation result with `isValid` boolean and `error` message
- [ ] Provides specific error messages for each rejection reason
- [ ] Exported and ready for use in forms (Yup integration)
- [ ] TypeScript strict mode compliant
- [ ] 100% unit test coverage

---

## Implementation Details

### Validation Utility

```typescript
// src/features/Auth/utils/pinValidation.ts

export interface PINValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Common weak PINs that should be rejected
 * Includes: sequential, repeated, keyboard patterns, common dates
 */
const WEAK_PINS = new Set<string>([
  // Sequential
  '123456',
  '234567',
  '345678',
  '456789',
  '654321',
  '765432',
  '876543',
  '987654',

  // Repeated digits
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

  // Keyboard patterns
  '147258',
  '258147',
  '159357',
  '357159',
  '147963',
  '369147',
  '159753',
  '357951',

  // Common dates (DDMMYY format)
  '010101',
  '010190',
  '010195',
  '010100',
  '010180',
  '311299',
  '311200',
  '311295',
  '311290',

  // Common patterns
  '121212',
  '123123',
  '112233',
  '101010',
  '696969',
  '420420',
  '123321',
  '456654',
]);

/**
 * Validates PIN strength and security
 *
 * @param pin - 6-digit PIN string to validate
 * @returns Validation result with isValid boolean and optional error message
 *
 * @example
 * const result = validatePIN('123456');
 * if (!result.isValid) {
 *   console.error(result.error); // "This PIN is too easy to guess (sequential digits)"
 * }
 */
export const validatePIN = (pin: string): PINValidationResult => {
  // Check length
  if (pin.length !== 6) {
    return {
      isValid: false,
      error: 'PIN must be exactly 6 digits',
    };
  }

  // Check if all characters are digits
  if (!/^\d{6}$/.test(pin)) {
    return {
      isValid: false,
      error: 'PIN must contain only numbers',
    };
  }

  // Check if PIN is in the weak PINs list
  if (WEAK_PINS.has(pin)) {
    return {
      isValid: false,
      error: 'This PIN is too easy to guess. Please choose a different one.',
    };
  }

  // Check for sequential ascending digits (e.g., 012345, 123456)
  if (isSequentialAscending(pin)) {
    return {
      isValid: false,
      error: 'This PIN contains sequential digits. Please choose a different one.',
    };
  }

  // Check for sequential descending digits (e.g., 654321, 543210)
  if (isSequentialDescending(pin)) {
    return {
      isValid: false,
      error: 'This PIN contains sequential digits. Please choose a different one.',
    };
  }

  // Check for repeated digits (e.g., 111111, 222222)
  if (isRepeatedDigits(pin)) {
    return {
      isValid: false,
      error: 'This PIN contains repeated digits. Please choose a different one.',
    };
  }

  // Check for alternating repeated patterns (e.g., 121212, 343434)
  if (isAlternatingPattern(pin)) {
    return {
      isValid: false,
      error: 'This PIN contains a repeating pattern. Please choose a different one.',
    };
  }

  // Check for mirrored patterns (e.g., 123321, 456654)
  if (isMirroredPattern(pin)) {
    return {
      isValid: false,
      error: 'This PIN contains a mirrored pattern. Please choose a different one.',
    };
  }

  // PIN passed all checks
  return {
    isValid: true,
  };
};

/**
 * Checks if PIN contains sequential ascending digits
 */
const isSequentialAscending = (pin: string): boolean => {
  for (let i = 0; i < pin.length - 1; i++) {
    const current = parseInt(pin[i], 10);
    const next = parseInt(pin[i + 1], 10);

    // Allow wrapping from 9 to 0
    const expectedNext = (current + 1) % 10;

    if (next !== expectedNext) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if PIN contains sequential descending digits
 */
const isSequentialDescending = (pin: string): boolean => {
  for (let i = 0; i < pin.length - 1; i++) {
    const current = parseInt(pin[i], 10);
    const next = parseInt(pin[i + 1], 10);

    // Allow wrapping from 0 to 9
    const expectedNext = current === 0 ? 9 : current - 1;

    if (next !== expectedNext) {
      return false;
    }
  }
  return true;
};

/**
 * Checks if PIN contains all the same digit
 */
const isRepeatedDigits = (pin: string): boolean => {
  const firstDigit = pin[0];
  return pin.split('').every(digit => digit === firstDigit);
};

/**
 * Checks if PIN contains alternating repeated pattern (e.g., 121212, 343434)
 */
const isAlternatingPattern = (pin: string): boolean => {
  // Check if pattern is AB repeated (e.g., 121212)
  if (pin.length === 6) {
    const pattern = pin.substring(0, 2);
    return pin === pattern.repeat(3);
  }
  return false;
};

/**
 * Checks if PIN is a mirrored pattern (e.g., 123321, 456654)
 */
const isMirroredPattern = (pin: string): boolean => {
  const firstHalf = pin.substring(0, 3);
  const secondHalf = pin.substring(3, 6);
  const reversed = secondHalf.split('').reverse().join('');
  return firstHalf === reversed;
};

/**
 * Generates a random secure 6-digit PIN
 * Used for testing purposes
 *
 * @returns A 6-digit PIN string that passes validation
 */
export const generateSecurePIN = (): string => {
  let pin = '';

  // Generate random 6-digit PIN
  while (pin.length < 6) {
    const digit = Math.floor(Math.random() * 10);
    pin += digit.toString();
  }

  // Validate and regenerate if weak
  const validation = validatePIN(pin);
  if (!validation.isValid) {
    return generateSecurePIN(); // Recursively try again
  }

  return pin;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/features/Auth/utils/__tests__/pinValidation.test.ts

import { validatePIN, generateSecurePIN } from '../pinValidation';

describe('validatePIN', () => {
  describe('Length validation', () => {
    it('should reject PINs shorter than 6 digits', () => {
      const result = validatePIN('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PIN must be exactly 6 digits');
    });

    it('should reject PINs longer than 6 digits', () => {
      const result = validatePIN('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PIN must be exactly 6 digits');
    });

    it('should accept PINs with exactly 6 digits', () => {
      const result = validatePIN('147852'); // Random non-weak PIN
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Character validation', () => {
    it('should reject PINs with letters', () => {
      const result = validatePIN('12345a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PIN must contain only numbers');
    });

    it('should reject PINs with special characters', () => {
      const result = validatePIN('12345!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PIN must contain only numbers');
    });

    it('should reject PINs with spaces', () => {
      const result = validatePIN('123 456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('PIN must contain only numbers');
    });
  });

  describe('Sequential digit validation', () => {
    it('should reject ascending sequential PINs', () => {
      expect(validatePIN('123456').isValid).toBe(false);
      expect(validatePIN('234567').isValid).toBe(false);
      expect(validatePIN('345678').isValid).toBe(false);
      expect(validatePIN('456789').isValid).toBe(false);
    });

    it('should reject descending sequential PINs', () => {
      expect(validatePIN('654321').isValid).toBe(false);
      expect(validatePIN('765432').isValid).toBe(false);
      expect(validatePIN('876543').isValid).toBe(false);
      expect(validatePIN('987654').isValid).toBe(false);
    });

    it('should reject wrapping sequential PINs', () => {
      expect(validatePIN('890123').isValid).toBe(false);
      expect(validatePIN('901234').isValid).toBe(false);
    });
  });

  describe('Repeated digit validation', () => {
    it('should reject all same digits', () => {
      expect(validatePIN('000000').isValid).toBe(false);
      expect(validatePIN('111111').isValid).toBe(false);
      expect(validatePIN('222222').isValid).toBe(false);
      expect(validatePIN('999999').isValid).toBe(false);
    });
  });

  describe('Pattern validation', () => {
    it('should reject alternating patterns', () => {
      expect(validatePIN('121212').isValid).toBe(false);
      expect(validatePIN('343434').isValid).toBe(false);
      expect(validatePIN('565656').isValid).toBe(false);
    });

    it('should reject mirrored patterns', () => {
      expect(validatePIN('123321').isValid).toBe(false);
      expect(validatePIN('456654').isValid).toBe(false);
      expect(validatePIN('789987').isValid).toBe(false);
    });

    it('should reject keyboard patterns', () => {
      expect(validatePIN('147258').isValid).toBe(false);
      expect(validatePIN('159357').isValid).toBe(false);
      expect(validatePIN('159753').isValid).toBe(false);
    });
  });

  describe('Common PIN validation', () => {
    it('should reject common date-like PINs', () => {
      expect(validatePIN('010101').isValid).toBe(false);
      expect(validatePIN('010190').isValid).toBe(false);
      expect(validatePIN('311299').isValid).toBe(false);
    });

    it('should reject other common PINs', () => {
      expect(validatePIN('696969').isValid).toBe(false);
      expect(validatePIN('420420').isValid).toBe(false);
    });
  });

  describe('Valid PINs', () => {
    it('should accept strong random PINs', () => {
      expect(validatePIN('147852').isValid).toBe(true);
      expect(validatePIN('639284').isValid).toBe(true);
      expect(validatePIN('582039').isValid).toBe(true);
    });
  });
});

describe('generateSecurePIN', () => {
  it('should generate a 6-digit PIN', () => {
    const pin = generateSecurePIN();
    expect(pin).toHaveLength(6);
    expect(/^\d{6}$/.test(pin)).toBe(true);
  });

  it('should generate a PIN that passes validation', () => {
    const pin = generateSecurePIN();
    const validation = validatePIN(pin);
    expect(validation.isValid).toBe(true);
  });

  it('should generate different PINs on subsequent calls', () => {
    const pin1 = generateSecurePIN();
    const pin2 = generateSecurePIN();
    const pin3 = generateSecurePIN();

    // At least one should be different (extremely unlikely all 3 are the same)
    expect(pin1 !== pin2 || pin2 !== pin3).toBe(true);
  });
});
```

---

## Integration with Yup

The validation utility is designed to integrate seamlessly with Yup schemas used in React Hook Form:

```typescript
// Example usage in ChangePINScreen schema
import * as yup from 'yup';
import { validatePIN } from '../utils/pinValidation';

const changePINSchema = yup.object({
  newPIN: yup
    .string()
    .required('New PIN is required')
    .matches(/^\d{6}$/, 'PIN must be 6 digits')
    .test('pin-strength', 'This PIN is too easy to guess', value => {
      if (!value) return false;
      const validation = validatePIN(value);
      return validation.isValid;
    }),
});
```

---

## Dependencies

- TypeScript 5.8.3
- Jest (for unit testing)

---

## Definition of Done

- [ ] Validation utility implemented with all pattern checks
- [ ] All helper functions implemented and documented
- [ ] TypeScript strict mode compliant
- [ ] 100% unit test coverage achieved
- [ ] All edge cases tested (length, characters, patterns)
- [ ] Integration with Yup validated
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-232](TASK-232-change-pin-ui.md), [TASK-234](TASK-234-bcrypt-integration.md)

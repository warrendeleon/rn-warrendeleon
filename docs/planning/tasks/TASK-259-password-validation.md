# TASK-259: Password Validation Utility

**ID**: TASK-259 | **Epic**: [EPIC-024](../epics/EPIC-024-password-recovery.md) | **User Story**: [US-045](../stories/US-045-reset-password-with-token.md)
**Status**: ✅ Done | **Effort**: 1h

---

## File Structure

```
src/utils/
└── validation/
    ├── passwordValidation.ts
    └── __tests__/
        └── passwordValidation.test.ts
```

**Note**: Password validation is a **correctly centralized** generic validation utility. It's used by multiple features (registration in TASK-195, reset password in TASK-257, change password in TASK-232), making it a cross-cutting concern that belongs in `/src/utils/validation/`.

---

## Task Description

Create a full password validation utility that enforces strong password requirements. Validate minimum length, character variety (uppercase, lowercase, numbers, special characters), and provide detailed feedback for password strength.

---

## Acceptance Criteria

- [x] Password validation utility created in `src/features/Auth/validation/passwordRecoverySchema.ts`
- [x] Minimum 8 characters required
- [x] At least one uppercase letter required
- [x] At least one lowercase letter required
- [x] At least one number required
- [x] At least one special character required (@$!%\*?&)
- [x] Yup schema for React Hook Form integration
- [x] Password strength calculation (Weak, Fair, Good, Strong)
- [x] Clear validation error messages
- [x] TypeScript strict mode compliant
- [x] Unit tests with 100% coverage

---

## Implementation Details

### Password Validation Utility

```typescript
// src/utils/validation/passwordValidation.ts

import * as yup from 'yup';

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 'weak',
  FAIR = 'fair',
  GOOD = 'good',
  STRONG = 'strong',
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
  score: number; // 0-100
}

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '@$!%*?&',
};

/**
 * Regular expressions for password validation
 */
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  specialChar: /[@$!%*?&]/,
};

/**
 * Common weak passwords to reject
 */
const WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  'qwerty123',
  'abc12345',
  'password1',
  'welcome123',
  'admin123',
  'letmein123',
  'changeme',
]);

/**
 * Validate password against all requirements
 *
 * @param password - Password to validate
 * @returns Validation result with errors and strength
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  } else {
    score += 20;
  }

  // Check maximum length
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check uppercase letter
  if (PASSWORD_REQUIREMENTS.requireUppercase && !PASSWORD_REGEX.uppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 20;
  }

  // Check lowercase letter
  if (PASSWORD_REQUIREMENTS.requireLowercase && !PASSWORD_REGEX.lowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 20;
  }

  // Check number
  if (PASSWORD_REQUIREMENTS.requireNumber && !PASSWORD_REGEX.number.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 20;
  }

  // Check special character
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !PASSWORD_REGEX.specialChar.test(password)) {
    errors.push(
      `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`
    );
  } else {
    score += 20;
  }

  // Check if password is in common weak passwords list
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more unique password.');
    score = Math.min(score, 20); // Cap score at weak level
  }

  // Bonus points for length
  if (password.length >= 12) {
    score += 10;
  }
  if (password.length >= 16) {
    score += 10;
  }

  // Determine strength
  const strength = calculatePasswordStrength(score);

  return {
    isValid: errors.length === 0,
    strength,
    errors,
    score: Math.min(score, 100),
  };
};

/**
 * Calculate password strength based on score
 *
 * @param score - Password score (0-100)
 * @returns Password strength level
 */
export const calculatePasswordStrength = (score: number): PasswordStrength => {
  if (score >= 80) {
    return PasswordStrength.STRONG;
  } else if (score >= 60) {
    return PasswordStrength.GOOD;
  } else if (score >= 40) {
    return PasswordStrength.FAIR;
  } else {
    return PasswordStrength.WEAK;
  }
};

/**
 * Get password strength color for UI display
 *
 * @param strength - Password strength
 * @returns Hex color code
 */
export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.STRONG:
      return '#059669'; // Green
    case PasswordStrength.GOOD:
      return '#3B82F6'; // Blue
    case PasswordStrength.FAIR:
      return '#F59E0B'; // Amber
    case PasswordStrength.WEAK:
      return '#DC2626'; // Red
    default:
      return '#9CA3AF'; // Gray
  }
};

/**
 * Get password strength label for UI display
 *
 * @param strength - Password strength
 * @returns Human-readable label
 */
export const getPasswordStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.STRONG:
      return 'Strong';
    case PasswordStrength.GOOD:
      return 'Good';
    case PasswordStrength.FAIR:
      return 'Fair';
    case PasswordStrength.WEAK:
      return 'Weak';
    default:
      return 'Unknown';
  }
};

/**
 * Yup validation schema for password
 * Use this with React Hook Form
 */
export const passwordValidationSchema = yup
  .string()
  .required('Password is required')
  .min(
    PASSWORD_REQUIREMENTS.minLength,
    `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
  )
  .max(
    PASSWORD_REQUIREMENTS.maxLength,
    `Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`
  )
  .matches(PASSWORD_REGEX.uppercase, 'Password must contain at least one uppercase letter')
  .matches(PASSWORD_REGEX.lowercase, 'Password must contain at least one lowercase letter')
  .matches(PASSWORD_REGEX.number, 'Password must contain at least one number')
  .matches(
    PASSWORD_REGEX.specialChar,
    `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`
  )
  .test('not-weak-password', 'This password is too common', value => {
    if (!value) return true;
    return !WEAK_PASSWORDS.has(value.toLowerCase());
  });

/**
 * Check if password meets all requirements
 *
 * @param password - Password to check
 * @returns True if password is valid
 */
export const isPasswordValid = (password: string): boolean => {
  const result = validatePassword(password);
  return result.isValid;
};

/**
 * Get user-friendly password requirements list
 * For displaying in UI
 *
 * @returns Array of requirement strings
 */
export const getPasswordRequirements = (): string[] => {
  return [
    `At least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    'At least one uppercase letter (A-Z)',
    'At least one lowercase letter (a-z)',
    'At least one number (0-9)',
    `At least one special character (${PASSWORD_REQUIREMENTS.specialChars})`,
    'Not a common password (e.g., "password123")',
  ];
};

/**
 * Format password validation errors for display
 *
 * @param errors - Array of error messages
 * @returns Formatted error string
 */
export const formatPasswordErrors = (errors: string[]): string => {
  if (errors.length === 0) {
    return '';
  }

  if (errors.length === 1) {
    return errors[0];
  }

  return `Please fix the following:\n${errors.map(error => `• ${error}`).join('\n')}`;
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/utils/validation/__tests__/passwordValidation.test.ts

import {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  isPasswordValid,
  getPasswordRequirements,
  formatPasswordErrors,
  PasswordStrength,
  passwordValidationSchema,
} from '../passwordValidation';

describe('passwordValidation', () => {
  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('MyP@ssw0rd123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.strength).toBe(PasswordStrength.STRONG);
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('myp@ssw0rd');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('MYP@SSW0RD');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('MyP@ssword');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('MyPassw0rd');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character (@$!%*?&)'
      );
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('MyP@ss1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'MyP@ssw0rd' + 'a'.repeat(120);
      const result = validatePassword(longPassword);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must not exceed 128 characters');
    });

    it('should reject common weak passwords', () => {
      const weakPasswords = ['password', 'password123', '12345678', 'qwerty123'];

      weakPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'This password is too common. Please choose a more unique password.'
        );
      });
    });

    it('should give bonus score for length 12+', () => {
      const shortPassword = 'MyP@ssw0rd'; // 10 chars
      const longPassword = 'MyP@ssw0rd12'; // 12 chars

      const shortResult = validatePassword(shortPassword);
      const longResult = validatePassword(longPassword);

      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });

    it('should give additional bonus for length 16+', () => {
      const mediumPassword = 'MyP@ssw0rd1234'; // 14 chars
      const longPassword = 'MyP@ssw0rd123456'; // 16 chars

      const mediumResult = validatePassword(mediumPassword);
      const longResult = validatePassword(longPassword);

      expect(longResult.score).toBeGreaterThan(mediumResult.score);
    });

    it('should handle multiple errors', () => {
      const result = validatePassword('short');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should return STRONG for score >= 80', () => {
      expect(calculatePasswordStrength(80)).toBe(PasswordStrength.STRONG);
      expect(calculatePasswordStrength(100)).toBe(PasswordStrength.STRONG);
    });

    it('should return GOOD for score 60-79', () => {
      expect(calculatePasswordStrength(60)).toBe(PasswordStrength.GOOD);
      expect(calculatePasswordStrength(79)).toBe(PasswordStrength.GOOD);
    });

    it('should return FAIR for score 40-59', () => {
      expect(calculatePasswordStrength(40)).toBe(PasswordStrength.FAIR);
      expect(calculatePasswordStrength(59)).toBe(PasswordStrength.FAIR);
    });

    it('should return WEAK for score < 40', () => {
      expect(calculatePasswordStrength(0)).toBe(PasswordStrength.WEAK);
      expect(calculatePasswordStrength(39)).toBe(PasswordStrength.WEAK);
    });
  });

  describe('getPasswordStrengthColor', () => {
    it('should return correct colors for each strength', () => {
      expect(getPasswordStrengthColor(PasswordStrength.STRONG)).toBe('#059669');
      expect(getPasswordStrengthColor(PasswordStrength.GOOD)).toBe('#3B82F6');
      expect(getPasswordStrengthColor(PasswordStrength.FAIR)).toBe('#F59E0B');
      expect(getPasswordStrengthColor(PasswordStrength.WEAK)).toBe('#DC2626');
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return correct labels for each strength', () => {
      expect(getPasswordStrengthLabel(PasswordStrength.STRONG)).toBe('Strong');
      expect(getPasswordStrengthLabel(PasswordStrength.GOOD)).toBe('Good');
      expect(getPasswordStrengthLabel(PasswordStrength.FAIR)).toBe('Fair');
      expect(getPasswordStrengthLabel(PasswordStrength.WEAK)).toBe('Weak');
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid password', () => {
      expect(isPasswordValid('MyP@ssw0rd123')).toBe(true);
    });

    it('should return false for invalid password', () => {
      expect(isPasswordValid('short')).toBe(false);
      expect(isPasswordValid('password')).toBe(false);
    });
  });

  describe('getPasswordRequirements', () => {
    it('should return array of requirement strings', () => {
      const requirements = getPasswordRequirements();

      expect(requirements).toHaveLength(6);
      expect(requirements[0]).toContain('8 characters');
      expect(requirements[1]).toContain('uppercase');
      expect(requirements[2]).toContain('lowercase');
      expect(requirements[3]).toContain('number');
      expect(requirements[4]).toContain('special character');
      expect(requirements[5]).toContain('common password');
    });
  });

  describe('formatPasswordErrors', () => {
    it('should return empty string for no errors', () => {
      expect(formatPasswordErrors([])).toBe('');
    });

    it('should return single error as-is', () => {
      expect(formatPasswordErrors(['Error 1'])).toBe('Error 1');
    });

    it('should format multiple errors as bullet list', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const formatted = formatPasswordErrors(errors);

      expect(formatted).toContain('Please fix the following:');
      expect(formatted).toContain('• Error 1');
      expect(formatted).toContain('• Error 2');
      expect(formatted).toContain('• Error 3');
    });
  });

  describe('passwordValidationSchema (Yup)', () => {
    it('should validate strong password', async () => {
      await expect(passwordValidationSchema.validate('MyP@ssw0rd123')).resolves.toBe(
        'MyP@ssw0rd123'
      );
    });

    it('should reject empty password', async () => {
      await expect(passwordValidationSchema.validate('')).rejects.toThrow('Password is required');
    });

    it('should reject password without uppercase', async () => {
      await expect(passwordValidationSchema.validate('myp@ssw0rd')).rejects.toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject password without lowercase', async () => {
      await expect(passwordValidationSchema.validate('MYP@SSW0RD')).rejects.toThrow(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should reject password without number', async () => {
      await expect(passwordValidationSchema.validate('MyP@ssword')).rejects.toThrow(
        'Password must contain at least one number'
      );
    });

    it('should reject password without special character', async () => {
      await expect(passwordValidationSchema.validate('MyPassw0rd')).rejects.toThrow(
        'Password must contain at least one special character'
      );
    });

    it('should reject short password', async () => {
      await expect(passwordValidationSchema.validate('MyP@ss1')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should reject common weak password', async () => {
      await expect(passwordValidationSchema.validate('password123')).rejects.toThrow(
        'This password is too common'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = validatePassword('');

      expect(result.isValid).toBe(false);
      expect(result.strength).toBe(PasswordStrength.WEAK);
    });

    it('should handle whitespace', () => {
      const result = validatePassword('   ');

      expect(result.isValid).toBe(false);
    });

    it('should handle special characters beyond allowed set', () => {
      const result = validatePassword('MyP#ssw0rd'); // # is not in allowed set

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character (@$!%*?&)'
      );
    });

    it('should accept all allowed special characters', () => {
      const specialChars = '@$!%*?&';

      specialChars.split('').forEach(char => {
        const password = `MyPassw0rd${char}`;
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle unicode characters', () => {
      const result = validatePassword('MyP@ssw0rd😀');

      // Should still be valid as it meets all requirements
      expect(result.isValid).toBe(true);
    });
  });
});
```

---

## Dependencies

- Yup (already in project)

---

## Usage Example

```typescript
// In a React component with React Hook Form

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { passwordValidationSchema } from '../utils/validation/passwordValidation';

const schema = yup.object({
  password: passwordValidationSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const MyComponent = () => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  // ... rest of component
};
```

---

## Definition of Done

- [x] Password validation utility implemented
- [x] All validation rules enforced
- [x] Password strength calculation working
- [x] Yup schema exported for React Hook Form
- [x] Helper functions implemented
- [x] All unit tests passing
- [x] 100% code coverage
- [x] TypeScript strict mode compliant
- [x] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-045](../stories/US-045-reset-password-with-token.md), [TASK-257](TASK-257-reset-password-ui.md), [TASK-260](TASK-260-supabase-password-reset-api.md)

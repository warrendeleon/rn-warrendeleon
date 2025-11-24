# TASK-195: Input Validation with Yup

**Task ID**: TASK-195
**Title**: Input Validation with Yup (All Forms)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

User input validation prevents security issues, improves UX, and ensures data quality. Yup provides declarative schema-based validation that integrates seamlessly with React Hook Form.

**Why Yup?**:

- Declarative schemas (readable, maintainable)
- React Hook Form integration (@hookform/resolvers)
- Async validation support
- Custom validation rules
- I18n support for error messages

**Security Benefits**:

- Prevents SQL injection (validates input before API calls)
- Enforces strong passwords
- Validates email formats
- Prevents XSS via input sanitization
- Detects malicious input patterns

This task creates Yup schemas for all forms in the authentication flow.

---

## Objective

Create Yup validation schemas:

1. Registration form validation
2. Login form validation
3. Password recovery validation
4. Profile update validation
5. Custom validation rules (password strength, etc.)
6. Error message translations (i18n)
7. Test all validation rules

**Deliverable**: Comprehensive Yup schemas for all auth forms with React Hook Form integration.

---

## Implementation Guide

### Install Dependencies

```bash
# Yup for validation
yarn add yup

# React Hook Form resolver for Yup
yarn add @hookform/resolvers

# Phone number validation library (for advanced validation - see note below)
yarn add libphonenumber-js
```

**Note**: For basic E.164 format validation, the regex in the schema is sufficient. For advanced country-specific validation (checking if a UK number is valid UK format, etc.), integrate `libphonenumber-js` in TASK-199 (Registration UI) with the country code selector.

### Registration Form Schema

Create `src/features/Auth/validation/registrationSchema.ts`:

```typescript
import * as yup from 'yup';

/**
 * Registration Form Validation Schema
 */

export const registrationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name cannot contain numbers or special characters')
    .trim(),

  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name cannot contain numbers or special characters')
    .trim(),

  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),

  phoneNumber: yup
    .string()
    .required('Mobile number is required')
    .matches(
      /^\+[1-9]\d{1,14}$/,
      'Please enter a valid mobile number with country code (E.164 format)'
    )
    .trim(),

  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),

  acceptTerms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

export type RegistrationFormData = yup.InferType<typeof registrationSchema>;
```

### Login Form Schema

Create `src/features/Auth/validation/loginSchema.ts`:

```typescript
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .lowercase()
    .trim(),

  password: yup.string().required('Password is required').min(1, 'Password cannot be empty'),

  rememberMe: yup.boolean().default(false),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
```

### Custom Validation Rules

Create `src/features/Auth/validation/customRules.ts`:

```typescript
import * as yup from 'yup';

/**
 * Custom validation method for strong passwords
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  'strongPassword',
  function (message = 'Password is not strong enough') {
    return this.test('strong-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true; // Let required() handle empty values

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&]/.test(value);
      const isLongEnough = value.length >= 8;

      const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLongEnough].filter(
        Boolean
      ).length;

      if (strength < 4) {
        return createError({
          path,
          message: 'Password must be stronger (use uppercase, lowercase, numbers, and symbols)',
        });
      }

      return true;
    });
  }
);

/**
 * Custom validation for preventing common passwords
 */
const COMMON_PASSWORDS = ['password', '12345678', 'qwerty', 'abc123', 'password123'];

yup.addMethod<yup.StringSchema>(
  yup.string,
  'notCommonPassword',
  function (message = 'This password is too common. Please choose a different one.') {
    return this.test('not-common-password', message, function (value) {
      const { path, createError } = this;

      if (!value) return true;

      const isCommon = COMMON_PASSWORDS.some(
        common => value.toLowerCase() === common.toLowerCase()
      );

      if (isCommon) {
        return createError({ path, message });
      }

      return true;
    });
  }
);

// TypeScript module augmentation
declare module 'yup' {
  interface StringSchema {
    strongPassword(message?: string): this;
    notCommonPassword(message?: string): this;
  }
}
```

### React Hook Form Integration

Example usage in Registration Screen:

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registrationSchema, RegistrationFormData } from '@app/features/Auth/validation/registrationSchema';

const RegistrationScreen = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: yupResolver(registrationSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (data: RegistrationFormData) => {
    // Data is validated and typed
    await supabaseAuthClient.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
  };

  return (
    <VStack space="md">
      <FormControl isInvalid={!!errors.email}>
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="your.email@example.com"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
              />
            </Input>
          )}
        />
        {errors.email && (
          <FormControlError>
            <FormControlErrorText>{errors.email.message}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      <Button onPress={handleSubmit(onSubmit)} isDisabled={isSubmitting}>
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
};
```

---

## Files Created

```
src/features/Auth/
└── validation/
    ├── registrationSchema.ts        # Created
    ├── loginSchema.ts                # Created
    ├── passwordRecoverySchema.ts    # Created
    ├── profileUpdateSchema.ts       # Created
    ├── customRules.ts                # Created
    └── __tests__/
        ├── registrationSchema.test.ts  # Created
        └── loginSchema.test.ts         # Created
```

**Note**: Validation schemas are co-located with the Auth feature following feature-first architecture (established in TASK-196).

---

## Tests

Create `src/features/Auth/validation/__tests__/registrationSchema.test.ts`:

```typescript
import { registrationSchema } from '../registrationSchema';

describe('registrationSchema', () => {
  it('should validate correct registration data', async () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      fullName: 'Warren de Leon',
      acceptTerms: true,
    };

    await expect(registrationSchema.validate(validData)).resolves.toEqual(validData);
  });

  it('should reject invalid email', async () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      fullName: 'Warren de Leon',
      acceptTerms: true,
    };

    await expect(registrationSchema.validate(invalidData)).rejects.toThrow(
      'Please enter a valid email address'
    );
  });

  it('should reject weak password', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
      fullName: 'Warren de Leon',
      acceptTerms: true,
    };

    await expect(registrationSchema.validate(invalidData)).rejects.toThrow(
      'Password must be at least 8 characters'
    );
  });

  it('should reject mismatched passwords', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'DifferentPass123!',
      fullName: 'Warren de Leon',
      acceptTerms: true,
    };

    await expect(registrationSchema.validate(invalidData)).rejects.toThrow('Passwords must match');
  });

  it('should reject if terms not accepted', async () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      fullName: 'Warren de Leon',
      acceptTerms: false,
    };

    await expect(registrationSchema.validate(invalidData)).rejects.toThrow(
      'You must accept the terms and conditions'
    );
  });
});
```

---

## Security Checklist

- [ ] **All forms validated** before submission
- [ ] **Email validation** prevents invalid formats
- [ ] **Password strength** enforced (8+ chars, mixed case, numbers, symbols)
- [ ] **Common passwords** rejected
- [ ] **Input sanitization** (trim, lowercase for emails)
- [ ] **Error messages** user-friendly (no technical details)

---

**Estimated Time**: 2 hours

**Last Updated**: 2025-11-21

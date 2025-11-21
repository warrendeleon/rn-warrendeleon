# EPIC-028: Form Validation Standards

**ID**: EPIC-028 | **Title**: Unified Form Validation and Error Handling Standards
**Status**: 📋 To Do | **Priority**: High | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 10 | **Total Effort**: 24h

---

## Epic Overview

Establish and implement unified form validation standards across the entire application. Creates consistent user experience for all form inputs with real-time validation, clear error messaging, and accessible feedback.

**Key Features**:

- Unified validation schema library (shared Yup schemas)
- Real-time field validation with debouncing
- Consistent error message display patterns
- Accessible error announcements (screen readers)
- Form-level vs field-level validation strategy
- Password strength indicator component
- Email format validation with domain checks
- Phone number validation with international formatting
- Date validation with calendar constraints
- Custom validation rules for business logic

---

## Business Value

### Why This Epic Matters

1. **User Experience**: Consistent validation reduces user frustration and form abandonment by 25% (Formisimo)
2. **Data Quality**: Proper validation ensures 98%+ data accuracy at submission time
3. **Support Reduction**: Clear error messages reduce "why didn't my form submit" support tickets by 40%
4. **Accessibility**: EAA-compliant error handling ensures usability for screen reader users
5. **Developer Productivity**: Shared validation schemas reduce code duplication by 60%
6. **Security**: Input validation prevents XSS, SQL injection, and malformed data attacks

### Success Metrics

| Metric                   | Target                 | Why It Matters                         |
| ------------------------ | ---------------------- | -------------------------------------- |
| Form Completion Rate     | 90%+                   | Users successfully submit valid data   |
| Validation Error Clarity | 95%+ user satisfaction | Users understand what to fix           |
| Data Quality Score       | 98%+                   | Submitted data is valid and complete   |
| Code Reuse               | 60%+                   | Validation schemas shared across forms |

---

## User Stories

### Overview

| ID                                                        | Title                      | Priority | Story Points | Effort | Status   |
| --------------------------------------------------------- | -------------------------- | -------- | ------------ | ------ | -------- |
| [US-054](../stories/US-054-validation-schema-library.md)  | Validation Schema Library  | High     | 4            | 9h     | 📋 To Do |
| [US-055](../stories/US-055-real-time-field-validation.md) | Real-Time Field Validation | High     | 3            | 7.5h   | 📋 To Do |
| [US-056](../stories/US-056-accessible-error-messages.md)  | Accessible Error Messages  | High     | 3            | 7.5h   | 📋 To Do |

**Total**: 3 user stories, 10 story points, 24 hours

---

## Technical Architecture

### Validation Strategy

**Two-Tier Validation Approach**:

1. **Client-Side Validation** (React Hook Form + Yup)
   - Immediate user feedback
   - Prevents invalid submissions
   - Reduces server load
   - Improves UX

2. **Server-Side Validation** (Supabase RLS + PostgreSQL constraints)
   - Final authority on data validity
   - Security layer (can't bypass via API)
   - Business rule enforcement
   - Database integrity constraints

**Never trust client-side validation alone** - always validate on server.

### Validation Library Structure

```typescript
// src/validation/schemas/index.ts

import * as yup from 'yup';

// ===========================
// SHARED VALIDATION SCHEMAS
// ===========================

// Email validation
export const emailSchema = yup
  .string()
  .required('Email is required')
  .email('Please enter a valid email address')
  .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email format is invalid')
  .test('email-domain', 'Email domain is not allowed', value => {
    if (!value) return false;
    const domain = value.split('@')[1];
    const blockedDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com'];
    return !blockedDomains.includes(domain);
  });

// Password validation (aligned with SECURITY.md requirements)
export const passwordSchema = yup
  .string()
  .required('Password is required')
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[@$!%*?&#]/, 'Password must contain at least one special character (@$!%*?&#)')
  .test('no-common-passwords', 'This password is too common', value => {
    if (!value) return false;
    const commonPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'monkey',
      'letmein',
      'trustno1',
    ];
    return !commonPasswords.includes(value.toLowerCase());
  });

// Phone number validation (international E.164 format)
export const phoneSchema = yup
  .string()
  .required('Phone number is required')
  .matches(
    /^\+[1-9]\d{1,14}$/,
    'Phone number must be in international format (e.g., +44 7700 900000)'
  )
  .test('phone-length', 'Phone number is too short', value => {
    if (!value) return false;
    return value.replace(/\D/g, '').length >= 10;
  });

// Date validation (ISO 8601 format)
export const dateSchema = yup
  .string()
  .required('Date is required')
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .test('valid-date', 'Please enter a valid date', value => {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  });

// Birthday validation (must be 18+ years old)
export const birthdaySchema = yup
  .string()
  .required('Date of birth is required')
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .test('age-18', 'You must be at least 18 years old', value => {
    if (!value) return false;
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  });

// Name validation (first/last name)
export const nameSchema = yup
  .string()
  .required('Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// PIN validation (6 digits, no weak PINs)
export const pinSchema = yup
  .string()
  .required('PIN is required')
  .matches(/^\d{6}$/, 'PIN must be exactly 6 digits')
  .test('no-weak-pins', 'This PIN is too easy to guess', value => {
    if (!value) return false;

    const weakPINs = [
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
    ];

    if (weakPINs.includes(value)) return false;

    // Check for sequential digits (123456, 234567, etc.)
    const isSequential =
      /012345|123456|234567|345678|456789|987654|876543|765432|654321|543210/.test(value);
    if (isSequential) return false;

    // Check for repeating patterns (121212, 131313, etc.)
    const isRepeating = /^(\d{2})\1{2}$/.test(value);
    if (isRepeating) return false;

    return true;
  });

// ===========================
// COMPOSITE FORM SCHEMAS
// ===========================

// Registration form schema
export const registrationFormSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  birthday: birthdaySchema,
});

// Login form schema
export const loginFormSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required'), // Don't validate strength on login
});

// Profile update schema
export const profileUpdateSchema = yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  birthday: birthdaySchema,
});

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

// Change PIN schema
export const changePINSchema = yup.object({
  currentPIN: yup
    .string()
    .required('Current PIN is required')
    .matches(/^\d{6}$/, 'PIN must be 6 digits'),
  newPIN: pinSchema,
  confirmPIN: yup
    .string()
    .required('Please confirm your new PIN')
    .oneOf([yup.ref('newPIN')], 'PINs must match'),
});
```

### Real-Time Validation Hook

```typescript
// src/hooks/useFieldValidation.ts

import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import * as yup from 'yup';

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const useFieldValidation = (schema: yup.Schema, debounceMs: number = 500) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    error: null,
  });

  const validate = useCallback(
    debounce(async (value: any) => {
      try {
        await schema.validate(value);
        setValidationResult({ isValid: true, error: null });
      } catch (err: any) {
        setValidationResult({ isValid: false, error: err.message });
      }
    }, debounceMs),
    [schema, debounceMs]
  );

  return {
    validationResult,
    validate,
  };
};
```

### Password Strength Indicator Component

```typescript
// src/components/forms/PasswordStrengthIndicator.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Box, HStack, VStack } from '@gluestack-ui/themed';

interface PasswordStrengthIndicatorProps {
  password: string;
  testID?: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

const calculateStrength = (password: string): StrengthLevel => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[@$!%*?&#]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 5) return 'good';
  return 'strong';
};

const strengthColors = {
  weak: '#EF4444', // Red
  fair: '#F59E0B', // Orange
  good: '#3B82F6', // Blue
  strong: '#10B981', // Green
};

const strengthLabels = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  testID = 'password-strength-indicator',
}) => {
  const strength = calculateStrength(password);
  const color = strengthColors[strength];
  const label = strengthLabels[strength];

  const requirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /[a-z]/.test(password), label: 'One lowercase letter' },
    { met: /[0-9]/.test(password), label: 'One number' },
    { met: /[@$!%*?&#]/.test(password), label: 'One special character' },
  ];

  return (
    <VStack space="sm" testID={testID}>
      {/* Strength bar */}
      <HStack space="xs">
        {['weak', 'fair', 'good', 'strong'].map((level, index) => {
          const levelStrength = ['weak', 'fair', 'good', 'strong'].indexOf(strength);
          const isActive = index <= levelStrength;

          return (
            <Box
              key={level}
              flex={1}
              height={4}
              backgroundColor={isActive ? color : '#E5E7EB'}
              borderRadius="$sm"
              testID={`strength-bar-${level}`}
            />
          );
        })}
      </HStack>

      {/* Strength label */}
      <Text
        style={{ color, fontSize: 14, fontWeight: '600' }}
        accessibilityLabel={`Password strength: ${label}`}
        testID={`strength-label-${strength}`}
      >
        {label}
      </Text>

      {/* Requirements checklist */}
      <VStack space="xs" marginTop="$2">
        {requirements.map((req, index) => (
          <HStack key={index} space="sm" alignItems="center">
            <Text
              style={{
                fontSize: 18,
                color: req.met ? '#10B981' : '#9CA3AF',
              }}
              accessibilityLabel={req.met ? 'Met' : 'Not met'}
            >
              {req.met ? '✓' : '○'}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: req.met ? '#10B981' : '#6B7280',
              }}
            >
              {req.label}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
```

### Accessible Error Message Component

```typescript
// src/components/forms/ErrorMessage.tsx

import React, { useEffect, useRef } from 'react';
import { Text, Animated } from 'react-native';
import { Box } from '@gluestack-ui/themed';

interface ErrorMessageProps {
  error: string | null;
  fieldLabel: string; // For accessibility context
  testID?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  fieldLabel,
  testID = 'error-message',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [error, fadeAnim]);

  if (!error) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Box
        backgroundColor="#FEE2E2"
        borderColor="#EF4444"
        borderWidth={1}
        borderRadius="$sm"
        padding="$2"
        marginTop="$1"
        testID={testID}
      >
        <Text
          style={{
            color: '#B91C1C',
            fontSize: 14,
          }}
          accessibilityRole="alert"
          accessibilityLabel={`Error for ${fieldLabel}: ${error}`}
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      </Box>
    </Animated.View>
  );
};
```

### Form Input Component with Validation

```typescript
// src/components/forms/ValidatedTextInput.tsx

import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input, InputField, FormControl, FormControlLabel, FormControlLabelText } from '@gluestack-ui/themed';
import { ErrorMessage } from './ErrorMessage';

interface ValidatedTextInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  testID?: string;
}

export const ValidatedTextInput = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  testID,
}: ValidatedTextInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FormControl isInvalid={!!error} testID={`${testID}-form-control`}>
          <FormControlLabel>
            <FormControlLabelText>{label}</FormControlLabelText>
          </FormControlLabel>

          <Input
            isInvalid={!!error}
            testID={testID}
            accessibilityLabel={label}
            accessibilityHint={placeholder}
            accessibilityState={{ disabled: false }}
          >
            <InputField
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              testID={`${testID}-input`}
            />
          </Input>

          <ErrorMessage
            error={error?.message ?? null}
            fieldLabel={label}
            testID={`${testID}-error`}
          />
        </FormControl>
      )}
    />
  );
};
```

---

## Implementation Phases

### Phase 1: Validation Schema Library (9h)

**User Story**: [US-054](../stories/US-054-validation-schema-library.md)

**Tasks**:

1. Create shared validation schemas (email, password, phone, date, name, PIN)
2. Create composite form schemas (registration, login, profile, change password)
3. Write Yup schema unit tests
4. Document validation rules in README
5. RNTL tests for validation logic

**Deliverables**:

- `src/validation/schemas/index.ts` (complete schema library)
- Unit tests for all schemas
- Validation documentation
- Complete test coverage

---

### Phase 2: Real-Time Field Validation (7.5h)

**User Story**: [US-055](../stories/US-055-real-time-field-validation.md)

**Tasks**:

1. useFieldValidation hook with debouncing
2. PasswordStrengthIndicator component
3. ValidatedTextInput component (React Hook Form integration)
4. Real-time validation examples (registration, login, profile)
5. RNTL tests for validation hooks and components

**Deliverables**:

- useFieldValidation hook
- PasswordStrengthIndicator component
- ValidatedTextInput component
- Complete test coverage

---

### Phase 3: Accessible Error Messages (7.5h)

**User Story**: [US-056](../stories/US-056-accessible-error-messages.md)

**Tasks**:

1. ErrorMessage component with ARIA live regions
2. Accessible error announcements (screen readers)
3. Error message styling (visual feedback)
4. Animated error transitions
5. RNTL tests with accessibility assertions

**Deliverables**:

- ErrorMessage component
- Accessible error patterns
- EAA compliance verification
- Complete test coverage

---

## Validation Best Practices

### When to Validate

**Field-Level Validation** (Real-Time):

- Use for: Email, password, phone, PIN
- Trigger: `onBlur` or debounced `onChange` (500ms)
- Feedback: Immediate (red border, error message)

**Form-Level Validation** (On Submit):

- Use for: All fields together, cross-field validation
- Trigger: Form submission attempt
- Feedback: Prevent submission, focus first invalid field

**Server-Side Validation** (Final Check):

- Use for: All data (never trust client)
- Trigger: API request
- Feedback: Display server error if validation fails

### Error Message Guidelines

**Good Error Messages**:

- ✅ "Email is required"
- ✅ "Password must be at least 8 characters"
- ✅ "Phone number must be in international format (e.g., +44 7700 900000)"
- ✅ "You must be at least 18 years old"

**Bad Error Messages**:

- ❌ "Invalid input" (too vague)
- ❌ "Error" (no context)
- ❌ "Field validation failed" (technical jargon)
- ❌ "Must match regex /^[a-z]+$/" (developer language)

### Accessibility Requirements

**Every error message MUST have**:

1. `accessibilityRole="alert"` - Announces error immediately
2. `accessibilityLiveRegion="assertive"` - Priority announcement
3. `accessibilityLabel` with field context - "Error for Email: Email is required"
4. Visual feedback - Red border on input, red text for error
5. Color contrast - 4.5:1 ratio (WCAG 2.1 Level AA)

---

## Security Considerations

### Input Sanitization

**Always sanitize user input** before storage or display:

```typescript
// src/utils/sanitizeInput.ts

import DOMPurify from 'isomorphic-dompurify';

export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  }).trim();
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, ''); // Remove non-digits
};
```

### Preventing Common Attacks

**XSS Prevention**:

- Sanitize all text inputs
- Escape HTML entities
- Use `DOMPurify` for rich text

**SQL Injection Prevention**:

- Use parameterized queries (Supabase does this automatically)
- Never concatenate user input into SQL
- Validate data types server-side

**CSRF Prevention**:

- Use Supabase CSRF tokens
- Validate `Origin` and `Referer` headers
- Short-lived tokens (1 hour access token)

---

## Non-Functional Requirements

### Performance

- Field validation: <50ms (debounced 500ms)
- Form validation: <100ms (on submit)
- Password strength calculation: <10ms
- Error message animation: 200ms

### Accessibility (EAA Compliance)

- All error messages have `accessibilityRole="alert"`
- All error messages have `accessibilityLiveRegion="assertive"`
- Color contrast 4.5:1 for error text
- Error messages announced by screen readers
- Form inputs have clear labels and hints

### Testing

- 100% RNTL coverage for validation logic
- Unit tests for all Yup schemas
- Integration tests for form validation flows
- Accessibility tests with screen reader simulation

---

## Dependencies

### Upstream Dependencies

- React Hook Form v7.x (form state management)
- Yup v1.x (validation schemas)
- GlueStack UI v1.x (form components)

### Downstream Dependencies

- All forms use shared validation schemas
- All user stories with forms depend on this epic

---

## Risks & Mitigation

### Technical Risks

| Risk                              | Probability | Impact | Mitigation                                              |
| --------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Complex validation rules too slow | Low         | Medium | Debounce validation, optimize regex patterns            |
| Server-side validation mismatch   | Medium      | High   | Share validation logic (TypeScript → PostgreSQL)        |
| Accessibility testing incomplete  | Low         | High   | Automated a11y tests, manual VoiceOver/TalkBack testing |

### UX Risks

| Risk                                   | Probability | Impact | Mitigation                                       |
| -------------------------------------- | ----------- | ------ | ------------------------------------------------ |
| Too much real-time validation annoying | Medium      | Medium | Debounce validation, validate on blur not change |
| Error messages unclear                 | Low         | High   | User testing, clear language guidelines          |
| Password requirements too strict       | Low         | Medium | Show requirements upfront, real-time feedback    |

---

## Definition of Done

**Functional**:

- [ ] All 3 user stories complete
- [ ] Shared validation schema library created
- [ ] Real-time field validation working
- [ ] Accessible error messages working
- [ ] Password strength indicator working

**Quality**:

- [ ] 100% RNTL coverage
- [ ] Unit tests for all Yup schemas
- [ ] `yarn validate` passes
- [ ] Manual testing complete

**Security**:

- [ ] All inputs sanitized
- [ ] Server-side validation enforced
- [ ] XSS/SQL injection prevented

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Error messages accessible
- [ ] VoiceOver/TalkBack tested

**Documentation**:

- [ ] Validation rules documented
- [ ] Code examples in README
- [ ] Best practices guide written

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before Phase 1 kickoff

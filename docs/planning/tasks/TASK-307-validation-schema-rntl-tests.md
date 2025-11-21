# TASK-307: Validation Schema RNTL Tests

**ID**: TASK-307 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-054](../stories/US-054-validation-schema-library.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create React Native Testing Library integration tests for validation schemas in real form components. Test validation behaviour within React Hook Form, error message display, field-level validation, form submission handling, and user interactions. Ensure validation works correctly in the full component context.

---

## Acceptance Criteria

- [ ] RNTL tests created in component test files
- [ ] Test validation with React Hook Form integration
- [ ] Test error message display and accessibility
- [ ] Test field-level validation triggers
- [ ] Test form submission with valid/invalid data
- [ ] Test error clearing on field correction
- [ ] Test conditional validation in forms
- [ ] 100% integration test coverage
- [ ] All tests passing
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Sign In Form Integration Tests

```typescript
// src/screens/auth/SignInScreen/__tests__/SignInScreen.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SignInScreen } from '../SignInScreen';
import { signInSchema } from '@/validation/schemas/authSchemas';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('SignInScreen - Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Validation', () => {
    it('should show error when email is empty and field loses focus', async () => {
      render(<SignInScreen />);

      const emailInput = screen.getByTestId('email-input');

      // Focus and blur without entering value
      fireEvent(emailInput, 'focus');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeTruthy();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<SignInScreen />);

      const emailInput = screen.getByTestId('email-input');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeTruthy();
      });
    });

    it('should clear error when valid email is entered', async () => {
      render(<SignInScreen />);

      const emailInput = screen.getByTestId('email-input');

      // First, trigger error
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeTruthy();
      });

      // Then, correct it
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid email address')
        ).toBeNull();
      });
    });

    it('should display error message with proper accessibility', async () => {
      render(<SignInScreen />);

      const emailInput = screen.getByTestId('email-input');

      fireEvent(emailInput, 'blur');

      await waitFor(() => {
        const errorMessage = screen.getByTestId('email-error');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.props.accessibilityLiveRegion).toBe('polite');
        expect(errorMessage.props.accessibilityRole).toBe('alert');
      });
    });
  });

  describe('Password Validation', () => {
    it('should show error when password is empty', async () => {
      render(<SignInScreen />);

      const passwordInput = screen.getByTestId('password-input');

      fireEvent(passwordInput, 'focus');
      fireEvent(passwordInput, 'blur');

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeTruthy();
      });
    });

    it('should show error for weak password', async () => {
      render(<SignInScreen />);

      const passwordInput = screen.getByTestId('password-input');

      fireEvent.changeText(passwordInput, 'weak');
      fireEvent(passwordInput, 'blur');

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeTruthy();
      });
    });

    it('should not show error for valid password', async () => {
      render(<SignInScreen />);

      const passwordInput = screen.getByTestId('password-input');

      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent(passwordInput, 'blur');

      await waitFor(() => {
        expect(screen.queryByTestId('password-error')).toBeNull();
      });
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission with invalid data', async () => {
      const mockOnSubmit = jest.fn();
      render(<SignInScreen onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // Enter invalid data
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'weak');

      // Try to submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeTruthy();
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeTruthy();
      });
    });

    it('should allow submission with valid data', async () => {
      const mockOnSubmit = jest.fn();
      render(<SignInScreen onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // Enter valid data
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'Password123!');

      // Submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123!',
          rememberMe: false,
        });
      });
    });

    it('should disable submit button while submitting', async () => {
      const mockOnSubmit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<SignInScreen onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      // Enter valid data
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'Password123!');

      // Submit
      fireEvent.press(submitButton);

      // Button should be disabled
      expect(submitButton.props.accessibilityState.disabled).toBe(true);

      await waitFor(() => {
        expect(submitButton.props.accessibilityState.disabled).toBe(false);
      });
    });
  });
});
```

---

### Sign Up Form Integration Tests

```typescript
// src/screens/auth/SignUpScreen/__tests__/SignUpScreen.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpScreen } from '../SignUpScreen';

describe('SignUpScreen - Validation Integration', () => {
  describe('Password Confirmation', () => {
    it('should show error when passwords do not match', async () => {
      render(<SignUpScreen />);

      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent.changeText(confirmPasswordInput, 'DifferentPassword123!');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        expect(screen.getByText('Passwords must match')).toBeTruthy();
      });
    });

    it('should clear error when passwords match', async () => {
      render(<SignUpScreen />);

      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      // First, create mismatch
      fireEvent.changeText(passwordInput, 'Password123!');
      fireEvent.changeText(confirmPasswordInput, 'DifferentPassword123!');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        expect(screen.getByText('Passwords must match')).toBeTruthy();
      });

      // Then, fix it
      fireEvent.changeText(confirmPasswordInput, 'Password123!');
      fireEvent(confirmPasswordInput, 'blur');

      await waitFor(() => {
        expect(screen.queryByText('Passwords must match')).toBeNull();
      });
    });
  });

  describe('Date of Birth Validation', () => {
    it('should show error for users under 18', async () => {
      render(<SignUpScreen />);

      const dateInput = screen.getByTestId('date-of-birth-input');

      // Set date to 10 years ago (under 18)
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 10);

      fireEvent(dateInput, 'onChange', underageDate);
      fireEvent(dateInput, 'blur');

      await waitFor(() => {
        expect(
          screen.getByText('You must be at least 18 years old')
        ).toBeTruthy();
      });
    });

    it('should accept users 18 or older', async () => {
      render(<SignUpScreen />);

      const dateInput = screen.getByTestId('date-of-birth-input');

      // Set date to 20 years ago (over 18)
      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);

      fireEvent(dateInput, 'onChange', validDate);
      fireEvent(dateInput, 'blur');

      await waitFor(() => {
        expect(screen.queryByTestId('date-of-birth-error')).toBeNull();
      });
    });
  });

  describe('Terms and Conditions', () => {
    it('should show error when terms not accepted', async () => {
      render(<SignUpScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill all fields except terms
      fireEvent.changeText(screen.getByTestId('first-name-input'), 'John');
      fireEvent.changeText(screen.getByTestId('last-name-input'), 'Doe');
      fireEvent.changeText(screen.getByTestId('email-input'), 'john@example.com');
      fireEvent.changeText(screen.getByTestId('password-input'), 'Password123!');
      fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'Password123!');
      fireEvent.changeText(screen.getByTestId('phone-input'), '+1234567890');

      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);
      fireEvent(screen.getByTestId('date-of-birth-input'), 'onChange', validDate);

      // Try to submit without accepting terms
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('You must accept the terms and conditions')
        ).toBeTruthy();
      });
    });
  });
});
```

---

### Profile Update Form Integration Tests

```typescript
// src/screens/profile/EditProfileScreen/__tests__/EditProfileScreen.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { EditProfileScreen } from '../EditProfileScreen';

describe('EditProfileScreen - Validation Integration', () => {
  describe('Conditional Profile Picture Validation', () => {
    it('should not require MIME type when no picture selected', async () => {
      render(<EditProfileScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields without profile picture
      fireEvent.changeText(screen.getByTestId('first-name-input'), 'John');
      fireEvent.changeText(screen.getByTestId('last-name-input'), 'Doe');
      fireEvent.changeText(screen.getByTestId('phone-input'), '+1234567890');

      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);
      fireEvent(screen.getByTestId('date-of-birth-input'), 'onChange', validDate);

      // Submit without picture
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/MIME type is required/)).toBeNull();
      });
    });

    it('should require MIME type when picture is selected', async () => {
      render(<EditProfileScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields
      fireEvent.changeText(screen.getByTestId('first-name-input'), 'John');
      fireEvent.changeText(screen.getByTestId('last-name-input'), 'Doe');
      fireEvent.changeText(screen.getByTestId('phone-input'), '+1234567890');

      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);
      fireEvent(screen.getByTestId('date-of-birth-input'), 'onChange', validDate);

      // Select picture but don't provide MIME type (simulate incomplete upload)
      fireEvent(screen.getByTestId('profile-picture-picker'), 'onImageSelected', {
        uri: 'file:///path/to/image.jpg',
        // mimeType and fileSize intentionally omitted
      });

      // Try to submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('MIME type is required when profile picture is provided')
        ).toBeTruthy();
      });
    });

    it('should validate file size when picture is selected', async () => {
      render(<EditProfileScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields
      fireEvent.changeText(screen.getByTestId('first-name-input'), 'John');
      fireEvent.changeText(screen.getByTestId('last-name-input'), 'Doe');
      fireEvent.changeText(screen.getByTestId('phone-input'), '+1234567890');

      const validDate = new Date();
      validDate.setFullYear(validDate.getFullYear() - 20);
      fireEvent(screen.getByTestId('date-of-birth-input'), 'onChange', validDate);

      // Select picture that's too large
      fireEvent(screen.getByTestId('profile-picture-picker'), 'onImageSelected', {
        uri: 'file:///path/to/image.jpg',
        mimeType: 'image/jpeg',
        fileSize: 15000000, // 15MB (exceeds 10MB limit)
      });

      // Try to submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Image size must be less than 10MB')
        ).toBeTruthy();
      });
    });
  });
});
```

---

### Work Experience Form Integration Tests

```typescript
// src/screens/portfolio/AddWorkExperienceScreen/__tests__/AddWorkExperienceScreen.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AddWorkExperienceScreen } from '../AddWorkExperienceScreen';

describe('AddWorkExperienceScreen - Validation Integration', () => {
  describe('Conditional End Date Validation', () => {
    it('should not require end date for current positions', async () => {
      render(<AddWorkExperienceScreen />);

      const isCurrentCheckbox = screen.getByTestId('is-current-checkbox');
      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields
      fireEvent.changeText(screen.getByTestId('company-input'), 'Tech Corp');
      fireEvent.changeText(screen.getByTestId('position-input'), 'Developer');
      fireEvent.changeText(screen.getByTestId('location-input'), 'Remote');
      fireEvent(screen.getByTestId('start-date-input'), 'onChange', new Date('2020-01-01'));
      fireEvent.changeText(
        screen.getByTestId('description-input'),
        'Working on large-scale React Native applications with TypeScript and Redux Toolkit.'
      );
      fireEvent(screen.getByTestId('technologies-input'), 'addTag', 'React Native');
      fireEvent(screen.getByTestId('achievements-input'), 'addItem', 'Increased app performance by 40%');

      // Check "Current position"
      fireEvent.press(isCurrentCheckbox);

      // Submit without end date
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('End date is required')).toBeNull();
      });
    });

    it('should require end date for past positions', async () => {
      render(<AddWorkExperienceScreen />);

      const isCurrentCheckbox = screen.getByTestId('is-current-checkbox');
      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields
      fireEvent.changeText(screen.getByTestId('company-input'), 'Tech Corp');
      fireEvent.changeText(screen.getByTestId('position-input'), 'Developer');
      fireEvent.changeText(screen.getByTestId('location-input'), 'Remote');
      fireEvent(screen.getByTestId('start-date-input'), 'onChange', new Date('2020-01-01'));
      fireEvent.changeText(
        screen.getByTestId('description-input'),
        'Worked on large-scale React Native applications with TypeScript and Redux Toolkit.'
      );
      fireEvent(screen.getByTestId('technologies-input'), 'addTag', 'React Native');
      fireEvent(screen.getByTestId('achievements-input'), 'addItem', 'Increased app performance by 40%');

      // Leave "Current position" unchecked (past position)
      // Don't set end date

      // Try to submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('End date is required for past positions')
        ).toBeTruthy();
      });
    });

    it('should validate end date is after start date', async () => {
      render(<AddWorkExperienceScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill required fields
      fireEvent.changeText(screen.getByTestId('company-input'), 'Tech Corp');
      fireEvent.changeText(screen.getByTestId('position-input'), 'Developer');
      fireEvent.changeText(screen.getByTestId('location-input'), 'Remote');
      fireEvent(screen.getByTestId('start-date-input'), 'onChange', new Date('2023-01-01'));
      fireEvent(screen.getByTestId('end-date-input'), 'onChange', new Date('2020-12-31')); // Before start
      fireEvent.changeText(
        screen.getByTestId('description-input'),
        'Worked on large-scale React Native applications with TypeScript and Redux Toolkit.'
      );
      fireEvent(screen.getByTestId('technologies-input'), 'addTag', 'React Native');
      fireEvent(screen.getByTestId('achievements-input'), 'addItem', 'Achievement');

      // Try to submit
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('End date must be after start date')
        ).toBeTruthy();
      });
    });
  });

  describe('Description Length Validation', () => {
    it('should show error for description less than 50 characters', async () => {
      render(<AddWorkExperienceScreen />);

      const descriptionInput = screen.getByTestId('description-input');

      fireEvent.changeText(descriptionInput, 'Short description');
      fireEvent(descriptionInput, 'blur');

      await waitFor(() => {
        expect(
          screen.getByText('Description must be at least 50 characters')
        ).toBeTruthy();
      });
    });

    it('should accept description with 50 or more characters', async () => {
      render(<AddWorkExperienceScreen />);

      const descriptionInput = screen.getByTestId('description-input');

      fireEvent.changeText(
        descriptionInput,
        'This is a detailed description that is more than 50 characters long and describes the work experience.'
      );
      fireEvent(descriptionInput, 'blur');

      await waitFor(() => {
        expect(screen.queryByTestId('description-error')).toBeNull();
      });
    });
  });

  describe('Array Field Validation', () => {
    it('should require at least one technology', async () => {
      render(<AddWorkExperienceScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill all fields except technologies
      fireEvent.changeText(screen.getByTestId('company-input'), 'Tech Corp');
      fireEvent.changeText(screen.getByTestId('position-input'), 'Developer');
      fireEvent.changeText(screen.getByTestId('location-input'), 'Remote');
      fireEvent(screen.getByTestId('start-date-input'), 'onChange', new Date('2020-01-01'));
      fireEvent.press(screen.getByTestId('is-current-checkbox'));
      fireEvent.changeText(
        screen.getByTestId('description-input'),
        'Working on large-scale React Native applications with TypeScript and Redux Toolkit.'
      );
      fireEvent(screen.getByTestId('achievements-input'), 'addItem', 'Achievement');

      // Try to submit without technologies
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('At least one technology is required')
        ).toBeTruthy();
      });
    });

    it('should require at least one achievement', async () => {
      render(<AddWorkExperienceScreen />);

      const submitButton = screen.getByTestId('submit-button');

      // Fill all fields except achievements
      fireEvent.changeText(screen.getByTestId('company-input'), 'Tech Corp');
      fireEvent.changeText(screen.getByTestId('position-input'), 'Developer');
      fireEvent.changeText(screen.getByTestId('location-input'), 'Remote');
      fireEvent(screen.getByTestId('start-date-input'), 'onChange', new Date('2020-01-01'));
      fireEvent.press(screen.getByTestId('is-current-checkbox'));
      fireEvent.changeText(
        screen.getByTestId('description-input'),
        'Working on large-scale React Native applications with TypeScript and Redux Toolkit.'
      );
      fireEvent(screen.getByTestId('technologies-input'), 'addTag', 'React Native');

      // Try to submit without achievements
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('At least one achievement is required')
        ).toBeTruthy();
      });
    });
  });
});
```

---

## Testing Requirements

### Coverage Requirements

- [ ] 100% integration test coverage for validation
- [ ] All validation rules tested in component context
- [ ] All error messages tested
- [ ] All conditional validation tested

### Test Scenarios

**Field-Level Validation**:

- [ ] Required field validation
- [ ] Format validation (email, phone, etc.)
- [ ] Length validation (min/max)
- [ ] Custom validation rules

**Form-Level Validation**:

- [ ] Submission with valid data
- [ ] Submission with invalid data
- [ ] Multiple errors displayed simultaneously
- [ ] Error clearing on correction

**Conditional Validation**:

- [ ] Optional fields become required based on conditions
- [ ] Required fields become optional based on conditions
- [ ] Cross-field validation (password confirmation, date ranges)

**Accessibility**:

- [ ] Error messages have proper roles
- [ ] Error messages announced to screen readers
- [ ] Error messages associated with inputs

---

## Dependencies

- React Native Testing Library
- Jest
- React Hook Form
- All validation schemas
- Form components

---

## Definition of Done

- [ ] All RNTL integration tests implemented
- [ ] Sign-in form validation tested
- [ ] Sign-up form validation tested
- [ ] Profile update form validation tested
- [ ] Work experience form validation tested
- [ ] Conditional validation tested
- [ ] Error message accessibility tested
- [ ] Form submission handling tested
- [ ] 100% integration test coverage
- [ ] All tests passing
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-054](../stories/US-054-validation-schema-library.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-303](TASK-303-shared-validation-schemas.md), [TASK-304](TASK-304-composite-form-schemas.md), [TASK-305](TASK-305-yup-schema-unit-tests.md)

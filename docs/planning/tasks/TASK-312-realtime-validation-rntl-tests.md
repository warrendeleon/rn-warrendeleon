# TASK-312: Real-Time Validation RNTL Tests

**ID**: TASK-312 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-055](../stories/US-055-realtime-field-validation.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create comprehensive React Native Testing Library tests for real-time validation features. Test the useFieldValidation hook, ValidatedTextInput component, PasswordStrengthIndicator, debouncing behavior, async validation, and user interactions. Ensure 100% coverage of real-time validation functionality.

---

## Acceptance Criteria

- [ ] RNTL tests created for all real-time validation components
- [ ] Test useFieldValidation hook behavior
- [ ] Test ValidatedTextInput component interactions
- [ ] Test PasswordStrengthIndicator visual feedback
- [ ] Test debouncing behavior
- [ ] Test async validation with loading states
- [ ] Test error message display and clearing
- [ ] 100% code coverage
- [ ] All tests passing
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### useFieldValidation Hook Tests

```typescript
// src/hooks/__tests__/useFieldValidation.test.ts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFieldValidation } from '../useFieldValidation';
import * as Yup from 'yup';

describe('useFieldValidation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useFieldValidation({ schema: Yup.string().required() }));

    expect(result.current.validationState).toBe('idle');
    expect(result.current.error).toBeUndefined();
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.isInvalid).toBe(false);
  });

  it('should validate with schema', async () => {
    const schema = Yup.string().email('Invalid email');
    const { result } = renderHook(() => useFieldValidation({ schema, debounceMs: 0 }));

    await act(async () => {
      await result.current.validateField('test@example.com');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('valid');
      expect(result.current.isValid).toBe(true);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should show error for invalid value', async () => {
    const schema = Yup.string().email('Invalid email');
    const { result } = renderHook(() => useFieldValidation({ schema, debounceMs: 0 }));

    await act(async () => {
      await result.current.validateField('invalid-email');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('invalid');
      expect(result.current.isInvalid).toBe(true);
      expect(result.current.error).toBe('Invalid email');
    });
  });

  it('should debounce validation calls', async () => {
    const validateFn = jest.fn().mockResolvedValue({ isValid: true });
    const { result } = renderHook(() =>
      useFieldValidation({ validate: validateFn, debounceMs: 300 })
    );

    // Rapid consecutive calls
    act(() => {
      result.current.validateField('a');
      result.current.validateField('ab');
      result.current.validateField('abc');
    });

    // Should not call validate yet
    expect(validateFn).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      // Should only call once with the last value
      expect(validateFn).toHaveBeenCalledTimes(1);
      expect(validateFn).toHaveBeenCalledWith('abc');
    });
  });

  it('should cancel pending validation on new input', async () => {
    let resolveFirst: (value: any) => void;
    let resolveSecond: (value: any) => void;

    const validateFn = jest.fn(value => {
      if (value === 'first') {
        return new Promise(resolve => {
          resolveFirst = resolve;
        });
      }
      return new Promise(resolve => {
        resolveSecond = resolve;
      });
    });

    const { result } = renderHook(() =>
      useFieldValidation({ validate: validateFn, debounceMs: 0 })
    );

    // Start first validation
    act(() => {
      result.current.validateField('first');
    });

    // Start second validation before first completes
    act(() => {
      result.current.validateField('second');
    });

    // Resolve first (should be ignored)
    act(() => {
      resolveFirst!({ isValid: true });
    });

    // Resolve second
    act(() => {
      resolveSecond!({ isValid: false, error: 'Second error' });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Second error');
    });
  });

  it('should reset validation state', async () => {
    const schema = Yup.string().email();
    const { result } = renderHook(() => useFieldValidation({ schema, debounceMs: 0 }));

    await act(async () => {
      await result.current.validateField('invalid-email');
    });

    await waitFor(() => {
      expect(result.current.isInvalid).toBe(true);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.validationState).toBe('idle');
    expect(result.current.error).toBeUndefined();
  });

  it('should handle async validation with loading state', async () => {
    const asyncValidate = jest.fn(
      value =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              isValid: value === 'valid',
              error: value !== 'valid' ? 'Invalid' : undefined,
            });
          }, 100);
        })
    );

    const { result } = renderHook(() =>
      useFieldValidation({ validate: asyncValidate, debounceMs: 0 })
    );

    await act(async () => {
      const promise = result.current.validateField('test');

      // Should be in validating state immediately
      expect(result.current.isValidating).toBe(true);

      await promise;
    });

    await waitFor(() => {
      expect(result.current.isValidating).toBe(false);
    });
  });

  it('should cleanup on unmount', () => {
    const validateFn = jest.fn().mockResolvedValue({ isValid: true });
    const { result, unmount } = renderHook(() =>
      useFieldValidation({ validate: validateFn, debounceMs: 300 })
    );

    act(() => {
      result.current.validateField('test');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should not execute after unmount
    expect(validateFn).not.toHaveBeenCalled();
  });
});
```

---

### ValidatedTextInput Component Tests

```typescript
// src/components/forms/__tests__/ValidatedTextInput.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ValidatedTextInput } from '../ValidatedTextInput';
import * as Yup from 'yup';

describe('ValidatedTextInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render with label', () => {
    render(
      <ValidatedTextInput label="Email" value="" onChangeText={() => {}} />
    );

    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('should show required asterisk when required', () => {
    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
        required
      />
    );

    expect(screen.getByText('*')).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const onChangeText = jest.fn();

    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={onChangeText}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent.changeText(input, 'test@example.com');

    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('should validate on blur', async () => {
    const schema = Yup.string().email('Invalid email');

    render(
      <ValidatedTextInput
        label="Email"
        value="invalid-email"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeTruthy();
    });
  });

  it('should show check icon for valid input', async () => {
    const schema = Yup.string().email();

    render(
      <ValidatedTextInput
        label="Email"
        value="test@example.com"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
        showValidationState
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.getByTestID('validated-input-valid')).toBeTruthy();
    });
  });

  it('should show error icon for invalid input', async () => {
    const schema = Yup.string().email();

    render(
      <ValidatedTextInput
        label="Email"
        value="invalid"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
        showValidationState
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.getByTestID('validated-input-invalid')).toBeTruthy();
    });
  });

  it('should show loading indicator while validating', async () => {
    const asyncValidate = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ isValid: true }), 100);
      });

    render(
      <ValidatedTextInput
        label="Email"
        value="test@example.com"
        onChangeText={() => {}}
        validation={{ validate: asyncValidate, debounceMs: 0 }}
        showValidationState
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    // Should show loading
    expect(screen.getByTestID('validated-input-validating')).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByTestID('validated-input-validating')).toBeNull();
    });
  });

  it('should display helper text when no error', () => {
    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
        helperText="We'll never share your email"
      />
    );

    expect(screen.getByText("We'll never share your email")).toBeTruthy();
  });

  it('should hide helper text when error is shown', async () => {
    const schema = Yup.string().email('Invalid email');

    render(
      <ValidatedTextInput
        label="Email"
        value="invalid"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
        helperText="Helper text"
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.queryByText('Helper text')).toBeNull();
      expect(screen.getByText('Invalid email')).toBeTruthy();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
        required
        helperText="Helper text"
      />
    );

    const input = screen.getByTestId('validated-input-input');
    expect(input.props.accessibilityLabel).toBe('Email');
    expect(input.props.accessibilityRequired).toBe(true);
    expect(input.props.accessibilityHint).toBe('Helper text');
  });

  it('should set accessibilityInvalid when input is invalid', async () => {
    const schema = Yup.string().email();

    render(
      <ValidatedTextInput
        label="Email"
        value="invalid"
        onChangeText={() => {}}
        validation={{ schema, debounceMs: 0 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(input.props.accessibilityInvalid).toBe(true);
    });
  });
});
```

---

### PasswordStrengthIndicator Tests

```typescript
// src/components/validation/__tests__/PasswordStrengthIndicator.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PasswordStrengthIndicator } from '../PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('should render weak strength for weak password', () => {
    render(<PasswordStrengthIndicator password="weak" />);

    expect(screen.getByText('Weak')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#DC2626',
    });
  });

  it('should render fair strength for fair password', () => {
    render(<PasswordStrengthIndicator password="Password1" />);

    expect(screen.getByText('Fair')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#EA580C',
    });
  });

  it('should render good strength for good password', () => {
    render(<PasswordStrengthIndicator password="MySecurePass123!" />);

    expect(screen.getByText('Good')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#CA8A04',
    });
  });

  it('should render strong strength for strong password', () => {
    render(<PasswordStrengthIndicator password="Str0ng&SecureP@ssw0rd!" />);

    expect(screen.getByText('Strong')).toBeTruthy();
    expect(screen.getByTestId('password-strength-label')).toHaveStyle({
      color: '#16A34A',
    });
  });

  it('should display feedback messages when showFeedback is true', () => {
    render(<PasswordStrengthIndicator password="weak" showFeedback />);

    expect(screen.getByTestId('password-strength-feedback')).toBeTruthy();
  });

  it('should not display feedback when showFeedback is false', () => {
    render(<PasswordStrengthIndicator password="weak" showFeedback={false} />);

    expect(screen.queryByTestId('password-strength-feedback')).toBeNull();
  });

  it('should display score', () => {
    render(<PasswordStrengthIndicator password="Password123!" />);

    expect(screen.getByTestId('password-strength-score')).toBeTruthy();
  });

  it('should have progress bar with correct accessibility', () => {
    render(<PasswordStrengthIndicator password="Password123!" />);

    const progress = screen.getByTestId('password-strength-progress');
    expect(progress.props.accessibilityRole).toBe('progressbar');
    expect(progress.props.accessibilityValue).toBeDefined();
    expect(progress.props.accessibilityLabel).toContain('Password strength');
  });

  it('should announce strength changes to screen readers', () => {
    render(<PasswordStrengthIndicator password="weak" />);

    const label = screen.getByTestId('password-strength-label');
    expect(label.props.accessibilityLiveRegion).toBe('polite');
  });
});
```

---

## Testing Requirements

### Coverage Requirements

- [ ] 100% line coverage for useFieldValidation hook
- [ ] 100% line coverage for ValidatedTextInput component
- [ ] 100% line coverage for PasswordStrengthIndicator component
- [ ] All edge cases tested
- [ ] All user interactions tested

### Test Scenarios

**Hook Tests**:

- [ ] Initialization
- [ ] Sync validation
- [ ] Async validation
- [ ] Debouncing
- [ ] Cancellation
- [ ] Reset
- [ ] Cleanup

**Component Tests**:

- [ ] Rendering
- [ ] User input
- [ ] Validation triggers
- [ ] Loading states
- [ ] Error display
- [ ] Visual feedback
- [ ] Accessibility

---

## Dependencies

- React Native Testing Library
- Jest
- React
- Yup
- All validation components and hooks

---

## Definition of Done

- [ ] All hook tests implemented
- [ ] All component tests implemented
- [ ] Debouncing behavior tested
- [ ] Async validation tested
- [ ] Loading states tested
- [ ] Error display tested
- [ ] Accessibility tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-055](../stories/US-055-realtime-field-validation.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-308](TASK-308-use-field-validation-hook.md), [TASK-309](TASK-309-password-strength-indicator.md), [TASK-310](TASK-310-validated-text-input.md)

# TASK-308: useFieldValidation Hook

**ID**: TASK-308 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-055](../stories/US-055-realtime-field-validation.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Create a custom React hook for real-time field validation. Implement debounced validation, validation state management, error handling, and integration with React Hook Form. Support both sync and async validation with proper loading states.

---

## Acceptance Criteria

- [ ] Hook created in `src/hooks/useFieldValidation.ts`
- [ ] Support synchronous validation
- [ ] Support asynchronous validation
- [ ] Implement debouncing for performance
- [ ] Track validation state (idle, validating, valid, invalid)
- [ ] Return error messages
- [ ] Integration with React Hook Form
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### useFieldValidation Hook

````typescript
// src/hooks/useFieldValidation.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import * as Yup from 'yup';

/**
 * Validation state
 */
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Hook configuration
 */
export interface UseFieldValidationConfig {
  schema?: Yup.Schema;
  validate?: (value: any) => Promise<ValidationResult> | ValidationResult;
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Hook return value
 */
export interface UseFieldValidationReturn {
  validationState: ValidationState;
  error: string | undefined;
  isValidating: boolean;
  isValid: boolean;
  isInvalid: boolean;
  validateField: (value: any) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for real-time field validation
 *
 * @example
 * ```typescript
 * const { validationState, error, validateField } = useFieldValidation({
 *   schema: emailSchema,
 *   debounceMs: 300,
 *   validateOnChange: true,
 * });
 *
 * // In your input component
 * <TextInput
 *   onChangeText={(text) => {
 *     setValue(text);
 *     validateField(text);
 *   }}
 * />
 * ```
 */
export function useFieldValidation({
  schema,
  validate,
  debounceMs = 300,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFieldValidationConfig): UseFieldValidationReturn {
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Perform validation
   */
  const performValidation = useCallback(
    async (value: any): Promise<void> => {
      // Cancel any pending validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setValidationState('validating');
        setError(undefined);

        let result: ValidationResult;

        if (schema) {
          // Use Yup schema validation
          try {
            await schema.validate(value, { abortEarly: false });
            result = { isValid: true };
          } catch (err) {
            if (err instanceof Yup.ValidationError) {
              result = {
                isValid: false,
                error: err.errors[0], // First error message
              };
            } else {
              throw err;
            }
          }
        } else if (validate) {
          // Use custom validation function
          result = await Promise.resolve(validate(value));
        } else {
          // No validation configured
          result = { isValid: true };
        }

        // Check if validation was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (result.isValid) {
          setValidationState('valid');
          setError(undefined);
        } else {
          setValidationState('invalid');
          setError(result.error);
        }
      } catch (err) {
        // Check if validation was aborted
        if (abortController.signal.aborted) {
          return;
        }

        setValidationState('invalid');
        setError(err instanceof Error ? err.message : 'Validation failed');
      } finally {
        abortControllerRef.current = null;
      }
    },
    [schema, validate]
  );

  /**
   * Debounced validation
   */
  const debouncedValidation = useRef(
    debounce((value: any) => {
      performValidation(value);
    }, debounceMs)
  ).current;

  /**
   * Validate field
   */
  const validateField = useCallback(
    async (value: any): Promise<void> => {
      if (validateOnChange) {
        debouncedValidation(value);
      }
    },
    [debouncedValidation, validateOnChange]
  );

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    debouncedValidation.cancel();
    setValidationState('idle');
    setError(undefined);
  }, [debouncedValidation]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedValidation.cancel();
    };
  }, [debouncedValidation]);

  return {
    validationState,
    error,
    isValidating: validationState === 'validating',
    isValid: validationState === 'valid',
    isInvalid: validationState === 'invalid',
    validateField,
    reset,
  };
}
````

---

### Integration with React Hook Form

````typescript
// src/hooks/useFieldValidationWithForm.ts

import { useCallback } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import {
  useFieldValidation,
  UseFieldValidationConfig,
  UseFieldValidationReturn,
} from './useFieldValidation';

/**
 * Combined hook for React Hook Form + real-time validation
 */
export interface UseFieldValidationWithFormConfig
  extends Omit<UseFieldValidationConfig, 'schema'>,
    UseControllerProps {
  // Inherits both configs
}

/**
 * Hook return value
 */
export interface UseFieldValidationWithFormReturn extends UseFieldValidationReturn {
  field: {
    onChange: (value: any) => void;
    onBlur: () => void;
    value: any;
    name: string;
  };
  fieldState: {
    invalid: boolean;
    error?: { message?: string };
  };
}

/**
 * Custom hook combining React Hook Form with real-time validation
 *
 * @example
 * ```typescript
 * const {
 *   field,
 *   fieldState,
 *   validationState,
 *   error,
 * } = useFieldValidationWithForm({
 *   name: 'email',
 *   control,
 *   validate: emailSchema.validate,
 *   debounceMs: 300,
 * });
 *
 * <TextInput
 *   value={field.value}
 *   onChangeText={field.onChange}
 *   onBlur={field.onBlur}
 * />
 * {fieldState.error && <ErrorMessage>{fieldState.error.message}</ErrorMessage>}
 * ```
 */
export function useFieldValidationWithForm({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  validate,
  debounceMs,
  validateOnChange,
  validateOnBlur,
}: UseFieldValidationWithFormConfig): UseFieldValidationWithFormReturn {
  // React Hook Form controller
  const { field, fieldState } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });

  // Real-time validation
  const validation = useFieldValidation({
    validate,
    debounceMs,
    validateOnChange,
    validateOnBlur,
  });

  // Enhanced onChange with validation
  const handleChange = useCallback(
    (value: any) => {
      field.onChange(value);
      validation.validateField(value);
    },
    [field, validation]
  );

  // Enhanced onBlur with validation
  const handleBlur = useCallback(() => {
    field.onBlur();
    if (validateOnBlur) {
      validation.validateField(field.value);
    }
  }, [field, validation, validateOnBlur]);

  return {
    ...validation,
    field: {
      ...field,
      onChange: handleChange,
      onBlur: handleBlur,
    },
    fieldState,
  };
}
````

---

### Usage Example

```typescript
// src/components/forms/EmailInput.tsx

import React from 'react';
import { TextInput } from 'react-native';
import { useFieldValidation } from '@/hooks/useFieldValidation';
import { emailSchema } from '@/validation/schemas/commonSchemas';
import { ErrorMessage } from '@/components/validation/ErrorMessage';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onBlur,
}) => {
  const { validationState, error, validateField, isValid, isInvalid } =
    useFieldValidation({
      schema: emailSchema,
      debounceMs: 300,
      validateOnChange: true,
    });

  const handleChange = (text: string) => {
    onChange(text);
    validateField(text);
  };

  return (
    <>
      <TextInput
        value={value}
        onChangeText={handleChange}
        onBlur={onBlur}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email"
        accessibilityInvalid={isInvalid}
        testID="email-input"
      />
      {validationState === 'validating' && (
        <ActivityIndicator size="small" testID="email-validating" />
      )}
      {isValid && (
        <Icon name="check-circle" color="green" testID="email-valid" />
      )}
      {error && <ErrorMessage message={error} testID="email-error" />}
    </>
  );
};
```

---

## Testing Requirements

### Unit Tests

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
  });

  it('should validate synchronously with schema', async () => {
    const schema = Yup.string().email('Invalid email');
    const { result } = renderHook(() => useFieldValidation({ schema, debounceMs: 0 }));

    await act(async () => {
      await result.current.validateField('test@example.com');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('valid');
      expect(result.current.error).toBeUndefined();
      expect(result.current.isValid).toBe(true);
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
      expect(result.current.error).toBe('Invalid email');
      expect(result.current.isInvalid).toBe(true);
    });
  });

  it('should debounce validation', async () => {
    const validateFn = jest.fn().mockResolvedValue({ isValid: true });
    const { result } = renderHook(() =>
      useFieldValidation({ validate: validateFn, debounceMs: 300 })
    );

    // Rapid changes
    act(() => {
      result.current.validateField('a');
      result.current.validateField('ab');
      result.current.validateField('abc');
    });

    // Validation should not be called yet
    expect(validateFn).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      // Should only be called once with the last value
      expect(validateFn).toHaveBeenCalledTimes(1);
      expect(validateFn).toHaveBeenCalledWith('abc');
    });
  });

  it('should cancel pending validation on new input', async () => {
    const validateFn = jest.fn(value => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ isValid: true });
        }, 100);
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

    await waitFor(() => {
      // Should only process the second validation
      expect(validateFn).toHaveBeenCalledTimes(2);
    });
  });

  it('should reset validation state', async () => {
    const schema = Yup.string().email();
    const { result } = renderHook(() => useFieldValidation({ schema, debounceMs: 0 }));

    await act(async () => {
      await result.current.validateField('invalid-email');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('invalid');
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.validationState).toBe('idle');
    expect(result.current.error).toBeUndefined();
  });

  it('should handle async validation', async () => {
    const asyncValidate = jest.fn(
      value =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              isValid: value === 'unique',
              error: value !== 'unique' ? 'Username taken' : undefined,
            });
          }, 50);
        })
    );

    const { result } = renderHook(() =>
      useFieldValidation({ validate: asyncValidate, debounceMs: 0 })
    );

    await act(async () => {
      await result.current.validateField('taken');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('invalid');
      expect(result.current.error).toBe('Username taken');
    });

    await act(async () => {
      await result.current.validateField('unique');
    });

    await waitFor(() => {
      expect(result.current.validationState).toBe('valid');
      expect(result.current.error).toBeUndefined();
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

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Validation should not execute after unmount
    expect(validateFn).not.toHaveBeenCalled();
  });
});
```

---

## Dependencies

- React
- Lodash (debounce)
- Yup
- React Hook Form (optional integration)

---

## Definition of Done

- [ ] useFieldValidation hook implemented
- [ ] Synchronous validation working
- [ ] Asynchronous validation working
- [ ] Debouncing implemented
- [ ] Validation state tracked correctly
- [ ] Error messages returned
- [ ] Integration with React Hook Form complete
- [ ] Abort pending validations working
- [ ] Reset functionality working
- [ ] Cleanup on unmount working
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-055](../stories/US-055-realtime-field-validation.md), [EPIC-028](../epics/EPIC-028-form-validation.md)

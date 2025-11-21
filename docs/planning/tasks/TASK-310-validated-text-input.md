# TASK-310: ValidatedTextInput Component

**ID**: TASK-310 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-055](../stories/US-055-realtime-field-validation.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Create a reusable ValidatedTextInput component that integrates real-time validation, error display, accessibility features, and visual feedback. Support integration with React Hook Form, custom validation functions, and Yup schemas. Provide validation state indicators (validating, valid, invalid) and ensure full EAA compliance.

---

## Acceptance Criteria

- [ ] Component created in `src/components/forms/ValidatedTextInput.tsx`
- [ ] Integration with useFieldValidation hook
- [ ] Display validation state (idle, validating, valid, invalid)
- [ ] Show error messages with accessibility
- [ ] Visual feedback (check icon for valid, error icon for invalid)
- [ ] Support for React Hook Form integration
- [ ] Support for Yup schemas
- [ ] Debounced real-time validation
- [ ] Touch target compliance (44×44 iOS, 48×48 Android)
- [ ] EAA compliant (contrast, labels, live regions)
- [ ] TypeScript strict mode compliant
- [ ] Unit tests with 100% coverage

---

## Implementation Details

### ValidatedTextInput Component

````typescript
// src/components/forms/ValidatedTextInput.tsx

import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInputProps as RNTextInputProps,
  Platform,
} from 'react-native';
import { Box, HStack, VStack, Icon } from '@gluestack-ui/themed';
import { Check, AlertCircle } from 'lucide-react-native';
import {
  useFieldValidation,
  UseFieldValidationConfig,
} from '@/hooks/useFieldValidation';
import { ErrorMessage } from '@/components/validation/ErrorMessage';

export interface ValidatedTextInputProps
  extends Omit<RNTextInputProps, 'onChange' | 'onBlur'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  validation?: UseFieldValidationConfig;
  showValidationState?: boolean;
  helperText?: string;
  required?: boolean;
  testID?: string;
}

/**
 * Validated text input component with real-time validation
 *
 * @example
 * ```tsx
 * <ValidatedTextInput
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   validation={{
 *     schema: emailSchema,
 *     debounceMs: 300,
 *   }}
 *   showValidationState={true}
 *   required
 * />
 * ```
 */
export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  validation,
  showValidationState = true,
  helperText,
  required = false,
  testID = 'validated-input',
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Real-time validation
  const {
    validationState,
    error,
    isValidating,
    isValid,
    isInvalid,
    validateField,
    reset,
  } = useFieldValidation(validation || {});

  // Handle change
  const handleChangeText = (text: string) => {
    onChangeText(text);
    if (validation) {
      validateField(text);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
    if (onBlur) {
      onBlur();
    }
    if (validation && value) {
      validateField(value);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Determine border color based on state
  const getBorderColor = (): string => {
    if (isFocused) {
      return '#3B82F6'; // Blue (focus)
    }
    if (isTouched && isInvalid) {
      return '#DC2626'; // Red (error)
    }
    if (isTouched && isValid) {
      return '#16A34A'; // Green (valid)
    }
    return '#D1D5DB'; // Gray (default)
  };

  // Minimum touch target size
  const MIN_TOUCH_TARGET = Platform.OS === 'ios' ? 44 : 48;

  return (
    <VStack space="xs" testID={testID}>
      {/* Label */}
      {label && (
        <Text
          style={styles.label}
          accessibilityRole="text"
          testID={`${testID}-label`}
        >
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <Box position="relative">
        <RNTextInput
          {...textInputProps}
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          style={[
            styles.input,
            {
              borderColor: getBorderColor(),
              minHeight: MIN_TOUCH_TARGET,
              paddingRight: showValidationState ? 44 : 16,
            },
            textInputProps.style,
          ]}
          accessibilityLabel={label || textInputProps.placeholder}
          accessibilityRequired={required}
          accessibilityInvalid={isTouched && isInvalid}
          accessibilityHint={helperText}
          testID={`${testID}-input`}
        />

        {/* Validation State Indicator */}
        {showValidationState && isTouched && value && (
          <Box
            position="absolute"
            right={12}
            top="50%"
            style={{ transform: [{ translateY: -12 }] }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID={`${testID}-validation-indicator`}
          >
            {isValidating && (
              <ActivityIndicator
                size="small"
                color="#6B7280"
                testID={`${testID}-validating`}
              />
            )}
            {isValid && !isValidating && (
              <Icon
                as={Check}
                size="md"
                color="#16A34A"
                testID={`${testID}-valid`}
              />
            )}
            {isInvalid && !isValidating && (
              <Icon
                as={AlertCircle}
                size="md"
                color="#DC2626"
                testID={`${testID}-invalid`}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Helper Text */}
      {helperText && !error && (
        <Text
          style={styles.helperText}
          accessibilityRole="text"
          testID={`${testID}-helper`}
        >
          {helperText}
        </Text>
      )}

      {/* Error Message */}
      {isTouched && error && (
        <ErrorMessage message={error} testID={`${testID}-error`} />
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
````

---

### React Hook Form Integration

````typescript
// src/components/forms/ControlledValidatedTextInput.tsx

import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
  ValidatedTextInput,
  ValidatedTextInputProps,
} from './ValidatedTextInput';

interface ControlledValidatedTextInputProps<T extends FieldValues>
  extends Omit<ValidatedTextInputProps, 'value' | 'onChangeText'> {
  name: Path<T>;
  control: Control<T>;
  defaultValue?: string;
}

/**
 * Validated text input integrated with React Hook Form
 *
 * @example
 * ```tsx
 * <ControlledValidatedTextInput
 *   name="email"
 *   control={control}
 *   label="Email"
 *   validation={{ schema: emailSchema }}
 *   required
 * />
 * ```
 */
export function ControlledValidatedTextInput<T extends FieldValues>({
  name,
  control,
  defaultValue = '',
  ...props
}: ControlledValidatedTextInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue as any}
      render={({ field: { onChange, onBlur, value } }) => (
        <ValidatedTextInput
          {...props}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
        />
      )}
    />
  );
}
````

---

### Usage Examples

```typescript
// Example 1: Standalone usage
import { ValidatedTextInput } from '@/components/forms/ValidatedTextInput';
import { emailSchema } from '@/validation/schemas/commonSchemas';

function EmailForm() {
  const [email, setEmail] = useState('');

  return (
    <ValidatedTextInput
      label="Email"
      value={email}
      onChangeText={setEmail}
      validation={{
        schema: emailSchema,
        debounceMs: 300,
      }}
      placeholder="Enter your email"
      keyboardType="email-address"
      autoCapitalize="none"
      required
    />
  );
}

// Example 2: React Hook Form integration
import { useForm } from 'react-hook-form';
import { ControlledValidatedTextInput } from '@/components/forms/ControlledValidatedTextInput';
import { signInSchema } from '@/validation/schemas/authSchemas';

function SignInForm() {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(signInSchema),
  });

  return (
    <>
      <ControlledValidatedTextInput
        name="email"
        control={control}
        label="Email"
        validation={{ schema: emailSchema }}
        placeholder="Enter your email"
        keyboardType="email-address"
        required
      />

      <ControlledValidatedTextInput
        name="password"
        control={control}
        label="Password"
        validation={{ schema: passwordSchema }}
        placeholder="Enter your password"
        secureTextEntry
        required
      />
    </>
  );
}

// Example 3: Custom async validation
function UsernameInput() {
  const [username, setUsername] = useState('');

  const checkUsernameAvailability = async (value: string) => {
    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();
    return {
      isValid: data.available,
      error: data.available ? undefined : 'Username is already taken',
    };
  };

  return (
    <ValidatedTextInput
      label="Username"
      value={username}
      onChangeText={setUsername}
      validation={{
        validate: checkUsernameAvailability,
        debounceMs: 500,
      }}
      placeholder="Choose a username"
      autoCapitalize="none"
      required
    />
  );
}
```

---

## Testing Requirements

### Component Unit Tests

```typescript
// src/components/forms/__tests__/ValidatedTextInput.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ValidatedTextInput } from '../ValidatedTextInput';
import * as Yup from 'yup';

describe('ValidatedTextInput', () => {
  it('should render with label', () => {
    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
      />
    );

    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('should show required indicator when required', () => {
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

  it('should validate on change with debounce', async () => {
    jest.useFakeTimers();
    const schema = Yup.string().email('Invalid email');
    const onChangeText = jest.fn();

    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={onChangeText}
        validation={{ schema, debounceMs: 300 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');

    fireEvent.changeText(input, 'invalid-email');
    expect(onChangeText).toHaveBeenCalledWith('invalid-email');

    // Fast-forward debounce
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByTestId('validated-input-invalid')).toBeTruthy();
    });

    jest.useRealTimers();
  });

  it('should show error message after blur with invalid value', async () => {
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
      expect(screen.getByTestId('validated-input-valid')).toBeTruthy();
    });
  });

  it('should show loading indicator while validating', async () => {
    const asyncValidate = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ isValid: true }), 100);
        })
    );

    render(
      <ValidatedTextInput
        label="Username"
        value="testuser"
        onChangeText={() => {}}
        validation={{ validate: asyncValidate, debounceMs: 0 }}
      />
    );

    const input = screen.getByTestId('validated-input-input');

    fireEvent(input, 'blur');

    // Should show loading indicator
    expect(screen.getByTestId('validated-input-validating')).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByTestId('validated-input-validating')).toBeNull();
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
        helperText="We'll never share your email"
      />
    );

    const input = screen.getByTestId('validated-input-input');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(screen.queryByText("We'll never share your email")).toBeNull();
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
      />
    );

    const input = screen.getByTestId('validated-input-input');
    expect(input.props.accessibilityLabel).toBe('Email');
    expect(input.props.accessibilityRequired).toBe(true);
  });

  it('should have minimum touch target size', () => {
    render(
      <ValidatedTextInput
        label="Email"
        value=""
        onChangeText={() => {}}
      />
    );

    const input = screen.getByTestId('validated-input-input');
    const minHeight = Platform.OS === 'ios' ? 44 : 48;
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ minHeight })
    );
  });
});
```

---

## Dependencies

- React
- React Native
- GlueStack UI
- Lucide React Native (icons)
- useFieldValidation hook
- React Hook Form (optional integration)

---

## Definition of Done

- [ ] ValidatedTextInput component implemented
- [ ] Real-time validation integrated
- [ ] Validation state indicators working
- [ ] Error messages displayed with accessibility
- [ ] Visual feedback (icons) working
- [ ] React Hook Form integration complete
- [ ] Debounced validation working
- [ ] Touch target compliance achieved
- [ ] EAA compliant (contrast, labels, live regions)
- [ ] All unit tests passing
- [ ] 100% code coverage
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-055](../stories/US-055-realtime-field-validation.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-308](TASK-308-use-field-validation-hook.md), [TASK-309](TASK-309-password-strength-indicator.md)

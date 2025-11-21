# TASK-311: Real-Time Validation Examples

**ID**: TASK-311 | **Epic**: [EPIC-028](../epics/EPIC-028-form-validation.md) | **User Story**: [US-055](../stories/US-055-realtime-field-validation.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create comprehensive examples demonstrating real-time validation patterns across different form types. Include sign-in, sign-up, password reset, profile update, and custom async validation examples. Serve as reference implementations for developers.

---

## Acceptance Criteria

- [ ] Examples created in `src/examples/validation/`
- [ ] Sign-in form example with real-time validation
- [ ] Sign-up form example with password strength
- [ ] Password reset example with confirmation matching
- [ ] Profile update example with conditional validation
- [ ] Async username availability check example
- [ ] Custom validation function examples
- [ ] All examples fully functional and testable
- [ ] Documentation comments included
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Sign-In Form Example

```typescript
// src/examples/validation/SignInExample.tsx

import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInSchema } from '@/validation/schemas/authSchemas';
import { ControlledValidatedTextInput } from '@/components/forms/ControlledValidatedTextInput';

interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Sign-in form with real-time validation
 * Demonstrates:
 * - Email format validation
 * - Password strength validation
 * - Real-time error display
 * - Form submission handling
 */
export const SignInExample: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: SignInFormData) => {
    console.log('Sign in data:', data);
    // Perform sign-in logic
  };

  return (
    <View style={{ padding: 16 }}>
      <ControlledValidatedTextInput
        name="email"
        control={control}
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
        helperText="We'll never share your email"
      />

      <ControlledValidatedTextInput
        name="password"
        control={control}
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        required
        helperText="Minimum 8 characters"
      />

      <Button
        title={isSubmitting ? 'Signing in...' : 'Sign In'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
};
```

---

### Sign-Up Form Example with Password Strength

```typescript
// src/examples/validation/SignUpExample.tsx

import React, { useState } from 'react';
import { View, Button, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema } from '@/validation/schemas/authSchemas';
import { ControlledValidatedTextInput } from '@/components/forms/ControlledValidatedTextInput';
import { PasswordStrengthIndicator } from '@/components/validation/PasswordStrengthIndicator';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

/**
 * Sign-up form with password strength indicator
 * Demonstrates:
 * - Multiple field validation
 * - Password strength feedback
 * - Password confirmation matching
 * - Phone number international format
 */
export const SignUpExample: React.FC = () => {
  const [password, setPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.log('Sign up data:', data);
    // Perform sign-up logic
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <ControlledValidatedTextInput
        name="firstName"
        control={control}
        label="First Name"
        placeholder="Enter your first name"
        autoCapitalize="words"
        required
      />

      <ControlledValidatedTextInput
        name="lastName"
        control={control}
        label="Last Name"
        placeholder="Enter your last name"
        autoCapitalize="words"
        required
      />

      <ControlledValidatedTextInput
        name="email"
        control={control}
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />

      <ControlledValidatedTextInput
        name="phoneNumber"
        control={control}
        label="Phone Number"
        placeholder="+1234567890"
        keyboardType="phone-pad"
        required
        helperText="Enter with country code (e.g., +1234567890)"
      />

      <View>
        <ControlledValidatedTextInput
          name="password"
          control={control}
          label="Password"
          placeholder="Create a strong password"
          secureTextEntry
          required
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
        {password && (
          <PasswordStrengthIndicator password={password} showFeedback />
        )}
      </View>

      <ControlledValidatedTextInput
        name="confirmPassword"
        control={control}
        label="Confirm Password"
        placeholder="Re-enter your password"
        secureTextEntry
        required
      />

      <Button
        title={isSubmitting ? 'Creating account...' : 'Sign Up'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </ScrollView>
  );
};
```

---

### Async Username Validation Example

```typescript
// src/examples/validation/UsernameValidationExample.tsx

import React, { useState } from 'react';
import { View } from 'react-native';
import { ValidatedTextInput } from '@/components/forms/ValidatedTextInput';

/**
 * Async username availability check
 * Simulates API call to check if username is available
 */
const checkUsernameAvailability = async (
  username: string
): Promise<{ isValid: boolean; error?: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate taken usernames
  const takenUsernames = ['admin', 'user', 'test', 'demo'];

  if (takenUsernames.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'Username is already taken',
    };
  }

  return { isValid: true };
};

/**
 * Username input with async availability check
 * Demonstrates:
 * - Async validation with debouncing
 * - Loading state during validation
 * - Success/error feedback
 */
export const UsernameValidationExample: React.FC = () => {
  const [username, setUsername] = useState('');

  return (
    <View style={{ padding: 16 }}>
      <ValidatedTextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        validation={{
          validate: checkUsernameAvailability,
          debounceMs: 500,
        }}
        placeholder="Choose a unique username"
        autoCapitalize="none"
        autoCorrect={false}
        required
        helperText="Username must be unique. We'll check availability as you type."
      />
    </View>
  );
};
```

---

### Password Reset Example

```typescript
// src/examples/validation/PasswordResetExample.tsx

import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '@/validation/schemas/authSchemas';
import { ControlledValidatedTextInput } from '@/components/forms/ControlledValidatedTextInput';
import { PasswordStrengthIndicator } from '@/components/validation/PasswordStrengthIndicator';

interface PasswordResetFormData {
  password: string;
  confirmPassword: string;
}

/**
 * Password reset form
 * Demonstrates:
 * - Password strength validation
 * - Password confirmation matching
 * - Real-time validation feedback
 */
export const PasswordResetExample: React.FC = () => {
  const [password, setPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    console.log('Reset password data:', data);
    // Perform password reset logic
  };

  return (
    <View style={{ padding: 16 }}>
      <View>
        <ControlledValidatedTextInput
          name="password"
          control={control}
          label="New Password"
          placeholder="Create a strong password"
          secureTextEntry
          required
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
        {password && (
          <PasswordStrengthIndicator password={password} showFeedback />
        )}
      </View>

      <ControlledValidatedTextInput
        name="confirmPassword"
        control={control}
        label="Confirm New Password"
        placeholder="Re-enter your password"
        secureTextEntry
        required
      />

      <Button
        title={isSubmitting ? 'Resetting password...' : 'Reset Password'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
};
```

---

### Profile Update with Conditional Validation

```typescript
// src/examples/validation/ProfileUpdateExample.tsx

import React, { useState } from 'react';
import { View, Button, Switch, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { completeProfileUpdateFormSchema } from '@/validation/schemas/formSchemas';
import { ControlledValidatedTextInput } from '@/components/forms/ControlledValidatedTextInput';

interface ProfileUpdateFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio?: string;
  websiteUrl?: string;
}

/**
 * Profile update form with conditional fields
 * Demonstrates:
 * - Optional field validation
 * - URL validation
 * - Conditional requirements
 */
export const ProfileUpdateExample: React.FC = () => {
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormData>({
    resolver: yupResolver(completeProfileUpdateFormSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: ProfileUpdateFormData) => {
    console.log('Profile update data:', data);
    // Perform profile update logic
  };

  return (
    <View style={{ padding: 16 }}>
      <ControlledValidatedTextInput
        name="firstName"
        control={control}
        label="First Name"
        placeholder="Enter your first name"
        autoCapitalize="words"
        required
      />

      <ControlledValidatedTextInput
        name="lastName"
        control={control}
        label="Last Name"
        placeholder="Enter your last name"
        autoCapitalize="words"
        required
      />

      <ControlledValidatedTextInput
        name="phoneNumber"
        control={control}
        label="Phone Number"
        placeholder="+1234567890"
        keyboardType="phone-pad"
        required
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
        <Text>Show optional fields</Text>
        <Switch
          value={showOptionalFields}
          onValueChange={setShowOptionalFields}
        />
      </View>

      {showOptionalFields && (
        <>
          <ControlledValidatedTextInput
            name="bio"
            control={control}
            label="Bio"
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            helperText="Optional: A brief description about you"
          />

          <ControlledValidatedTextInput
            name="websiteUrl"
            control={control}
            label="Website"
            placeholder="https://example.com"
            keyboardType="url"
            autoCapitalize="none"
            helperText="Optional: Your personal website or portfolio"
          />
        </>
      )}

      <Button
        title={isSubmitting ? 'Updating profile...' : 'Update Profile'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />
    </View>
  );
};
```

---

### Custom Validation Function Example

```typescript
// src/examples/validation/CustomValidationExample.tsx

import React, { useState } from 'react';
import { View } from 'react-native';
import { ValidatedTextInput } from '@/components/forms/ValidatedTextInput';

/**
 * Custom validation: Age verification
 */
const validateAge = (value: string): { isValid: boolean; error?: string } => {
  const age = parseInt(value, 10);

  if (isNaN(age)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (age < 18) {
    return { isValid: false, error: 'You must be at least 18 years old' };
  }

  if (age > 120) {
    return { isValid: false, error: 'Please enter a realistic age' };
  }

  return { isValid: true };
};

/**
 * Custom validation example
 * Demonstrates:
 * - Custom validation logic
 * - Number input validation
 * - Range validation
 */
export const CustomValidationExample: React.FC = () => {
  const [age, setAge] = useState('');

  return (
    <View style={{ padding: 16 }}>
      <ValidatedTextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        validation={{
          validate: validateAge,
          debounceMs: 300,
        }}
        placeholder="Enter your age"
        keyboardType="number-pad"
        required
        helperText="You must be at least 18 years old"
      />
    </View>
  );
};
```

---

## Testing Requirements

No formal tests required for examples, but:

- [ ] All examples compile without errors
- [ ] All examples run in development mode
- [ ] All validation logic works as expected
- [ ] Documentation comments are clear and helpful

---

## Dependencies

- React
- React Native
- React Hook Form
- Yup validation schemas
- Validation components

---

## Definition of Done

- [ ] Sign-in example created
- [ ] Sign-up example with password strength created
- [ ] Async username validation example created
- [ ] Password reset example created
- [ ] Profile update with conditional validation created
- [ ] Custom validation function examples created
- [ ] All examples compile and run
- [ ] Documentation comments complete
- [ ] TypeScript strict mode compliant
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-055](../stories/US-055-realtime-field-validation.md), [EPIC-028](../epics/EPIC-028-form-validation.md), [TASK-308](TASK-308-use-field-validation-hook.md), [TASK-309](TASK-309-password-strength-indicator.md), [TASK-310](TASK-310-validated-text-input.md)

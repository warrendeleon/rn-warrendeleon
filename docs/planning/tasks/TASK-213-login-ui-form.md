# TASK-213: Login UI Form

**ID**: TASK-213 | **Title**: Build Login UI Form with Email/Password Inputs
**User Story**: [US-036](../stories/US-036-email-password-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: ✅ Done | **Priority**: High | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

### Why This Task Matters

The login form is the primary entry point for returning users. A well-designed login form balances:

1. **Security**: Validates input, prevents common attacks (XSS, SQL injection)
2. **User Experience**: Clear feedback, intuitive layout, fast response
3. **Accessibility**: EAA compliant, screen reader friendly, touch target compliance
4. **Error Handling**: Specific, actionable error messages

**User Flow**:

```
User opens app
  → App checks if logged in (refresh token exists)
  → Not logged in → Navigate to LoginScreen
  → User sees login form with email/password fields
  → User taps email field → Keyboard appears
  → User enters email → Real-time validation on blur
  → User taps password field → Secure keyboard appears
  → User enters password → Show/hide password toggle
  → User taps "Log In" button → Button shows loading state
  → API call succeeds → Navigate to Home
  → API call fails → Show error message below form
```

**Error Scenarios**:

```
Invalid email format → "Please enter a valid email address"
Empty email → "Email is required"
Empty password → "Password is required"
Wrong credentials → "Incorrect email or password"
Network error → "Network error. Please try again."
Account locked → "Your account has been locked. Please contact support."
```

### Design Specifications

**Layout** (Mobile-first, single column):

```
┌─────────────────────────────────────┐
│                                     │
│         [App Logo/Icon]             │
│                                     │
│    Welcome Back                     │
│    Log in to your account           │
│                                     │
│    Email                            │
│    [user@example.com            ]   │
│    └─ Error message here            │
│                                     │
│    Password                         │
│    [•••••••••••            👁]      │
│    └─ Error message here            │
│                                     │
│    [Forgot password?]               │
│                                     │
│    [          Log In          ]     │
│                                     │
│    Don't have an account? [Sign up] │
│                                     │
│    ──────── Or ────────             │
│                                     │
│    [🔗 Log in with Magic Link]     │
│    [💼 Log in with LinkedIn]       │
│                                     │
└─────────────────────────────────────┘
```

**Color Palette** (GlueStack UI):

- Primary button: `bg-primary-600` (active), `bg-primary-700` (pressed)
- Error: `text-error-700`, `bg-error-100` (error background)
- Input border: `border-gray-300` (default), `border-primary-500` (focus), `border-error-500` (error)

**Typography**:

- Heading: `text-2xl font-bold`
- Subheading: `text-base text-gray-600`
- Input labels: `text-sm font-medium`
- Error messages: `text-sm text-error-700`

---

## Objective

Build a fully functional login form UI with:

1. Email input field with validation (Yup schema, React Hook Form)
2. Password input field with show/hide toggle
3. "Log In" button with loading state
4. "Forgot password?" link
5. Navigation to Sign Up screen
6. Alternative login methods (Magic Link, LinkedIn OAuth)
7. Full EAA compliance (accessibility labels, touch targets, screen reader support)

---

## Detailed Implementation Guide

### Phase 1: Set Up LoginScreen Component (20 minutes)

**File**: `src/features/Auth/screens/LoginScreen.tsx`

**Deliverables**:

- LoginScreen component with SafeAreaView
- ScrollView wrapper (handles keyboard overlap)
- Basic layout structure (header, form, footer)

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx
import React from 'react';
import { ScrollView, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      testID="login-screen"
      className="flex-1 bg-white"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* App Logo */}
            <View className="items-center mb-8">
              {/* TODO: Replace with actual app logo */}
              <View className="w-20 h-20 bg-primary-500 rounded-full" />
            </View>

            {/* Header */}
            <View className="mb-6">
              <Text
                className="text-2xl font-bold text-center mb-2"
                accessibilityRole="header"
              >
                Welcome Back
              </Text>
              <Text className="text-base text-gray-600 text-center">
                Log in to your account
              </Text>
            </View>

            {/* Form will go here */}
            <View className="mb-6">
              <Text>Login form placeholder</Text>
            </View>

            {/* Footer */}
            <View className="items-center">
              <Text className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Text
                  className="text-primary-600 font-semibold"
                  onPress={() => navigation.navigate('Register')}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
```

**Validation**:

```bash
yarn typecheck  # No TypeScript errors
yarn lint       # No ESLint errors
```

---

### Phase 2: Create Login Form Schema (15 minutes)

**File**: `src/features/Auth/validation/loginSchema.ts`

**Deliverables**:

- Yup validation schema for email and password
- Type-safe schema with TypeScript inference

**Code**:

```typescript
// src/schemas/loginSchema.ts
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
```

**Validation**:

```bash
yarn test src/schemas/__tests__/loginSchema.test.ts
```

**Test File** (create alongside):

```typescript
// src/features/Auth/validation/__tests__/loginSchema.test.ts
import { loginSchema } from '../loginSchema';

describe('loginSchema', () => {
  it('should validate valid email and password', async () => {
    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123',
    };

    await expect(loginSchema.validate(validData)).resolves.toBeTruthy();
  });

  it('should reject invalid email format', async () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123',
    };

    await expect(loginSchema.validate(invalidData)).rejects.toThrow(
      'Please enter a valid email address'
    );
  });

  it('should reject empty email', async () => {
    const invalidData = {
      email: '',
      password: 'SecurePass123',
    };

    await expect(loginSchema.validate(invalidData)).rejects.toThrow('Email is required');
  });

  it('should reject password shorter than 8 characters', async () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'short',
    };

    await expect(loginSchema.validate(invalidData)).rejects.toThrow(
      'Password must be at least 8 characters'
    );
  });

  it('should reject empty password', async () => {
    const invalidData = {
      email: 'user@example.com',
      password: '',
    };

    await expect(loginSchema.validate(invalidData)).rejects.toThrow('Password is required');
  });
});
```

---

### Phase 3: Build Email Input Component (20 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- Email input field using React Hook Form
- Real-time validation on blur
- Error message display below input
- Full EAA compliance

**Code**:

```typescript
// src/features/Auth/screens/LoginScreen.tsx (updated)
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, LoginFormData } from '../validation/loginSchema';
import { Input, InputField, FormControl, FormControlLabel, FormControlLabelText, FormControlError, FormControlErrorText } from '@gluestack-ui/themed';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Form submitted:', data);
    // TODO: Call login API
  };

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* App Logo */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-primary-500 rounded-full" />
            </View>

            {/* Header */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-center mb-2" accessibilityRole="header">
                Welcome Back
              </Text>
              <Text className="text-base text-gray-600 text-center">
                Log in to your account
              </Text>
            </View>

            {/* Email Input */}
            <FormControl isInvalid={!!errors.email} className="mb-4">
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    testID="email-input"
                    accessibilityLabel="Email address"
                    accessibilityHint="Enter your email address"
                  >
                    <InputField
                      placeholder="user@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              {errors.email && (
                <FormControlError>
                  <FormControlErrorText testID="email-error">
                    {errors.email.message}
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Password Input (placeholder for now) */}
            <View className="mb-4">
              <Text>Password input will go here</Text>
            </View>

            {/* Footer */}
            <View className="items-center">
              <Text className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Text
                  className="text-primary-600 font-semibold"
                  onPress={() => navigation.navigate('Register')}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
```

**Validation**:

- Run app: `yarn ios`
- Tap email field
- Enter invalid email (e.g., "test")
- Tap outside field
- Verify error message appears: "Please enter a valid email address"

---

### Phase 4: Build Password Input with Show/Hide Toggle (25 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- Password input field with secure text entry
- Show/hide password toggle button (eye icon)
- Error message display below input
- Full EAA compliance

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';  // Icon library

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  // ... existing code

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      {/* ... existing code */}

      {/* Password Input */}
      <FormControl isInvalid={!!errors.password} className="mb-4">
        <FormControlLabel>
          <FormControlLabelText>Password</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              testID="password-input"
              accessibilityLabel="Password"
              accessibilityHint="Enter your password"
            >
              <InputField
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                testID="password-toggle"
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityHint="Toggles password visibility"
                style={{ padding: 8, minWidth: 44, minHeight: 44 }}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </Pressable>
            </Input>
          )}
        />
        {errors.password && (
          <FormControlError>
            <FormControlErrorText testID="password-error">
              {errors.password.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* ... existing code */}
    </SafeAreaView>
  );
};
```

**Alternative** (if lucide-react-native not installed):

```bash
yarn add lucide-react-native
```

Or use built-in React Native icons:

```typescript
// Use built-in Text emoji instead
<Text style={{ fontSize: 20 }}>
  {showPassword ? '🙈' : '👁️'}
</Text>
```

**Validation**:

- Enter password
- Tap eye icon → Password becomes visible
- Tap again → Password hidden again

---

### Phase 5: Build "Log In" Button with Loading State (20 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- "Log In" button with primary styling
- Loading state (spinner, disabled)
- Submit handler integration with React Hook Form
- Full EAA compliance

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
import { Button, ButtonText, ButtonSpinner } from '@gluestack-ui/themed';

export const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    console.log('Logging in:', data);

    // TODO: Call login API
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
  };

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      {/* ... existing code */}

      {/* Log In Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        testID="login-button"
        accessibilityRole="button"
        accessibilityLabel="Log in"
        accessibilityHint="Submits your email and password to log in"
        isDisabled={isLoading}
        size="lg"
        className="mb-4"
      >
        {isLoading && <ButtonSpinner />}
        <ButtonText>{isLoading ? 'Logging in...' : 'Log In'}</ButtonText>
      </Button>

      {/* ... existing code */}
    </SafeAreaView>
  );
};
```

**Validation**:

- Enter valid email and password
- Tap "Log In" button
- Verify button shows "Logging in..." with spinner
- Verify button is disabled during loading

---

### Phase 6: Add "Forgot Password?" Link (10 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- "Forgot password?" link below password field
- Navigation to ForgotPasswordScreen
- Full EAA compliance

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
export const LoginScreen: React.FC = () => {
  // ... existing code

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      {/* ... existing code */}

      {/* Password Input */}
      <FormControl isInvalid={!!errors.password} className="mb-2">
        {/* ... password input code */}
      </FormControl>

      {/* Forgot Password Link */}
      <Pressable
        onPress={() => navigation.navigate('ForgotPassword')}
        testID="forgot-password-link"
        accessibilityRole="link"
        accessibilityLabel="Forgot password?"
        accessibilityHint="Opens forgot password screen"
        className="mb-6"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Text className="text-sm text-primary-600 text-right">
          Forgot password?
        </Text>
      </Pressable>

      {/* ... existing code */}
    </SafeAreaView>
  );
};
```

---

### Phase 7: Add Alternative Login Methods (20 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Deliverables**:

- Divider with "Or" text
- "Log in with Magic Link" button
- "Log in with LinkedIn" button (placeholder)
- Navigation to respective screens
- Full EAA compliance

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
export const LoginScreen: React.FC = () => {
  // ... existing code

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      {/* ... existing code */}

      {/* Log In Button */}
      <Button onPress={handleSubmit(onSubmit)} testID="login-button" size="lg" className="mb-6">
        {isLoading && <ButtonSpinner />}
        <ButtonText>{isLoading ? 'Logging in...' : 'Log In'}</ButtonText>
      </Button>

      {/* Sign Up Link */}
      <View className="items-center mb-6">
        <Text className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Text
            className="text-primary-600 font-semibold"
            onPress={() => navigation.navigate('Register')}
          >
            Sign up
          </Text>
        </Text>
      </View>

      {/* Divider */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-sm text-gray-600">Or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Magic Link Button */}
      <Button
        onPress={() => {
          // TODO: Navigate to Magic Link tab or trigger magic link flow
          console.log('Magic Link login');
        }}
        testID="magic-link-button"
        accessibilityRole="button"
        accessibilityLabel="Log in with Magic Link"
        accessibilityHint="Sends a login link to your email"
        variant="outline"
        size="lg"
        className="mb-3"
      >
        <ButtonText>🔗 Log in with Magic Link</ButtonText>
      </Button>

      {/* LinkedIn Button */}
      <Button
        onPress={() => {
          // TODO: Trigger LinkedIn OAuth flow
          console.log('LinkedIn login');
        }}
        testID="linkedin-button"
        accessibilityRole="button"
        accessibilityLabel="Log in with LinkedIn"
        accessibilityHint="Opens LinkedIn login in browser"
        variant="outline"
        size="lg"
      >
        <ButtonText>💼 Log in with LinkedIn</ButtonText>
      </Button>

      {/* ... existing code */}
    </SafeAreaView>
  );
};
```

---

## Acceptance Criteria

**Functional Requirements**:

- [x] Email input field renders correctly
- [x] Email validation on blur (Yup schema)
- [x] Password input field renders correctly
- [x] Password show/hide toggle works
- [x] "Log In" button submits form
- [x] Button shows loading state during submission
- [x] "Forgot password?" link navigates to ForgotPasswordScreen
- [x] "Sign up" link navigates to RegisterScreen
- [x] "Magic Link" button renders (placeholder for now)
- [x] "LinkedIn" button renders (placeholder for now)
- [x] Form validates on submit (both email and password required)

**Non-Functional Requirements**:

- [x] All input fields have proper `testID` for E2E tests
- [x] All touch targets minimum 44×44 (iOS) / 48×48 (Android)
- [x] Email keyboard type is "email-address"
- [x] Password field uses `secureTextEntry`
- [x] Form scrolls correctly when keyboard appears
- [x] `KeyboardAvoidingView` works on iOS
- [x] All elements have proper accessibility labels/roles/hints

**Error Handling**:

- [x] Invalid email → "Please enter a valid email address"
- [x] Empty email → "Email is required"
- [x] Empty password → "Password is required"
- [x] Password <8 chars → "Password must be at least 8 characters"

**EAA Compliance**:

- [x] Email field has `accessibilityLabel="Email address"`
- [x] Password field has `accessibilityLabel="Password"`
- [x] "Log In" button has `accessibilityRole="button"` and hint
- [x] "Forgot password?" link has `accessibilityRole="link"` and hint
- [x] Error messages announced to screen reader
- [x] All touch targets comply with minimum size

---

## Testing

### Manual Testing Checklist

**Email Field**:

- [x] Tap email field → Keyboard appears (email type)
- [x] Enter invalid email → Blur → Error message appears
- [x] Enter valid email → Blur → No error
- [x] Leave empty → Submit → "Email is required" error

**Password Field**:

- [x] Tap password field → Secure keyboard appears
- [x] Password displays as dots (•••)
- [x] Tap eye icon → Password becomes visible
- [x] Tap eye icon again → Password hidden
- [x] Leave empty → Submit → "Password is required" error
- [x] Enter <8 chars → Submit → "Password must be at least 8 characters" error

**Submit Button**:

- [x] Valid email + password → Tap "Log In" → Button shows loading state
- [x] Button disabled during loading
- [x] Console logs form data

**Navigation**:

- [x] Tap "Forgot password?" → Navigate to ForgotPasswordScreen
- [x] Tap "Sign up" → Navigate to RegisterScreen

**Keyboard**:

- [x] Keyboard appears when tapping input
- [x] Keyboard doesn't overlap inputs (KeyboardAvoidingView works)
- [x] Tap outside input → Keyboard dismisses

**Accessibility** (VoiceOver/TalkBack):

- [x] Email field announced as "Email address"
- [x] Password field announced as "Password"
- [x] "Log In" button announced with hint
- [x] Error messages announced when they appear

---

## Troubleshooting

### Issue: Keyboard overlaps input fields

**Symptoms**: Keyboard covers password field on small screens.

**Cause**: `KeyboardAvoidingView` not configured correctly.

**Fix**:

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}  // Add offset
  className="flex-1"
>
```

---

### Issue: Form doesn't scroll when keyboard appears

**Symptoms**: Can't scroll to see all form fields when keyboard is open.

**Cause**: ScrollView not configured correctly.

**Fix**:

```typescript
<ScrollView
  contentContainerStyle={{ flexGrow: 1 }}
  keyboardShouldPersistTaps="handled"  // Important!
>
```

---

### Issue: Password toggle icon too small

**Symptoms**: Eye icon difficult to tap (accessibility issue).

**Cause**: Touch target <44×44.

**Fix**:

```typescript
<Pressable
  style={{ padding: 8, minWidth: 44, minHeight: 44 }}  // Minimum touch target
>
```

---

### Issue: Email validation not triggering on blur

**Symptoms**: Error message doesn't appear when leaving email field.

**Cause**: React Hook Form mode not set to "onBlur".

**Fix**:

```typescript
const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(loginSchema),
  mode: 'onBlur', // Validate on blur
});
```

---

## File Structure

```
src/features/Auth/
├── screens/
│   ├── LoginScreen.tsx
│   └── __tests__/
│       └── LoginScreen.rntl.tsx
└── validation/
    ├── loginSchema.ts
    └── __tests__/
        └── loginSchema.test.ts
```

**Note**: Screen and validation schema co-located with Auth feature following feature-first architecture (established in TASK-196).

## Definition of Done

**Code Complete**:

- [x] LoginScreen component renders correctly
- [x] Email and password inputs working with validation
- [x] "Log In" button submits form
- [x] Loading state working
- [x] All navigation links working
- [x] Alternative login methods render (placeholders)

**Quality**:

- [x] `yarn typecheck` passes
- [x] `yarn lint` passes
- [x] All manual tests pass (checklist above)
- [x] Screenshots captured for documentation

**Accessibility**:

- [x] All EAA requirements met
- [x] VoiceOver/TalkBack tested
- [x] Touch targets verified (44×44 iOS, 48×48 Android)

**Documentation**:

- [x] Component documented with JSDoc
- [x] Props documented
- [x] Usage example in comments

---

**Dependencies**:

- React Hook Form installed: `yarn add react-hook-form`
- Yup installed: `yarn add yup`
- @hookform/resolvers installed: `yarn add @hookform/resolvers`
- GlueStack UI components available
- lucide-react-native installed: `yarn add lucide-react-native`

**Next Task**: [TASK-214](TASK-214-login-api-integration.md) - Login API Integration

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours
**Actual Effort**: _[To be filled after completion]_

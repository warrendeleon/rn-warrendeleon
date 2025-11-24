# TASK-218: Magic Link UI Tab

**ID**: TASK-218 | **Title**: Build Magic Link Tab in Login Screen with Email-Only Form
**User Story**: [US-037](../stories/US-037-magic-link-login.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

## File Structure

```
src/features/Auth/
├── screens/
│   └── LoginScreen.tsx     # Add Magic Link tab
└── components/
    ├── MagicLinkTab.tsx    # Magic Link tab component
    └── __tests__/
        └── MagicLinkTab.rntl.tsx
```

**Note**: Magic Link UI co-located with Auth feature following feature-first architecture (established in TASK-196).

---

## Context & Background

Magic Link provides a password less login experience. This task builds the UI for the Magic Link tab in the LoginScreen, allowing users to request a magic link via email.

**User Flow**:

```
User opens Login screen
  → User taps "Magic Link" tab
  → Email input field appears (no password field)
  → User enters email
  → User taps "Send Magic Link"
  → Button shows loading state
  → API call succeeds
  → Success message appears: "Check your email! We've sent you a magic link to log in."
  → "Resend" button appears (disabled for 60 seconds with countdown)
  → After 60 seconds, "Resend" button enabled
```

---

## Objective

Build Magic Link tab UI with:

1. Tab navigation (Email/Password ↔ Magic Link)
2. Email-only input field
3. "Send Magic Link" button
4. Success message display
5. "Resend" button with 60-second countdown
6. Full EAA compliance

---

## Detailed Implementation Guide

### Phase 1: Add Tab Navigation to LoginScreen (30 minutes)

**File**: Update `src/screens/auth/LoginScreen.tsx`

**Code**:

```typescript
// src/screens/auth/LoginScreen.tsx (updated)
import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@gluestack-ui/themed';

type LoginMethod = 'email' | 'magiclink';

export const LoginScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoginMethod>('email');

  return (
    <SafeAreaView testID="login-screen" className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-500 rounded-full" />
          </View>

          <Text className="text-2xl font-bold text-center mb-2" accessibilityRole="header">
            Welcome Back
          </Text>
          <Text className="text-base text-gray-600 text-center mb-6">
            Log in to your account
          </Text>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value as LoginMethod)}
            className="mb-6"
          >
            <TabList className="flex-row border-b border-gray-200 mb-4">
              <Tab
                value="email"
                testID="email-tab"
                accessibilityRole="tab"
                accessibilityLabel="Email and password login"
                className="flex-1 pb-3"
              >
                <Text className={activeTab === 'email' ? 'text-primary-600 font-semibold' : 'text-gray-600'}>
                  Email/Password
                </Text>
              </Tab>
              <Tab
                value="magiclink"
                testID="magiclink-tab"
                accessibilityRole="tab"
                accessibilityLabel="Magic link login"
                className="flex-1 pb-3"
              >
                <Text className={activeTab === 'magiclink' ? 'text-primary-600 font-semibold' : 'text-gray-600'}>
                  Magic Link
                </Text>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Email/Password Tab Panel */}
              <TabPanel value="email">
                {/* Existing email/password form */}
                {/* ... Email input ... */}
                {/* ... Password input ... */}
                {/* ... Log In button ... */}
              </TabPanel>

              {/* Magic Link Tab Panel */}
              <TabPanel value="magiclink">
                <MagicLinkTab />
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Footer */}
          <View className="items-center mt-6">
            <Text className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Text className="text-primary-600 font-semibold" onPress={() => navigation.navigate('Register')}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

### Phase 2: Create MagicLinkTab Component (40 minutes)

**File**: `src/components/auth/MagicLinkTab.tsx`

**Code**:

```typescript
// src/components/auth/MagicLinkTab.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Input,
  InputField,
  Button,
  ButtonText,
  ButtonSpinner,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '@gluestack-ui/themed';

const magicLinkSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

type MagicLinkFormData = yup.InferType<typeof magicLinkSchema>;

export const MagicLinkTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<MagicLinkFormData>({
    resolver: yupResolver(magicLinkSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      // TODO: Call Supabase magic link API
      console.log('Sending magic link to:', data.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      setSuccessMessage(`Check your email! We've sent you a magic link to ${data.email}.`);

      // Start resend countdown
      startResendCountdown();
    } catch (error) {
      console.error('[MagicLink] Error sending magic link:', error);
      // Error handling will be added in TASK-219
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);

    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    const email = getValues('email');
    if (email) {
      onSubmit({ email });
    }
  };

  return (
    <View testID="magic-link-tab">
      {/* Instruction Text */}
      <Text className="text-sm text-gray-600 mb-4">
        Enter your email address and we'll send you a magic link to log in. No password required!
      </Text>

      {/* Success Message */}
      {successMessage && (
        <View className="bg-success-100 p-4 rounded-lg mb-4" accessibilityLiveRegion="polite">
          <Text className="text-success-700 text-sm">{successMessage}</Text>
        </View>
      )}

      {/* Email Input */}
      <FormControl isInvalid={!!errors.email} className="mb-6">
        <FormControlLabel>
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input testID="magiclink-email-input" accessibilityLabel="Email address for magic link">
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
            <FormControlErrorText testID="magiclink-email-error">
              {errors.email.message}
            </FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      {/* Send Magic Link Button */}
      <Button
        onPress={handleSubmit(onSubmit)}
        testID="send-magic-link-button"
        accessibilityRole="button"
        accessibilityLabel="Send magic link"
        accessibilityHint="Sends a login link to your email"
        isDisabled={isLoading || !canResend}
        size="lg"
        className="mb-4"
      >
        {isLoading && <ButtonSpinner />}
        <ButtonText>{isLoading ? 'Sending...' : 'Send Magic Link'}</ButtonText>
      </Button>

      {/* Resend Button */}
      {successMessage && (
        <View className="items-center">
          {canResend ? (
            <Button
              onPress={handleResend}
              testID="magiclink-resend-button"
              variant="link"
              accessibilityRole="button"
              accessibilityLabel="Resend magic link"
            >
              <ButtonText className="text-primary-600 text-sm">Didn't receive it? Resend</ButtonText>
            </Button>
          ) : (
            <Text className="text-gray-500 text-sm" testID="magiclink-resend-countdown">
              Resend in {resendCountdown}s...
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
```

---

### Phase 3: RNTL Tests (30 minutes)

**File**: `src/components/auth/__tests__/MagicLinkTab.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MagicLinkTab } from '../MagicLinkTab';

describe('MagicLinkTab', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    const { getByTestId, getByText } = render(<MagicLinkTab />);

    expect(getByTestId('magic-link-tab')).toBeTruthy();
    expect(getByText(/No password required/)).toBeTruthy();
    expect(getByTestId('magiclink-email-input')).toBeTruthy();
    expect(getByTestId('send-magic-link-button')).toBeTruthy();
  });

  it('should show email validation error on invalid email', async () => {
    const { getByTestId, getByText } = render(<MagicLinkTab />);

    const emailInput = getByTestId('magiclink-email-input');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should show success message after sending magic link', async () => {
    const { getByTestId, getByText } = render(<MagicLinkTab />);

    const emailInput = getByTestId('magiclink-email-input');
    const sendButton = getByTestId('send-magic-link-button');

    fireEvent.changeText(emailInput, 'user@example.com');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText(/Check your email/)).toBeTruthy();
    });
  });

  it('should show resend countdown after sending', async () => {
    const { getByTestId, getByText } = render(<MagicLinkTab />);

    fireEvent.changeText(getByTestId('magiclink-email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-magic-link-button'));

    await waitFor(() => {
      expect(getByTestId('magiclink-resend-countdown')).toBeTruthy();
      expect(getByText('Resend in 60s...')).toBeTruthy();
    });
  });

  it('should enable resend button after 60 seconds', async () => {
    const { getByTestId } = render(<MagicLinkTab />);

    fireEvent.changeText(getByTestId('magiclink-email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-magic-link-button'));

    await waitFor(() => {
      expect(getByTestId('magiclink-resend-countdown')).toBeTruthy();
    });

    // Fast-forward 60 seconds
    jest.advanceTimersByTime(60000);

    await waitFor(() => {
      expect(getByTestId('magiclink-resend-button')).toBeTruthy();
    });
  });

  it('should show loading state during send', async () => {
    const { getByTestId, getByText } = render(<MagicLinkTab />);

    fireEvent.changeText(getByTestId('magiclink-email-input'), 'user@example.com');
    fireEvent.press(getByTestId('send-magic-link-button'));

    expect(getByText('Sending...')).toBeTruthy();
  });
});
```

---

## Acceptance Criteria

**Functional**:

- [ ] Tab navigation working (Email/Password ↔ Magic Link)
- [ ] Magic Link tab renders correctly
- [ ] Email input validates on blur
- [ ] "Send Magic Link" button submits form
- [ ] Success message displays after sending
- [ ] "Resend" button disabled for 60 seconds with countdown
- [ ] Countdown timer working correctly

**Non-Functional**:

- [ ] All EAA requirements met
- [ ] Touch targets minimum 44×44 (iOS) / 48×48 (Android)
- [ ] 100% RNTL coverage
- [ ] All testIDs present for E2E tests

---

## Definition of Done

- [ ] Tab navigation complete
- [ ] MagicLinkTab component complete
- [ ] RNTL tests passing (100% coverage)
- [ ] `yarn validate` passes
- [ ] Manual testing complete

---

**Dependencies**:

- TASK-213 (Login UI Form) complete

**Next Task**: [TASK-219](TASK-219-magic-link-api.md) - Magic Link API Integration

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours

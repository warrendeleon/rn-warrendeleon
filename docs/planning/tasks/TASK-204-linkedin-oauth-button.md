# TASK-204: LinkedIn OAuth Button Component

**ID**: TASK-204 | **US**: [US-034](../stories/US-034-linkedin-oauth-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 1.5h | **Created**: 2025-11-21

---

## Context & Background

LinkedIn OAuth authentication requires a branded button that adheres to LinkedIn's Brand Guidelines whilst maintaining our app's design system consistency. The button must provide clear visual feedback during the OAuth flow, handle errors gracefully, and maintain full EAA compliance.

**Why This Task Matters:**

Social authentication buttons are critical conversion points in the registration funnel. Users expect:

- **Brand Recognition**: Immediate visual identification of LinkedIn through official brand colours and logo
- **Clear State Feedback**: Loading indicators, disabled states during processing
- **Error Recovery**: Actionable error messages with retry functionality
- **Accessibility**: Full support for screen readers and touch target requirements

**LinkedIn Brand Guidelines:**

- Primary colour: `#0077B5` (LinkedIn Blue)
- Logo: Official LinkedIn "in" logo (white on blue background)
- Button text: "Continue with LinkedIn" (recommended phrasing)
- Minimum size: Must be readable and recognizable
- No modifications to logo (stretching, recolouring, etc.)

**Design Considerations:**

- Outline variant to match registration screen aesthetic
- 44×44 minimum touch target (iOS HIG / EAA compliance)
- Loading spinner replaces logo during OAuth flow
- Error state shows red border with inline error message
- Disabled state has reduced opacity (0.5)

---

## Objective

Build a reusable LinkedIn OAuth button component with:

1. **LinkedIn brand compliance**: Official colour (#0077B5) and logo
2. **State management**: Default, loading, error, disabled states
3. **Error handling**: Display errors inline with retry capability
4. **EAA compliance**: Full accessibility support (roles, labels, hints, touch targets)
5. **Integration**: Seamless integration with OAuth flow from TASK-205
6. **Testing**: 100% RNTL coverage for all states and interactions

---

## Detailed Implementation Guide

### Phase 1: Component Structure (20 minutes)

Create the LinkedIn OAuth button component with GlueStack UI:

**File**: `src/features/Auth/components/LinkedInOAuthButton.tsx`

```typescript
import React, { useState } from 'react';
import {
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
  HStack,
  VStack,
  Text,
} from '@gluestack-ui/themed';
import { styled } from '@gluestack-style/react';
import { Svg, Path } from 'react-native-svg';
import { useLinkedInAuth } from '@app/features/Auth/hooks/useLinkedInAuth';

/**
 * LinkedIn "in" Logo SVG Component
 * Official LinkedIn brand logo (do not modify)
 */
const LinkedInIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#FFFFFF',
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill={color}
    />
  </Svg>
);

export interface LinkedInOAuthButtonProps {
  onSuccess?: (userData: { email: string; fullName: string; profilePictureUrl?: string }) => void;
  onError?: (error: Error) => void;
  testID?: string;
}

/**
 * LinkedIn OAuth Button Component
 *
 * Branded button for LinkedIn OAuth authentication
 * Handles OAuth flow, loading states, and error display
 *
 * @example
 * <LinkedInOAuthButton
 *   onSuccess={(userData) => console.log('Authenticated:', userData)}
 *   onError={(error) => console.error('OAuth failed:', error)}
 *   testID="linkedin-oauth-button"
 * />
 */
export const LinkedInOAuthButton: React.FC<LinkedInOAuthButtonProps> = ({
  onSuccess,
  onError,
  testID = 'linkedin-oauth-button',
}) => {
  const { initiateLinkedInAuth, isLoading, error, clearError } = useLinkedInAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePress = async () => {
    try {
      clearError();
      setLocalError(null);

      const result = await initiateLinkedInAuth();

      if (result.success && onSuccess) {
        onSuccess(result.userData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'LinkedIn authentication failed';
      setLocalError(errorMessage);

      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  const displayError = error || localError;

  return (
    <VStack space="sm" w="$full">
      <Button
        variant="outline"
        onPress={handlePress}
        isDisabled={isLoading}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Continue with LinkedIn"
        accessibilityHint="Sign up or log in using your LinkedIn account"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
        sx={{
          minWidth: 44,
          minHeight: 44,
          borderColor: displayError ? '$error500' : '$borderLight300',
          borderWidth: 1,
          backgroundColor: '$white',
          '$dark': {
            backgroundColor: '$backgroundDark900',
            borderColor: displayError ? '$error400' : '$borderDark700',
          },
          ':hover': {
            backgroundColor: '$backgroundLight50',
            '$dark': {
              backgroundColor: '$backgroundDark800',
            },
          },
          ':active': {
            backgroundColor: '$backgroundLight100',
            '$dark': {
              backgroundColor: '$backgroundDark700',
            },
          },
          ':disabled': {
            opacity: 0.5,
          },
        }}
      >
        <HStack space="sm" alignItems="center">
          {isLoading ? (
            <ButtonSpinner color="#0077B5" testID={`${testID}-spinner`} />
          ) : (
            <ButtonIcon as={LinkedInIcon} color="#0077B5" size={20} />
          )}
          <ButtonText
            sx={{
              color: '$textLight900',
              fontSize: '$md',
              fontWeight: '$medium',
              '$dark': {
                color: '$textDark50',
              },
            }}
          >
            {isLoading ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}
          </ButtonText>
        </HStack>
      </Button>

      {displayError && (
        <Text
          testID={`${testID}-error`}
          accessibilityRole="alert"
          accessibilityLive="assertive"
          sx={{
            color: '$error500',
            fontSize: '$sm',
            paddingHorizontal: '$2',
            '$dark': {
              color: '$error400',
            },
          }}
        >
          {displayError}
        </Text>
      )}
    </VStack>
  );
};

export default LinkedInOAuthButton;
```

### Phase 2: Hook Implementation (30 minutes)

Create the LinkedIn OAuth hook that handles the authentication flow:

**File**: `src/features/Auth/hooks/useLinkedInAuth.ts`

```typescript
import { useState } from 'react';
import { authorize } from 'react-native-app-auth';
import { useAppDispatch } from '@app/store/hooks';
import { registerWithLinkedIn } from '@app/features/Auth';

const linkedInConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  redirectUrl: process.env.LINKEDIN_REDIRECT_URI!,
  scopes: ['openid', 'profile', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
};

interface LinkedInAuthResult {
  success: boolean;
  userData: {
    email: string;
    fullName: string;
    profilePictureUrl?: string;
  };
}

export const useLinkedInAuth = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateLinkedInAuth = async (): Promise<LinkedInAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Initiate OAuth flow
      const authResult = await authorize(linkedInConfig);

      // Step 2: Fetch LinkedIn profile data
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${authResult.accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch LinkedIn profile');
      }

      const profileData = await profileResponse.json();

      // Step 3: Extract user data
      const userData = {
        email: profileData.email,
        fullName: profileData.name,
        profilePictureUrl: profileData.picture,
      };

      // Step 4: Register user via Redux thunk
      const result = await dispatch(
        registerWithLinkedIn({
          email: userData.email,
          fullName: userData.fullName,
          profilePictureUrl: userData.profilePictureUrl,
          linkedInAccessToken: authResult.accessToken,
        })
      ).unwrap();

      setIsLoading(false);

      return {
        success: true,
        userData,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'LinkedIn authentication failed';
      setError(errorMessage);
      setIsLoading(false);

      throw err;
    }
  };

  const clearError = () => setError(null);

  return {
    initiateLinkedInAuth,
    isLoading,
    error,
    clearError,
  };
};
```

### Phase 3: Integration with Registration Screen (20 minutes)

Add the LinkedIn OAuth button to the registration screen:

**File**: `src/features/Auth/screens/RegistrationScreen.tsx`

```typescript
import { LinkedInOAuthButton } from '@app/features/Auth/components/LinkedInOAuthButton';

// Inside RegistrationScreen component:
<VStack space="lg" w="$full">
  {/* Email/password form fields */}
  <FormControl>
    {/* ... existing email/password fields ... */}
  </FormControl>

  {/* Divider */}
  <HStack alignItems="center" space="md">
    <Divider flex={1} />
    <Text sx={{ color: '$textLight500', fontSize: '$sm' }}>or</Text>
    <Divider flex={1} />
  </HStack>

  {/* LinkedIn OAuth Button */}
  <LinkedInOAuthButton
    onSuccess={(userData) => {
      // Navigate to BiometricSetup or Home based on requirements
      navigation.navigate('BiometricSetup');
    }}
    onError={(error) => {
      // Error is already displayed by the button component
      console.error('LinkedIn OAuth error:', error);
    }}
    testID="registration-linkedin-button"
  />
</VStack>
```

### Phase 4: Styling Refinements (10 minutes)

Ensure the button matches LinkedIn brand guidelines and our design system:

**LinkedIn Brand Colour Constants**:

**File**: `src/theme/colors.ts`

```typescript
export const linkedInColors = {
  primary: '#0077B5',
  primaryHover: '#006097',
  primaryActive: '#00558A',
  background: '#FFFFFF',
  text: '#000000',
};
```

### Phase 5: Error Handling (10 minutes)

Handle common LinkedIn OAuth errors:

```typescript
const getLinkedInErrorMessage = (error: Error): string => {
  if (error.message.includes('user_cancelled')) {
    return 'LinkedIn sign-in was cancelled. Please try again.';
  }

  if (error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error.message.includes('invalid_grant')) {
    return 'LinkedIn authorization expired. Please try again.';
  }

  return 'Unable to sign in with LinkedIn. Please try again or use email registration.';
};
```

---

## Acceptance Criteria

- [ ] LinkedIn official brand colour used (#0077B5)
- [ ] Official LinkedIn "in" logo displayed correctly
- [ ] Button text: "Continue with LinkedIn"
- [ ] Loading state shows spinner with "Connecting to LinkedIn..." text
- [ ] Error state shows red border with inline error message below button
- [ ] Disabled state has 0.5 opacity
- [ ] Minimum touch target 44×44 (iOS) / 48×48 (Android)
- [ ] `accessibilityRole="button"` set
- [ ] `accessibilityLabel="Continue with LinkedIn"` set
- [ ] `accessibilityHint` explains what happens on press
- [ ] `accessibilityState` reflects disabled/busy states
- [ ] Error message has `accessibilityRole="alert"` with `accessibilityLive="assertive"`
- [ ] Component is reusable (can be used on Login screen too)
- [ ] 100% RNTL coverage (all states tested)

---

## Testing

**Test File**: `src/features/Auth/components/__tests__/LinkedInOAuthButton.rntl.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LinkedInOAuthButton } from '../LinkedInOAuthButton';
import { useLinkedInAuth } from '../../hooks/useLinkedInAuth';

jest.mock('@/hooks/useLinkedInAuth');

describe('LinkedInOAuthButton', () => {
  const mockInitiateLinkedInAuth = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLinkedInAuth as jest.Mock).mockReturnValue({
      initiateLinkedInAuth: mockInitiateLinkedInAuth,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders correctly with default state', () => {
    const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

    expect(getByTestId('linkedin-oauth-button')).toBeTruthy();
    expect(getByText('Continue with LinkedIn')).toBeTruthy();
  });

  it('displays loading state when isLoading is true', () => {
    (useLinkedInAuth as jest.Mock).mockReturnValue({
      initiateLinkedInAuth: mockInitiateLinkedInAuth,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

    expect(getByTestId('linkedin-oauth-button-spinner')).toBeTruthy();
    expect(getByText('Connecting to LinkedIn...')).toBeTruthy();
  });

  it('calls initiateLinkedInAuth when pressed', async () => {
    mockInitiateLinkedInAuth.mockResolvedValue({
      success: true,
      userData: { email: 'test@example.com', fullName: 'John Doe' },
    });

    const { getByTestId } = render(<LinkedInOAuthButton />);
    const button = getByTestId('linkedin-oauth-button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(mockInitiateLinkedInAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onSuccess callback when authentication succeeds', async () => {
    const mockOnSuccess = jest.fn();
    const userData = { email: 'test@example.com', fullName: 'John Doe' };

    mockInitiateLinkedInAuth.mockResolvedValue({
      success: true,
      userData,
    });

    const { getByTestId } = render(<LinkedInOAuthButton onSuccess={mockOnSuccess} />);

    fireEvent.press(getByTestId('linkedin-oauth-button'));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(userData);
    });
  });

  it('displays error message when authentication fails', async () => {
    const errorMessage = 'LinkedIn authentication failed';
    mockInitiateLinkedInAuth.mockRejectedValue(new Error(errorMessage));

    const { getByTestId, getByText } = render(<LinkedInOAuthButton />);

    fireEvent.press(getByTestId('linkedin-oauth-button'));

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
      expect(getByTestId('linkedin-oauth-button-error')).toBeTruthy();
    });
  });

  it('has correct accessibility props', () => {
    const { getByTestId } = render(<LinkedInOAuthButton />);
    const button = getByTestId('linkedin-oauth-button');

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Continue with LinkedIn');
    expect(button.props.accessibilityHint).toBe('Sign up or log in using your LinkedIn account');
  });

  it('is disabled when isLoading is true', () => {
    (useLinkedInAuth as jest.Mock).mockReturnValue({
      initiateLinkedInAuth: mockInitiateLinkedInAuth,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    const { getByTestId } = render(<LinkedInOAuthButton />);
    const button = getByTestId('linkedin-oauth-button');

    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

## File Structure

```
src/features/Auth/
├── components/
│   ├── LinkedInOAuthButton.tsx
│   └── __tests__/
│       └── LinkedInOAuthButton.rntl.tsx
└── hooks/
    ├── useLinkedInAuth.ts
    └── __tests__/
        └── useLinkedInAuth.test.ts
```

**Note**: Component and hook co-located with Auth feature following feature-first architecture (established in TASK-196).

**Run tests**:

```bash
yarn test src/features/Auth/components/__tests__/LinkedInOAuthButton.rntl.tsx
```

---

## Troubleshooting

### Issue: "LinkedIn logo not displaying"

**Cause**: SVG path not rendering correctly

**Solution**: Ensure `react-native-svg` is installed and linked:

```bash
yarn add react-native-svg
cd ios && pod install
```

### Issue: "Button touch target too small on iOS"

**Cause**: Missing minimum size constraints

**Solution**: Ensure `minWidth: 44, minHeight: 44` in sx prop:

```typescript
sx={{
  minWidth: 44,
  minHeight: 44,
}}
```

### Issue: "Error message not announced by screen reader"

**Cause**: Missing accessibility props on error text

**Solution**: Add `accessibilityRole="alert"` and `accessibilityLive="assertive"`:

```typescript
<Text
  accessibilityRole="alert"
  accessibilityLive="assertive"
>
  {errorMessage}
</Text>
```

### Issue: "LinkedIn brand colour doesn't match official guidelines"

**Cause**: Incorrect hex colour

**Solution**: Use official LinkedIn blue: `#0077B5` (not `#0077B6` or similar)

---

**Effort**: 1.5h | **Last Updated**: 2025-11-21

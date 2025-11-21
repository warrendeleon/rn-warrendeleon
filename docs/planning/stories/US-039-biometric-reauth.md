# US-039: Biometric Re-Authentication

**ID**: US-039 | **Title**: Biometric Re-Authentication After App Background
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 4 | **Effort**: 9h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## User Story

**As a** security-conscious user
**I want** to re-authenticate with biometrics after backgrounding the app for >30 minutes
**So that** my account remains secure if someone gains access to my unlocked device

---

## Context & Background

### Why This Story Matters

Biometric re-authentication provides a critical security layer for mobile apps:

1. **Device Security**: If user's unlocked device is stolen/borrowed, prevents unauthorised access
2. **Industry Standard**: Banking apps, password managers, health apps all require biometric re-auth
3. **Balance UX and Security**: 30-minute threshold is industry standard (not too frequent, not too lax)
4. **Regulatory Compliance**: Many industries (finance, healthcare) require re-authentication
5. **User Trust**: Shows commitment to security, builds confidence in app

**Re-Authentication Flow**:

```
User backgrounds app (Home button / app switcher)
  → App records background timestamp
  → User does other things for 35 minutes
  → User taps app icon to return
  → App detects >30 minutes in background
  → App navigates to BiometricPromptScreen
  → User sees Face ID prompt
  → User authenticates with Face ID
  → Authentication successful
  → App navigates to previous screen (Home)
  → User continues where they left off
```

**Failure Flow**:

```
User fails biometric authentication
  → User taps "Cancel" or Face ID fails 3x
  → App shows "Authentication failed"
  → App offers "Try Again" button
  → User taps "Try Again"
  → Biometric prompt appears again
  → User fails again
  → App shows "Too many failed attempts. Please log in again."
  → App clears all tokens from Keychain
  → App navigates to Login screen
```

**PIN Fallback Flow**:

```
User has PIN enabled (no biometrics)
  → App navigates to PINPromptScreen instead
  → User enters 6-digit PIN
  → App validates PIN with bcrypt
  → PIN correct → Navigate to Home
  → PIN incorrect → Show error, allow 3 attempts
  → 3 failed attempts → Full logout
```

### Current State vs Desired State

**Current State**: App state listener detects background time (US-038), but no re-auth UI exists.

**Desired State**:

- BiometricPromptScreen for re-authentication
- Automatic navigation to BiometricPromptScreen when >30 minutes in background
- Face ID / Touch ID / Fingerprint authentication
- PIN fallback screen (PINPromptScreen)
- "Try Again" flow for failed attempts
- 3 failed attempts → Full logout
- Clear error messages for each scenario
- EAA compliance (accessibility labels, screen reader support)

### Success Metrics

| Metric                     | Target     | Why It Matters                   |
| -------------------------- | ---------- | -------------------------------- |
| Re-Auth Success Rate       | 95%+       | Measures biometric reliability   |
| Re-Auth Time (Median)      | <3 seconds | UX benchmark (fast re-auth)      |
| Failed Attempt Logout Rate | <5%        | Shows 3-attempt limit working    |
| PIN Fallback Usage         | <10%       | Most users should use biometrics |

---

## Acceptance Criteria

### Functional Requirements

#### BiometricPromptScreen (Re-Authentication)

- [ ] Screen renders when app foregrounded after >30 minutes
- [ ] Screen blocks access to rest of app (no back navigation)
- [ ] Screen shows:
  - [ ] App icon/logo
  - [ ] Message: "For your security, please authenticate to continue"
  - [ ] Biometric prompt (Face ID / Touch ID / Fingerprint)
  - [ ] "Try Again" button (if first attempt fails)
  - [ ] "Cancel" button (triggers logout)
- [ ] On successful authentication:
  - [ ] Dismiss BiometricPromptScreen
  - [ ] Navigate to previous screen (restore navigation state)
  - [ ] User continues where they left off
- [ ] On failed authentication:
  - [ ] Show error message: "Authentication failed. Please try again."
  - [ ] Show "Try Again" button
  - [ ] Track failed attempt count (max 3 attempts)
  - [ ] After 3 failed attempts:
    - [ ] Show error: "Too many failed attempts. Please log in again."
    - [ ] Clear all tokens from Keychain
    - [ ] Clear all encrypted storage
    - [ ] Reset Redux state
    - [ ] Navigate to Login screen
- [ ] On "Cancel" button press:
  - [ ] Show confirmation dialog: "Are you sure you want to log out?"
  - [ ] If confirmed:
    - [ ] Full logout (clear tokens, navigate to Login)
  - [ ] If cancelled:
    - [ ] Return to BiometricPromptScreen

#### PINPromptScreen (PIN Fallback)

- [ ] Screen renders when biometrics not available
- [ ] Screen shows:
  - [ ] App icon/logo
  - [ ] Message: "For your security, please enter your PIN to continue"
  - [ ] 6-digit PIN input (numeric keyboard)
  - [ ] Masked dots (• • • • • •) as user types
  - [ ] "Cancel" button (triggers logout)
- [ ] On PIN submission:
  - [ ] Validate PIN with bcrypt (compare hash stored in Keychain)
  - [ ] Show loading state during validation
  - [ ] On success:
    - [ ] Dismiss PINPromptScreen
    - [ ] Navigate to previous screen
  - [ ] On failure:
    - [ ] Show error: "Incorrect PIN. Please try again."
    - [ ] Clear PIN input
    - [ ] Track failed attempt count (max 3 attempts)
    - [ ] Show remaining attempts: "2 attempts remaining"
    - [ ] After 3 failed attempts:
      - [ ] Show error: "Too many failed attempts. Please log in again."
      - [ ] Full logout (clear tokens, navigate to Login)

#### App State Listener Integration

- [ ] useAppStateListener hook calls navigation on >30 minutes:
  - [ ] If biometrics available: Navigate to BiometricPromptScreen
  - [ ] If biometrics NOT available: Navigate to PINPromptScreen
- [ ] Navigation uses `reset()` to prevent back navigation
- [ ] Previous screen stored in Redux for restoration after re-auth

#### Error Handling

- [ ] **Biometric sensor unavailable** → Navigate to PINPromptScreen instead
- [ ] **Biometric authentication failed (3x)** → "Too many failed attempts. Please log in again."
- [ ] **PIN incorrect (3x)** → "Too many failed attempts. Please log in again."
- [ ] **User cancels** → "Are you sure you want to log out?" confirmation dialog
- [ ] **Network error during re-auth** → No network call needed (local biometric/PIN only)

### Non-Functional Requirements

#### Performance

- [ ] BiometricPromptScreen renders <200ms
- [ ] Biometric prompt appears <500ms after navigation
- [ ] PIN validation <100ms (bcrypt compare)
- [ ] Navigation restoration <100ms

#### Security

- [ ] Maximum 3 authentication attempts before logout
- [ ] PIN hash stored in Keychain (never plain text)
- [ ] No tokens exposed in logs
- [ ] Clear all sensitive data on logout
- [ ] No back navigation from BiometricPromptScreen (security)

#### Accessibility (EAA Compliance)

- [ ] BiometricPromptScreen message has `accessibilityRole="header"`
- [ ] "Try Again" button has `accessibilityRole="button"` and `accessibilityHint`
- [ ] "Cancel" button has `accessibilityRole="button"` and `accessibilityHint`
- [ ] Error messages announced to screen reader
- [ ] PIN input accessible (numeric keyboard, masked input)
- [ ] All touch targets minimum 48×48 (Android) / 44×44 (iOS)

#### Testing

- [ ] 100% RNTL coverage for BiometricPromptScreen
- [ ] 100% RNTL coverage for PINPromptScreen
- [ ] 100% RNTL coverage for useBiometricReAuth hook
- [ ] E2E tests (Detox + Cucumber):
  - [ ] Successful biometric re-auth
  - [ ] Failed biometric re-auth (3 attempts)
  - [ ] PIN fallback re-auth
  - [ ] Cancel button triggers logout
  - [ ] Navigation restoration after re-auth

---

## Implementation Phases

### Phase 1: BiometricPromptScreen UI (2.5 hours)

**Tasks**: [TASK-227](../tasks/TASK-227-biometric-prompt-screen.md)

**Objective**: Build BiometricPromptScreen UI for re-authentication.

**Deliverables**:

- BiometricPromptScreen component
- "Try Again" button logic
- "Cancel" button with confirmation dialog
- Failed attempt tracking (max 3 attempts)
- Full logout on 3 failed attempts
- Error message display
- Full EAA compliance

**UI Layout**:

```
┌─────────────────────────────────────┐
│                                     │
│         [App Icon/Logo]             │
│                                     │
│    For your security, please        │
│    authenticate to continue         │
│                                     │
│    [Face ID Animation]              │
│                                     │
│    [Try Again Button]               │
│                                     │
│    [Cancel]                         │
│                                     │
└─────────────────────────────────────┘
```

**BiometricPromptScreen Component**:

```typescript
// src/screens/auth/BiometricPromptScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, Alert } from 'react-native';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import { Button, ButtonText } from '@gluestack-ui/themed';

const MAX_ATTEMPTS = 3;

export const BiometricPromptScreen: React.FC = () => {
  const { authenticate, type } = useBiometricAuth();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    setErrorMessage(null);

    const success = await authenticate({
      promptMessage: 'Authenticate to continue',
    });

    if (success) {
      // Re-authentication successful → Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      // Re-authentication failed
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= MAX_ATTEMPTS) {
        setErrorMessage('Too many failed attempts. Please log in again.');
        setTimeout(() => handleLogout(), 2000);
      } else {
        setErrorMessage(`Authentication failed. ${MAX_ATTEMPTS - newFailedAttempts} attempts remaining.`);
      }
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const handleLogout = async () => {
    // Clear tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Navigate to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const getBiometricName = () => {
    switch (type) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      default:
        return 'Biometric';
    }
  };

  return (
    <SafeAreaView
      testID="biometric-prompt-screen"
      className="flex-1 justify-center items-center p-6"
    >
      <View className="items-center">
        {/* App Icon/Logo */}
        <View className="mb-8">
          {/* TODO: Replace with actual app icon */}
          <View className="w-20 h-20 bg-primary-500 rounded-full" />
        </View>

        {/* Message */}
        <Text
          className="text-xl font-semibold text-center mb-4"
          accessibilityRole="header"
        >
          For your security, please authenticate to continue
        </Text>

        {/* Biometric Type */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Use {getBiometricName()} to verify your identity
        </Text>

        {/* Error Message */}
        {errorMessage && (
          <View
            className="bg-error-100 p-4 rounded-lg mb-6"
            accessibilityLiveRegion="assertive"
          >
            <Text className="text-error-700 text-center">{errorMessage}</Text>
          </View>
        )}

        {/* Try Again Button */}
        {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
          <Button
            onPress={handleAuthenticate}
            testID="try-again-button"
            accessibilityRole="button"
            accessibilityLabel="Try authenticating again"
            accessibilityHint="Prompts biometric authentication again"
            className="w-full mb-4"
            size="lg"
          >
            <ButtonText>Try Again</ButtonText>
          </Button>
        )}

        {/* Cancel Button */}
        <Pressable
          onPress={handleCancel}
          testID="cancel-button"
          accessibilityRole="button"
          accessibilityLabel="Cancel and log out"
          accessibilityHint="Logs you out and returns to login screen"
          className="mt-4"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text className="text-gray-600">Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
```

**Acceptance Criteria**:

- [ ] BiometricPromptScreen renders correctly
- [ ] Biometric prompt appears on mount
- [ ] Successful auth navigates to Home
- [ ] Failed auth shows error message
- [ ] "Try Again" button appears after first failure
- [ ] 3 failed attempts triggers logout
- [ ] "Cancel" button shows confirmation dialog
- [ ] All elements EAA compliant

**Effort**: 2.5h

---

### Phase 2: PINPromptScreen UI (2.5 hours)

**Tasks**: [TASK-228](../tasks/TASK-228-pin-prompt-screen.md)

**Objective**: Build PINPromptScreen for PIN fallback re-authentication.

**Deliverables**:

- PINPromptScreen component
- 6-digit PIN input with masked display
- bcrypt validation for PIN
- Failed attempt tracking (max 3 attempts)
- Full logout on 3 failed attempts
- Error message display
- Full EAA compliance

**UI Layout**:

```
┌─────────────────────────────────────┐
│                                     │
│         [App Icon/Logo]             │
│                                     │
│    For your security, please        │
│    enter your PIN to continue       │
│                                     │
│    • • • • • •                      │
│    [Numeric Keyboard]               │
│                                     │
│    [Cancel]                         │
│                                     │
└─────────────────────────────────────┘
```

**PINPromptScreen Component**:

```typescript
// src/screens/auth/PINPromptScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import bcrypt from 'react-native-bcrypt';

const MAX_ATTEMPTS = 3;

export const PINPromptScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handlePINSubmit = async () => {
    if (pin.length !== 6) {
      setErrorMessage('PIN must be 6 digits');
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      // Read PIN hash from Keychain
      const pinHashCredentials = await Keychain.getGenericPassword({
        service: 'auth_pin_hash',
      });

      if (!pinHashCredentials) {
        throw new Error('No PIN hash found');
      }

      const pinHash = pinHashCredentials.password;

      // Validate PIN with bcrypt
      const isValid = await bcrypt.compare(pin, pinHash);

      if (isValid) {
        // PIN correct → Navigate to Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        // PIN incorrect
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        setPin('');

        if (newFailedAttempts >= MAX_ATTEMPTS) {
          setErrorMessage('Too many failed attempts. Please log in again.');
          setTimeout(() => handleLogout(), 2000);
        } else {
          setErrorMessage(`Incorrect PIN. ${MAX_ATTEMPTS - newFailedAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('PIN validation error:', error);
      setErrorMessage('Error validating PIN. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const handleLogout = async () => {
    // Clear tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Navigate to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const getMaskedPIN = () => {
    return '•'.repeat(pin.length) + '○'.repeat(6 - pin.length);
  };

  return (
    <SafeAreaView
      testID="pin-prompt-screen"
      className="flex-1 justify-center items-center p-6"
    >
      <View className="items-center w-full">
        {/* App Icon/Logo */}
        <View className="mb-8">
          <View className="w-20 h-20 bg-primary-500 rounded-full" />
        </View>

        {/* Message */}
        <Text
          className="text-xl font-semibold text-center mb-4"
          accessibilityRole="header"
        >
          For your security, please enter your PIN to continue
        </Text>

        {/* Masked PIN Display */}
        <View className="mb-8">
          <Text
            className="text-4xl tracking-widest"
            testID="masked-pin-display"
            accessibilityLabel={`PIN entered: ${pin.length} of 6 digits`}
          >
            {getMaskedPIN()}
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View
            className="bg-error-100 p-4 rounded-lg mb-6 w-full"
            accessibilityLiveRegion="assertive"
          >
            <Text className="text-error-700 text-center">{errorMessage}</Text>
          </View>
        )}

        {/* PIN Input (Hidden) */}
        <TextInput
          testID="pin-input"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          autoFocus
          onSubmitEditing={handlePINSubmit}
          editable={!isValidating && failedAttempts < MAX_ATTEMPTS}
          accessibilityLabel="PIN input"
          accessibilityHint="Enter your 6-digit PIN"
          className="opacity-0 h-0 w-0"
        />

        {/* Cancel Button */}
        <Pressable
          onPress={handleCancel}
          testID="cancel-button"
          accessibilityRole="button"
          accessibilityLabel="Cancel and log out"
          accessibilityHint="Logs you out and returns to login screen"
          className="mt-4"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text className="text-gray-600">Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
```

**Acceptance Criteria**:

- [ ] PINPromptScreen renders correctly
- [ ] PIN input uses numeric keyboard
- [ ] PIN displays as masked dots
- [ ] PIN validation uses bcrypt
- [ ] Successful validation navigates to Home
- [ ] Failed validation shows error message
- [ ] 3 failed attempts triggers logout
- [ ] "Cancel" button shows confirmation dialog
- [ ] All elements EAA compliant

**Effort**: 2.5h

---

### Phase 3: App State Listener Integration (1.5 hours)

**Tasks**: [TASK-229](../tasks/TASK-229-app-state-reauth-integration.md)

**Objective**: Integrate BiometricPromptScreen/PINPromptScreen with app state listener.

**Deliverables**:

- Update useAppStateListener hook to navigate to re-auth screens
- Navigation reset logic (prevent back navigation)
- Previous screen restoration logic
- Biometric availability check (navigate to PIN if unavailable)

**Updated useAppStateListener Hook**:

```typescript
// src/hooks/useAppStateListener.ts (updated)
import { useBiometricCapability } from './useBiometricCapability';

export const useAppStateListener = () => {
  const { isAvailable } = useBiometricCapability();
  // ... existing code

  const handleForeground = async () => {
    const now = Date.now();

    if (!backgroundTimestamp) {
      return;
    }

    const timeInBackground = now - backgroundTimestamp;

    if (timeInBackground >= LOGOUT_THRESHOLD) {
      // >24 hours → Full logout
      await handleSessionExpiry();
    } else if (timeInBackground >= RE_AUTH_THRESHOLD) {
      // 30min-24h → Re-authentication required
      if (isAvailable) {
        // Biometrics available → Navigate to BiometricPromptScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'BiometricPrompt' }],
        });
      } else {
        // Biometrics NOT available → Navigate to PINPromptScreen
        navigation.reset({
          index: 0,
          routes: [{ name: 'PINPrompt' }],
        });
      }
    }

    // Clear background timestamp
    dispatch(setBackgroundTimestamp(null));
  };

  // ... existing code
};
```

**Acceptance Criteria**:

- [ ] > 30 minutes in background triggers re-auth navigation
- [ ] Biometrics available → Navigate to BiometricPromptScreen
- [ ] Biometrics NOT available → Navigate to PINPromptScreen
- [ ] Navigation uses reset() (no back navigation)
- [ ] Previous screen restored after successful re-auth

**Effort**: 1.5h

---

### Phase 4: RNTL Tests (2 hours)

**Tasks**: [TASK-230](../tasks/TASK-230-biometric-reauth-rntl-tests.md)

**Objective**: Write comprehensive unit tests for re-authentication screens and hooks.

**Test Files**:

- `src/screens/auth/__tests__/BiometricPromptScreen.test.tsx`
- `src/screens/auth/__tests__/PINPromptScreen.test.tsx`
- `src/hooks/__tests__/useBiometricReAuth.test.ts`

**Test Coverage**:

**BiometricPromptScreen**:

```typescript
// src/screens/auth/__tests__/BiometricPromptScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BiometricPromptScreen } from '../BiometricPromptScreen';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';

jest.mock('../../../hooks/useBiometricAuth');

describe('BiometricPromptScreen', () => {
  it('should render correctly', () => {
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: jest.fn(),
      type: 'FaceID',
    });

    const { getByTestId, getByText } = render(<BiometricPromptScreen />);

    expect(getByTestId('biometric-prompt-screen')).toBeTruthy();
    expect(getByText(/For your security/)).toBeTruthy();
  });

  it('should authenticate on mount', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(true);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(mockAuthenticate).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
      });
    });
  });

  it('should navigate to Home on successful authentication', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(true);
    const mockNavigate = jest.fn();

    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { navigation } = render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  it('should show error message on failed authentication', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(false);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByText } = render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(getByText(/Authentication failed/)).toBeTruthy();
      expect(getByText(/2 attempts remaining/)).toBeTruthy();
    });
  });

  it('should show "Try Again" button after first failure', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(false);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByTestId } = render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(getByTestId('try-again-button')).toBeTruthy();
    });
  });

  it('should logout after 3 failed attempts', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(false);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByTestId, getByText } = render(<BiometricPromptScreen />);

    // First failure
    await waitFor(() => {
      expect(getByText(/2 attempts remaining/)).toBeTruthy();
    });

    // Try again
    fireEvent.press(getByTestId('try-again-button'));

    // Second failure
    await waitFor(() => {
      expect(getByText(/1 attempts remaining/)).toBeTruthy();
    });

    // Try again
    fireEvent.press(getByTestId('try-again-button'));

    // Third failure
    await waitFor(() => {
      expect(getByText(/Too many failed attempts/)).toBeTruthy();
    });

    // Verify logout after 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });

  it('should show confirmation dialog on Cancel press', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(true);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByTestId } = render(<BiometricPromptScreen />);

    fireEvent.press(getByTestId('cancel-button'));

    // Alert.alert should be called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Log Out',
      'Are you sure you want to log out?',
      expect.any(Array)
    );
  });
});
```

**PINPromptScreen**:

```typescript
// src/screens/auth/__tests__/PINPromptScreen.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PINPromptScreen } from '../PINPromptScreen';
import * as Keychain from 'react-native-keychain';
import bcrypt from 'react-native-bcrypt';

jest.mock('react-native-keychain');
jest.mock('react-native-bcrypt');

describe('PINPromptScreen', () => {
  it('should render correctly', () => {
    const { getByTestId, getByText } = render(<PINPromptScreen />);

    expect(getByTestId('pin-prompt-screen')).toBeTruthy();
    expect(getByText(/enter your PIN/)).toBeTruthy();
  });

  it('should display masked PIN as user types', () => {
    const { getByTestId } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123');

    const maskedDisplay = getByTestId('masked-pin-display');
    expect(maskedDisplay.props.children).toBe('•••○○○');
  });

  it('should validate PIN with bcrypt on submit', async () => {
    const mockPinHash = 'hashed_pin';
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      password: mockPinHash,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { getByTestId } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123456');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockPinHash);
    });
  });

  it('should navigate to Home on correct PIN', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      password: 'hashed_pin',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { getByTestId, navigation } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123456');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  it('should show error message on incorrect PIN', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      password: 'hashed_pin',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { getByTestId, getByText } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123456');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(getByText(/Incorrect PIN/)).toBeTruthy();
      expect(getByText(/2 attempts remaining/)).toBeTruthy();
    });
  });

  it('should logout after 3 incorrect PIN attempts', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      password: 'hashed_pin',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { getByTestId, getByText, navigation } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');

    // First attempt
    fireEvent.changeText(pinInput, '123456');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(getByText(/2 attempts remaining/)).toBeTruthy();
    });

    // Second attempt
    fireEvent.changeText(pinInput, '654321');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(getByText(/1 attempts remaining/)).toBeTruthy();
    });

    // Third attempt
    fireEvent.changeText(pinInput, '111111');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(getByText(/Too many failed attempts/)).toBeTruthy();
    });

    // Verify logout after 2 seconds
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });
});
```

**Acceptance Criteria**:

- [ ] 100% coverage for BiometricPromptScreen
- [ ] 100% coverage for PINPromptScreen
- [ ] All edge cases tested
- [ ] All error scenarios tested
- [ ] EAA compliance tested

**Effort**: 2h

---

### Phase 5: E2E Tests (Detox + Cucumber) (0.5 hours)

**Tasks**: [TASK-231](../tasks/TASK-231-biometric-reauth-e2e-tests.md)

**Objective**: Write E2E tests for biometric re-authentication flows.

**Feature File**: `e2e/features/auth/biometric-reauth.feature`

**Scenarios**:

```gherkin
Feature: Biometric Re-Authentication After App Background

  Background:
    Given I am logged in
    And biometric authentication is enabled

  @smoke @biometric @ios
  Scenario: Successful Face ID re-authentication after 30 minutes
    Given the app is in the foreground
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "BiometricPrompt" screen
    And I should see text "For your security, please authenticate to continue"
    When I approve the Face ID prompt
    Then I should be navigated to "Home" screen

  @biometric @android
  Scenario: Successful Fingerprint re-authentication after 30 minutes
    Given the app is in the foreground
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "BiometricPrompt" screen
    When I approve the Fingerprint prompt
    Then I should be navigated to "Home" screen

  @biometric @failure
  Scenario: Failed biometric authentication (3 attempts)
    Given the app is in the foreground
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "BiometricPrompt" screen
    When I reject the Face ID prompt
    Then I should see error "Authentication failed. 2 attempts remaining."
    And I should see button "Try Again"
    When I tap "Try Again"
    And I reject the Face ID prompt again
    Then I should see error "Authentication failed. 1 attempts remaining."
    When I tap "Try Again"
    And I reject the Face ID prompt again
    Then I should see error "Too many failed attempts. Please log in again."
    And I should be navigated to "Login" screen after 2 seconds

  @pin @fallback
  Scenario: PIN re-authentication (biometrics unavailable)
    Given the app is in the foreground
    And biometrics are NOT available on the device
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "PINPrompt" screen
    When I enter PIN "123456"
    Then I should be navigated to "Home" screen

  @pin @incorrect
  Scenario: Incorrect PIN (3 attempts)
    Given the app is in the foreground
    And biometrics are NOT available on the device
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "PINPrompt" screen
    When I enter PIN "111111"
    Then I should see error "Incorrect PIN. 2 attempts remaining."
    When I enter PIN "222222"
    Then I should see error "Incorrect PIN. 1 attempts remaining."
    When I enter PIN "333333"
    Then I should see error "Too many failed attempts. Please log in again."
    And I should be navigated to "Login" screen after 2 seconds

  @cancel
  Scenario: Cancel re-authentication
    Given the app is in the foreground
    When I background the app
    And I wait for 31 minutes (simulated)
    And I foreground the app
    Then I should see the "BiometricPrompt" screen
    When I tap "Cancel"
    Then I should see alert "Are you sure you want to log out?"
    When I tap "Log Out"
    Then I should be navigated to "Login" screen
```

**Acceptance Criteria**:

- [ ] All scenarios pass on iOS simulator
- [ ] All scenarios pass on Android emulator
- [ ] Background time simulation working
- [ ] Biometric prompt simulation working
- [ ] All error states tested

**Effort**: 0.5h

---

## Tasks

### Task Breakdown (5 tasks, 9h total)

| ID                                                            | Task                           | Status   | Effort | Priority | Dependencies                 |
| ------------------------------------------------------------- | ------------------------------ | -------- | ------ | -------- | ---------------------------- |
| [TASK-227](../tasks/TASK-227-biometric-prompt-screen.md)      | BiometricPromptScreen UI       | 📋 To Do | 2.5h   | High     | None                         |
| [TASK-228](../tasks/TASK-228-pin-prompt-screen.md)            | PINPromptScreen UI             | 📋 To Do | 2.5h   | High     | None                         |
| [TASK-229](../tasks/TASK-229-app-state-reauth-integration.md) | App State Listener Integration | 📋 To Do | 1.5h   | High     | TASK-224 (US-038)            |
| [TASK-230](../tasks/TASK-230-biometric-reauth-rntl-tests.md)  | Biometric Re-Auth RNTL Tests   | 📋 To Do | 2h     | Medium   | TASK-227, TASK-228           |
| [TASK-231](../tasks/TASK-231-biometric-reauth-e2e-tests.md)   | Biometric Re-Auth E2E Tests    | 📋 To Do | 0.5h   | Medium   | TASK-227, TASK-228, TASK-229 |

**Total Effort**: 9 hours

**Dependency Chain**:

```
TASK-227 (BiometricPromptScreen) → TASK-230 (RNTL Tests) → TASK-231 (E2E Tests)
TASK-228 (PINPromptScreen) → TASK-230 (RNTL Tests) → TASK-231 (E2E Tests)
TASK-224 (App State Listener, US-038) → TASK-229 (Integration) → TASK-231 (E2E Tests)
```

---

## Non-Functional Requirements

### Performance

- BiometricPromptScreen renders <200ms
- Biometric prompt appears <500ms
- PIN validation <100ms (bcrypt)
- Navigation restoration <100ms

### Security

- Maximum 3 authentication attempts
- PIN hash in Keychain (never plain text)
- No tokens logged
- Clear all sensitive data on logout
- No back navigation from re-auth screens

### Accessibility

- All messages EAA compliant
- Error messages announced to screen reader
- All touch targets minimum 48×48 (Android) / 44×44 (iOS)
- PIN input accessible

### Testing

- 100% RNTL coverage (BiometricPromptScreen, PINPromptScreen)
- E2E tests for all re-auth scenarios (Detox + Cucumber)
- Platform coverage: iOS + Android

---

## Definition of Done

**Functional**:

- [ ] BiometricPromptScreen for re-authentication
- [ ] PINPromptScreen for PIN fallback
- [ ] App state listener integration
- [ ] Failed attempt tracking (max 3 attempts)
- [ ] Full logout on 3 failed attempts
- [ ] "Cancel" button with confirmation
- [ ] All error scenarios handled

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes
- [ ] Zero ESLint/TypeScript errors

**Security**:

- [ ] Maximum 3 attempts enforced
- [ ] PIN hash stored in Keychain
- [ ] All tokens cleared on logout
- [ ] No sensitive data logged

**Accessibility**:

- [ ] All UI elements EAA compliant
- [ ] Touch targets minimum 48×48 / 44×44
- [ ] Error messages accessible

**Documentation**:

- [ ] BiometricPromptScreen documented
- [ ] PINPromptScreen documented
- [ ] Re-auth flow documented in README

---

## Risk Assessment

### Technical Risks

| Risk                                         | Probability | Impact | Mitigation                                               |
| -------------------------------------------- | ----------- | ------ | -------------------------------------------------------- |
| Biometric sensor fails intermittently        | Medium      | Medium | Always provide PIN fallback, clear error messages        |
| App state listener doesn't fire consistently | Low         | High   | Test on real devices, use AppState.currentState fallback |
| PIN validation too slow (>500ms)             | Low         | Medium | Optimize bcrypt rounds, show loading indicator           |
| User forgets PIN                             | Medium      | High   | Require email/password login after 3 failures            |

### UX Risks

| Risk                                   | Probability | Impact | Mitigation                                      |
| -------------------------------------- | ----------- | ------ | ----------------------------------------------- |
| User frustrated by re-auth requirement | Medium      | Medium | Clear messaging, explain security benefit       |
| User confused by PIN fallback          | Low         | Low    | Clear instructions: "Enter your 6-digit PIN"    |
| User gives up after 2 failed attempts  | Low         | Medium | Show remaining attempts, encourage trying again |

---

## Testing Strategy

### Unit Tests (RNTL)

**Screens**:

- BiometricPromptScreen (re-auth flow, failed attempts, cancel)
- PINPromptScreen (PIN validation, failed attempts, masked display)

**Coverage Target**: 100%

### E2E Tests (Detox + Cucumber)

**Scenarios**:

- Successful biometric re-auth
- Failed biometric re-auth (3 attempts)
- PIN fallback re-auth
- Incorrect PIN (3 attempts)
- Cancel re-authentication

**Platform Coverage**: iOS + Android

---

## Dependencies

### Upstream Dependencies

- US-036 (Email/Password Login) must be complete
- US-038 (Session Management) must be complete (app state listener)
- Biometric setup (US-035, EPIC-021) must be complete
- PIN setup (US-035, EPIC-021) must be complete

### Downstream Dependencies

- None (re-authentication is the final security layer)

---

**Last Updated**: 2025-11-21
**Story Points**: 4 (UI complexity + security requirements)
**Priority**: High (critical for security)
**Next Review**: Before Phase 1 implementation

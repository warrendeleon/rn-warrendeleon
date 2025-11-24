# TASK-210: BiometricSetupScreen UI

**ID**: TASK-210 | **US**: [US-035](../stories/US-035-biometric-security-setup.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 3h | **Created**: 2025-11-21

---

## Context & Background

After successful registration, users are guided through security setup. The BiometricSetupScreen is the first security layer, offering device-specific biometric authentication (Face ID, Touch ID, Fingerprint) based on hardware capability.

**Why This Task Matters:**

Biometric authentication significantly improves security and user experience:

- **Security**: Stronger than passwords, tied to device hardware
- **Convenience**: No need to remember/type passwords
- **Speed**: Instant authentication (200-500ms vs 5-10s for password)
- **Industry Standard**: Expected by users in banking/finance apps

**User Flow:**

1. User completes registration → Navigates to BiometricSetup
2. Screen detects device capability (Face ID / Touch ID / Fingerprint / None)
3. If available: Show "Enable [Biometric Type]" button
4. If not available: Show "Set up PIN instead" button
5. User can skip, but must acknowledge security warning
6. Choice stored in Keychain → Navigate to Home

**Device-Specific Behaviour:**

| Device           | Biometric Type | Button Text          | Fallback               |
| ---------------- | -------------- | -------------------- | ---------------------- |
| iPhone X+        | Face ID        | "Enable Face ID"     | 6-digit PIN            |
| iPhone 5s-8      | Touch ID       | "Enable Touch ID"    | 6-digit PIN            |
| Android (varies) | Fingerprint    | "Enable Fingerprint" | 6-digit PIN            |
| No biometrics    | None           | "Set Up PIN"         | 6-digit PIN (required) |

**Skip Warning:**

Users who skip biometric setup must acknowledge security implications:

- Fallback to PIN-only authentication
- PIN less secure than biometrics
- Can enable biometrics later in Settings

---

## Objective

Build BiometricSetupScreen with:

1. **Device capability detection**: Use `useBiometricCapability` hook
2. **Dynamic UI**: Show appropriate option based on device
3. **Primary action**: "Enable [Biometric Type]" button
4. **Fallback option**: "Set up PIN instead" link
5. **Skip with warning**: Modal confirmation before skipping
6. **Keychain storage**: Save biometric preference
7. **Navigation**: Route to Home or PINSetup
8. **EAA compliance**: Full accessibility support
9. **Testing**: 100% RNTL coverage with all scenarios

---

## Detailed Implementation Guide

### Phase 1: Screen Component Structure (45 minutes)

**File**: `src/features/Auth/screens/BiometricSetupScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Heading,
  Icon,
  Box,
} from '@gluestack-ui/themed';
import { SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBiometricCapability, getBiometricName } from '@/hooks/useBiometricCapability';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { SkipBiometricWarningModal } from '@/components/auth/SkipBiometricWarningModal';
import { FaceIdIcon, FingerprintIcon, LockIcon } from '@/components/icons';

/**
 * BiometricSetupScreen
 *
 * Guides user through biometric authentication setup during registration.
 *
 * Features:
 * - Device-specific biometric type detection (Face ID, Touch ID, Fingerprint)
 * - Dynamic UI based on capability
 * - Skip with security warning modal
 * - Fallback to PIN setup
 * - Keychain storage for preference
 *
 * User Flow:
 * 1. Detect device capability
 * 2. Show "Enable [Biometric Type]" if available
 * 3. Show "Set up PIN" if not available
 * 4. Allow skip with warning
 * 5. Store preference → Navigate to Home
 */
export const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { type, isEnrolled, isAvailable, isLoading } = useBiometricCapability();
  const { enableBiometric, isEnabling } = useBiometricAuth();

  const [showSkipWarning, setShowSkipWarning] = useState(false);

  /**
   * Handle enabling biometric authentication
   *
   * Process:
   * 1. Trigger biometric prompt (Face ID / Touch ID / Fingerprint)
   * 2. On success: Store preference in Keychain
   * 3. Navigate to Home
   */
  const handleEnableBiometric = async () => {
    try {
      const success = await enableBiometric();

      if (success) {
        // Biometric enabled successfully
        console.log('[BiometricSetup] Biometric authentication enabled');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('[BiometricSetup] Failed to enable biometric:', error);
      // Error handled by useBiometricAuth hook (shows error message)
    }
  };

  /**
   * Handle PIN setup fallback
   *
   * Navigates to PINSetupScreen for 6-digit PIN creation
   */
  const handleSetupPIN = () => {
    navigation.navigate('PINSetup');
  };

  /**
   * Handle skip action
   *
   * Shows warning modal before allowing skip
   */
  const handleSkip = () => {
    setShowSkipWarning(true);
  };

  /**
   * Confirm skip (from warning modal)
   *
   * User acknowledged security implications → Navigate to Home
   */
  const handleConfirmSkip = () => {
    setShowSkipWarning(false);
    console.log('[BiometricSetup] User skipped biometric setup');
    navigation.navigate('Home');
  };

  /**
   * Cancel skip (from warning modal)
   *
   * User returns to BiometricSetup screen
   */
  const handleCancelSkip = () => {
    setShowSkipWarning(false);
  };

  /**
   * Get icon component based on biometric type
   */
  const getBiometricIcon = () => {
    switch (type) {
      case 'faceId':
        return <FaceIdIcon size={80} color="$primary500" />;
      case 'touchId':
      case 'fingerprint':
        return <FingerprintIcon size={80} color="$primary500" />;
      default:
        return <LockIcon size={80} color="$textLight400" />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '$backgroundLight0' }}
        testID="biometric-setup-screen-loading"
      >
        <VStack flex={1} justifyContent="center" alignItems="center" space="md">
          <Text>Checking biometric capability...</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '$backgroundLight0' }}
        testID="biometric-setup-screen"
        accessibilityLabel="Biometric setup screen"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <VStack flex={1} padding="$6" space="xl" justifyContent="center">
            {/* Icon */}
            <Box alignItems="center" marginBottom="$4">
              {getBiometricIcon()}
            </Box>

            {/* Heading */}
            <VStack space="sm" alignItems="center">
              <Heading
                size="2xl"
                textAlign="center"
                accessibilityRole="header"
                accessibilityLabel={
                  isAvailable && isEnrolled
                    ? `Set up ${getBiometricName(type)}`
                    : 'Set up security'
                }
              >
                {isAvailable && isEnrolled
                  ? `Set Up ${getBiometricName(type)}`
                  : 'Set Up Security'}
              </Heading>

              <Text
                size="md"
                textAlign="center"
                color="$textLight600"
                paddingHorizontal="$4"
                accessibilityLabel={
                  isAvailable && isEnrolled
                    ? `Use ${getBiometricName(type)} to quickly and securely access your account`
                    : 'Set up a PIN to secure your account'
                }
              >
                {isAvailable && isEnrolled
                  ? `Use ${getBiometricName(type)} to quickly and securely access your account.`
                  : 'Set up a 6-digit PIN to secure your account.'}
              </Text>
            </VStack>

            {/* Primary Action */}
            <VStack space="md" marginTop="$8">
              {isAvailable && isEnrolled ? (
                <Button
                  onPress={handleEnableBiometric}
                  isDisabled={isEnabling}
                  size="lg"
                  accessibilityRole="button"
                  accessibilityLabel={`Enable ${getBiometricName(type)}`}
                  accessibilityHint="Activates biometric authentication for your account"
                  accessibilityState={{ disabled: isEnabling, busy: isEnabling }}
                  testID="enable-biometric-button"
                  style={{ minHeight: 48 }}
                >
                  <ButtonText>
                    {isEnabling ? 'Enabling...' : `Enable ${getBiometricName(type)}`}
                  </ButtonText>
                </Button>
              ) : (
                <Button
                  onPress={handleSetupPIN}
                  size="lg"
                  accessibilityRole="button"
                  accessibilityLabel="Set up PIN"
                  accessibilityHint="Creates a 6-digit PIN for account security"
                  testID="setup-pin-button"
                  style={{ minHeight: 48 }}
                >
                  <ButtonText>Set Up PIN</ButtonText>
                </Button>
              )}

              {/* Fallback Option */}
              {isAvailable && isEnrolled && (
                <Button
                  onPress={handleSetupPIN}
                  variant="link"
                  accessibilityRole="button"
                  accessibilityLabel="Set up PIN instead"
                  accessibilityHint="Skip biometric authentication and create a PIN"
                  testID="setup-pin-fallback-button"
                  style={{ minHeight: 48 }}
                >
                  <ButtonText>Set Up PIN Instead</ButtonText>
                </Button>
              )}

              {/* Skip Option */}
              <Button
                onPress={handleSkip}
                variant="link"
                accessibilityRole="button"
                accessibilityLabel="Skip for now"
                accessibilityHint="Skip security setup. You can enable it later in Settings."
                testID="skip-biometric-button"
                style={{ minHeight: 48 }}
              >
                <ButtonText color="$textLight500">Skip for Now</ButtonText>
              </Button>
            </VStack>

            {/* Info Box */}
            {isAvailable && isEnrolled && (
              <Box
                marginTop="$6"
                padding="$4"
                backgroundColor="$primary50"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$primary200"
              >
                <Text size="sm" color="$textLight700">
                  💡 {getBiometricName(type)} is faster and more secure than a password. You
                  can change this later in Settings.
                </Text>
              </Box>
            )}
          </VStack>
        </ScrollView>
      </SafeAreaView>

      {/* Skip Warning Modal */}
      <SkipBiometricWarningModal
        visible={showSkipWarning}
        onConfirm={handleConfirmSkip}
        onCancel={handleCancelSkip}
      />
    </>
  );
};
```

### Phase 2: Skip Warning Modal Component (30 minutes)

**File**: `src/components/auth/SkipBiometricWarningModal.tsx`

```typescript
import React from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Text,
  Button,
  ButtonText,
  VStack,
  Icon,
} from '@gluestack-ui/themed';
import { AlertTriangleIcon } from '@/components/icons';

interface SkipBiometricWarningModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Called when user confirms skip */
  onConfirm: () => void;
  /** Called when user cancels skip */
  onCancel: () => void;
}

/**
 * SkipBiometricWarningModal
 *
 * Warning modal shown when user attempts to skip biometric setup.
 *
 * Explains security implications:
 * - Account less secure without biometrics
 * - Can enable later in Settings
 * - Recommends setting up PIN at minimum
 */
export const SkipBiometricWarningModal: React.FC<SkipBiometricWarningModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={visible} onClose={onCancel}>
      <ModalBackdrop />
      <ModalContent
        testID="skip-biometric-warning-modal"
        accessibilityLabel="Security warning modal"
        accessibilityRole="alert"
      >
        <ModalHeader>
          <VStack space="sm" alignItems="center" width="100%">
            <Icon as={AlertTriangleIcon} size="xl" color="$warning500" />
            <Heading size="lg" textAlign="center">
              Skip Security Setup?
            </Heading>
          </VStack>
        </ModalHeader>

        <ModalBody>
          <VStack space="md">
            <Text color="$textLight700">
              Without biometric authentication or a PIN, your account will be less secure.
            </Text>

            <Text color="$textLight700">
              We strongly recommend setting up at least a 6-digit PIN to protect your data.
            </Text>

            <Text size="sm" color="$textLight500">
              You can always enable security later in Settings.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <VStack space="sm" width="100%">
            <Button
              onPress={onCancel}
              size="lg"
              accessibilityRole="button"
              accessibilityLabel="Go back and set up security"
              accessibilityHint="Returns to security setup screen"
              testID="cancel-skip-button"
              style={{ minHeight: 48 }}
            >
              <ButtonText>Set Up Security</ButtonText>
            </Button>

            <Button
              onPress={onConfirm}
              variant="outline"
              size="lg"
              accessibilityRole="button"
              accessibilityLabel="Skip security setup"
              accessibilityHint="Proceeds without setting up biometric or PIN"
              testID="confirm-skip-button"
              style={{ minHeight: 48 }}
            >
              <ButtonText>Skip Anyway</ButtonText>
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

### Phase 3: Biometric Auth Hook (45 minutes)

**File**: `src/hooks/useBiometricAuth.ts`

```typescript
import { useState, useCallback } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import { Alert } from 'react-native';

/**
 * Biometric authentication hook
 *
 * Provides functions to:
 * - Enable biometric authentication
 * - Authenticate with biometrics
 * - Store/retrieve biometric preference
 */
export const useBiometricAuth = () => {
  const [isEnabling, setIsEnabling] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * Enable biometric authentication
   *
   * Process:
   * 1. Trigger biometric prompt (Face ID / Touch ID / Fingerprint)
   * 2. On success: Store preference in Keychain
   * 3. Return success status
   */
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    setIsEnabling(true);

    try {
      const rnBiometrics = new ReactNativeBiometrics();

      // Check sensor availability first
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device.'
        );
        setIsEnabling(false);
        return false;
      }

      console.log('[BiometricAuth] Prompting biometric authentication:', biometryType);

      // Create signature to trigger biometric prompt
      const { success } = await rnBiometrics.createSignature({
        promptMessage: 'Authenticate to enable biometric security',
        payload: 'enable_biometric',
      });

      if (success) {
        // Store biometric preference in Keychain
        await Keychain.setGenericPassword('biometric_enabled', 'true', {
          service: 'biometric_preference',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        console.log('[BiometricAuth] Biometric authentication enabled successfully');
        setIsEnabling(false);
        return true;
      } else {
        console.log('[BiometricAuth] User cancelled biometric prompt');
        setIsEnabling(false);
        return false;
      }
    } catch (error) {
      console.error('[BiometricAuth] Failed to enable biometric:', error);

      Alert.alert(
        'Biometric Setup Failed',
        'Failed to enable biometric authentication. Please try again.'
      );

      setIsEnabling(false);
      return false;
    }
  }, []);

  /**
   * Authenticate with biometrics
   *
   * Used for login/sensitive actions
   */
  const authenticate = useCallback(async (promptMessage = 'Authenticate'): Promise<boolean> => {
    setIsAuthenticating(true);

    try {
      const rnBiometrics = new ReactNativeBiometrics();

      const { success } = await rnBiometrics.createSignature({
        promptMessage,
        payload: 'authenticate',
      });

      setIsAuthenticating(false);
      return success;
    } catch (error) {
      console.error('[BiometricAuth] Authentication failed:', error);
      setIsAuthenticating(false);
      return false;
    }
  }, []);

  /**
   * Check if biometric is enabled (from Keychain)
   */
  const isBiometricEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'biometric_preference',
      });

      return credentials && credentials.password === 'true';
    } catch (error) {
      console.error('[BiometricAuth] Failed to check biometric preference:', error);
      return false;
    }
  }, []);

  return {
    enableBiometric,
    authenticate,
    isBiometricEnabled,
    isEnabling,
    isAuthenticating,
  };
};
```

### Phase 4: Icon Components (15 minutes)

**File**: `src/components/icons/index.ts`

```typescript
// Export biometric-related icons
export { default as FaceIdIcon } from './FaceIdIcon';
export { default as FingerprintIcon } from './FingerprintIcon';
export { default as LockIcon } from './LockIcon';
export { default as AlertTriangleIcon } from './AlertTriangleIcon';
```

**File**: `src/components/icons/FaceIdIcon.tsx`

```typescript
import React from 'react';
import { Icon } from '@gluestack-ui/themed';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const FaceIdIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => {
  return (
    <Icon as={Svg} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V6C4 4.89543 4.89543 4 6 4H8M4 16V18C4 19.1046 4.89543 20 6 20H8M16 4H18C19.1046 4 20 4.89543 20 6V8M16 20H18C19.1046 20 20 19.1046 20 18V16M9 10H9.01M15 10H15.01M9 14C9 14 10 16 12 16C14 16 15 14 15 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
};

export default FaceIdIcon;
```

**File**: `src/components/icons/FingerprintIcon.tsx`

```typescript
import React from 'react';
import { Icon } from '@gluestack-ui/themed';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const FingerprintIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor' }) => {
  return (
    <Icon as={Svg} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12C13 11.4477 12.5523 11 12 11Z"
        fill={color}
      />
      <Path
        d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12V16C16 16.5523 16.4477 17 17 17C17.5523 17 18 16.5523 18 16V12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12V16C6 16.5523 6.44772 17 7 17C7.55228 17 8 16.5523 8 16V12Z"
        fill={color}
      />
    </Icon>
  );
};

export default FingerprintIcon;
```

### Phase 5: Navigation Integration (15 minutes)

**File**: `src/navigation/AppNavigator.tsx`

```typescript
// Add BiometricSetupScreen to navigation stack
import { BiometricSetupScreen } from '@/screens/auth/BiometricSetupScreen';

// In stack navigator
<Stack.Screen
  name="BiometricSetup"
  component={BiometricSetupScreen}
  options={{
    headerShown: false,
    gestureEnabled: false, // Prevent back swipe
  }}
/>
```

**File**: `src/types/navigation.ts`

```typescript
export type AuthStackParamList = {
  // ... other screens
  BiometricSetup: undefined;
  PINSetup: undefined;
};
```

---

## Acceptance Criteria

- [ ] Screen detects device capability using `useBiometricCapability` hook
- [ ] Shows "Enable Face ID" button on iPhone X+ devices
- [ ] Shows "Enable Touch ID" button on iPhone 5s-8 devices
- [ ] Shows "Enable Fingerprint" button on Android devices
- [ ] Shows "Set Up PIN" button if no biometrics available
- [ ] "Enable [Biometric]" triggers biometric prompt
- [ ] Successful prompt stores preference in Keychain
- [ ] Navigates to Home on successful enable
- [ ] "Set up PIN instead" navigates to PINSetup
- [ ] "Skip for now" shows warning modal
- [ ] Warning modal explains security implications
- [ ] Confirming skip navigates to Home
- [ ] Cancelling skip returns to BiometricSetup
- [ ] Loading state shown during capability detection
- [ ] All buttons have minimum 48×48 touch targets (EAA compliance)
- [ ] All elements have proper accessibility labels/hints/roles
- [ ] Screen navigable with screen reader (VoiceOver/TalkBack)
- [ ] 100% RNTL test coverage for all scenarios

---

## Testing

**Test File**: `src/screens/auth/__tests__/BiometricSetupScreen.test.tsx`

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { BiometricSetupScreen } from '../BiometricSetupScreen';
import { useBiometricCapability } from '@/hooks/useBiometricCapability';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useNavigation } from '@react-navigation/native';

// Mocks
jest.mock('@/hooks/useBiometricCapability');
jest.mock('@/hooks/useBiometricAuth');
jest.mock('@react-navigation/native');

const mockUseBiometricCapability = useBiometricCapability as jest.MockedFunction<
  typeof useBiometricCapability
>;
const mockUseBiometricAuth = useBiometricAuth as jest.MockedFunction<typeof useBiometricAuth>;
const mockNavigate = jest.fn();

(useNavigation as jest.Mock).mockReturnValue({
  navigate: mockNavigate,
});

describe('BiometricSetupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Face ID available', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'faceId',
        isEnrolled: true,
        isAvailable: true,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn().mockResolvedValue(true),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('renders Face ID setup screen correctly', () => {
      render(<BiometricSetupScreen />);

      expect(screen.getByText('Set Up Face ID')).toBeOnTheScreen();
      expect(
        screen.getByText('Use Face ID to quickly and securely access your account.'),
      ).toBeOnTheScreen();
      expect(screen.getByTestId('enable-biometric-button')).toBeOnTheScreen();
      expect(screen.getByText('Enable Face ID')).toBeOnTheScreen();
    });

    it('enables Face ID when button is pressed', async () => {
      const mockEnableBiometric = jest.fn().mockResolvedValue(true);
      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: mockEnableBiometric,
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });

      render(<BiometricSetupScreen />);

      const enableButton = screen.getByTestId('enable-biometric-button');
      fireEvent.press(enableButton);

      await waitFor(() => {
        expect(mockEnableBiometric).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('shows loading state while enabling', () => {
      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn(),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: true,
        isAuthenticating: false,
      });

      render(<BiometricSetupScreen />);

      const enableButton = screen.getByTestId('enable-biometric-button');
      expect(enableButton).toBeDisabled();
      expect(screen.getByText('Enabling...')).toBeOnTheScreen();
    });

    it('navigates to PINSetup when "Set up PIN instead" is pressed', () => {
      render(<BiometricSetupScreen />);

      const pinButton = screen.getByTestId('setup-pin-fallback-button');
      fireEvent.press(pinButton);

      expect(mockNavigate).toHaveBeenCalledWith('PINSetup');
    });
  });

  describe('Touch ID available', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'touchId',
        isEnrolled: true,
        isAvailable: true,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn().mockResolvedValue(true),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('renders Touch ID setup screen correctly', () => {
      render(<BiometricSetupScreen />);

      expect(screen.getByText('Set Up Touch ID')).toBeOnTheScreen();
      expect(screen.getByText('Enable Touch ID')).toBeOnTheScreen();
    });
  });

  describe('Fingerprint available (Android)', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'fingerprint',
        isEnrolled: true,
        isAvailable: true,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn().mockResolvedValue(true),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('renders Fingerprint setup screen correctly', () => {
      render(<BiometricSetupScreen />);

      expect(screen.getByText('Set Up Fingerprint')).toBeOnTheScreen();
      expect(screen.getByText('Enable Fingerprint')).toBeOnTheScreen();
    });
  });

  describe('No biometrics available', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'none',
        isEnrolled: false,
        isAvailable: false,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn(),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('shows PIN setup option when no biometrics available', () => {
      render(<BiometricSetupScreen />);

      expect(screen.getByText('Set Up Security')).toBeOnTheScreen();
      expect(screen.getByText('Set up a 6-digit PIN to secure your account.')).toBeOnTheScreen();
      expect(screen.getByTestId('setup-pin-button')).toBeOnTheScreen();
      expect(screen.getByText('Set Up PIN')).toBeOnTheScreen();
    });

    it('navigates to PINSetup when button is pressed', () => {
      render(<BiometricSetupScreen />);

      const pinButton = screen.getByTestId('setup-pin-button');
      fireEvent.press(pinButton);

      expect(mockNavigate).toHaveBeenCalledWith('PINSetup');
    });

    it('does not show "Set up PIN instead" fallback', () => {
      render(<BiometricSetupScreen />);

      expect(screen.queryByTestId('setup-pin-fallback-button')).not.toBeOnTheScreen();
    });
  });

  describe('Skip functionality', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'faceId',
        isEnrolled: true,
        isAvailable: true,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn(),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('shows warning modal when "Skip for now" is pressed', () => {
      render(<BiometricSetupScreen />);

      const skipButton = screen.getByTestId('skip-biometric-button');
      fireEvent.press(skipButton);

      expect(screen.getByTestId('skip-biometric-warning-modal')).toBeOnTheScreen();
      expect(screen.getByText('Skip Security Setup?')).toBeOnTheScreen();
    });

    it('navigates to Home when skip is confirmed', async () => {
      render(<BiometricSetupScreen />);

      // Open modal
      const skipButton = screen.getByTestId('skip-biometric-button');
      fireEvent.press(skipButton);

      // Confirm skip
      const confirmButton = screen.getByTestId('confirm-skip-button');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('Home');
      });
    });

    it('closes modal when skip is cancelled', () => {
      render(<BiometricSetupScreen />);

      // Open modal
      const skipButton = screen.getByTestId('skip-biometric-button');
      fireEvent.press(skipButton);

      expect(screen.getByTestId('skip-biometric-warning-modal')).toBeOnTheScreen();

      // Cancel skip
      const cancelButton = screen.getByTestId('cancel-skip-button');
      fireEvent.press(cancelButton);

      expect(screen.queryByTestId('skip-biometric-warning-modal')).not.toBeOnTheScreen();
    });
  });

  describe('Loading state', () => {
    it('shows loading state while detecting capability', () => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'none',
        isEnrolled: false,
        isAvailable: false,
        isLoading: true,
        error: null,
        retry: jest.fn(),
      });

      render(<BiometricSetupScreen />);

      expect(screen.getByTestId('biometric-setup-screen-loading')).toBeOnTheScreen();
      expect(screen.getByText('Checking biometric capability...')).toBeOnTheScreen();
    });
  });

  describe('EAA compliance', () => {
    beforeEach(() => {
      mockUseBiometricCapability.mockReturnValue({
        type: 'faceId',
        isEnrolled: true,
        isAvailable: true,
        isLoading: false,
        error: null,
        retry: jest.fn(),
      });

      mockUseBiometricAuth.mockReturnValue({
        enableBiometric: jest.fn(),
        authenticate: jest.fn(),
        isBiometricEnabled: jest.fn(),
        isEnabling: false,
        isAuthenticating: false,
      });
    });

    it('has proper accessibility labels on screen', () => {
      render(<BiometricSetupScreen />);

      const screen = screen.getByTestId('biometric-setup-screen');
      expect(screen).toHaveAccessibilityLabel('Biometric setup screen');
    });

    it('has proper accessibility on enable button', () => {
      render(<BiometricSetupScreen />);

      const button = screen.getByTestId('enable-biometric-button');
      expect(button).toHaveAccessibilityRole('button');
      expect(button).toHaveAccessibilityLabel('Enable Face ID');
      expect(button).toHaveAccessibilityHint(
        'Activates biometric authentication for your account',
      );
    });

    it('has proper accessibility on skip button', () => {
      render(<BiometricSetupScreen />);

      const button = screen.getByTestId('skip-biometric-button');
      expect(button).toHaveAccessibilityRole('button');
      expect(button).toHaveAccessibilityLabel('Skip for now');
      expect(button).toHaveAccessibilityHint(
        'Skip security setup. You can enable it later in Settings.',
      );
    });

    it('has proper accessibility on heading', () => {
      render(<BiometricSetupScreen />);

      const heading = screen.getByText('Set Up Face ID');
      expect(heading).toHaveAccessibilityRole('header');
      expect(heading).toHaveAccessibilityLabel('Set up Face ID');
    });
  });
});
```

---

## Troubleshooting

### Issue: "Biometric prompt doesn't appear"

**Cause**: Device simulator doesn't have biometric hardware enrolled

**Solution**: Enable Face ID in simulator:

```bash
# iOS Simulator
Simulator → Features → Face ID → Enrolled

# Test biometric prompt
xcrun simctl openurl booted "warrendeleon://test-biometric"
```

### Issue: "enableBiometric returns false but no error"

**Cause**: User cancelled biometric prompt

**Solution**: This is expected behaviour. Show a message encouraging user to try again.

### Issue: "Keychain storage fails"

**Cause**: Keychain service not configured or simulator limitations

**Solution**:

1. Ensure `react-native-keychain` is properly linked
2. On simulator, try resetting keychain: Device → Erase All Content and Settings
3. Check Keychain configuration in `Info.plist`:

```xml
<key>KeychainAccessGroups</key>
<array>
  <string>$(AppIdentifierPrefix)com.warrendeleon</string>
</array>
```

### Issue: "Skip modal doesn't close"

**Cause**: State not updating correctly

**Solution**: Ensure `setShowSkipWarning(false)` is called in both `handleConfirmSkip` and `handleCancelSkip`.

### Issue: "Navigation doesn't work"

**Cause**: Screen not registered in navigator or incorrect screen name

**Solution**: Verify screen is added to `AuthStackParamList` and registered in navigator:

```typescript
<Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
```

---

**Effort**: 3h | **Last Updated**: 2025-11-21

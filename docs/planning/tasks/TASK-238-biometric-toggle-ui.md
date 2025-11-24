# TASK-238: BiometricToggleScreen UI Implementation

**ID**: TASK-238 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-041](../stories/US-041-toggle-biometric-auth.md)
**Status**: 📋 To Do | **Effort**: 1.5h

## File Structure

```
src/features/Auth/
└── screens/
    ├── BiometricToggleScreen.tsx
    └── __tests__/
        └── BiometricToggleScreen.rntl.tsx
```

**Note**: Biometric authentication management is Auth-specific functionality, co-located with Auth feature following feature-first architecture (established in TASK-196). Uses existing `useBiometricCapability` hook from TASK-209.

---

## Task Description

Create the BiometricToggleScreen component with a toggle switch to enable/disable biometric authentication. Display device biometric capability status, current biometric type (Face ID/Touch ID/Fingerprint), and fallback information if biometrics are unavailable.

---

## Acceptance Criteria

- [ ] BiometricToggleScreen component created in `src/features/Auth/screens/BiometricToggleScreen.tsx`
- [ ] Toggle switch for enabling/disabling biometrics
- [ ] Display current biometric type (Face ID, Touch ID, Fingerprint)
- [ ] Show capability check result (available/unavailable)
- [ ] Fallback message when biometrics are unavailable
- [ ] Success/error messaging
- [ ] Loading indicator during toggle operation
- [ ] Back button navigates to SettingsScreen
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/screens/settings/BiometricToggleScreen.tsx

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Switch,
  Text,
  Spinner,
  AlertCircleIcon,
  ShieldCheckIcon,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { checkBiometricCapability, enableBiometric, disableBiometric } from '../../services/biometric/biometricService';
import { BiometricType } from '../../types/biometric';

export const BiometricToggleScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  const checkCapability = async () => {
    setIsLoading(true);
    try {
      const capability = await checkBiometricCapability();

      setIsAvailable(capability.available);
      setBiometricType(capability.biometricType);
      setIsEnabled(capability.isCurrentlyEnabled);

      if (!capability.available) {
        setErrorMessage(getBiometricUnavailableMessage(capability.error));
      }
    } catch (error) {
      console.error('Failed to check biometric capability:', error);
      setErrorMessage('Failed to check biometric availability');
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricUnavailableMessage = (error?: string): string => {
    if (error?.includes('NOT_ENROLLED')) {
      return 'No biometrics enrolled. Please set up Face ID/Touch ID in your device settings.';
    }
    if (error?.includes('NOT_AVAILABLE')) {
      return 'Biometric authentication is not available on this device.';
    }
    return 'Biometric authentication is currently unavailable.';
  };

  const getBiometricLabel = (): string => {
    if (!biometricType) return 'Biometric Authentication';

    if (Platform.OS === 'ios') {
      return biometricType === 'FaceID' ? 'Face ID' : 'Touch ID';
    }

    return 'Fingerprint';
  };

  const handleToggle = async (value: boolean) => {
    if (!isAvailable) {
      setErrorMessage('Biometric authentication is not available');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (value) {
        await enableBiometric();
        setSuccessMessage(`${getBiometricLabel()} enabled successfully`);
      } else {
        await disableBiometric();
        setSuccessMessage(`${getBiometricLabel()} disabled successfully`);
      }

      setIsEnabled(value);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Failed to toggle biometric:', error);
      setErrorMessage(error.message || 'Failed to update biometric setting');
      setIsEnabled(!value); // Revert toggle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      testID="biometric-toggle-screen"
    >
      <Box flex={1} padding="$6">
        <VStack space="xl">
          {/* Header */}
          <VStack space="xs">
            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              color="$gray900"
              accessibilityRole="header"
            >
              Biometric Authentication
            </Text>
            <Text fontSize="$sm" color="$gray600">
              {isAvailable
                ? `Use ${getBiometricLabel()} to unlock the app`
                : 'Biometric authentication is not available'}
            </Text>
          </VStack>

          {/* Capability Status */}
          <Box
            backgroundColor={isAvailable ? '$green100' : '$amber100'}
            borderColor={isAvailable ? '$green600' : '$amber600'}
            borderWidth={1}
            borderRadius="$md"
            padding="$4"
            testID="capability-status"
            accessibilityRole="alert"
          >
            <HStack space="sm" alignItems="center">
              {isAvailable ? (
                <ShieldCheckIcon size="xl" color="$green600" />
              ) : (
                <AlertCircleIcon size="xl" color="$amber600" />
              )}
              <VStack flex={1}>
                <Text fontSize="$md" fontWeight="$semibold" color={isAvailable ? '$green800' : '$amber800'}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </Text>
                <Text fontSize="$sm" color={isAvailable ? '$green700' : '$amber700'}>
                  {isAvailable
                    ? `${getBiometricLabel()} is available on this device`
                    : errorMessage || 'Biometric authentication is not set up'}
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Toggle Switch */}
          <HStack
            backgroundColor="$gray100"
            borderRadius="$md"
            padding="$4"
            justifyContent="space-between"
            alignItems="center"
            opacity={isAvailable ? 1 : 0.5}
            testID="biometric-toggle-container"
          >
            <VStack flex={1}>
              <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                Enable {getBiometricLabel()}
              </Text>
              <Text fontSize="$sm" color="$gray600">
                {isEnabled ? 'Currently enabled' : 'Currently disabled'}
              </Text>
            </VStack>

            {isLoading ? (
              <Spinner size="small" testID="biometric-loading-spinner" />
            ) : (
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                isDisabled={!isAvailable || isLoading}
                testID="biometric-toggle-switch"
                accessibilityRole="switch"
                accessibilityLabel={`${getBiometricLabel()} toggle`}
                accessibilityHint={`Toggle ${getBiometricLabel()} ${isEnabled ? 'off' : 'on'}`}
                accessibilityState={{ checked: isEnabled, disabled: !isAvailable || isLoading }}
              />
            )}
          </HStack>

          {/* Success Message */}
          {successMessage && (
            <Box
              backgroundColor="$green100"
              borderColor="$green600"
              borderWidth={1}
              borderRadius="$md"
              padding="$3"
              testID="success-message"
              accessibilityRole="alert"
            >
              <HStack space="sm" alignItems="center">
                <Text fontSize="$lg">✓</Text>
                <Text color="$green800">{successMessage}</Text>
              </HStack>
            </Box>
          )}

          {/* Information */}
          <Box
            backgroundColor="$blue50"
            borderColor="$blue200"
            borderWidth={1}
            borderRadius="$md"
            padding="$4"
          >
            <VStack space="xs">
              <Text fontSize="$md" fontWeight="$semibold" color="$blue900">
                About Biometric Authentication
              </Text>
              <Text fontSize="$sm" color="$blue800">
                {isAvailable
                  ? `When enabled, you can use ${getBiometricLabel()} to unlock the app instead of entering your PIN.`
                  : 'To use biometric authentication, please set up Face ID or Touch ID in your device Settings app.'}
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </SafeAreaView>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/screens/settings/__tests__/BiometricToggleScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BiometricToggleScreen } from '../BiometricToggleScreen';
import * as biometricService from '../../../services/biometric/biometricService';

jest.mock('../../../services/biometric/biometricService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

const mockBiometricService = biometricService as jest.Mocked<typeof biometricService>;

describe('BiometricToggleScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render screen with biometrics available (Face ID)', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'FaceID',
      isCurrentlyEnabled: false,
    });

    const { getByText, getByTestId } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByText('Biometric Authentication')).toBeTruthy();
      expect(getByText('Use Face ID to unlock the app')).toBeTruthy();
      expect(getByText('Available')).toBeTruthy();
      expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
    });
  });

  it('should render screen with biometrics available (Touch ID)', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'TouchID',
      isCurrentlyEnabled: false,
    });

    const { getByText } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByText('Use Touch ID to unlock the app')).toBeTruthy();
    });
  });

  it('should show unavailable status when biometrics are not available', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: false,
      biometricType: null,
      isCurrentlyEnabled: false,
      error: 'NOT_AVAILABLE',
    });

    const { getByText } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByText('Unavailable')).toBeTruthy();
      expect(getByText(/Biometric authentication is not available on this device/)).toBeTruthy();
    });
  });

  it('should enable biometric when toggle is turned on', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'FaceID',
      isCurrentlyEnabled: false,
    });
    mockBiometricService.enableBiometric.mockResolvedValue();

    const { getByTestId, getByText } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
    });

    fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

    await waitFor(() => {
      expect(mockBiometricService.enableBiometric).toHaveBeenCalled();
      expect(getByText('Face ID enabled successfully')).toBeTruthy();
    });
  });

  it('should disable biometric when toggle is turned off', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'FaceID',
      isCurrentlyEnabled: true,
    });
    mockBiometricService.disableBiometric.mockResolvedValue();

    const { getByTestId, getByText } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
    });

    fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', false);

    await waitFor(() => {
      expect(mockBiometricService.disableBiometric).toHaveBeenCalled();
      expect(getByText('Face ID disabled successfully')).toBeTruthy();
    });
  });

  it('should show error when toggle fails', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'FaceID',
      isCurrentlyEnabled: false,
    });
    mockBiometricService.enableBiometric.mockRejectedValue(new Error('Failed to enable'));

    const { getByTestId, getByText } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
    });

    fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

    await waitFor(() => {
      expect(getByText('Failed to enable')).toBeTruthy();
    });
  });

  it('should have correct accessibility properties', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      available: true,
      biometricType: 'FaceID',
      isCurrentlyEnabled: false,
    });

    const { getByTestId } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      const toggleSwitch = getByTestId('biometric-toggle-switch');
      expect(toggleSwitch).toHaveProp('accessibilityRole', 'switch');
      expect(toggleSwitch).toHaveProp('accessibilityLabel', 'Face ID toggle');
    });
  });
});
```

---

## Dependencies

- GlueStack UI components
- React Hook Form (if needed for form state)
- Biometric service (TASK-239, TASK-240)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Toggle switch functional
- [ ] Capability check integrated
- [ ] Success/error messaging working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-041](../stories/US-041-toggle-biometric-auth.md), [TASK-239](TASK-239-biometric-capability-check.md), [TASK-240](TASK-240-biometric-enable-disable-logic.md)

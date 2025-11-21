# TASK-209: Biometric Capability Detection

**ID**: TASK-209 | **US**: [US-035](../stories/US-035-biometric-security-setup.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 1.5h | **Created**: 2025-11-21

---

## Context & Background

Biometric authentication (Face ID, Touch ID, Fingerprint) availability varies by device. Before offering biometric setup to users, we must detect:

- **Device capability**: Does the device have biometric hardware?
- **Biometric type**: Face ID, Touch ID (iOS), or Fingerprint (Android)?
- **Enrollment status**: Has the user enrolled biometrics in device settings?

**Why This Task Matters:**

Offering biometric setup when the device doesn't support it leads to poor UX. We need to:

- Show appropriate UI based on capability ("Enable Face ID" vs "Enable Fingerprint")
- Skip biometric setup entirely if no hardware available
- Prompt user to enrol biometrics in Settings if hardware exists but not enrolled
- Gracefully fall back to 6-digit PIN if biometrics unavailable

**Device Support Matrix:**

| Device           | Biometric Type      | Library Detection |
| ---------------- | ------------------- | ----------------- |
| iPhone X+        | Face ID             | `FaceID`          |
| iPhone 5s-8      | Touch ID            | `TouchID`         |
| Android (varies) | Fingerprint         | `Biometrics`      |
| iPad Pro         | Face ID             | `FaceID`          |
| iPad (older)     | Touch ID            | `TouchID`         |
| Simulator        | None (can simulate) | Varies            |

---

## Objective

Build biometric detection system with:

1. **Device capability detection**: Check if biometric hardware exists
2. **Biometric type identification**: Determine Face ID vs Touch ID vs Fingerprint
3. **Enrollment verification**: Check if user has enrolled biometrics
4. **React hook interface**: Clean, reusable hook for components
5. **Error handling**: Handle permission denials, simulator limitations
6. **Testing**: 100% coverage with all device scenarios mocked

---

## Detailed Implementation Guide

### Phase 1: Install Dependencies (10 minutes)

```bash
yarn add react-native-biometrics

# iOS setup
cd ios && pod install && cd ..

# Android setup (already configured in TASK-189)
```

### Phase 2: Biometric Capability Hook (40 minutes)

**File**: `src/hooks/useBiometricCapability.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';

/**
 * Biometric capability types
 */
export type BiometricType = 'faceId' | 'touchId' | 'fingerprint' | 'none';

/**
 * Biometric capability state
 */
export interface BiometricCapability {
  /** Type of biometric available on device */
  type: BiometricType;
  /** Whether biometrics are enrolled (user has set up Face ID/Fingerprint in Settings) */
  isEnrolled: boolean;
  /** Whether biometric hardware is available (device capability) */
  isAvailable: boolean;
  /** Loading state while detecting capability */
  isLoading: boolean;
  /** Error message if detection failed */
  error: string | null;
  /** Retry detection (useful if initial detection failed) */
  retry: () => Promise<void>;
}

/**
 * Map react-native-biometrics BiometryTypes to our BiometricType
 */
const mapBiometryType = (biometryType: BiometryTypes | undefined): BiometricType => {
  if (!biometryType) return 'none';

  switch (biometryType) {
    case BiometryTypes.FaceID:
      return 'faceId';
    case BiometryTypes.TouchID:
      return 'touchId';
    case BiometryTypes.Biometrics:
      return 'fingerprint';
    default:
      return 'none';
  }
};

/**
 * Hook to detect biometric capability and enrollment status
 *
 * Detects:
 * - Device biometric hardware (Face ID, Touch ID, Fingerprint)
 * - Whether user has enrolled biometrics in device settings
 * - Platform-specific biometric types
 *
 * @example
 * const { type, isEnrolled, isAvailable } = useBiometricCapability();
 *
 * if (isAvailable && isEnrolled) {
 *   // Show "Enable Face ID" button
 * } else if (isAvailable && !isEnrolled) {
 *   // Show "Set up Face ID in Settings first" message
 * } else {
 *   // Fall back to PIN
 * }
 */
export const useBiometricCapability = (): BiometricCapability => {
  const [type, setType] = useState<BiometricType>('none');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectCapability = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rnBiometrics = new ReactNativeBiometrics();

      // Check if biometric sensor is available
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      console.log('[Biometrics] Detection result:', { available, biometryType });

      if (available && biometryType) {
        // Biometric hardware exists and user has enrolled
        const mappedType = mapBiometryType(biometryType);
        setType(mappedType);
        setIsAvailable(true);
        setIsEnrolled(true);
      } else if (!available) {
        // No biometric hardware or not enrolled
        // Try to determine if hardware exists but not enrolled
        const platformType = Platform.OS === 'ios' ? 'touchId' : 'fingerprint';

        // On iOS, isSensorAvailable returns false if not enrolled
        // On Android, similar behavior
        setType('none');
        setIsAvailable(false);
        setIsEnrolled(false);

        console.log('[Biometrics] No biometrics available or not enrolled');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('[Biometrics] Detection error:', err);

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to detect biometric capability';
      setError(errorMessage);
      setType('none');
      setIsAvailable(false);
      setIsEnrolled(false);
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    await detectCapability();
  }, [detectCapability]);

  useEffect(() => {
    detectCapability();
  }, [detectCapability]);

  return {
    type,
    isEnrolled,
    isAvailable,
    isLoading,
    error,
    retry,
  };
};

/**
 * Get user-friendly biometric name for UI display
 */
export const getBiometricName = (type: BiometricType): string => {
  switch (type) {
    case 'faceId':
      return 'Face ID';
    case 'touchId':
      return 'Touch ID';
    case 'fingerprint':
      return 'Fingerprint';
    case 'none':
      return 'Biometric authentication';
  }
};

/**
 * Get biometric setup instruction for user
 */
export const getBiometricSetupInstruction = (type: BiometricType): string => {
  switch (type) {
    case 'faceId':
      return 'Go to Settings > Face ID & Passcode to set up Face ID';
    case 'touchId':
      return 'Go to Settings > Touch ID & Passcode to set up Touch ID';
    case 'fingerprint':
      return 'Go to Settings > Security > Fingerprint to set up fingerprint';
    case 'none':
      return 'Biometric authentication is not available on this device';
  }
};
```

### Phase 3: Capability Display Component (20 minutes)

**File**: `src/components/auth/BiometricCapabilityDisplay.tsx`

```typescript
import React from 'react';
import { HStack, VStack, Text, Icon, Button } from '@gluestack-ui/themed';
import { useBiometricCapability, getBiometricName } from '@/hooks/useBiometricCapability';
import { Linking } from 'react-native';

/**
 * Display biometric capability status to user
 *
 * Shows:
 * - Available biometric type (Face ID, Touch ID, Fingerprint)
 * - Enrollment status
 * - Action button (enable or set up in Settings)
 */
export const BiometricCapabilityDisplay: React.FC = () => {
  const { type, isEnrolled, isAvailable, isLoading, error } = useBiometricCapability();

  const openSettings = () => {
    Linking.openSettings();
  };

  if (isLoading) {
    return (
      <VStack space="sm">
        <Text>Checking biometric capability...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack space="sm">
        <Text color="$error500">Failed to detect biometrics: {error}</Text>
      </VStack>
    );
  }

  if (!isAvailable) {
    return (
      <VStack space="sm">
        <Text color="$textLight500">
          Biometric authentication is not available on this device. You can set up a 6-digit PIN instead.
        </Text>
      </VStack>
    );
  }

  if (isAvailable && !isEnrolled) {
    return (
      <VStack space="md">
        <Text color="$warning600">
          {getBiometricName(type)} is available but not set up on your device.
        </Text>
        <Button onPress={openSettings} variant="outline">
          <Text>Open Settings to Set Up {getBiometricName(type)}</Text>
        </Button>
      </VStack>
    );
  }

  return (
    <VStack space="sm">
      <HStack space="sm" alignItems="center">
        <Icon name="check-circle" color="$success500" />
        <Text>{getBiometricName(type)} is available and ready to use</Text>
      </HStack>
    </VStack>
  );
};
```

### Phase 4: Integration with BiometricSetup Screen (10 minutes)

**File**: `src/screens/auth/BiometricSetupScreen.tsx`

```typescript
import React from 'react';
import { VStack, Button, ButtonText, Text } from '@gluestack-ui/themed';
import { useBiometricCapability, getBiometricName } from '@/hooks/useBiometricCapability';
import { useNavigation } from '@react-navigation/native';

export const BiometricSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { type, isEnrolled, isAvailable } = useBiometricCapability();

  const handleEnableBiometric = () => {
    if (type === 'faceId') {
      // Trigger Face ID prompt
    } else if (type === 'touchId' || type === 'fingerprint') {
      // Trigger Touch ID/Fingerprint prompt
    }
  };

  const handleSkip = () => {
    navigation.navigate('PINSetup'); // Fall back to PIN
  };

  return (
    <VStack space="lg" padding="$4">
      <Text fontSize="$2xl" fontWeight="$bold">
        Set Up {getBiometricName(type)}
      </Text>

      {isAvailable && isEnrolled ? (
        <>
          <Text color="$textLight600">
            Use {getBiometricName(type)} to quickly and securely access your account.
          </Text>

          <Button onPress={handleEnableBiometric}>
            <ButtonText>Enable {getBiometricName(type)}</ButtonText>
          </Button>

          <Button onPress={handleSkip} variant="link">
            <ButtonText>Set up PIN instead</ButtonText>
          </Button>
        </>
      ) : (
        <>
          <Text color="$warning600">
            {getBiometricName(type)} is not available. You'll need to set up a 6-digit PIN.
          </Text>

          <Button onPress={handleSkip}>
            <ButtonText>Set Up PIN</ButtonText>
          </Button>
        </>
      )}
    </VStack>
  );
};
```

---

## Acceptance Criteria

- [ ] Detects Face ID on iPhone X+ devices
- [ ] Detects Touch ID on iPhone 5s-8 devices
- [ ] Detects Fingerprint on Android devices
- [ ] Returns `isEnrolled: true` if biometrics enrolled in device Settings
- [ ] Returns `isEnrolled: false` if hardware exists but not enrolled
- [ ] Returns `isAvailable: false` if no biometric hardware
- [ ] Returns `type: 'none'` if biometrics unavailable
- [ ] `retry()` function re-detects capability
- [ ] Hook handles errors gracefully
- [ ] Loading state shown during detection
- [ ] User-friendly biometric names (Face ID, Touch ID, Fingerprint)
- [ ] 100% unit test coverage for all scenarios

---

## Testing

**Test File**: `src/hooks/__tests__/useBiometricCapability.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useBiometricCapability } from '../useBiometricCapability';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

jest.mock('react-native-biometrics');

describe('useBiometricCapability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('detects Face ID when available and enrolled', async () => {
    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      }),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.type).toBe('faceId');
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnrolled).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('detects Touch ID when available and enrolled', async () => {
    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.TouchID,
      }),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    await waitForNextUpdate();

    expect(result.current.type).toBe('touchId');
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnrolled).toBe(true);
  });

  it('detects Fingerprint (Android) when available and enrolled', async () => {
    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.Biometrics,
      }),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    await waitForNextUpdate();

    expect(result.current.type).toBe('fingerprint');
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnrolled).toBe(true);
  });

  it('returns none when biometrics not available', async () => {
    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockResolvedValue({
        available: false,
        biometryType: undefined,
      }),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    await waitForNextUpdate();

    expect(result.current.type).toBe('none');
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isEnrolled).toBe(false);
  });

  it('handles detection errors gracefully', async () => {
    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: jest.fn().mockRejectedValue(new Error('Permission denied')),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    await waitForNextUpdate();

    expect(result.current.type).toBe('none');
    expect(result.current.error).toBe('Permission denied');
    expect(result.current.isLoading).toBe(false);
  });

  it('retry function re-detects capability', async () => {
    const mockIsSensorAvailable = jest
      .fn()
      .mockResolvedValueOnce({ available: false })
      .mockResolvedValueOnce({ available: true, biometryType: BiometryTypes.FaceID });

    (ReactNativeBiometrics as jest.Mock).mockImplementation(() => ({
      isSensorAvailable: mockIsSensorAvailable,
    }));

    const { result, waitForNextUpdate } = renderHook(() => useBiometricCapability());

    await waitForNextUpdate();

    expect(result.current.type).toBe('none');

    act(() => {
      result.current.retry();
    });

    await waitForNextUpdate();

    expect(result.current.type).toBe('faceId');
    expect(mockIsSensorAvailable).toHaveBeenCalledTimes(2);
  });
});
```

---

## Troubleshooting

### Issue: "isSensorAvailable always returns false on simulator"

**Cause**: iOS simulator doesn't have biometric hardware by default

**Solution**: Enable Face ID in simulator:

```
Simulator → Features → Face ID → Enrolled
```

### Issue: "Detection shows available but authentication fails"

**Cause**: User hasn't enrolled biometrics in device Settings

**Solution**: Guide user to Settings with `Linking.openSettings()`.

### Issue: "Hook returns 'none' on real device with Face ID"

**Cause**: App missing biometric permissions

**Solution**: Add to `Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to secure your account</string>
```

---

**Effort**: 1.5h | **Last Updated**: 2025-11-21

# TASK-239: Biometric Capability Check Implementation

**ID**: TASK-239 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-041](../stories/US-041-toggle-biometric-auth.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement biometric capability checking using `react-native-biometrics` to detect if biometric authentication is available, identify the biometric type (Face ID, Touch ID, Fingerprint), check enrollment status, and return detailed capability information.

---

## Acceptance Criteria

- [ ] `react-native-biometrics` library installed and configured
- [ ] `checkBiometricCapability` function implemented
- [ ] Detects Face ID on iOS devices
- [ ] Detects Touch ID on iOS devices
- [ ] Detects Fingerprint on Android devices
- [ ] Checks if biometrics are enrolled
- [ ] Returns availability status, biometric type, and error details
- [ ] Handles platform differences (iOS/Android)
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Installation

```bash
yarn add react-native-biometrics
cd ios && pod install
```

### Type Definitions

```typescript
// src/types/biometric.ts

export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | null;

export interface BiometricCapability {
  available: boolean;
  biometricType: BiometricType;
  isCurrentlyEnabled: boolean;
  error?: string;
}
```

### Biometric Service

```typescript
// src/services/biometric/biometricService.ts

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricType, BiometricCapability } from '../../types/biometric';

const rnBiometrics = new ReactNativeBiometrics();

/**
 * AsyncStorage key for biometric enabled state
 */
const BIOMETRIC_ENABLED_KEY = '@biometric_enabled';

/**
 * Maps react-native-biometrics types to our BiometricType
 *
 * @param biometryType - BiometryTypes from react-native-biometrics
 * @returns BiometricType
 */
const mapBiometryType = (biometryType: BiometryTypes | undefined): BiometricType => {
  if (!biometryType) return null;

  switch (biometryType) {
    case BiometryTypes.FaceID:
      return 'FaceID';
    case BiometryTypes.TouchID:
      return 'TouchID';
    case BiometryTypes.Biometrics:
      return 'Fingerprint'; // Android
    default:
      return null;
  }
};

/**
 * Checks if biometric authentication is available on the device
 *
 * @returns Promise resolving to BiometricCapability
 *
 * @example
 * const capability = await checkBiometricCapability();
 * if (capability.available) {
 *   console.log(`${capability.biometricType} is available`);
 * } else {
 *   console.error(capability.error);
 * }
 */
export const checkBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    // Check if biometrics are available
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    if (!available) {
      return {
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      };
    }

    // Map biometry type to our enum
    const mappedBiometricType = mapBiometryType(biometryType);

    // Check if biometric is currently enabled in app settings
    const isCurrentlyEnabled = await isBiometricEnabled();

    return {
      available: true,
      biometricType: mappedBiometricType,
      isCurrentlyEnabled,
    };
  } catch (error: any) {
    console.error('Failed to check biometric capability:', error);

    // Handle specific errors
    if (error.message?.includes('NOT_ENROLLED')) {
      return {
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_ENROLLED',
      };
    }

    if (error.message?.includes('NOT_AVAILABLE')) {
      return {
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      };
    }

    return {
      available: false,
      biometricType: null,
      isCurrentlyEnabled: false,
      error: error.message || 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Checks if biometric authentication is currently enabled in the app
 *
 * @returns Promise resolving to boolean
 *
 * @example
 * const isEnabled = await isBiometricEnabled();
 * console.log(`Biometric enabled: ${isEnabled}`);
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Failed to check biometric enabled state:', error);
    return false;
  }
};

/**
 * Enables biometric authentication in the app
 *
 * @throws Error if biometric is not available
 *
 * @example
 * try {
 *   await enableBiometric();
 *   console.log('Biometric enabled');
 * } catch (error) {
 *   console.error('Failed to enable biometric:', error.message);
 * }
 */
export const enableBiometric = async (): Promise<void> => {
  const capability = await checkBiometricCapability();

  if (!capability.available) {
    throw new Error(
      capability.error === 'NOT_ENROLLED'
        ? 'No biometrics enrolled. Please set up biometric authentication in your device settings.'
        : 'Biometric authentication is not available on this device.'
    );
  }

  // Test biometric authentication before enabling
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate to enable biometric login',
      cancelButtonText: 'Cancel',
    });

    if (!success) {
      throw new Error('Biometric authentication failed. Please try again.');
    }

    // Store enabled state
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  } catch (error: any) {
    console.error('Failed to enable biometric:', error);

    if (error.message?.includes('User cancellation')) {
      throw new Error('Biometric authentication was cancelled.');
    }

    throw new Error(error.message || 'Failed to enable biometric authentication.');
  }
};

/**
 * Disables biometric authentication in the app
 *
 * @example
 * await disableBiometric();
 * console.log('Biometric disabled');
 */
export const disableBiometric = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
  } catch (error) {
    console.error('Failed to disable biometric:', error);
    throw new Error('Failed to disable biometric authentication.');
  }
};

/**
 * Authenticates the user with biometrics
 *
 * @returns Promise resolving to boolean (true if authenticated)
 *
 * @example
 * const authenticated = await authenticateWithBiometric();
 * if (authenticated) {
 *   console.log('User authenticated');
 * } else {
 *   console.log('Authentication failed');
 * }
 */
export const authenticateWithBiometric = async (): Promise<boolean> => {
  try {
    const capability = await checkBiometricCapability();

    if (!capability.available || !capability.isCurrentlyEnabled) {
      return false;
    }

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Authenticate to continue',
      cancelButtonText: 'Cancel',
    });

    return success;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);

    if (error.message?.includes('User cancellation')) {
      return false;
    }

    throw error;
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/biometric/__tests__/biometricService.test.ts

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkBiometricCapability,
  isBiometricEnabled,
  enableBiometric,
  disableBiometric,
  authenticateWithBiometric,
} from '../biometricService';

// Mock dependencies
jest.mock('react-native-biometrics');
jest.mock('@react-native-async-storage/async-storage');

const mockReactNativeBiometrics = ReactNativeBiometrics as jest.MockedClass<
  typeof ReactNativeBiometrics
>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('biometricService', () => {
  let mockBiometrics: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instance
    mockBiometrics = {
      isSensorAvailable: jest.fn(),
      simplePrompt: jest.fn(),
    };

    mockReactNativeBiometrics.mockImplementation(() => mockBiometrics);
  });

  describe('checkBiometricCapability', () => {
    it('should return available with FaceID on iOS', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await checkBiometricCapability();

      expect(result).toEqual({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
    });

    it('should return available with TouchID on iOS', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.TouchID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await checkBiometricCapability();

      expect(result).toEqual({
        available: true,
        biometricType: 'TouchID',
        isCurrentlyEnabled: false,
      });
    });

    it('should return available with Fingerprint on Android', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.Biometrics,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await checkBiometricCapability();

      expect(result).toEqual({
        available: true,
        biometricType: 'Fingerprint',
        isCurrentlyEnabled: false,
      });
    });

    it('should return unavailable when no biometrics are available', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: false,
        biometryType: undefined,
      });

      const result = await checkBiometricCapability();

      expect(result).toEqual({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      });
    });

    it('should return unavailable when biometrics are not enrolled', async () => {
      mockBiometrics.isSensorAvailable.mockRejectedValue(new Error('NOT_ENROLLED'));

      const result = await checkBiometricCapability();

      expect(result).toEqual({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_ENROLLED',
      });
    });

    it('should include isCurrentlyEnabled status', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('true');

      const result = await checkBiometricCapability();

      expect(result.isCurrentlyEnabled).toBe(true);
    });
  });

  describe('isBiometricEnabled', () => {
    it('should return true when biometric is enabled', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');

      const result = await isBiometricEnabled();

      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@biometric_enabled');
    });

    it('should return false when biometric is disabled', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await isBiometricEnabled();

      expect(result).toBe(false);
    });

    it('should return false when key does not exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await isBiometricEnabled();

      expect(result).toBe(false);
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric after successful authentication', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');
      mockBiometrics.simplePrompt.mockResolvedValue({ success: true });
      mockAsyncStorage.setItem.mockResolvedValue();

      await enableBiometric();

      expect(mockBiometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to enable biometric login',
        cancelButtonText: 'Cancel',
      });
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@biometric_enabled', 'true');
    });

    it('should throw error if biometric is not available', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: false,
        biometryType: undefined,
      });

      await expect(enableBiometric()).rejects.toThrow(
        'Biometric authentication is not available on this device.'
      );
    });

    it('should throw error if biometric authentication fails', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');
      mockBiometrics.simplePrompt.mockResolvedValue({ success: false });

      await expect(enableBiometric()).rejects.toThrow(
        'Biometric authentication failed. Please try again.'
      );
    });

    it('should throw error if user cancels authentication', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');
      mockBiometrics.simplePrompt.mockRejectedValue(new Error('User cancellation'));

      await expect(enableBiometric()).rejects.toThrow('Biometric authentication was cancelled.');
    });
  });

  describe('disableBiometric', () => {
    it('should disable biometric', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await disableBiometric();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@biometric_enabled', 'false');
    });

    it('should throw error if storage fails', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(disableBiometric()).rejects.toThrow(
        'Failed to disable biometric authentication.'
      );
    });
  });

  describe('authenticateWithBiometric', () => {
    it('should return true on successful authentication', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('true');
      mockBiometrics.simplePrompt.mockResolvedValue({ success: true });

      const result = await authenticateWithBiometric();

      expect(result).toBe(true);
      expect(mockBiometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
        cancelButtonText: 'Cancel',
      });
    });

    it('should return false if biometric is not available', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: false,
        biometryType: undefined,
      });

      const result = await authenticateWithBiometric();

      expect(result).toBe(false);
    });

    it('should return false if biometric is not enabled', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await authenticateWithBiometric();

      expect(result).toBe(false);
    });

    it('should return false if user cancels', async () => {
      mockBiometrics.isSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
      mockAsyncStorage.getItem.mockResolvedValue('true');
      mockBiometrics.simplePrompt.mockRejectedValue(new Error('User cancellation'));

      const result = await authenticateWithBiometric();

      expect(result).toBe(false);
    });
  });
});
```

---

## Dependencies

- `react-native-biometrics` - Biometric authentication library
- `@react-native-async-storage/async-storage` - Storage for enabled state

---

## Definition of Done

- [ ] Library installed and configured
- [ ] All capability check functions implemented
- [ ] Platform differences handled (iOS/Android)
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-041](../stories/US-041-toggle-biometric-auth.md), [TASK-238](TASK-238-biometric-toggle-ui.md), [TASK-240](TASK-240-biometric-enable-disable-logic.md)

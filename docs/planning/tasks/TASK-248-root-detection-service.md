# TASK-248: Root/Jailbreak Detection Service Implementation

**ID**: TASK-248 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-043](../stories/US-043-root-jailbreak-detection.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Implement root/jailbreak detection service using `jail-monkey` library to detect compromised devices. Check for root access, jailbreak status, debugging mode, and mock locations. Provide security recommendations and warnings.

---

## Acceptance Criteria

- [ ] `jail-monkey` library installed and configured
- [ ] Root detection function (Android)
- [ ] Jailbreak detection function (iOS)
- [ ] Debug mode detection
- [ ] Mock location detection (Android)
- [ ] Security status aggregation
- [ ] Risk level calculation (low, medium, high)
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Installation

```bash
yarn add jail-monkey
cd ios && pod install
```

### Security Detection Service

```typescript
// src/services/security/securityDetectionService.ts

import JailMonkey from 'jail-monkey';
import { Platform } from 'react-native';

/**
 * Security risk levels
 */
export enum SecurityRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Security check result
 */
export interface SecurityCheckResult {
  isRooted: boolean;
  isJailbroken: boolean;
  isDebugMode: boolean;
  isMockLocationEnabled: boolean;
  isOnExternalStorage: boolean;
  riskLevel: SecurityRiskLevel;
  warnings: string[];
  recommendations: string[];
}

/**
 * Detects if device is rooted (Android) or jailbroken (iOS)
 *
 * @returns Promise resolving to SecurityCheckResult
 *
 * @example
 * const result = await detectDeviceSecurity();
 * if (result.riskLevel === SecurityRiskLevel.HIGH) {
 *   console.warn('Device security compromised');
 * }
 */
export const detectDeviceSecurity = async (): Promise<SecurityCheckResult> => {
  const isRooted = JailMonkey.isJailBroken();
  const isDebugMode = JailMonkey.isDebuggedMode();
  const isMockLocationEnabled = Platform.OS === 'android' ? JailMonkey.canMockLocation() : false;
  const isOnExternalStorage = Platform.OS === 'android' ? JailMonkey.isOnExternalStorage() : false;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for root/jailbreak
  if (isRooted) {
    if (Platform.OS === 'ios') {
      warnings.push('Your device appears to be jailbroken');
      recommendations.push('For maximum security, use a non-jailbroken device');
    } else {
      warnings.push('Your device appears to be rooted');
      recommendations.push('For maximum security, use a non-rooted device');
    }
  }

  // Check for debug mode
  if (isDebugMode) {
    warnings.push('Debug mode is enabled on this device');
    recommendations.push('Disable developer options for better security');
  }

  // Check for mock locations (Android only)
  if (isMockLocationEnabled) {
    warnings.push('Mock location is enabled');
    recommendations.push('Disable mock location apps for accurate location services');
  }

  // Check for external storage (Android only)
  if (isOnExternalStorage) {
    warnings.push('App is installed on external storage');
    recommendations.push('Install the app on internal storage for better security');
  }

  // Calculate risk level
  const riskLevel = calculateRiskLevel({
    isRooted,
    isDebugMode,
    isMockLocationEnabled,
    isOnExternalStorage,
  });

  return {
    isRooted,
    isJailbroken: isRooted && Platform.OS === 'ios',
    isDebugMode,
    isMockLocationEnabled,
    isOnExternalStorage,
    riskLevel,
    warnings,
    recommendations,
  };
};

/**
 * Calculates overall security risk level
 */
const calculateRiskLevel = (checks: {
  isRooted: boolean;
  isDebugMode: boolean;
  isMockLocationEnabled: boolean;
  isOnExternalStorage: boolean;
}): SecurityRiskLevel => {
  const { isRooted, isDebugMode, isMockLocationEnabled, isOnExternalStorage } = checks;

  // Critical: Device is rooted/jailbroken
  if (isRooted) {
    return SecurityRiskLevel.CRITICAL;
  }

  // High: Debug mode enabled (potential security risk)
  if (isDebugMode) {
    return SecurityRiskLevel.HIGH;
  }

  // Medium: Mock location or external storage
  if (isMockLocationEnabled || isOnExternalStorage) {
    return SecurityRiskLevel.MEDIUM;
  }

  // Low: No security concerns detected
  return SecurityRiskLevel.LOW;
};

/**
 * Checks if device is rooted (Android) or jailbroken (iOS)
 *
 * @returns boolean
 */
export const isDeviceCompromised = (): boolean => {
  return JailMonkey.isJailBroken();
};

/**
 * Checks if device is in debug mode
 *
 * @returns boolean
 */
export const isDeviceInDebugMode = (): boolean => {
  return JailMonkey.isDebuggedMode();
};

/**
 * Checks if mock location is enabled (Android only)
 *
 * @returns boolean
 */
export const isMockLocationEnabled = (): boolean => {
  if (Platform.OS === 'android') {
    return JailMonkey.canMockLocation();
  }
  return false;
};

/**
 * Checks if app is installed on external storage (Android only)
 *
 * @returns boolean
 */
export const isOnExternalStorage = (): boolean => {
  if (Platform.OS === 'android') {
    return JailMonkey.isOnExternalStorage();
  }
  return false;
};

/**
 * Gets security status message based on risk level
 */
export const getSecurityStatusMessage = (riskLevel: SecurityRiskLevel): string => {
  switch (riskLevel) {
    case SecurityRiskLevel.CRITICAL:
      return 'Critical security risk detected. Your device may be compromised.';
    case SecurityRiskLevel.HIGH:
      return 'High security risk detected. Please review security warnings.';
    case SecurityRiskLevel.MEDIUM:
      return 'Moderate security risk detected. Consider reviewing recommendations.';
    case SecurityRiskLevel.LOW:
      return 'No security concerns detected. Your device appears secure.';
    default:
      return 'Security status unknown.';
  }
};

/**
 * Determines if app should block functionality based on security status
 */
export const shouldBlockFunctionality = (riskLevel: SecurityRiskLevel): boolean => {
  // Only block on CRITICAL risk (rooted/jailbroken devices)
  // For HIGH/MEDIUM, show warnings but allow usage
  return riskLevel === SecurityRiskLevel.CRITICAL;
};

/**
 * Gets color for risk level indicator
 */
export const getRiskLevelColor = (riskLevel: SecurityRiskLevel): string => {
  switch (riskLevel) {
    case SecurityRiskLevel.CRITICAL:
      return '#DC2626'; // red-600
    case SecurityRiskLevel.HIGH:
      return '#EA580C'; // orange-600
    case SecurityRiskLevel.MEDIUM:
      return '#F59E0B'; // amber-500
    case SecurityRiskLevel.LOW:
      return '#059669'; // green-600
    default:
      return '#6B7280'; // gray-500
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/security/__tests__/securityDetectionService.test.ts

import { Platform } from 'react-native';
import JailMonkey from 'jail-monkey';
import {
  detectDeviceSecurity,
  isDeviceCompromised,
  isDeviceInDebugMode,
  isMockLocationEnabled,
  isOnExternalStorage,
  getSecurityStatusMessage,
  shouldBlockFunctionality,
  getRiskLevelColor,
  SecurityRiskLevel,
} from '../securityDetectionService';

jest.mock('jail-monkey');

const mockJailMonkey = JailMonkey as jest.Mocked<typeof JailMonkey>;

describe('securityDetectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectDeviceSecurity', () => {
    it('should detect rooted Android device (CRITICAL risk)', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(true);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);
      mockJailMonkey.canMockLocation.mockReturnValue(false);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.isRooted).toBe(true);
      expect(result.riskLevel).toBe(SecurityRiskLevel.CRITICAL);
      expect(result.warnings).toContain('Your device appears to be rooted');
    });

    it('should detect jailbroken iOS device (CRITICAL risk)', async () => {
      Platform.OS = 'ios';
      mockJailMonkey.isJailBroken.mockReturnValue(true);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.isJailbroken).toBe(true);
      expect(result.riskLevel).toBe(SecurityRiskLevel.CRITICAL);
      expect(result.warnings).toContain('Your device appears to be jailbroken');
    });

    it('should detect debug mode (HIGH risk)', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(false);
      mockJailMonkey.isDebuggedMode.mockReturnValue(true);
      mockJailMonkey.canMockLocation.mockReturnValue(false);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.isDebugMode).toBe(true);
      expect(result.riskLevel).toBe(SecurityRiskLevel.HIGH);
      expect(result.warnings).toContain('Debug mode is enabled on this device');
    });

    it('should detect mock location (MEDIUM risk)', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(false);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);
      mockJailMonkey.canMockLocation.mockReturnValue(true);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.isMockLocationEnabled).toBe(true);
      expect(result.riskLevel).toBe(SecurityRiskLevel.MEDIUM);
      expect(result.warnings).toContain('Mock location is enabled');
    });

    it('should detect external storage (MEDIUM risk)', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(false);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);
      mockJailMonkey.canMockLocation.mockReturnValue(false);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(true);

      const result = await detectDeviceSecurity();

      expect(result.isOnExternalStorage).toBe(true);
      expect(result.riskLevel).toBe(SecurityRiskLevel.MEDIUM);
    });

    it('should return LOW risk when no issues detected', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(false);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);
      mockJailMonkey.canMockLocation.mockReturnValue(false);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.riskLevel).toBe(SecurityRiskLevel.LOW);
      expect(result.warnings).toHaveLength(0);
    });

    it('should provide recommendations for each warning', async () => {
      Platform.OS = 'android';
      mockJailMonkey.isJailBroken.mockReturnValue(true);
      mockJailMonkey.isDebuggedMode.mockReturnValue(false);
      mockJailMonkey.canMockLocation.mockReturnValue(false);
      mockJailMonkey.isOnExternalStorage.mockReturnValue(false);

      const result = await detectDeviceSecurity();

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('non-rooted device');
    });
  });

  describe('isDeviceCompromised', () => {
    it('should return true for rooted/jailbroken device', () => {
      mockJailMonkey.isJailBroken.mockReturnValue(true);

      expect(isDeviceCompromised()).toBe(true);
    });

    it('should return false for non-compromised device', () => {
      mockJailMonkey.isJailBroken.mockReturnValue(false);

      expect(isDeviceCompromised()).toBe(false);
    });
  });

  describe('shouldBlockFunctionality', () => {
    it('should block on CRITICAL risk', () => {
      expect(shouldBlockFunctionality(SecurityRiskLevel.CRITICAL)).toBe(true);
    });

    it('should not block on HIGH risk', () => {
      expect(shouldBlockFunctionality(SecurityRiskLevel.HIGH)).toBe(false);
    });

    it('should not block on MEDIUM risk', () => {
      expect(shouldBlockFunctionality(SecurityRiskLevel.MEDIUM)).toBe(false);
    });

    it('should not block on LOW risk', () => {
      expect(shouldBlockFunctionality(SecurityRiskLevel.LOW)).toBe(false);
    });
  });

  describe('getSecurityStatusMessage', () => {
    it('should return correct message for each risk level', () => {
      expect(getSecurityStatusMessage(SecurityRiskLevel.CRITICAL)).toContain('Critical');
      expect(getSecurityStatusMessage(SecurityRiskLevel.HIGH)).toContain('High');
      expect(getSecurityStatusMessage(SecurityRiskLevel.MEDIUM)).toContain('Moderate');
      expect(getSecurityStatusMessage(SecurityRiskLevel.LOW)).toContain('No security concerns');
    });
  });

  describe('getRiskLevelColor', () => {
    it('should return correct color for each risk level', () => {
      expect(getRiskLevelColor(SecurityRiskLevel.CRITICAL)).toBe('#DC2626');
      expect(getRiskLevelColor(SecurityRiskLevel.HIGH)).toBe('#EA580C');
      expect(getRiskLevelColor(SecurityRiskLevel.MEDIUM)).toBe('#F59E0B');
      expect(getRiskLevelColor(SecurityRiskLevel.LOW)).toBe('#059669');
    });
  });
});
```

---

## Dependencies

- `jail-monkey` - Root/jailbreak detection library

---

## Definition of Done

- [ ] Library installed and configured
- [ ] All detection functions implemented
- [ ] Risk level calculation working
- [ ] Security messages generated
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-043](../stories/US-043-root-jailbreak-detection.md), [TASK-249](TASK-249-security-warning-modal.md), [TASK-250](TASK-250-security-status-indicator.md)

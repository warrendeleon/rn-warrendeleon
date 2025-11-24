# TASK-250: SecurityStatusIndicator Component

**ID**: TASK-250 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-043](../stories/US-043-root-jailbreak-detection.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## File Structure

```
src/
├── components/
│   └── security/
│       ├── SecurityStatusIndicator.tsx
│       ├── SecurityWarningModal.tsx     # TASK-249 (imported by this component)
│       └── __tests__/
│           └── SecurityStatusIndicator.test.tsx
└── utils/
    └── security/
        └── securityDetectionService.ts  # TASK-248 (imported by this component)
```

**Note**: SecurityStatusIndicator is a shared UI component used across multiple features (Settings, Dashboard), so it's correctly centralized in `/src/components/security/`. The security detection service is in `/src/utils/security/` (correctly centralized cross-cutting concern from TASK-248).

---

## Task Description

Create a SecurityStatusIndicator component to display the current security status in the Settings screen. Show risk level badge, status message, and tap-to-view-details functionality.

---

## Acceptance Criteria

- [ ] SecurityStatusIndicator component created in `src/components/security/SecurityStatusIndicator.tsx`
- [ ] Risk level badge with color coding
- [ ] Security status message
- [ ] Tap to view details (opens SecurityWarningModal)
- [ ] Loading state while checking security
- [ ] All EAA accessibility requirements met
- [ ] TypeScript strict mode compliant

---

## Implementation Details

### Component Structure

```typescript
// src/components/security/SecurityStatusIndicator.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  Spinner,
  Badge,
  BadgeText,
  ShieldCheckIcon,
  ShieldAlertIcon,
  ChevronRightIcon,
} from '@gluestack-ui/themed';
import {
  detectDeviceSecurity,
  SecurityRiskLevel,
  getSecurityStatusMessage,
  getRiskLevelColor,
  SecurityCheckResult,
} from '@app/utils/security/securityDetectionService';
import { SecurityWarningModal } from './SecurityWarningModal';

export const SecurityStatusIndicator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityCheckResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = async () => {
    setIsLoading(true);
    try {
      const result = await detectDeviceSecurity();
      setSecurityStatus(result);

      // Auto-show modal for CRITICAL risk
      if (result.riskLevel === SecurityRiskLevel.CRITICAL) {
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to check security:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleProceed = () => {
    console.log('User proceeded despite security warnings');
  };

  const handleExit = () => {
    // On Android, we can force quit
    // On iOS, we just close the modal
    console.log('User chose to exit');
  };

  if (isLoading) {
    return (
      <Box
        backgroundColor="$gray100"
        borderRadius="$md"
        padding="$4"
        testID="security-status-loading"
      >
        <HStack space="md" alignItems="center">
          <Spinner size="small" />
          <Text fontSize="$sm" color="$gray600">
            Checking device security...
          </Text>
        </HStack>
      </Box>
    );
  }

  if (!securityStatus) {
    return null;
  }

  const riskColor = getRiskLevelColor(securityStatus.riskLevel);
  const statusMessage = getSecurityStatusMessage(securityStatus.riskLevel);

  const StatusIcon = securityStatus.riskLevel === SecurityRiskLevel.LOW
    ? ShieldCheckIcon
    : ShieldAlertIcon;

  return (
    <>
      <Pressable
        onPress={handlePress}
        testID="security-status-indicator"
        accessibilityRole="button"
        accessibilityLabel={`Security status: ${securityStatus.riskLevel}. Tap for details.`}
        accessibilityHint="View detailed security information"
      >
        <Box
          backgroundColor="$white"
          borderColor="$gray300"
          borderWidth={1}
          borderRadius="$md"
          padding="$4"
        >
          <HStack space="md" alignItems="center">
            {/* Icon */}
            <StatusIcon size="lg" color={riskColor} />

            {/* Content */}
            <VStack flex={1} space="xs">
              <HStack space="sm" alignItems="center">
                <Text fontSize="$md" fontWeight="$semibold" color="$gray900">
                  Device Security
                </Text>
                <Badge
                  backgroundColor={`${riskColor}20`}
                  borderColor={riskColor}
                  borderWidth={1}
                  testID="risk-level-badge"
                >
                  <BadgeText
                    fontSize="$xs"
                    fontWeight="$bold"
                    color={riskColor}
                    textTransform="uppercase"
                  >
                    {securityStatus.riskLevel}
                  </BadgeText>
                </Badge>
              </HStack>

              <Text fontSize="$sm" color="$gray600">
                {statusMessage}
              </Text>

              {securityStatus.warnings.length > 0 && (
                <Text fontSize="$xs" color={riskColor}>
                  {securityStatus.warnings.length} warning{securityStatus.warnings.length > 1 ? 's' : ''} detected
                </Text>
              )}
            </VStack>

            {/* Chevron */}
            <ChevronRightIcon size="md" color="$gray400" />
          </HStack>
        </Box>
      </Pressable>

      {/* Security Warning Modal */}
      <SecurityWarningModal
        isOpen={showModal}
        onClose={handleModalClose}
        onProceed={handleProceed}
        onExit={handleExit}
        riskLevel={securityStatus.riskLevel}
        warnings={securityStatus.warnings}
        recommendations={securityStatus.recommendations}
      />
    </>
  );
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/components/security/__tests__/SecurityStatusIndicator.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SecurityStatusIndicator } from '../SecurityStatusIndicator';
import * as securityDetectionService from '@app/utils/security/securityDetectionService';

jest.mock('@app/utils/security/securityDetectionService');

const mockSecurityDetection = securityDetectionService as jest.Mocked<typeof securityDetectionService>;

describe('SecurityStatusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockSecurityDetection.detectDeviceSecurity.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

    expect(getByTestId('security-status-loading')).toBeTruthy();
    expect(getByText('Checking device security...')).toBeTruthy();
  });

  it('should display LOW risk status', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
      isRooted: false,
      isJailbroken: false,
      isDebugMode: false,
      isMockLocationEnabled: false,
      isOnExternalStorage: false,
      riskLevel: securityDetectionService.SecurityRiskLevel.LOW,
      warnings: [],
      recommendations: [],
    });
    mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('No security concerns detected');
    mockSecurityDetection.getRiskLevelColor.mockReturnValue('#059669');

    const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      expect(getByTestId('security-status-indicator')).toBeTruthy();
      expect(getByText('Device Security')).toBeTruthy();
      expect(getByTestId('risk-level-badge')).toBeTruthy();
      expect(getByText('low')).toBeTruthy();
    });
  });

  it('should display CRITICAL risk status with warnings', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
      isRooted: true,
      isJailbroken: false,
      isDebugMode: false,
      isMockLocationEnabled: false,
      isOnExternalStorage: false,
      riskLevel: securityDetectionService.SecurityRiskLevel.CRITICAL,
      warnings: ['Device is rooted', 'Security compromised'],
      recommendations: ['Use a non-rooted device'],
    });
    mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('Critical security risk detected');
    mockSecurityDetection.getRiskLevelColor.mockReturnValue('#DC2626');

    const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      expect(getByTestId('risk-level-badge')).toBeTruthy();
      expect(getByText('critical')).toBeTruthy();
      expect(getByText('2 warnings detected')).toBeTruthy();
    });
  });

  it('should open modal when pressed', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
      isRooted: false,
      isJailbroken: false,
      isDebugMode: true,
      isMockLocationEnabled: false,
      isOnExternalStorage: false,
      riskLevel: securityDetectionService.SecurityRiskLevel.HIGH,
      warnings: ['Debug mode enabled'],
      recommendations: ['Disable developer options'],
    });
    mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('High security risk detected');
    mockSecurityDetection.getRiskLevelColor.mockReturnValue('#EA580C');

    const { getByTestId } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      expect(getByTestId('security-status-indicator')).toBeTruthy();
    });

    fireEvent.press(getByTestId('security-status-indicator'));

    // Modal should open (tested in SecurityWarningModal tests)
  });

  it('should auto-show modal for CRITICAL risk', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
      isRooted: true,
      isJailbroken: false,
      isDebugMode: false,
      isMockLocationEnabled: false,
      isOnExternalStorage: false,
      riskLevel: securityDetectionService.SecurityRiskLevel.CRITICAL,
      warnings: ['Device is rooted'],
      recommendations: ['Use a non-rooted device'],
    });
    mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('Critical security risk detected');
    mockSecurityDetection.getRiskLevelColor.mockReturnValue('#DC2626');

    const { getByTestId } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      // Modal should be automatically shown for CRITICAL risk
      expect(getByTestId('security-status-indicator')).toBeTruthy();
    });
  });

  it('should have correct accessibility properties', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
      isRooted: false,
      isJailbroken: false,
      isDebugMode: false,
      isMockLocationEnabled: false,
      isOnExternalStorage: false,
      riskLevel: securityDetectionService.SecurityRiskLevel.LOW,
      warnings: [],
      recommendations: [],
    });
    mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('No security concerns detected');
    mockSecurityDetection.getRiskLevelColor.mockReturnValue('#059669');

    const { getByTestId } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      const indicator = getByTestId('security-status-indicator');
      expect(indicator).toHaveProp('accessibilityRole', 'button');
      expect(indicator).toHaveProp('accessibilityLabel', 'Security status: low. Tap for details.');
      expect(indicator).toHaveProp('accessibilityHint', 'View detailed security information');
    });
  });

  it('should handle security check error gracefully', async () => {
    mockSecurityDetection.detectDeviceSecurity.mockRejectedValue(
      new Error('Security check failed')
    );

    const { queryByTestId } = render(<SecurityStatusIndicator />);

    await waitFor(() => {
      // Component should not render if security check fails
      expect(queryByTestId('security-status-indicator')).toBeNull();
    });
  });
});
```

---

## Dependencies

- GlueStack UI components
- Security detection service (TASK-248)
- SecurityWarningModal (TASK-249)

---

## Definition of Done

- [ ] Component implemented and renders correctly
- [ ] Risk level badge with correct colors
- [ ] Modal opens on tap
- [ ] Auto-show modal for CRITICAL risk
- [ ] Loading state working
- [ ] All unit tests passing
- [ ] EAA compliance verified
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-043](../stories/US-043-root-jailbreak-detection.md), [TASK-248](TASK-248-root-detection-service.md), [TASK-249](TASK-249-security-warning-modal.md)

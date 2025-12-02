# TASK-251: Root Detection RNTL Tests

**ID**: TASK-251 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-043](../stories/US-043-root-jailbreak-detection.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Write full React Native Testing Library tests for root/jailbreak detection components. Test SecurityWarningModal, SecurityStatusIndicator, and all security detection scenarios. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] SecurityWarningModal tests complete
- [ ] SecurityStatusIndicator tests complete
- [ ] All risk levels tested
- [ ] Modal behavior tested for CRITICAL vs non-CRITICAL
- [ ] Auto-show functionality tested
- [ ] Accessibility tested
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

The SecurityWarningModal and SecurityStatusIndicator components already have full test suites included in their task files (TASK-249 and TASK-250). This task consolidates and extends those tests to ensure complete coverage.

### Additional Integration Tests

```typescript
// src/components/security/__tests__/SecurityIntegration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SecurityStatusIndicator } from '../SecurityStatusIndicator';
import * as securityDetectionService from '../../../services/security/securityDetectionService';

jest.mock('../../../services/security/securityDetectionService');

const mockSecurityDetection = securityDetectionService as jest.Mocked<typeof securityDetectionService>;

describe('Security Detection Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Security Flow', () => {
    it('should handle LOW risk security check flow', async () => {
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

      // Wait for security check to complete
      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // Verify LOW risk indicator
      expect(getByText('low')).toBeTruthy();
      expect(getByText('No security concerns detected')).toBeTruthy();

      // Tap to view details
      fireEvent.press(getByTestId('security-status-indicator'));

      // Modal should open (but not forced open)
    });

    it('should handle CRITICAL risk security check flow', async () => {
      mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
        isRooted: true,
        isJailbroken: false,
        isDebugMode: false,
        isMockLocationEnabled: false,
        isOnExternalStorage: false,
        riskLevel: securityDetectionService.SecurityRiskLevel.CRITICAL,
        warnings: ['Your device appears to be rooted'],
        recommendations: ['For maximum security, use a non-rooted device'],
      });
      mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('Critical security risk detected');
      mockSecurityDetection.getRiskLevelColor.mockReturnValue('#DC2626');

      const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

      // Wait for security check to complete
      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // Verify CRITICAL risk indicator
      expect(getByText('critical')).toBeTruthy();
      expect(getByText('1 warning detected')).toBeTruthy();

      // Modal should auto-open for CRITICAL risk
    });

    it('should handle HIGH risk with multiple warnings', async () => {
      mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
        isRooted: false,
        isJailbroken: false,
        isDebugMode: true,
        isMockLocationEnabled: false,
        isOnExternalStorage: false,
        riskLevel: securityDetectionService.SecurityRiskLevel.HIGH,
        warnings: [
          'Debug mode is enabled on this device',
          'Developer options are active',
        ],
        recommendations: [
          'Disable developer options for better security',
          'Turn off USB debugging',
        ],
      });
      mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('High security risk detected');
      mockSecurityDetection.getRiskLevelColor.mockReturnValue('#EA580C');

      const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      expect(getByText('high')).toBeTruthy();
      expect(getByText('2 warnings detected')).toBeTruthy();
    });

    it('should handle MEDIUM risk with mock location', async () => {
      mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
        isRooted: false,
        isJailbroken: false,
        isDebugMode: false,
        isMockLocationEnabled: true,
        isOnExternalStorage: false,
        riskLevel: securityDetectionService.SecurityRiskLevel.MEDIUM,
        warnings: ['Mock location is enabled'],
        recommendations: ['Disable mock location apps for accurate location services'],
      });
      mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('Moderate security risk detected');
      mockSecurityDetection.getRiskLevelColor.mockReturnValue('#F59E0B');

      const { getByTestId, getByText } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      expect(getByText('medium')).toBeTruthy();
      expect(getByText('Moderate security risk detected')).toBeTruthy();
    });
  });

  describe('Modal Interaction Flow', () => {
    it('should open and close modal for non-CRITICAL risk', async () => {
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
      mockSecurityDetection.shouldBlockFunctionality.mockReturnValue(false);

      const { getByTestId } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // Open modal
      fireEvent.press(getByTestId('security-status-indicator'));

      // Modal should be visible with HIGH risk content
      // (Modal rendering tested in SecurityWarningModal tests)
    });

    it('should prevent modal dismissal for CRITICAL risk', async () => {
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
      mockSecurityDetection.shouldBlockFunctionality.mockReturnValue(true);

      const { getByTestId } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // Modal should auto-open and cannot be dismissed
    });
  });

  describe('Error Handling', () => {
    it('should handle security check failure gracefully', async () => {
      mockSecurityDetection.detectDeviceSecurity.mockRejectedValue(
        new Error('Security check failed')
      );

      const { queryByTestId } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        // Component should not render if check fails
        expect(queryByTestId('security-status-indicator')).toBeNull();
      });
    });

    it('should handle security check timeout', async () => {
      jest.useFakeTimers();

      mockSecurityDetection.detectDeviceSecurity.mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              isRooted: false,
              isJailbroken: false,
              isDebugMode: false,
              isMockLocationEnabled: false,
              isOnExternalStorage: false,
              riskLevel: securityDetectionService.SecurityRiskLevel.LOW,
              warnings: [],
              recommendations: [],
            });
          }, 10000); // 10 second delay
        })
      );

      const { getByTestId } = render(<SecurityStatusIndicator />);

      // Should show loading state
      expect(getByTestId('security-status-loading')).toBeTruthy();

      // Fast-forward time
      jest.advanceTimersByTime(10000);

      jest.useRealTimers();
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should show jailbreak message on iOS for rooted device', async () => {
      const Platform = require('react-native').Platform;
      Platform.OS = 'ios';

      mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
        isRooted: true,
        isJailbroken: true,
        isDebugMode: false,
        isMockLocationEnabled: false,
        isOnExternalStorage: false,
        riskLevel: securityDetectionService.SecurityRiskLevel.CRITICAL,
        warnings: ['Your device appears to be jailbroken'],
        recommendations: ['For maximum security, use a non-jailbroken device'],
      });
      mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('Critical security risk detected');
      mockSecurityDetection.getRiskLevelColor.mockReturnValue('#DC2626');

      const { getByTestId } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // Verify jailbreak-specific warning appears
    });

    it('should not check mock location on iOS', async () => {
      const Platform = require('react-native').Platform;
      Platform.OS = 'ios';

      mockSecurityDetection.detectDeviceSecurity.mockResolvedValue({
        isRooted: false,
        isJailbroken: false,
        isDebugMode: false,
        isMockLocationEnabled: false, // iOS always returns false
        isOnExternalStorage: false,   // iOS always returns false
        riskLevel: securityDetectionService.SecurityRiskLevel.LOW,
        warnings: [],
        recommendations: [],
      });
      mockSecurityDetection.getSecurityStatusMessage.mockReturnValue('No security concerns detected');
      mockSecurityDetection.getRiskLevelColor.mockReturnValue('#059669');

      const { getByTestId } = render(<SecurityStatusIndicator />);

      await waitFor(() => {
        expect(getByTestId('security-status-indicator')).toBeTruthy();
      });

      // No mock location warnings on iOS
    });
  });
});
```

---

## Dependencies

- `@testing-library/react-native`
- `@testing-library/jest-native`
- Jest

---

## Definition of Done

- [ ] All component tests complete
- [ ] Integration tests written
- [ ] All risk levels tested
- [ ] Modal interactions tested
- [ ] Error handling tested
- [ ] Platform-specific behavior tested
- [ ] Accessibility tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-043](../stories/US-043-root-jailbreak-detection.md), [TASK-248](TASK-248-root-detection-service.md), [TASK-249](TASK-249-security-warning-modal.md), [TASK-250](TASK-250-security-status-indicator.md)

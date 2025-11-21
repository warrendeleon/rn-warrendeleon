# TASK-241: Biometric Toggle RNTL Tests

**ID**: TASK-241 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-041](../stories/US-041-toggle-biometric-auth.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Write comprehensive React Native Testing Library tests for the BiometricToggleScreen component. Test capability checking, toggle interactions, success/error states, accessibility, and edge cases. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Test file created at `src/screens/settings/__tests__/BiometricToggleScreen.test.tsx`
- [ ] Capability check tested (available/unavailable biometrics)
- [ ] Toggle switch interaction tested
- [ ] Enable biometric flow tested
- [ ] Disable biometric flow tested
- [ ] Error states tested (authentication failure, cancellation)
- [ ] Loading states tested
- [ ] Accessibility tested (screen reader support)
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Test Suite

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

  describe('Rendering - FaceID Available', () => {
    it('should render screen when FaceID is available', async () => {
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

    it('should show FaceID as currently enabled when toggled on', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: true,
      });

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Enable Face ID')).toBeTruthy();
        expect(getByText('Currently enabled')).toBeTruthy();
      });
    });
  });

  describe('Rendering - TouchID Available', () => {
    it('should render screen when TouchID is available', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'TouchID',
        isCurrentlyEnabled: false,
      });

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Use Touch ID to unlock the app')).toBeTruthy();
        expect(getByText('Enable Touch ID')).toBeTruthy();
      });
    });
  });

  describe('Rendering - Fingerprint Available (Android)', () => {
    it('should render screen when Fingerprint is available', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'Fingerprint',
        isCurrentlyEnabled: false,
      });

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Use Fingerprint to unlock the app')).toBeTruthy();
        expect(getByText('Enable Fingerprint')).toBeTruthy();
      });
    });
  });

  describe('Rendering - Biometric Unavailable', () => {
    it('should show unavailable status when biometric is not available', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      });

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Biometric authentication is not available')).toBeTruthy();
        expect(getByText('Unavailable')).toBeTruthy();
        expect(getByText(/Biometric authentication is not available on this device/)).toBeTruthy();
      });
    });

    it('should show enrollment message when biometric is not enrolled', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_ENROLLED',
      });

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText(/No biometrics enrolled/)).toBeTruthy();
        expect(getByText(/Please set up Face ID\/Touch ID in your device settings/)).toBeTruthy();
      });
    });
  });

  describe('Enable Biometric', () => {
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

    it('should show loading spinner during enable', async () => {
      let resolveEnable: () => void;
      const enablePromise = new Promise<void>((resolve) => {
        resolveEnable = resolve;
      });

      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
      mockBiometricService.enableBiometric.mockReturnValue(enablePromise);

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

      await waitFor(() => {
        expect(getByTestId('biometric-loading-spinner')).toBeTruthy();
      });

      resolveEnable!();
    });

    it('should show error when enable fails', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
      mockBiometricService.enableBiometric.mockRejectedValue(
        new Error('Failed to enable biometric')
      );

      const { getByTestId, getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

      await waitFor(() => {
        expect(getByText('Failed to enable biometric')).toBeTruthy();
      });
    });

    it('should revert toggle when enable fails', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
      mockBiometricService.enableBiometric.mockRejectedValue(
        new Error('Failed to enable biometric')
      );

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      const toggleSwitch = getByTestId('biometric-toggle-switch');
      expect(toggleSwitch).toHaveProp('value', false);

      fireEvent(toggleSwitch, 'onValueChange', true);

      await waitFor(() => {
        expect(toggleSwitch).toHaveProp('value', false); // Reverted
      });
    });
  });

  describe('Disable Biometric', () => {
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

    it('should show error when disable fails', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: true,
      });
      mockBiometricService.disableBiometric.mockRejectedValue(
        new Error('Failed to disable biometric')
      );

      const { getByTestId, getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', false);

      await waitFor(() => {
        expect(getByText('Failed to disable biometric')).toBeTruthy();
      });
    });
  });

  describe('Success Message', () => {
    it('should clear success message after 3 seconds', async () => {
      jest.useFakeTimers();

      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
      mockBiometricService.enableBiometric.mockResolvedValue();

      const { getByTestId, getByText, queryByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

      await waitFor(() => {
        expect(getByText('Face ID enabled successfully')).toBeTruthy();
      });

      // Fast-forward time
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(queryByText('Face ID enabled successfully')).toBeNull();
      });

      jest.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });

      const { getByText, getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Biometric Authentication')).toHaveProp('accessibilityRole', 'header');
        expect(getByTestId('biometric-toggle-switch')).toHaveProp('accessibilityRole', 'switch');
        expect(getByTestId('capability-status')).toHaveProp('accessibilityRole', 'alert');
      });
    });

    it('should have correct accessibility labels', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        const toggleSwitch = getByTestId('biometric-toggle-switch');
        expect(toggleSwitch).toHaveProp('accessibilityLabel', 'Face ID toggle');
      });
    });

    it('should have correct accessibility hints', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        const toggleSwitch = getByTestId('biometric-toggle-switch');
        expect(toggleSwitch).toHaveProp('accessibilityHint', 'Toggle Face ID on');
      });
    });

    it('should update accessibility state when disabled', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      });

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        const toggleSwitch = getByTestId('biometric-toggle-switch');
        expect(toggleSwitch).toHaveProp('accessibilityState', {
          checked: false,
          disabled: true,
        });
      });
    });

    it('should announce success message to screen readers', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
      mockBiometricService.enableBiometric.mockResolvedValue();

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
      });

      fireEvent(getByTestId('biometric-toggle-switch'), 'onValueChange', true);

      await waitFor(() => {
        const successMessage = getByTestId('success-message');
        expect(successMessage).toHaveProp('accessibilityRole', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not allow toggle when biometric is unavailable', async () => {
      mockBiometricService.checkBiometricCapability.mockResolvedValue({
        available: false,
        biometricType: null,
        isCurrentlyEnabled: false,
        error: 'NOT_AVAILABLE',
      });

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        const toggleSwitch = getByTestId('biometric-toggle-switch');
        expect(toggleSwitch).toBeDisabled();
      });
    });

    it('should handle capability check failure gracefully', async () => {
      mockBiometricService.checkBiometricCapability.mockRejectedValue(
        new Error('Failed to check capability')
      );

      const { getByText } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByText('Failed to check biometric availability')).toBeTruthy();
      });
    });

    it('should disable toggle during loading', async () => {
      let resolveCapability: (value: any) => void;
      const capabilityPromise = new Promise((resolve) => {
        resolveCapability = resolve;
      });

      mockBiometricService.checkBiometricCapability.mockReturnValue(capabilityPromise as any);

      const { getByTestId } = render(<BiometricToggleScreen />);

      await waitFor(() => {
        expect(getByTestId('biometric-loading-spinner')).toBeTruthy();
      });

      resolveCapability!({
        available: true,
        biometricType: 'FaceID',
        isCurrentlyEnabled: false,
      });
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

- [ ] Test file created with comprehensive test suite
- [ ] Capability check tested
- [ ] Toggle interactions tested
- [ ] Enable/disable flows tested
- [ ] Error states tested
- [ ] Loading states tested
- [ ] Accessibility tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-041](../stories/US-041-toggle-biometric-auth.md), [TASK-238](TASK-238-biometric-toggle-ui.md), [TASK-242](TASK-242-biometric-toggle-e2e-tests.md)

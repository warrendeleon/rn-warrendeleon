# TASK-236: Change PIN RNTL Tests

**ID**: TASK-236 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Write comprehensive React Native Testing Library tests for the ChangePINScreen component. Test all user interactions, form validation, success/error states, accessibility, and edge cases. Achieve 100% code coverage.

---

## Acceptance Criteria

- [ ] Test file created at `src/screens/settings/__tests__/ChangePINScreen.test.tsx`
- [ ] All user interactions tested (input changes, button presses)
- [ ] Form validation tested (empty fields, mismatched PINs, weak PINs)
- [ ] Success state tested (PIN changed successfully)
- [ ] Error states tested (incorrect current PIN, network errors)
- [ ] Rate limiting tested (lockout after 3 failed attempts)
- [ ] Accessibility tested (screen reader labels, roles)
- [ ] Loading states tested
- [ ] Navigation tested (back button)
- [ ] 100% code coverage
- [ ] All tests passing

---

## Implementation Details

### Test Suite

```typescript
// src/screens/settings/__tests__/ChangePINScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ChangePINScreen } from '../ChangePINScreen';
import * as pinHashingService from '../../../services/security/pinHashingService';
import * as rateLimitService from '../../../services/security/rateLimitService';
import { validatePIN } from '../../../utils/pinValidation';

// Mock dependencies
jest.mock('../../../services/security/pinHashingService');
jest.mock('../../../services/security/rateLimitService');
jest.mock('../../../utils/pinValidation');

const mockPinHashingService = pinHashingService as jest.Mocked<typeof pinHashingService>;
const mockRateLimitService = rateLimitService as jest.Mocked<typeof rateLimitService>;
const mockValidatePIN = validatePIN as jest.MockedFunction<typeof validatePIN>;

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('ChangePINScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockRateLimitService.checkRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 3,
      lockedUntil: null,
    });
    mockValidatePIN.mockReturnValue({ isValid: true });
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <ChangePINScreen />
      </NavigationContainer>
    );
  };

  describe('Rendering', () => {
    it('should render all three PIN input fields', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('current-pin-input')).toBeTruthy();
      expect(getByTestId('new-pin-input')).toBeTruthy();
      expect(getByTestId('confirm-new-pin-input')).toBeTruthy();
    });

    it('should render header and description', () => {
      const { getByText } = renderScreen();

      expect(getByText('Change PIN')).toBeTruthy();
      expect(getByText('Enter your current PIN and choose a new one')).toBeTruthy();
    });

    it('should render submit button', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('change-pin-submit-button')).toBeTruthy();
    });

    it('should have submit button disabled by default', () => {
      const { getByTestId } = renderScreen();

      const submitButton = getByTestId('change-pin-submit-button');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show error when current PIN is empty', async () => {
      const { getByTestId, getByText } = renderScreen();

      const currentPINInput = getByTestId('current-pin-input');
      fireEvent.changeText(currentPINInput, '');
      fireEvent(currentPINInput, 'blur');

      await waitFor(() => {
        expect(getByText('Current PIN is required')).toBeTruthy();
      });
    });

    it('should show error when new PIN is empty', async () => {
      const { getByTestId, getByText } = renderScreen();

      const newPINInput = getByTestId('new-pin-input');
      fireEvent.changeText(newPINInput, '');
      fireEvent(newPINInput, 'blur');

      await waitFor(() => {
        expect(getByText('New PIN is required')).toBeTruthy();
      });
    });

    it('should show error when PINs do not match', async () => {
      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '123456');
      fireEvent(getByTestId('confirm-new-pin-input'), 'blur');

      await waitFor(() => {
        expect(getByText('PINs must match')).toBeTruthy();
      });
    });

    it('should show error when PIN is not 6 digits', async () => {
      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('new-pin-input'), '12345');
      fireEvent(getByTestId('new-pin-input'), 'blur');

      await waitFor(() => {
        expect(getByText('PIN must be 6 digits')).toBeTruthy();
      });
    });

    it('should show error when PIN is weak', async () => {
      mockValidatePIN.mockReturnValue({
        isValid: false,
        error: 'This PIN is too easy to guess',
      });

      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('new-pin-input'), '123456');
      fireEvent(getByTestId('new-pin-input'), 'blur');

      await waitFor(() => {
        expect(getByText('This PIN is too easy to guess')).toBeTruthy();
      });
    });

    it('should enable submit button when all fields are valid', async () => {
      const { getByTestId } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });
    });
  });

  describe('PIN Change Flow', () => {
    it('should successfully change PIN', async () => {
      mockPinHashingService.changePIN.mockResolvedValue();
      mockRateLimitService.resetRateLimit.mockResolvedValue();

      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(mockPinHashingService.changePIN).toHaveBeenCalledWith('111111', '654321');
        expect(mockRateLimitService.resetRateLimit).toHaveBeenCalled();
        expect(getByText('PIN changed successfully')).toBeTruthy();
      });
    });

    it('should show error when current PIN is incorrect', async () => {
      mockPinHashingService.changePIN.mockRejectedValue(
        new Error('Current PIN is incorrect')
      );
      mockRateLimitService.recordFailedAttempt.mockResolvedValue({
        allowed: true,
        remainingAttempts: 2,
        lockedUntil: null,
        message: 'Incorrect PIN. 2 attempts remaining.',
      });

      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '999999');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByText('Incorrect PIN. 2 attempts remaining.')).toBeTruthy();
        expect(mockRateLimitService.recordFailedAttempt).toHaveBeenCalled();
      });
    });

    it('should navigate back after successful PIN change', async () => {
      jest.useFakeTimers();
      mockPinHashingService.changePIN.mockResolvedValue();
      mockRateLimitService.resetRateLimit.mockResolvedValue();

      const { getByTestId } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(mockPinHashingService.changePIN).toHaveBeenCalled();
      });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Rate Limiting', () => {
    it('should lock out user after 3 failed attempts', async () => {
      mockPinHashingService.changePIN.mockRejectedValue(
        new Error('Current PIN is incorrect')
      );

      // First two attempts
      mockRateLimitService.recordFailedAttempt
        .mockResolvedValueOnce({
          allowed: true,
          remainingAttempts: 2,
          lockedUntil: null,
          message: 'Incorrect PIN. 2 attempts remaining.',
        })
        .mockResolvedValueOnce({
          allowed: true,
          remainingAttempts: 1,
          lockedUntil: null,
          message: 'Incorrect PIN. 1 attempt remaining.',
        });

      // Third attempt - lockout
      const lockedUntil = Date.now() + 15 * 60 * 1000;
      mockRateLimitService.recordFailedAttempt.mockResolvedValueOnce({
        allowed: false,
        remainingAttempts: 0,
        lockedUntil,
        message: 'Too many failed attempts. Please try again in 15 minutes.',
      });

      const { getByTestId, getByText } = renderScreen();

      // Attempt 1
      fireEvent.changeText(getByTestId('current-pin-input'), '999999');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => expect(getByTestId('change-pin-submit-button')).toBeEnabled());
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByText('Incorrect PIN. 2 attempts remaining.')).toBeTruthy();
      });

      // Attempt 2
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByText('Incorrect PIN. 1 attempt remaining.')).toBeTruthy();
      });

      // Attempt 3 - lockout
      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByText('Too many failed attempts. Please try again in 15 minutes.')).toBeTruthy();
      });
    });

    it('should disable submit button when locked out', async () => {
      const lockedUntil = Date.now() + 15 * 60 * 1000;
      mockRateLimitService.checkRateLimit.mockResolvedValue({
        allowed: false,
        remainingAttempts: 0,
        lockedUntil,
        message: 'Too many failed attempts. Please try again in 15 minutes.',
      });

      const { getByTestId, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Too many failed attempts. Please try again in 15 minutes.')).toBeTruthy();
        expect(getByTestId('change-pin-submit-button')).toBeDisabled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during PIN change', async () => {
      let resolveChangePIN: () => void;
      const changePINPromise = new Promise<void>((resolve) => {
        resolveChangePIN = resolve;
      });

      mockPinHashingService.changePIN.mockReturnValue(changePINPromise);

      const { getByTestId } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => {
        expect(getByTestId('change-pin-submit-button')).toBeEnabled();
      });

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByTestId('change-pin-loading-spinner')).toBeTruthy();
        expect(getByTestId('change-pin-submit-button')).toBeDisabled();
      });

      resolveChangePIN!();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles', () => {
      const { getByTestId, getByText } = renderScreen();

      expect(getByText('Change PIN')).toHaveProp('accessibilityRole', 'header');
      expect(getByTestId('change-pin-submit-button')).toHaveProp('accessibilityRole', 'button');
    });

    it('should have correct accessibility labels', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('current-pin-input')).toHaveProp('accessibilityLabel', 'Current PIN');
      expect(getByTestId('new-pin-input')).toHaveProp('accessibilityLabel', 'New PIN');
      expect(getByTestId('confirm-new-pin-input')).toHaveProp('accessibilityLabel', 'Confirm new PIN');
      expect(getByTestId('change-pin-submit-button')).toHaveProp('accessibilityLabel', 'Change PIN');
    });

    it('should have correct accessibility hints', () => {
      const { getByTestId } = renderScreen();

      expect(getByTestId('change-pin-submit-button')).toHaveProp('accessibilityHint', 'Submit new PIN');
    });

    it('should update accessibility state when button is disabled', () => {
      const { getByTestId } = renderScreen();

      const submitButton = getByTestId('change-pin-submit-button');
      expect(submitButton).toHaveProp('accessibilityState', { disabled: true });
    });

    it('should announce success message to screen readers', async () => {
      mockPinHashingService.changePIN.mockResolvedValue();
      mockRateLimitService.resetRateLimit.mockResolvedValue();

      const { getByTestId } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => expect(getByTestId('change-pin-submit-button')).toBeEnabled());

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        const successMessage = getByTestId('success-message');
        expect(successMessage).toHaveProp('accessibilityRole', 'alert');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockPinHashingService.changePIN.mockRejectedValue(
        new Error('Network request failed')
      );

      const { getByTestId, getByText } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => expect(getByTestId('change-pin-submit-button')).toBeEnabled());

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(getByText(/Network request failed/i)).toBeTruthy();
      });
    });

    it('should clear form after successful PIN change', async () => {
      mockPinHashingService.changePIN.mockResolvedValue();
      mockRateLimitService.resetRateLimit.mockResolvedValue();

      const { getByTestId } = renderScreen();

      fireEvent.changeText(getByTestId('current-pin-input'), '111111');
      fireEvent.changeText(getByTestId('new-pin-input'), '654321');
      fireEvent.changeText(getByTestId('confirm-new-pin-input'), '654321');

      await waitFor(() => expect(getByTestId('change-pin-submit-button')).toBeEnabled());

      fireEvent.press(getByTestId('change-pin-submit-button'));

      await waitFor(() => {
        expect(mockPinHashingService.changePIN).toHaveBeenCalled();
      });

      // Form should be cleared
      await waitFor(() => {
        expect(getByTestId('current-pin-input')).toHaveProp('value', '');
        expect(getByTestId('new-pin-input')).toHaveProp('value', '');
        expect(getByTestId('confirm-new-pin-input')).toHaveProp('value', '');
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
- [ ] All user interactions tested
- [ ] Form validation tested
- [ ] Success/error states tested
- [ ] Rate limiting tested
- [ ] Accessibility tested
- [ ] Loading states tested
- [ ] Edge cases tested
- [ ] 100% code coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-232](TASK-232-change-pin-ui.md), [TASK-237](TASK-237-change-pin-e2e-tests.md)

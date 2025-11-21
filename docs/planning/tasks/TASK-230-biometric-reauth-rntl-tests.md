# TASK-230: Biometric Re-Auth RNTL Tests

**ID**: TASK-230 | **Title**: Write RNTL Tests for Biometric Re-Authentication Screens
**User Story**: [US-039](../stories/US-039-biometric-reauth.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 2h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Objective

Write comprehensive RNTL tests for:

1. BiometricPromptScreen
2. PINPromptScreen

**Coverage Target**: 100%

---

## Test Files

### File 1: `src/screens/auth/__tests__/BiometricPromptScreen.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BiometricPromptScreen } from '../BiometricPromptScreen';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';

jest.mock('../../../hooks/useBiometricAuth');

const mockNavigation = {
  reset: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

describe('BiometricPromptScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  it('should show error on failed authentication', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(false);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByText } = render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(getByText(/Authentication failed/)).toBeTruthy();
    });
  });

  it('should logout after 3 failed attempts', async () => {
    const mockAuthenticate = jest.fn().mockResolvedValue(false);
    (useBiometricAuth as jest.Mock).mockReturnValue({
      authenticate: mockAuthenticate,
      type: 'FaceID',
    });

    const { getByTestId, getByText } = render(<BiometricPromptScreen />);

    await waitFor(() => {
      expect(getByText(/2 attempts remaining/)).toBeTruthy();
    });

    fireEvent.press(getByTestId('try-again-button'));

    await waitFor(() => {
      expect(getByText(/1 attempts remaining/)).toBeTruthy();
    });

    fireEvent.press(getByTestId('try-again-button'));

    await waitFor(() => {
      expect(getByText(/Too many failed attempts/)).toBeTruthy();
    });

    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });
});
```

### File 2: `src/screens/auth/__tests__/PINPromptScreen.test.tsx`

```typescript
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PINPromptScreen } from '../PINPromptScreen';
import * as Keychain from 'react-native-keychain';
import bcrypt from 'react-native-bcrypt';

jest.mock('react-native-keychain');
jest.mock('react-native-bcrypt');

describe('PINPromptScreen', () => {
  it('should display masked PIN as user types', () => {
    const { getByTestId } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123');

    const maskedDisplay = getByTestId('masked-pin-display');
    expect(maskedDisplay.props.children).toBe('•••○○○');
  });

  it('should validate PIN with bcrypt', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
      password: 'hashed_pin',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { getByTestId } = render(<PINPromptScreen />);

    const pinInput = getByTestId('pin-input');
    fireEvent.changeText(pinInput, '123456');
    fireEvent(pinInput, 'submitEditing');

    await waitFor(() => {
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashed_pin');
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
});
```

---

## Acceptance Criteria

- [ ] 100% coverage for BiometricPromptScreen
- [ ] 100% coverage for PINPromptScreen
- [ ] All edge cases tested
- [ ] All error scenarios tested

---

## Definition of Done

- [ ] All test files created
- [ ] All tests passing: `yarn test --coverage`
- [ ] 100% coverage
- [ ] `yarn validate` passes

---

**Dependencies**: TASK-227, TASK-228

**Next Task**: [TASK-231](TASK-231-biometric-reauth-e2e-tests.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2 hours

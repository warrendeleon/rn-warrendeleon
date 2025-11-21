# US-041: Toggle Biometric Authentication

**ID**: US-041 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **Title**: Enable/Disable Biometric Authentication
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 3 | **Effort**: 7h

---

## User Story

**As a** registered user
**I want to** enable or disable biometric authentication (Face ID/Touch ID/Fingerprint)
**So that** I can control whether I use biometrics or just a PIN for authentication

---

## Acceptance Criteria

### Functional Requirements

1. **Biometric Capability Check**
   - [ ] App checks if biometrics are available on device
   - [ ] Supports Face ID (iOS), Touch ID (iOS), Fingerprint (Android)
   - [ ] If biometrics not available: Toggle disabled with message "Not available on this device"
   - [ ] If biometrics available but not enrolled: Toggle disabled with message "No biometrics enrolled. Please set up Face ID/Touch ID in Settings."

2. **Enable Biometrics**
   - [ ] User navigates to Settings → Security → Biometric Authentication
   - [ ] Toggle switch shows current state (enabled/disabled)
   - [ ] When user enables toggle:
     - Prompt biometric authentication: "Verify to enable biometric authentication"
     - If successful: Save preference to Encrypted Storage
     - If failed: Show error, toggle reverts to disabled
     - Update Redux state: `biometricEnabled: true`

3. **Disable Biometrics**
   - [ ] User taps toggle to disable
   - [ ] Before disabling, verify PIN is set up as fallback
   - [ ] If no PIN exists: Show error "Please set up a PIN before disabling biometrics"
   - [ ] If PIN exists: Disable biometrics immediately
     - Save preference to Encrypted Storage
     - Update Redux state: `biometricEnabled: false`
     - Show confirmation: "Biometric authentication disabled. You will now use your PIN."

4. **Security Requirements**
   - [ ] Biometric preference stored in Encrypted Storage (not AsyncStorage)
   - [ ] PIN must always be available as fallback
   - [ ] Biometric re-authentication required after 30 minutes in background

### Non-Functional Requirements

1. **Performance**
   - [ ] Toggle state update: <50ms
   - [ ] Biometric prompt: <500ms
   - [ ] Preference save: <100ms

2. **Accessibility (EAA)**
   - [ ] Toggle switch has `accessibilityRole="switch"`
   - [ ] Toggle has `accessibilityLabel="Enable biometric authentication"`
   - [ ] Toggle has `accessibilityState={{ checked: isEnabled }}`
   - [ ] Error messages have `accessibilityRole="alert"`

3. **Testing**
   - [ ] 100% RNTL coverage for BiometricToggleScreen
   - [ ] E2E test for enable/disable flow
   - [ ] Security test: Verify fallback to PIN works

---

## Technical Implementation

### Component Structure

```typescript
// src/screens/settings/BiometricToggleScreen.tsx

BiometricToggleScreen
├── Header ("Biometric Authentication")
├── StatusIndicator
│   ├── BiometricTypeLabel (Face ID, Touch ID, or Fingerprint)
│   └── AvailabilityStatus (Available, Not Available, Not Enrolled)
├── ToggleSwitch
│   ├── Label ("Enable Biometric Authentication")
│   └── Switch (enabled/disabled)
├── DescriptionText ("Use Face ID/Touch ID instead of PIN")
└── FallbackWarning ("PIN will be used as fallback")
```

### Data Flow

```
User navigates to Settings → Security → Biometric Authentication
  → BiometricToggleScreen mounted
  → Check biometric capability (available? enrolled?)
  → If not available: Disable toggle, show warning
  → If available: Show toggle with current state
  → User enables toggle:
    → Prompt biometric authentication
    → If success:
      → Save preference to Encrypted Storage
      → Update Redux: biometricEnabled = true
      → Show success message
    → If fail:
      → Revert toggle to disabled
      → Show error message
  → User disables toggle:
    → Check if PIN exists (fallback)
    → If no PIN:
      → Show error: "Set up PIN first"
      → Prevent disable
    → If PIN exists:
      → Save preference to Encrypted Storage
      → Update Redux: biometricEnabled = false
      → Show confirmation
```

### Biometric Capability Check

```typescript
// src/services/biometrics/biometricService.ts

import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform } from 'react-native';

export interface BiometricCapability {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
  error: string | null;
}

export const checkBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    const rnBiometrics = new ReactNativeBiometrics();

    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    if (!available) {
      return {
        isAvailable: false,
        isEnrolled: false,
        biometryType: null,
        error: 'Biometric authentication is not available on this device',
      };
    }

    // Check if biometrics are enrolled
    const { keysExist } = await rnBiometrics.biometricKeysExist();

    return {
      isAvailable: true,
      isEnrolled: keysExist || available, // Android may not require key check
      biometryType: biometryType as 'FaceID' | 'TouchID' | 'Biometrics',
      error: null,
    };
  } catch (error: any) {
    return {
      isAvailable: false,
      isEnrolled: false,
      biometryType: null,
      error: error.message || 'Failed to check biometric capability',
    };
  }
};

export const authenticateBiometric = async (promptMessage: string): Promise<boolean> => {
  try {
    const rnBiometrics = new ReactNativeBiometrics();

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    return success;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};
```

### Enable/Disable Logic

```typescript
// src/hooks/useBiometricToggle.ts

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBiometricEnabled } from '../../store/slices/authSlice';
import {
  checkBiometricCapability,
  authenticateBiometric,
} from '../../services/biometrics/biometricService';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';

export const useBiometricToggle = () => {
  const dispatch = useDispatch();
  const biometricEnabled = useSelector(state => state.auth.biometricEnabled);

  const [capability, setCapability] = useState<BiometricCapability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkCapability();
  }, []);

  const checkCapability = async () => {
    const result = await checkBiometricCapability();
    setCapability(result);

    if (!result.isAvailable || !result.isEnrolled) {
      // Force disable if not available
      await disableBiometricInternal();
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check capability
      if (!capability?.isAvailable || !capability?.isEnrolled) {
        throw new Error('Biometric authentication is not available');
      }

      // 2. Prompt biometric authentication
      const success = await authenticateBiometric('Verify to enable biometric authentication');

      if (!success) {
        throw new Error('Biometric verification failed');
      }

      // 3. Save preference to Encrypted Storage
      await EncryptedStorage.setItem('biometric_enabled', 'true');

      // 4. Update Redux state
      dispatch(setBiometricEnabled(true));

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to enable biometric authentication');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometric = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check if PIN exists as fallback
      const pinHash = await Keychain.getGenericPassword({ service: 'auth_pin_hash' });

      if (!pinHash) {
        throw new Error('Please set up a PIN before disabling biometrics');
      }

      // 2. Disable biometrics
      await disableBiometricInternal();

      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to disable biometric authentication');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometricInternal = async () => {
    await EncryptedStorage.setItem('biometric_enabled', 'false');
    dispatch(setBiometricEnabled(false));
  };

  const toggleBiometric = async () => {
    if (biometricEnabled) {
      await disableBiometric();
    } else {
      await enableBiometric();
    }
  };

  return {
    biometricEnabled,
    capability,
    isLoading,
    error,
    toggleBiometric,
    enableBiometric,
    disableBiometric,
  };
};
```

### Biometric Type Label

```typescript
// src/components/settings/BiometricTypeLabel.tsx

import React from 'react';
import { Text } from '@gluestack-ui/themed';
import { Platform } from 'react-native';

interface BiometricTypeLabelProps {
  biometryType: 'FaceID' | 'TouchID' | 'Biometrics' | null;
}

export const BiometricTypeLabel: React.FC<BiometricTypeLabelProps> = ({ biometryType }) => {
  const getLabel = () => {
    if (Platform.OS === 'ios') {
      if (biometryType === 'FaceID') return 'Face ID';
      if (biometryType === 'TouchID') return 'Touch ID';
      return 'Biometric Authentication';
    } else {
      return 'Fingerprint Authentication';
    }
  };

  return (
    <Text fontSize="$lg" fontWeight="$semibold">
      {getLabel()}
    </Text>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                 | Effort |
| -------- | --------------------------- | ------ |
| TASK-238 | BiometricToggleScreen UI    | 1.5h   |
| TASK-239 | Biometric Capability Check  | 1.5h   |
| TASK-240 | Enable/Disable Logic        | 2h     |
| TASK-241 | Biometric Toggle RNTL Tests | 1.5h   |
| TASK-242 | Biometric Toggle E2E Tests  | 0.5h   |

**Total**: 5 tasks, 7 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/screens/settings/__tests__/BiometricToggleScreen.test.tsx`

```typescript
describe('BiometricToggleScreen', () => {
  it('should render biometric toggle with current state', () => {
    const { getByTestId } = render(<BiometricToggleScreen />);

    expect(getByTestId('biometric-toggle-switch')).toBeTruthy();
  });

  it('should disable toggle if biometrics not available', async () => {
    mockBiometricService.checkBiometricCapability.mockResolvedValue({
      isAvailable: false,
      isEnrolled: false,
      biometryType: null,
      error: 'Not available',
    });

    const { getByTestId } = render(<BiometricToggleScreen />);

    await waitFor(() => {
      const toggle = getByTestId('biometric-toggle-switch');
      expect(toggle).toBeDisabled();
    });
  });

  it('should prompt biometric authentication when enabling', async () => {
    mockBiometricService.authenticateBiometric.mockResolvedValue(true);

    const { getByTestId } = render(<BiometricToggleScreen />);

    fireEvent.press(getByTestId('biometric-toggle-switch'));

    await waitFor(() => {
      expect(mockBiometricService.authenticateBiometric).toHaveBeenCalledWith(
        'Verify to enable biometric authentication'
      );
    });
  });

  it('should save preference and update Redux when enabled', async () => {
    mockBiometricService.authenticateBiometric.mockResolvedValue(true);

    const { getByTestId } = render(<BiometricToggleScreen />);

    fireEvent.press(getByTestId('biometric-toggle-switch'));

    await waitFor(() => {
      expect(mockEncryptedStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'true');
      expect(mockDispatch).toHaveBeenCalledWith(setBiometricEnabled(true));
    });
  });

  it('should show error when no PIN exists and user tries to disable', async () => {
    mockKeychainService.getGenericPassword.mockResolvedValue(null);

    const { getByTestId } = render(<BiometricToggleScreen />);

    fireEvent.press(getByTestId('biometric-toggle-switch')); // Disable

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent(
        'Please set up a PIN before disabling biometrics'
      );
    });
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `e2e/features/biometric-toggle.feature`

```gherkin
Feature: Toggle Biometric Authentication

  Background:
    Given I am logged in
    And I am on the Settings screen

  Scenario: Enable biometric authentication
    When I tap "Biometric Authentication"
    Then I should see the Biometric Toggle screen
    When I tap the toggle switch
    Then I should see the biometric prompt "Verify to enable biometric authentication"
    When I authenticate with biometrics
    Then the toggle should be enabled
    And I should see "Biometric authentication enabled"

  Scenario: Disable biometric authentication when PIN exists
    Given biometric authentication is enabled
    And I have a PIN set up
    When I tap "Biometric Authentication"
    And I tap the toggle switch
    Then the toggle should be disabled
    And I should see "Biometric authentication disabled"

  Scenario: Cannot disable biometric without PIN
    Given biometric authentication is enabled
    And I do not have a PIN set up
    When I tap "Biometric Authentication"
    And I tap the toggle switch
    Then I should see "Please set up a PIN before disabling biometrics"
    And the toggle should remain enabled

  Scenario: Biometric not available
    Given biometric authentication is not available on device
    When I tap "Biometric Authentication"
    Then the toggle should be disabled
    And I should see "Not available on this device"
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (biometric setup exists)
- EPIC-023: Security Settings (PIN setup exists)

**Downstream**:

- None (Toggle is standalone)

---

## Risks & Mitigation

| Risk                                        | Probability | Impact | Mitigation                                              |
| ------------------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Biometric hardware fails                    | Low         | Medium | Always provide PIN fallback                             |
| User disables biometrics and forgets PIN    | Medium      | High   | Require PIN verification before disabling               |
| Face ID/Touch ID enrollment removed by user | Medium      | Medium | Check enrollment on app launch, auto-disable if removed |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 5 tasks complete
- [ ] Toggle working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing
- [ ] `yarn validate` passes

**Security**:

- [ ] PIN fallback always available
- [ ] Preference stored in Encrypted Storage
- [ ] Biometric re-auth after 30min background

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-023](../epics/EPIC-023-security-settings.md), [US-040](US-040-change-pin.md)

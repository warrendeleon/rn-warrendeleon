# US-043: Root/Jailbreak Detection

**ID**: US-043 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **Title**: Detect Root/Jailbreak and Warn Users
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 2 | **Effort**: 5h

---

## User Story

**As a** security-conscious app owner
**I want to** detect if the app is running on a rooted/jailbroken device
**So that** I can warn users about potential security risks and inform them that some features may not work as expected

---

## Acceptance Criteria

### Functional Requirements

1. **Detection on App Launch**
   - [ ] Root/jailbreak detection runs automatically on app launch
   - [ ] Detection is non-blocking (app continues to load)
   - [ ] Detection completes within 500ms

2. **Security Warning Modal**
   - [ ] If device is rooted/jailbroken: Show security warning modal
   - [ ] Modal title: "Security Warning"
   - [ ] Modal message:

     ```
     Your device appears to be jailbroken/rooted. This may compromise the security
     of your data. We recommend using this app on a secure device.

     Some features may not work as expected:
     - Biometric authentication may be bypassed
     - Sensitive data may be accessible to other apps
     - Security updates may not be applied
     ```

   - [ ] Modal actions:
     - "I Understand" button (dismisses modal, allows app usage)
     - "Learn More" button (links to security FAQ)

3. **Security Settings Indicator**
   - [ ] Settings screen shows device security status
   - [ ] If compromised: Red indicator with "Device Security: At Risk"
   - [ ] If secure: Green indicator with "Device Security: Protected"
   - [ ] Tap indicator → Show detailed security information

4. **Periodic Re-checks**
   - [ ] Detection runs every time app returns from background
   - [ ] Detection logged for security monitoring (no PII)

### Non-Functional Requirements

1. **Performance**
   - [ ] Detection completes in <500ms
   - [ ] Non-blocking (doesn't delay app launch)
   - [ ] Minimal battery impact

2. **Accessibility (EAA)**
   - [ ] Warning modal has `accessibilityRole="alert"`
   - [ ] Security indicator has `accessibilityLabel="Device security status"`
   - [ ] All buttons have proper `accessibilityRole` and `accessibilityHint`

3. **Testing**
   - [ ] 100% RNTL coverage for SecurityWarningModal
   - [ ] E2E test on non-rooted device (secure)
   - [ ] Manual testing on rooted/jailbroken device (if available)

---

## Technical Implementation

### Detection Strategy

**iOS (Jailbreak Detection)**:

- Check for Cydia app (`/Applications/Cydia.app`)
- Check for common jailbreak files (`/usr/sbin/sshd`, `/etc/apt`)
- Check if app can write to `/private` directory
- Check for process injection (suspicious frameworks)

**Android (Root Detection)**:

- Check for `su` binary (`/system/xbin/su`, `/system/bin/su`)
- Check for SuperSU or Magisk apps
- Check build tags for `test-keys`
- Check if SELinux is enforcing

### Root Detection Service

```typescript
// src/services/security/rootDetectionService.ts

import JailMonkey from 'jail-monkey';

export interface DeviceSecurityStatus {
  isCompromised: boolean;
  isJailbroken: boolean;
  isRooted: boolean;
  canMockLocation: boolean;
  isOnExternalStorage: boolean;
  isDebuggedMode: boolean;
  hookDetected: boolean;
  risks: string[];
}

export const checkDeviceSecurity = (): DeviceSecurityStatus => {
  const isJailbroken = JailMonkey.isJailBroken();
  const canMockLocation = JailMonkey.canMockLocation(); // Android only
  const isOnExternalStorage = JailMonkey.isOnExternalStorage(); // Android only
  const isDebuggedMode = JailMonkey.isDebugged();
  const hookDetected = JailMonkey.hookDetected(); // iOS only

  const isCompromised = isJailbroken || isRooted;

  const risks: string[] = [];

  if (isJailbroken) {
    risks.push('Device is jailbroken/rooted');
    risks.push('Biometric authentication may be bypassed');
    risks.push('Sensitive data may be accessible to other apps');
  }

  if (canMockLocation) {
    risks.push('Location mocking is enabled');
  }

  if (isOnExternalStorage) {
    risks.push('App is installed on external storage (security risk)');
  }

  if (isDebuggedMode) {
    risks.push('Debugger is attached');
  }

  if (hookDetected) {
    risks.push('Code injection detected');
  }

  return {
    isCompromised,
    isJailbroken,
    isRooted: isJailbroken, // JailMonkey uses same method for both platforms
    canMockLocation,
    isOnExternalStorage,
    isDebuggedMode,
    hookDetected,
    risks,
  };
};

export const getSecurityRecommendations = (status: DeviceSecurityStatus): string[] => {
  const recommendations: string[] = [];

  if (status.isCompromised) {
    recommendations.push('Use the app on a non-jailbroken/non-rooted device');
    recommendations.push('Disable biometric authentication and use a strong PIN');
    recommendations.push('Avoid storing sensitive information in the app');
  }

  if (status.canMockLocation) {
    recommendations.push('Disable location mocking in Developer Options');
  }

  if (status.isOnExternalStorage) {
    recommendations.push('Move the app to internal storage for better security');
  }

  if (status.isDebuggedMode) {
    recommendations.push('Close any debugging tools before using the app');
  }

  return recommendations;
};
```

### Security Warning Modal

```typescript
// src/components/security/SecurityWarningModal.tsx

import React from 'react';
import { Modal, View, Text, Pressable, Linking } from 'react-native';
import { Box, VStack, HStack, Button, ButtonText } from '@gluestack-ui/themed';
import { DeviceSecurityStatus } from '../../services/security/rootDetectionService';

interface SecurityWarningModalProps {
  visible: boolean;
  securityStatus: DeviceSecurityStatus;
  onDismiss: () => void;
  testID?: string;
}

export const SecurityWarningModal: React.FC<SecurityWarningModalProps> = ({
  visible,
  securityStatus,
  onDismiss,
  testID = 'security-warning-modal',
}) => {
  const handleLearnMore = () => {
    Linking.openURL('https://warrendeleon.com/security-faq');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      testID={testID}
      accessibilityViewIsModal
    >
      <Box
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.6)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Box
          backgroundColor="$white"
          borderRadius="$lg"
          padding="$6"
          width="90%"
          maxWidth={400}
          testID={`${testID}-content`}
        >
          {/* Icon */}
          <Box alignItems="center" marginBottom="$4">
            <Text style={{ fontSize: 48 }}>⚠️</Text>
          </Box>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 16,
            }}
            accessibilityRole="header"
          >
            Security Warning
          </Text>

          {/* Message */}
          <VStack space="md" marginBottom="$6">
            <Text
              style={{
                fontSize: 16,
                color: '#374151',
                textAlign: 'center',
              }}
              accessibilityRole="alert"
            >
              Your device appears to be jailbroken/rooted. This may compromise the
              security of your data. We recommend using this app on a secure device.
            </Text>

            {/* Risks List */}
            {securityStatus.risks.length > 0 && (
              <VStack space="xs">
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#1F2937',
                  }}
                >
                  Detected risks:
                </Text>
                {securityStatus.risks.map((risk, index) => (
                  <HStack key={index} space="sm" alignItems="flex-start">
                    <Text style={{ color: '#EF4444' }}>•</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#6B7280',
                        flex: 1,
                      }}
                    >
                      {risk}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>

          {/* Actions */}
          <VStack space="sm">
            <Button
              onPress={onDismiss}
              backgroundColor="$blue600"
              testID={`${testID}-dismiss-button`}
              accessibilityRole="button"
              accessibilityLabel="I understand"
              accessibilityHint="Dismiss this warning and continue using the app"
            >
              <ButtonText>I Understand</ButtonText>
            </Button>

            <Button
              onPress={handleLearnMore}
              variant="outline"
              borderColor="$blue600"
              testID={`${testID}-learn-more-button`}
              accessibilityRole="button"
              accessibilityLabel="Learn more"
              accessibilityHint="Open security FAQ in browser"
            >
              <ButtonText color="$blue600">Learn More</ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
};
```

### Security Indicator Component

```typescript
// src/features/Settings/components/SecurityStatusIndicator.tsx

import React from 'react';
import { Pressable } from 'react-native';
import { Box, HStack, VStack, Text } from '@gluestack-ui/themed';
import { DeviceSecurityStatus } from '../../services/security/rootDetectionService';

interface SecurityStatusIndicatorProps {
  securityStatus: DeviceSecurityStatus;
  onPress: () => void;
  testID?: string;
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({
  securityStatus,
  onPress,
  testID = 'security-status-indicator',
}) => {
  const isSecure = !securityStatus.isCompromised;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Device security status: ${isSecure ? 'Protected' : 'At Risk'}`}
      accessibilityHint="Tap to view detailed security information"
    >
      <Box
        backgroundColor={isSecure ? '#D1FAE5' : '#FEE2E2'}
        borderColor={isSecure ? '#10B981' : '#EF4444'}
        borderWidth={1}
        borderRadius="$md"
        padding="$3"
      >
        <HStack space="md" alignItems="center">
          {/* Icon */}
          <Text style={{ fontSize: 24 }}>
            {isSecure ? '🛡️' : '⚠️'}
          </Text>

          {/* Status */}
          <VStack flex={1}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: '#6B7280',
              }}
            >
              Device Security
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: isSecure ? '#10B981' : '#EF4444',
              }}
            >
              {isSecure ? 'Protected' : 'At Risk'}
            </Text>
          </VStack>

          {/* Arrow */}
          <Text style={{ fontSize: 18, color: '#9CA3AF' }}>›</Text>
        </HStack>
      </Box>
    </Pressable>
  );
};
```

### App Launch Integration

```typescript
// src/App.tsx (or navigation root)

import { useEffect, useState } from 'react';
import { checkDeviceSecurity, DeviceSecurityStatus } from './services/security/rootDetectionService';
import { SecurityWarningModal } from './components/security/SecurityWarningModal';

export const App = () => {
  const [securityStatus, setSecurityStatus] = useState<DeviceSecurityStatus | null>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = () => {
    const status = checkDeviceSecurity();
    setSecurityStatus(status);

    if (status.isCompromised) {
      setShowSecurityWarning(true);
    }
  };

  return (
    <>
      {/* Your app navigation */}
      <RootNavigator />

      {/* Security Warning Modal */}
      {securityStatus && (
        <SecurityWarningModal
          visible={showSecurityWarning}
          securityStatus={securityStatus}
          onDismiss={() => setShowSecurityWarning(false)}
        />
      )}
    </>
  );
};
```

---

## Tasks Breakdown

| Task ID  | Description                       | Effort |
| -------- | --------------------------------- | ------ |
| TASK-248 | Root Detection Service            | 1.5h   |
| TASK-249 | SecurityWarningModal Component    | 1.5h   |
| TASK-250 | SecurityStatusIndicator Component | 1h     |
| TASK-251 | Root Detection RNTL Tests         | 1h     |

**Total**: 4 tasks, 5 hours

---

## Testing Strategy

### Unit Tests (RNTL)

**File**: `src/features/Settings/components/__tests__/SecurityWarningModal.rntl.tsx`

```typescript
describe('SecurityWarningModal', () => {
  const mockSecurityStatus: DeviceSecurityStatus = {
    isCompromised: true,
    isJailbroken: true,
    isRooted: false,
    canMockLocation: false,
    isOnExternalStorage: false,
    isDebuggedMode: false,
    hookDetected: false,
    risks: ['Device is jailbroken/rooted', 'Biometric authentication may be bypassed'],
  };

  it('should render when visible', () => {
    const { getByTestId } = render(
      <SecurityWarningModal
        visible={true}
        securityStatus={mockSecurityStatus}
        onDismiss={jest.fn()}
      />
    );

    expect(getByTestId('security-warning-modal')).toBeTruthy();
  });

  it('should display all detected risks', () => {
    const { getByText } = render(
      <SecurityWarningModal
        visible={true}
        securityStatus={mockSecurityStatus}
        onDismiss={jest.fn()}
      />
    );

    expect(getByText('Device is jailbroken/rooted')).toBeTruthy();
    expect(getByText('Biometric authentication may be bypassed')).toBeTruthy();
  });

  it('should call onDismiss when "I Understand" is pressed', () => {
    const mockOnDismiss = jest.fn();

    const { getByTestId } = render(
      <SecurityWarningModal
        visible={true}
        securityStatus={mockSecurityStatus}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByTestId('security-warning-modal-dismiss-button'));

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should open security FAQ when "Learn More" is pressed', () => {
    const { getByTestId } = render(
      <SecurityWarningModal
        visible={true}
        securityStatus={mockSecurityStatus}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.press(getByTestId('security-warning-modal-learn-more-button'));

    expect(mockLinking.openURL).toHaveBeenCalledWith('https://warrendeleon.com/security-faq');
  });
});
```

### E2E Tests (Detox + Cucumber)

**File**: `src/features/Settings/__tests__/RootDetection/root-detection.feature`

```gherkin
Feature: Root/Jailbreak Detection

  Scenario: Secure device (not rooted)
    Given the device is not rooted
    When I launch the app
    Then I should not see the security warning
    And I should see "Device Security: Protected" in Settings

  # Manual testing on rooted device required
  @manual
  Scenario: Compromised device (rooted)
    Given the device is rooted
    When I launch the app
    Then I should see the security warning modal
    When I tap "I Understand"
    Then the modal should dismiss
    And the app should continue to work
```

---

## Dependencies

**Upstream**:

- EPIC-021: Registration (app functionality exists)

**Downstream**:

- None (Detection is passive security measure)

---

## Risks & Mitigation

| Risk                                        | Probability | Impact | Mitigation                                            |
| ------------------------------------------- | ----------- | ------ | ----------------------------------------------------- |
| False positives (detect as rooted when not) | Low         | Medium | Use well-tested library (JailMonkey), allow app usage |
| Detection bypassed by advanced tools        | Medium      | Low    | Use multiple detection methods, inform users          |
| Users annoyed by warning                    | Low         | Low    | Show once per session, allow dismissal                |

---

## Definition of Done

**Functional**:

- [ ] All acceptance criteria met
- [ ] All 4 tasks complete
- [ ] Detection working on iOS + Android

**Quality**:

- [ ] 100% RNTL coverage
- [ ] Manual testing on rooted/jailbroken device
- [ ] `yarn validate` passes

**Security**:

- [ ] Detection results logged (no PII)
- [ ] Multiple detection methods used
- [ ] User education provided

**Accessibility**:

- [ ] All EAA requirements met
- [ ] Screen reader tested

---

**Last Updated**: 2025-11-21
**Related**: [EPIC-023](../epics/EPIC-023-security-settings.md), [US-040](US-040-change-pin.md)

# TASK-227: BiometricPromptScreen

**ID**: TASK-227 | **Title**: Build BiometricPromptScreen UI for Re-Authentication
**User Story**: [US-039](../stories/US-039-biometric-reauth.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

## File Structure

```
src/features/Auth/
└── screens/
    ├── BiometricPromptScreen.tsx
    └── __tests__/
        └── BiometricPromptScreen.rntl.tsx
```

**Note**: Screen co-located with Auth feature following feature-first architecture (established in TASK-196).

---

## Context & Background

BiometricPromptScreen appears when user foregrounds app after >30 minutes in background. Requires Face ID/Touch ID/Fingerprint to continue.

**Flow**:

```
App foregrounded after 30+ minutes
  → Navigate to BiometricPromptScreen
  → Biometric prompt appears automatically
  → User authenticates
  → Success → Navigate to Home
  → Failure → Show error, allow retry (max 3 attempts)
  → 3 failures → Full logout
```

---

## Objective

Build BiometricPromptScreen with:

1. Automatic biometric prompt on mount
2. "Try Again" button after failure
3. Failed attempt tracking (max 3)
4. "Cancel" button with confirmation
5. Full EAA compliance

---

## Implementation

**File**: `src/screens/auth/BiometricPromptScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import { Button, ButtonText } from '@gluestack-ui/themed';

const MAX_ATTEMPTS = 3;

export const BiometricPromptScreen: React.FC = () => {
  const { authenticate, type } = useBiometricAuth();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    setErrorMessage(null);

    const success = await authenticate({
      promptMessage: 'Authenticate to continue',
    });

    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= MAX_ATTEMPTS) {
        setErrorMessage('Too many failed attempts. Please log in again.');
        setTimeout(() => handleLogout(), 2000);
      } else {
        setErrorMessage(`Authentication failed. ${MAX_ATTEMPTS - newFailedAttempts} attempts remaining.`);
      }
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleLogout = async () => {
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });
    dispatch(clearAuth());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView testID="biometric-prompt-screen" className="flex-1 justify-center items-center p-6">
      <View className="items-center">
        <View className="mb-8">
          <View className="w-20 h-20 bg-primary-500 rounded-full" />
        </View>

        <Text className="text-xl font-semibold text-center mb-4" accessibilityRole="header">
          For your security, please authenticate to continue
        </Text>

        {errorMessage && (
          <View className="bg-error-100 p-4 rounded-lg mb-6" accessibilityLiveRegion="assertive">
            <Text className="text-error-700 text-center">{errorMessage}</Text>
          </View>
        )}

        {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
          <Button
            onPress={handleAuthenticate}
            testID="try-again-button"
            size="lg"
            className="w-full mb-4"
          >
            <ButtonText>Try Again</ButtonText>
          </Button>
        )}

        <Pressable
          onPress={handleCancel}
          testID="cancel-button"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <Text className="text-gray-600">Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
```

---

## Acceptance Criteria

- [ ] Biometric prompt appears on mount
- [ ] Successful auth navigates to Home
- [ ] Failed auth shows error message
- [ ] "Try Again" button appears after failure
- [ ] 3 failed attempts triggers logout
- [ ] "Cancel" button shows confirmation
- [ ] All EAA requirements met

---

## Definition of Done

- [ ] Component implemented
- [ ] Manual testing complete
- [ ] EAA verified
- [ ] `yarn validate` passes

---

**Dependencies**: None

**Next Task**: [TASK-228](TASK-228-pin-prompt-screen.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2.5 hours

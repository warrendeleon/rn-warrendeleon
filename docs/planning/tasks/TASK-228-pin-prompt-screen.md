# TASK-228: PINPromptScreen

## File Structure

```
src/features/Auth/
└── screens/
    ├── PINPromptScreen.tsx
    └── __tests__/
        └── PINPromptScreen.rntl.tsx
```

**Note**: Screen co-located with Auth feature following feature-first architecture (established in TASK-196).

# TASK-228: PINPromptScreen (Original Content)

**ID**: TASK-228 | **Title**: Build PINPromptScreen for PIN Fallback Re-Authentication
**User Story**: [US-039](../stories/US-039-biometric-reauth.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

PINPromptScreen appears when biometrics are unavailable. User must enter 6-digit PIN to continue.

**Flow**:

```
App foregrounded after 30+ minutes (biometrics unavailable)
  → Navigate to PINPromptScreen
  → User enters 6-digit PIN
  → Validate with bcrypt
  → Success → Navigate to Home
  → Failure → Show error, allow retry (max 3 attempts)
  → 3 failures → Full logout
```

---

## Objective

Build PINPromptScreen with:

1. 6-digit PIN input (masked display)
2. bcrypt validation
3. Failed attempt tracking (max 3)
4. "Cancel" button with confirmation
5. Full EAA compliance

---

## Implementation

**File**: `src/screens/auth/PINPromptScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import bcrypt from 'react-native-bcrypt';

const MAX_ATTEMPTS = 3;

export const PINPromptScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handlePINSubmit = async () => {
    if (pin.length !== 6) {
      setErrorMessage('PIN must be 6 digits');
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const pinHashCredentials = await Keychain.getGenericPassword({
        service: 'auth_pin_hash',
      });

      if (!pinHashCredentials) {
        throw new Error('No PIN hash found');
      }

      const pinHash = pinHashCredentials.password;
      const isValid = await bcrypt.compare(pin, pinHash);

      if (isValid) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        setPin('');

        if (newFailedAttempts >= MAX_ATTEMPTS) {
          setErrorMessage('Too many failed attempts. Please log in again.');
          setTimeout(() => handleLogout(), 2000);
        } else {
          setErrorMessage(`Incorrect PIN. ${MAX_ATTEMPTS - newFailedAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      setErrorMessage('Error validating PIN. Please try again.');
    } finally {
      setIsValidating(false);
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

  const getMaskedPIN = () => {
    return '•'.repeat(pin.length) + '○'.repeat(6 - pin.length);
  };

  return (
    <SafeAreaView testID="pin-prompt-screen" className="flex-1 justify-center items-center p-6">
      <View className="items-center w-full">
        <View className="mb-8">
          <View className="w-20 h-20 bg-primary-500 rounded-full" />
        </View>

        <Text className="text-xl font-semibold text-center mb-4" accessibilityRole="header">
          For your security, please enter your PIN to continue
        </Text>

        <View className="mb-8">
          <Text className="text-4xl tracking-widest" testID="masked-pin-display">
            {getMaskedPIN()}
          </Text>
        </View>

        {errorMessage && (
          <View className="bg-error-100 p-4 rounded-lg mb-6 w-full" accessibilityLiveRegion="assertive">
            <Text className="text-error-700 text-center">{errorMessage}</Text>
          </View>
        )}

        <TextInput
          testID="pin-input"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={6}
          secureTextEntry
          autoFocus
          onSubmitEditing={handlePINSubmit}
          editable={!isValidating && failedAttempts < MAX_ATTEMPTS}
          className="opacity-0 h-0 w-0"
        />

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

- [ ] PIN input uses numeric keyboard
- [ ] PIN displays as masked dots
- [ ] PIN validation uses bcrypt
- [ ] Successful validation navigates to Home
- [ ] Failed validation shows error
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

**Next Task**: [TASK-229](TASK-229-app-state-reauth-integration.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2.5 hours

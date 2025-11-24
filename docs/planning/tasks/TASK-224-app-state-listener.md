# TASK-224: App State Listener

## File Structure

```
src/hooks/
├── useAppState.ts          # Generic AppState listener hook
└── __tests__/
    └── useAppState.test.ts
```

**Note**: AppState listener is a generic utility used across multiple features (Auth, Analytics, etc.), so it's correctly centralized in `/src/hooks/` (not feature-specific).

---

**ID**: TASK-224 | **Title**: Implement App State Listener for Background/Foreground Detection
**User Story**: [US-038](../stories/US-038-session-management.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 3h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

App state listener detects when user backgrounds/foregrounds the app and triggers appropriate security actions based on time in background.

**Thresholds**:

- <30 minutes: No action
- 30 minutes to 24 hours: Require biometric re-authentication
- > 24 hours: Full logout (session expired)

---

## Objective

Implement:

1. useAppStateListener hook
2. Background timestamp tracking
3. Biometric re-auth navigation (30min-24h)
4. Full logout (>24h)

---

## Implementation

### useAppStateListener Hook

**File**: `src/hooks/useAppStateListener.ts`

```typescript
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBackgroundTimestamp, clearAuth } from '../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import { useBiometricCapability } from './useBiometricCapability';
import * as Keychain from 'react-native-keychain';

const RE_AUTH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const LOGOUT_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

export const useAppStateListener = () => {
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useSelector((state: RootState) => state.auth.backgroundTimestamp);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { isAvailable } = useBiometricCapability();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        handleForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        handleBackground();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, backgroundTimestamp]);

  const handleBackground = () => {
    const now = Date.now();
    dispatch(setBackgroundTimestamp(now));
  };

  const handleForeground = async () => {
    const now = Date.now();

    if (!backgroundTimestamp) {
      return;
    }

    const timeInBackground = now - backgroundTimestamp;

    if (timeInBackground >= LOGOUT_THRESHOLD) {
      await handleSessionExpiry();
    } else if (timeInBackground >= RE_AUTH_THRESHOLD) {
      if (isAvailable) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'BiometricPrompt' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PINPrompt' }],
        });
      }
    }

    dispatch(setBackgroundTimestamp(null));
  };

  const handleSessionExpiry = async () => {
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });
    dispatch(clearAuth());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
};
```

---

## Acceptance Criteria

- [ ] App state listener detects background/foreground
- [ ] Background timestamp recorded
- [ ] <30 minutes: No action
- [ ] 30min-24h: Navigate to BiometricPromptScreen
- [ ] > 24 hours: Full logout
- [ ] All tokens cleared on logout

---

## Definition of Done

- [ ] Hook implemented
- [ ] Unit tests passing (100% coverage)
- [ ] Manual testing complete
- [ ] `yarn validate` passes

---

**Dependencies**: None

**Next Task**: [TASK-225](TASK-225-session-expiry-detection.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 3 hours

# TASK-229: App State Re-Auth Integration

**ID**: TASK-229 | **Title**: Integrate BiometricPromptScreen/PINPromptScreen with App State Listener
**User Story**: [US-039](../stories/US-039-biometric-reauth.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 1.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

Connect app state listener to re-auth screens. When user foregrounds app after >30 minutes, automatically navigate to appropriate re-auth screen.

---

## Objective

Update useAppStateListener hook to:

1. Navigate to BiometricPromptScreen (if biometrics available)
2. Navigate to PINPromptScreen (if biometrics NOT available)
3. Use navigation reset (prevent back navigation)

---

## Implementation

**File**: Update `src/hooks/useAppStateListener.ts`

```typescript
import { useBiometricCapability } from './useBiometricCapability';

export const useAppStateListener = () => {
  const { isAvailable } = useBiometricCapability();

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
};
```

---

## Acceptance Criteria

- [ ] > 30 minutes in background triggers re-auth navigation
- [ ] Biometrics available → Navigate to BiometricPromptScreen
- [ ] Biometrics NOT available → Navigate to PINPromptScreen
- [ ] Navigation uses reset() (no back navigation)

---

## Definition of Done

- [ ] Hook updated
- [ ] Manual testing complete
- [ ] `yarn validate` passes

---

**Dependencies**: TASK-224, TASK-227, TASK-228

**Next Task**: [TASK-230](TASK-230-biometric-reauth-rntl-tests.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 1.5 hours

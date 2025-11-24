# TASK-223: Inactivity Timeout

**ID**: TASK-223 | **Title**: Implement 5-Minute Inactivity Timeout with Automatic Logout
**User Story**: [US-038](../stories/US-038-session-management.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

## File Structure

```
src/features/Auth/
├── hooks/
│   ├── useInactivityTimeout.ts
│   └── __tests__/
│       └── useInactivityTimeout.test.ts
└── store/
    └── middleware/
        └── inactivityMiddleware.ts
```

**Note**: Inactivity timeout is Auth-specific functionality, co-located with Auth feature following feature-first architecture (established in TASK-196).

---

## Context & Background

Inactivity timeout protects user accounts if device is left unlocked. After 5 minutes of no user interaction, automatically log out.

**Flow**:

```
User interacts (tap, swipe, navigation)
  → Update lastActivity timestamp in Redux
  → Timer checks every 30 seconds
  → If current time - lastActivity > 5 minutes:
    → Clear tokens from Keychain
    → Clear Redux state
    → Navigate to Login
    → Show message: "You've been logged out due to inactivity"
```

---

## Objective

Implement:

1. useInactivityTimeout hook
2. Redux middleware to track user interactions
3. Timer logic (checks every 30 seconds)
4. Logout flow on inactivity
5. Pause/resume on app background/foreground

---

## Implementation

### useInactivityTimeout Hook

**File**: `src/hooks/useInactivityTimeout.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import { RootState } from '../store';
import { clearAuth } from '../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL = 30 * 1000; // 30 seconds

export const useInactivityTimeout = () => {
  const lastActivity = useSelector((state: RootState) => state.auth.lastActivity);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isPaused, setIsPaused] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        setIsPaused(true);
      } else if (nextAppState === 'active') {
        setIsPaused(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isPaused) {
      return;
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        handleInactivityLogout();
      }
    }, CHECK_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lastActivity, isAuthenticated, isPaused]);

  const handleInactivityLogout = async () => {
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

### Redux Middleware

**File**: `src/store/middleware/activityMiddleware.ts`

```typescript
import { Middleware } from '@reduxjs/toolkit';
import { updateLastActivity } from '../auth/authSlice';

const ACTIVITY_ACTIONS = ['NAVIGATE', 'BUTTON_PRESS', 'TEXT_INPUT', 'SCROLL', 'SWIPE'];

export const activityMiddleware: Middleware = store => next => action => {
  const result = next(action);

  const isActivityAction = ACTIVITY_ACTIONS.some(type => action.type.includes(type));

  if (isActivityAction) {
    store.dispatch(updateLastActivity(Date.now()));
  }

  return result;
};
```

---

## Acceptance Criteria

- [ ] Hook tracks last activity timestamp
- [ ] Timer checks inactivity every 30 seconds
- [ ] Logout triggered after 5 minutes
- [ ] Timer pauses on app background
- [ ] Timer resumes on app foreground
- [ ] All tokens cleared on logout
- [ ] Navigation to Login working

---

## Definition of Done

- [ ] Hook implemented
- [ ] Middleware implemented
- [ ] Unit tests passing (100% coverage)
- [ ] Manual testing complete
- [ ] `yarn validate` passes

---

**Dependencies**: None

**Next Task**: [TASK-224](TASK-224-app-state-listener.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 2.5 hours

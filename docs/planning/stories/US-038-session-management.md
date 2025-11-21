# US-038: Session Management (Token Refresh, Expiry, Inactivity)

**ID**: US-038 | **Title**: Session Management with Token Refresh and Inactivity Detection
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 6 | **Effort**: 11.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## User Story

**As a** logged-in user
**I want** my session to refresh automatically and logout after inactivity
**So that** I stay logged in seamlessly while maintaining security

---

## Context & Background

### Why This Story Matters

Session management is the backbone of authentication security and user experience:

1. **Seamless Experience**: Users stay logged in without interruption
2. **Security Balance**: Automatic logout after inactivity prevents unauthorised access
3. **Token Lifecycle**: Access tokens expire quickly (1 hour), refresh tokens last longer (30 days)
4. **Network Resilience**: Handles network errors gracefully during refresh
5. **App State Awareness**: Detects when user backgrounds/foregrounds app

**Token Lifecycle**:

```
User logs in
  → Access token valid for 1 hour
  → Refresh token valid for 30 days
  → API request fails with 401 (token expired)
  → Axios interceptor catches 401
  → Automatically calls refresh endpoint
  → Gets new access + refresh tokens
  → Stores in Keychain
  → Retries original request
  → User never notices (seamless)
```

**Inactivity Detection**:

```
User interacts with app
  → Last activity timestamp updated
  → User stops interacting (no taps, no navigation)
  → 5 minutes pass with no activity
  → Inactivity timer fires
  → Logout user
  → Clear all tokens from Keychain
  → Navigate to Login screen
  → Show message: "You've been logged out due to inactivity"
```

**App State Detection**:

```
User backgrounds app (Home button / app switcher)
  → App state changes to "background"
  → Record background timestamp
  → User foregrounds app (tap app icon)
  → App state changes to "active"
  → Calculate time in background
  → If >30 minutes → Require biometric re-authentication
  → If >24 hours → Full logout (session expired)
```

### Current State vs Desired State

**Current State**: Login works (US-036, US-037), but tokens expire and sessions don't persist.

**Desired State**:

- Automatic token refresh via Axios interceptors
- 401 errors trigger refresh, not logout
- Refresh token errors (401/403) trigger full logout
- Inactivity timeout (5 minutes) with automatic logout
- App state listener detects background/foreground transitions
- Background >30 minutes requires biometric re-auth
- Background >24 hours triggers full logout
- Last activity timestamp tracked globally
- Network error handling (retry with exponential backoff)
- Clear error messages for each scenario

### Success Metrics

| Metric                      | Target  | Why It Matters                                |
| --------------------------- | ------- | --------------------------------------------- |
| Token Refresh Success Rate  | 98%+    | Measures reliability of automatic refresh     |
| User Session Duration (Avg) | 7+ days | Shows users stay logged in long-term          |
| Inactivity Logout Accuracy  | 100%    | Security requirement (must fire at 5min)      |
| Background Re-Auth Rate     | 100%    | All users must re-auth after 30min background |
| Network Error Recovery      | 95%+    | Graceful handling of temporary network issues |

---

## Acceptance Criteria

### Functional Requirements

#### Automatic Token Refresh (Axios Interceptor)

- [ ] Axios response interceptor catches 401 errors
- [ ] On 401:
  - [ ] Read refresh token from Keychain
  - [ ] Call Supabase refresh endpoint:
    - [ ] `POST /auth/v1/token?grant_type=refresh_token`
    - [ ] Body: `{ refresh_token: "..." }`
  - [ ] Validate response with Zod schema
  - [ ] Store new access + refresh tokens in Keychain
  - [ ] Retry original request with new access token
  - [ ] Return response to original caller (seamless)
- [ ] If refresh fails (401/403):
  - [ ] Clear all tokens from Keychain
  - [ ] Clear all encrypted storage
  - [ ] Reset Redux state
  - [ ] Navigate to Login screen
  - [ ] Show error: "Your session has expired. Please log in again."
- [ ] If refresh fails (network error):
  - [ ] Retry up to 3 times with exponential backoff (1s, 2s, 4s)
  - [ ] If all retries fail: Show error "Network error. Please check your connection."
  - [ ] Do NOT logout (let user retry manually)

#### Inactivity Timeout (5 Minutes)

- [ ] Track last activity timestamp in Redux:
  - [ ] Update on every navigation event
  - [ ] Update on every user interaction (tap, swipe, text input)
  - [ ] Store timestamp in `auth.lastActivity` (number, Unix timestamp)
- [ ] Timer checks inactivity every 30 seconds:
  - [ ] Calculate time since last activity
  - [ ] If >5 minutes → Trigger logout
- [ ] Logout flow:
  - [ ] Clear all tokens from Keychain
  - [ ] Clear all encrypted storage
  - [ ] Reset Redux state
  - [ ] Navigate to Login screen
  - [ ] Show message: "You've been logged out due to inactivity"
- [ ] Timer pauses when app backgrounds
- [ ] Timer resumes when app foregrounds

#### App State Listener (Background/Foreground Detection)

- [ ] Listen to app state changes via `AppState.addEventListener('change')`
- [ ] On app state change to "background":
  - [ ] Record background timestamp in Redux
  - [ ] Pause inactivity timer
- [ ] On app state change to "active" (foreground):
  - [ ] Calculate time in background
  - [ ] If <30 minutes:
    - [ ] Resume inactivity timer
    - [ ] No action required
  - [ ] If 30 minutes to 24 hours:
    - [ ] Navigate to BiometricPromptScreen
    - [ ] Require biometric/PIN re-authentication
    - [ ] On success: Resume session
    - [ ] On failure: Full logout
  - [ ] If >24 hours:
    - [ ] Full logout (session expired)
    - [ ] Clear all tokens
    - [ ] Navigate to Login screen
    - [ ] Show error: "Your session has expired. Please log in again."

#### Session Expiry Detection

- [ ] Check refresh token expiry on app launch:
  - [ ] Read refresh token from Keychain
  - [ ] Decode JWT payload (base64 decode middle section)
  - [ ] Check `exp` claim (expiry timestamp)
  - [ ] If expired:
    - [ ] Full logout
    - [ ] Clear all tokens
    - [ ] Navigate to Login screen
    - [ ] Show error: "Your session has expired. Please log in again."
  - [ ] If valid: Continue to Home
- [ ] If refresh token missing on app launch:
  - [ ] Navigate to Login screen (user not logged in)

#### Error Handling

- [ ] **401 during refresh** → "Your session has expired. Please log in again."
- [ ] **Network error during refresh** → "Network error. Please check your connection." (retry 3x)
- [ ] **Inactivity timeout** → "You've been logged out due to inactivity"
- [ ] **Background >24 hours** → "Your session has expired. Please log in again."
- [ ] **Biometric re-auth failure** → "Authentication failed. Please log in again."
- [ ] **Invalid refresh token** → "Your session has expired. Please log in again."

### Non-Functional Requirements

#### Performance

- [ ] Token refresh <2 seconds (including network round-trip)
- [ ] Inactivity check <10ms (runs every 30 seconds)
- [ ] App state listener <50ms response time
- [ ] Background timestamp calculation <5ms
- [ ] JWT decode <10ms

#### Security

- [ ] Tokens stored in hardware-backed Keychain only
- [ ] Never log tokens (mask in logs)
- [ ] Clear all sensitive data on logout
- [ ] Validate all API responses with Zod
- [ ] Exponential backoff on retry (prevent DoS)
- [ ] Maximum 3 retry attempts

#### Accessibility (EAA Compliance)

- [ ] Error messages announced to screen reader
- [ ] Session expiry message uses `accessibilityLiveRegion="assertive"`
- [ ] Inactivity warning message accessible

#### Testing

- [ ] 100% RNTL coverage for:
  - [ ] useTokenRefresh hook
  - [ ] useInactivityTimeout hook
  - [ ] useAppStateListener hook
  - [ ] sessionMiddleware (Redux middleware)
- [ ] 100% RNTL coverage for BiometricPromptScreen
- [ ] E2E tests (Detox + Cucumber):
  - [ ] Automatic token refresh on 401
  - [ ] Inactivity timeout (5 minutes)
  - [ ] Background >30 minutes triggers biometric re-auth
  - [ ] Background >24 hours triggers logout
  - [ ] Network error handling during refresh

---

## Implementation Phases

### Phase 1: Automatic Token Refresh (Axios Interceptor) (3 hours)

**Tasks**: [TASK-222](../tasks/TASK-222-token-refresh-interceptor.md)

**Objective**: Build Axios response interceptor to automatically refresh expired tokens.

**Deliverables**:

- Axios response interceptor for 401 errors
- Refresh token API client (`src/api/auth/refresh.ts`)
- Token refresh logic with retry and exponential backoff
- Error handling for all scenarios
- Zod validation for refresh response
- Token storage in Keychain

**Axios Interceptor Implementation**:

```typescript
// src/api/interceptors/authInterceptor.ts
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { refreshAccessToken } from '../auth/refresh';
import { store } from '../../store';
import { clearAuth } from '../../store/auth/authSlice';

axios.interceptors.response.use(
  response => response, // Pass through successful responses
  async error => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Read refresh token from Keychain
        const refreshTokenCredentials = await Keychain.getGenericPassword({
          service: 'auth_refresh_token',
        });

        if (!refreshTokenCredentials) {
          throw new Error('No refresh token found');
        }

        const refreshToken = refreshTokenCredentials.password;

        // Call refresh endpoint
        const { accessToken, refreshToken: newRefreshToken } =
          await refreshAccessToken(refreshToken);

        // Store new tokens in Keychain
        await Keychain.setGenericPassword('auth_access_token', accessToken, {
          service: 'auth_access_token',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        await Keychain.setGenericPassword('auth_refresh_token', newRefreshToken, {
          service: 'auth_refresh_token',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        // Update Authorization header with new access token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed → Full logout
        console.error('Token refresh failed:', refreshError);

        // Clear all tokens
        await Keychain.resetGenericPassword({ service: 'auth_access_token' });
        await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

        // Clear Redux state
        store.dispatch(clearAuth());

        // Navigate to Login (handled by navigation listener in App.tsx)
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
```

**Refresh Token API Client**:

```typescript
// src/api/auth/refresh.ts
import axios from 'axios';
import { z } from 'zod';
import Config from 'react-native-config';

const refreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.literal('bearer'),
});

export const refreshAccessToken = async (refreshToken: string) => {
  const url = `${Config.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;

  const response = await axios.post(
    url,
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: Config.SUPABASE_ANON_KEY,
      },
    }
  );

  // Validate response
  const validation = refreshResponseSchema.safeParse(response.data);
  if (!validation.success) {
    throw new Error('Invalid refresh response');
  }

  return {
    accessToken: validation.data.access_token,
    refreshToken: validation.data.refresh_token,
    expiresIn: validation.data.expires_in,
  };
};
```

**Exponential Backoff Retry Logic**:

```typescript
// src/utils/retry.ts
export const retryWithExponentialBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If not a network error, throw immediately
      if (error.response?.status !== undefined) {
        throw error;
      }

      // Network error → Retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Usage in refresh function
export const refreshAccessToken = async (refreshToken: string) => {
  return retryWithExponentialBackoff(async () => {
    const url = `${Config.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;
    const response = await axios.post(url, { refresh_token: refreshToken });
    // ... validation and return
  });
};
```

**Acceptance Criteria**:

- [ ] Axios interceptor catches 401 errors
- [ ] Refresh token API call succeeds
- [ ] New tokens stored in Keychain
- [ ] Original request retried with new token
- [ ] Exponential backoff on network errors
- [ ] Full logout on refresh failure (401/403)
- [ ] All responses validated with Zod

**Effort**: 3h

---

### Phase 2: Inactivity Timeout (5 Minutes) (2.5 hours)

**Tasks**: [TASK-223](../tasks/TASK-223-inactivity-timeout.md)

**Objective**: Implement 5-minute inactivity timeout with automatic logout.

**Deliverables**:

- `useInactivityTimeout` hook
- Redux middleware to track user interactions
- Timer logic (checks every 30 seconds)
- Logout flow on inactivity
- Pause/resume on app background/foreground

**useInactivityTimeout Hook**:

```typescript
// src/hooks/useInactivityTimeout.ts
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearAuth } from '../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export const useInactivityTimeout = () => {
  const lastActivity = useSelector((state: RootState) => state.auth.lastActivity);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Start inactivity timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('User inactive for 5 minutes → Logging out');
        handleInactivityLogout();
      }
    }, CHECK_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lastActivity, isAuthenticated]);

  const handleInactivityLogout = async () => {
    // Clear tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Navigate to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

    // Show message
    // TODO: Use Toast/Snackbar component
    console.log("You've been logged out due to inactivity");
  };
};
```

**Redux Middleware to Track User Interactions**:

```typescript
// src/store/middleware/activityMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { updateLastActivity } from '../auth/authSlice';

// Actions that indicate user activity
const ACTIVITY_ACTIONS = [
  'NAVIGATE',
  'BUTTON_PRESS',
  'TEXT_INPUT',
  'SCROLL',
  'SWIPE',
  // Add more as needed
];

export const activityMiddleware: Middleware = store => next => action => {
  const result = next(action);

  // Check if action indicates user activity
  const isActivityAction = ACTIVITY_ACTIONS.some(type => action.type.includes(type));

  if (isActivityAction) {
    store.dispatch(updateLastActivity(Date.now()));
  }

  return result;
};
```

**Redux Slice Update**:

```typescript
// src/store/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  lastActivity: number;
  // ... other fields
}

const initialState: AuthState = {
  isAuthenticated: false,
  lastActivity: Date.now(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateLastActivity: (state, action: PayloadAction<number>) => {
      state.lastActivity = action.payload;
    },
    clearAuth: state => {
      state.isAuthenticated = false;
      state.lastActivity = Date.now();
      // ... clear other fields
    },
  },
});

export const { updateLastActivity, clearAuth } = authSlice.actions;
export default authSlice.reducer;
```

**Pause/Resume on App State Change**:

```typescript
// src/hooks/useInactivityTimeout.ts (updated)
import { AppState, AppStateStatus } from 'react-native';

export const useInactivityTimeout = () => {
  const [isPaused, setIsPaused] = useState(false);

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

    // Timer logic (same as before)
    timerRef.current = setInterval(() => {
      // ... check inactivity
    }, CHECK_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [lastActivity, isAuthenticated, isPaused]);
};
```

**Acceptance Criteria**:

- [ ] Hook tracks last activity timestamp
- [ ] Timer checks inactivity every 30 seconds
- [ ] Logout triggered after 5 minutes
- [ ] Timer pauses on app background
- [ ] Timer resumes on app foreground
- [ ] All tokens cleared on inactivity logout
- [ ] User navigated to Login screen
- [ ] Message displayed to user

**Effort**: 2.5h

---

### Phase 3: App State Listener (Background/Foreground Detection) (3 hours)

**Tasks**: [TASK-224](../tasks/TASK-224-app-state-listener.md)

**Objective**: Detect when user backgrounds/foregrounds app and trigger appropriate actions.

**Deliverables**:

- `useAppStateListener` hook
- Background timestamp tracking in Redux
- Biometric re-auth screen for 30min-24h background
- Full logout for >24h background
- Integration with BiometricPromptScreen

**useAppStateListener Hook**:

```typescript
// src/hooks/useAppStateListener.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setBackgroundTimestamp, clearAuth } from '../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';

const RE_AUTH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
const LOGOUT_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

export const useAppStateListener = () => {
  const appState = useRef(AppState.currentState);
  const backgroundTimestamp = useSelector((state: RootState) => state.auth.backgroundTimestamp);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        handleForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
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
    console.log('App backgrounded at:', new Date(now).toISOString());
  };

  const handleForeground = async () => {
    const now = Date.now();
    console.log('App foregrounded at:', new Date(now).toISOString());

    if (!backgroundTimestamp) {
      return;
    }

    const timeInBackground = now - backgroundTimestamp;
    console.log(`Time in background: ${Math.round(timeInBackground / 1000)}s`);

    if (timeInBackground >= LOGOUT_THRESHOLD) {
      // >24 hours → Full logout
      console.log('Session expired (>24h in background) → Logging out');
      await handleSessionExpiry();
    } else if (timeInBackground >= RE_AUTH_THRESHOLD) {
      // 30min-24h → Biometric re-auth required
      console.log('Session requires re-authentication (>30min in background)');
      navigation.navigate('BiometricPrompt');
    } else {
      // <30 minutes → No action required
      console.log('No re-authentication required (<30min in background)');
    }

    // Clear background timestamp
    dispatch(setBackgroundTimestamp(null));
  };

  const handleSessionExpiry = async () => {
    // Clear tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Navigate to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

    // Show message
    console.log('Your session has expired. Please log in again.');
  };
};
```

**Redux Slice Update**:

```typescript
// src/store/auth/authSlice.ts
interface AuthState {
  isAuthenticated: boolean;
  lastActivity: number;
  backgroundTimestamp: number | null;
  // ... other fields
}

const initialState: AuthState = {
  isAuthenticated: false,
  lastActivity: Date.now(),
  backgroundTimestamp: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setBackgroundTimestamp: (state, action: PayloadAction<number | null>) => {
      state.backgroundTimestamp = action.payload;
    },
    clearAuth: state => {
      state.isAuthenticated = false;
      state.lastActivity = Date.now();
      state.backgroundTimestamp = null;
      // ... clear other fields
    },
  },
});

export const { setBackgroundTimestamp, clearAuth } = authSlice.actions;
export default authSlice.reducer;
```

**BiometricPromptScreen**:

```typescript
// src/screens/auth/BiometricPromptScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/auth/authSlice';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';

export const BiometricPromptScreen: React.FC = () => {
  const { authenticate, isAvailable } = useBiometricAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    const success = await authenticate({
      promptMessage: 'Authenticate to continue',
    });

    if (success) {
      // Re-authentication successful → Navigate back to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      // Re-authentication failed → Full logout
      await handleLogout();
    }
  };

  const handleLogout = async () => {
    // Clear tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Navigate to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

    // Show message
    console.log('Authentication failed. Please log in again.');
  };

  return (
    <View testID="biometric-prompt-screen">
      <Text>Re-authenticating...</Text>
      <Pressable
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Cancel and log out"
      >
        <Text>Cancel</Text>
      </Pressable>
    </View>
  );
};
```

**Acceptance Criteria**:

- [ ] App state listener detects background/foreground transitions
- [ ] Background timestamp recorded when app backgrounds
- [ ] Time in background calculated on foreground
- [ ] <30 minutes: No action required
- [ ] 30min-24h: Navigate to BiometricPromptScreen
- [ ] > 24 hours: Full logout with session expired message
- [ ] Biometric re-auth success: Navigate to Home
- [ ] Biometric re-auth failure: Full logout
- [ ] All tokens cleared on logout

**Effort**: 3h

---

### Phase 4: Session Expiry Detection (1.5 hours)

**Tasks**: [TASK-225](../tasks/TASK-225-session-expiry-detection.md)

**Objective**: Check refresh token expiry on app launch and logout if expired.

**Deliverables**:

- JWT decode utility function
- Expiry check on app launch
- Full logout flow for expired sessions
- Integration with App.tsx bootstrap logic

**JWT Decode Utility**:

```typescript
// src/utils/jwt.ts
import { z } from 'zod';

const jwtPayloadSchema = z.object({
  exp: z.number(),
  sub: z.string(),
  email: z.string().email().optional(),
  // Add other claims as needed
});

export const decodeJWT = (token: string): z.infer<typeof jwtPayloadSchema> => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode base64 payload (middle section)
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    // Validate with Zod
    const validation = jwtPayloadSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error('Invalid JWT payload');
    }

    return validation.data;
  } catch (error) {
    console.error('JWT decode error:', error);
    throw error;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return payload.exp < now;
  } catch (error) {
    // If decode fails, consider token expired
    return true;
  }
};
```

**App Launch Session Check**:

```typescript
// src/App.tsx (excerpt)
import { useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { isTokenExpired } from './utils/jwt';
import { useDispatch } from 'react-redux';
import { clearAuth } from './store/auth/authSlice';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    try {
      // Check if refresh token exists
      const refreshTokenCredentials = await Keychain.getGenericPassword({
        service: 'auth_refresh_token',
      });

      if (!refreshTokenCredentials) {
        // No refresh token → User not logged in
        setIsAuthenticated(false);
        setIsBootstrapping(false);
        return;
      }

      const refreshToken = refreshTokenCredentials.password;

      // Check if refresh token is expired
      if (isTokenExpired(refreshToken)) {
        // Refresh token expired → Full logout
        console.log('Refresh token expired → Logging out');
        await handleExpiredSession();
        setIsAuthenticated(false);
      } else {
        // Refresh token valid → User is logged in
        console.log('Refresh token valid → User authenticated');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleExpiredSession = async () => {
    // Clear all tokens
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });

    // Clear Redux state
    dispatch(clearAuth());

    // Show message (via Toast/Snackbar)
    console.log('Your session has expired. Please log in again.');
  };

  if (isBootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
};
```

**Acceptance Criteria**:

- [ ] JWT decode utility extracts expiry claim
- [ ] isTokenExpired checks expiry against current time
- [ ] App launch checks refresh token expiry
- [ ] Expired refresh token triggers full logout
- [ ] All tokens cleared on expiry
- [ ] User navigated to Login screen
- [ ] Message displayed: "Your session has expired. Please log in again."

**Effort**: 1.5h

---

### Phase 5: RNTL Tests (1.5 hours)

**Tasks**: [TASK-226](../tasks/TASK-226-session-management-rntl-tests.md)

**Objective**: Write comprehensive unit tests for all session management hooks.

**Test Files**:

- `src/hooks/__tests__/useTokenRefresh.test.ts`
- `src/hooks/__tests__/useInactivityTimeout.test.ts`
- `src/hooks/__tests__/useAppStateListener.test.ts`
- `src/utils/__tests__/jwt.test.ts`
- `src/screens/auth/__tests__/BiometricPromptScreen.test.tsx`

**Test Coverage**:

**useTokenRefresh Hook**:

```typescript
// src/hooks/__tests__/useTokenRefresh.test.ts
import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { refreshAccessToken } from '../../api/auth/refresh';

jest.mock('axios');
jest.mock('react-native-keychain');

describe('refreshAccessToken', () => {
  it('should refresh token successfully', async () => {
    const mockResponse = {
      data: {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 3600,
        token_type: 'bearer',
      },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await refreshAccessToken('old_refresh_token');

    expect(result.accessToken).toBe('new_access_token');
    expect(result.refreshToken).toBe('new_refresh_token');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/v1/token'),
      { refresh_token: 'old_refresh_token' },
      expect.any(Object)
    );
  });

  it('should throw error on invalid response', async () => {
    const mockResponse = {
      data: { invalid: 'data' },
    };

    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    await expect(refreshAccessToken('token')).rejects.toThrow('Invalid refresh response');
  });

  it('should retry on network error', async () => {
    (axios.post as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        data: {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 3600,
          token_type: 'bearer',
        },
      });

    const result = await refreshAccessToken('token');

    expect(result.accessToken).toBe('new_access_token');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
```

**useInactivityTimeout Hook**:

```typescript
// src/hooks/__tests__/useInactivityTimeout.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useInactivityTimeout } from '../useInactivityTimeout';
import { Provider } from 'react-redux';
import { store } from '../../store';

jest.useFakeTimers();

describe('useInactivityTimeout', () => {
  it('should logout after 5 minutes of inactivity', () => {
    const { result } = renderHook(() => useInactivityTimeout(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Fast-forward 5 minutes + 30 seconds (check interval)
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000 + 30 * 1000);
    });

    // Verify logout was called
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('should reset timer on user activity', () => {
    const { result } = renderHook(() => useInactivityTimeout(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // Fast-forward 4 minutes
    act(() => {
      jest.advanceTimersByTime(4 * 60 * 1000);
    });

    // Simulate user activity
    act(() => {
      store.dispatch({ type: 'NAVIGATE' });
    });

    // Fast-forward another 4 minutes (total 8 minutes, but last activity was 4 minutes ago)
    act(() => {
      jest.advanceTimersByTime(4 * 60 * 1000);
    });

    // Should NOT logout (last activity was 4 minutes ago)
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
```

**JWT Decode Utility**:

```typescript
// src/utils/__tests__/jwt.test.ts
import { decodeJWT, isTokenExpired } from '../jwt';

describe('JWT Utilities', () => {
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzM1MDAwMDAwfQ.signature';

  it('should decode valid JWT', () => {
    const decoded = decodeJWT(validToken);
    expect(decoded.sub).toBe('1234567890');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.exp).toBe(1735000000);
  });

  it('should throw error on invalid JWT format', () => {
    expect(() => decodeJWT('invalid')).toThrow('Invalid JWT format');
  });

  it('should detect expired token', () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNjAwMDAwMDAwfQ.signature';
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it('should detect valid token', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // +1 hour
    const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoke2Z1dHVyZVRpbWVzdGFtcH19.signature`;
    expect(isTokenExpired(validToken)).toBe(false);
  });
});
```

**Acceptance Criteria**:

- [ ] 100% coverage for useTokenRefresh
- [ ] 100% coverage for useInactivityTimeout
- [ ] 100% coverage for useAppStateListener
- [ ] 100% coverage for JWT utilities
- [ ] 100% coverage for BiometricPromptScreen
- [ ] All edge cases tested
- [ ] All error scenarios tested

**Effort**: 1.5h

---

## Tasks

### Task Breakdown (5 tasks, 11.5h total)

| ID                                                             | Task                                        | Status   | Effort | Priority | Dependencies                           |
| -------------------------------------------------------------- | ------------------------------------------- | -------- | ------ | -------- | -------------------------------------- |
| [TASK-222](../tasks/TASK-222-token-refresh-interceptor.md)     | Automatic Token Refresh (Axios Interceptor) | 📋 To Do | 3h     | High     | None                                   |
| [TASK-223](../tasks/TASK-223-inactivity-timeout.md)            | Inactivity Timeout (5 Minutes)              | 📋 To Do | 2.5h   | High     | None                                   |
| [TASK-224](../tasks/TASK-224-app-state-listener.md)            | App State Listener (Background/Foreground)  | 📋 To Do | 3h     | High     | None                                   |
| [TASK-225](../tasks/TASK-225-session-expiry-detection.md)      | Session Expiry Detection                    | 📋 To Do | 1.5h   | Medium   | TASK-224                               |
| [TASK-226](../tasks/TASK-226-session-management-rntl-tests.md) | Session Management RNTL Tests               | 📋 To Do | 1.5h   | Medium   | TASK-222, TASK-223, TASK-224, TASK-225 |

**Total Effort**: 11.5 hours

**Dependency Chain**:

```
TASK-222 (Token Refresh) → TASK-226 (RNTL Tests)
TASK-223 (Inactivity) → TASK-226 (RNTL Tests)
TASK-224 (App State) → TASK-225 (Expiry Detection) → TASK-226 (RNTL Tests)
```

---

## Non-Functional Requirements

### Performance

- Token refresh <2 seconds
- Inactivity check <10ms (runs every 30 seconds)
- App state listener <50ms response time
- Background timestamp calculation <5ms
- JWT decode <10ms

### Security

- Tokens in hardware-backed Keychain only
- Never log tokens (mask in logs)
- Clear all sensitive data on logout
- Validate all API responses with Zod
- Exponential backoff on retry (prevent DoS)
- Maximum 3 retry attempts

### Accessibility

- Error messages announced to screen reader
- Session expiry message uses `accessibilityLiveRegion="assertive"`
- Inactivity warning message accessible

### Testing

- 100% RNTL coverage (all hooks + utilities + screens)
- E2E tests for all session management scenarios (Detox + Cucumber)
- Platform coverage: iOS + Android

---

## Definition of Done

**Functional**:

- [ ] Automatic token refresh on 401 errors
- [ ] Inactivity timeout (5 minutes) with automatic logout
- [ ] App state listener for background/foreground detection
- [ ] Background >30 minutes triggers biometric re-auth
- [ ] Background >24 hours triggers full logout
- [ ] Session expiry detection on app launch
- [ ] All error scenarios handled gracefully

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes
- [ ] Zero ESLint/TypeScript errors

**Security**:

- [ ] Tokens stored in Keychain only
- [ ] All sensitive data cleared on logout
- [ ] Zod validation for all API responses
- [ ] No tokens logged

**Accessibility**:

- [ ] All error messages EAA compliant
- [ ] Screen reader announcements working

**Documentation**:

- [ ] All hooks documented with JSDoc
- [ ] BiometricPromptScreen documented
- [ ] JWT utilities documented

---

## Risk Assessment

### Technical Risks

| Risk                                         | Probability | Impact | Mitigation                                               |
| -------------------------------------------- | ----------- | ------ | -------------------------------------------------------- |
| Token refresh race condition (multiple 401s) | Medium      | High   | Use request queue, prevent duplicate refresh calls       |
| App state listener not firing on iOS         | Low         | High   | Test on real devices, use AppState.currentState fallback |
| Inactivity timer drift over time             | Low         | Medium | Use Date.now() instead of timer increments               |
| JWT decode fails on malformed token          | Low         | Medium | Zod validation, treat as expired                         |

### UX Risks

| Risk                                           | Probability | Impact | Mitigation                                                 |
| ---------------------------------------------- | ----------- | ------ | ---------------------------------------------------------- |
| User frustrated by 5-minute timeout            | Medium      | Medium | Clear messaging, allow user to extend session              |
| User confused by biometric re-auth after 30min | Low         | Low    | Clear message: "For your security, please re-authenticate" |
| Token refresh causes visible delay             | Low         | Medium | Show loading indicator only if >2 seconds                  |

---

## Testing Strategy

### Unit Tests (RNTL)

**Hooks**:

- useTokenRefresh (refresh flow, retry logic, error handling)
- useInactivityTimeout (timer logic, pause/resume, logout)
- useAppStateListener (background/foreground detection, thresholds)

**Utilities**:

- JWT decode (valid/invalid tokens, expiry detection)

**Screens**:

- BiometricPromptScreen (re-auth flow, success/failure)

**Coverage Target**: 100%

### E2E Tests (Detox + Cucumber)

**Scenarios**:

- Automatic token refresh on 401
- Inactivity timeout (5 minutes)
- Background >30 minutes triggers biometric re-auth
- Background >24 hours triggers logout
- Network error handling during refresh

**Platform Coverage**: iOS + Android

---

## Dependencies

### Upstream Dependencies

- US-036 (Email/Password Login) must be complete
- Keychain integration must be working
- Axios must be configured with interceptors

### Downstream Dependencies

- All subsequent features depend on stable session management
- Chat (realtime) requires active session

---

**Last Updated**: 2025-11-21
**Story Points**: 6 (complex state management and timing logic)
**Priority**: High (critical for security and UX)
**Next Review**: Before Phase 1 implementation

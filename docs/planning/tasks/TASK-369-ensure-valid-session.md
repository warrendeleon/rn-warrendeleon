# TASK-369: Implement ensureValidSession() with ProtectedRoute Integration

**Task ID**: TASK-369
**Title**: Implement Proactive Session Validation Function and ProtectedRoute Integration
**User Story**: [US-066](../stories/US-066-proactive-session-validation.md) - Proactive Session Validation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: High
**Effort**: 6 hours
**Owner**: Warren de Leon
**Created**: 2025-11-27

---

## Context

Currently, the app uses reactive session management: tokens are refreshed only when API calls return 401 errors. This task implements proactive validation that checks and refreshes tokens _before_ users enter secure screens (Book a Call, Chat), ensuring a seamless experience with no mid-task auth failures.

**Why Proactive?**

- Users never see auth errors mid-form-submission
- Tokens refreshed before they expire (5-minute buffer)
- Failed sessions caught before user starts a task
- Clear, predictable behaviour for all secure screens

**Architecture**:

```
User navigates to secure screen
    ↓
ProtectedRoute renders
    ↓
ensureValidSession() called
    ↓
Check tokens in SecureStore
    ↓
Token valid? → Enter screen
Token expiring soon? → Refresh proactively → Enter screen
Token invalid/missing? → Navigate to Login
```

---

## Objective

Create `ensureValidSession()` function and integrate it with `ProtectedRoute` HOC to provide proactive session validation before secure screen access.

**Deliverables**:

1. `ensureValidSession()` function in `src/features/Auth/api/`
2. JWT utility functions (`isTokenExpired`, `isTokenExpiringSoon`)
3. Updated `ProtectedRoute` with proactive validation
4. Clear session utility function
5. Comprehensive RNTL tests (100% coverage)

---

## Implementation Guide

### Part 1: JWT Utility Functions

Create `src/features/Auth/utils/jwt.ts`:

```typescript
import { Buffer } from 'buffer';
import { z } from 'zod';

/**
 * JWT Payload Schema (Supabase format)
 */
const jwtPayloadSchema = z.object({
  exp: z.number(),
  sub: z.string(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  aud: z.string().optional(),
});

type JWTPayload = z.infer<typeof jwtPayloadSchema>;

/**
 * Decode a JWT and extract the payload
 *
 * @param token - The JWT token string
 * @returns The decoded payload
 * @throws Error if token is invalid or malformed
 */
export const decodeJWT = (token: string): JWTPayload => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 parts');
  }

  try {
    // Decode base64url payload (middle section)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    const validation = jwtPayloadSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`Invalid JWT payload: ${validation.error.message}`);
    }

    return validation.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JWT: payload is not valid JSON');
    }
    throw error;
  }
};

/**
 * Check if a JWT token is expired
 *
 * @param token - The JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < nowSeconds;
  } catch (error) {
    // If we can't decode the token, treat it as expired
    console.warn('[isTokenExpired] Failed to decode token:', error);
    return true;
  }
};

/**
 * Check if a JWT token is expiring soon (within buffer period)
 *
 * @param token - The JWT token string
 * @param bufferMinutes - Minutes before expiry to consider "expiring soon"
 * @returns true if token expires within buffer period
 */
export const isTokenExpiringSoon = (token: string, bufferMinutes: number = 5): boolean => {
  try {
    const payload = decodeJWT(token);
    const nowSeconds = Math.floor(Date.now() / 1000);
    const bufferSeconds = bufferMinutes * 60;
    return payload.exp < nowSeconds + bufferSeconds;
  } catch (error) {
    // If we can't decode the token, treat it as expiring soon
    console.warn('[isTokenExpiringSoon] Failed to decode token:', error);
    return true;
  }
};

/**
 * Get token expiry time as Date
 *
 * @param token - The JWT token string
 * @returns Date object representing expiry, or null if invalid
 */
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const payload = decodeJWT(token);
    return new Date(payload.exp * 1000);
  } catch {
    return null;
  }
};
```

### Part 2: Session Validation Function

Create `src/features/Auth/api/ensureValidSession.ts`:

````typescript
import * as SecureStore from 'expo-secure-store';

import { isTokenExpired, isTokenExpiringSoon } from '../utils/jwt';
import { refreshAccessToken } from './refresh';
import { getCurrentUser } from './api';
import type { SupabaseUser } from '../types';

/** Expiry buffer in minutes - refresh tokens expiring within this window */
const EXPIRY_BUFFER_MINUTES = 5;

/** SecureStore keys */
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_DATA_KEY = 'auth_user_data';

/**
 * Result of session validation
 */
export interface SessionValidationResult {
  /** Whether the session is valid */
  valid: boolean;
  /** User data if session is valid */
  user?: SupabaseUser;
  /** Reason for invalid session */
  reason?: 'expired' | 'missing' | 'refresh_failed' | 'network_error' | 'invalid_token';
}

/**
 * Clear all auth data from SecureStore
 */
export const clearSession = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_DATA_KEY),
    ]);
    console.log('[clearSession] Session cleared successfully');
  } catch (error) {
    console.error('[clearSession] Failed to clear session:', error);
    // Don't throw - best effort cleanup
  }
};

/**
 * Proactively validate and refresh session before secure screen access
 *
 * This function checks token validity and proactively refreshes tokens
 * that are expiring soon (within 5 minutes), ensuring users always
 * enter secure screens with fresh, valid tokens.
 *
 * @returns SessionValidationResult indicating if session is valid
 *
 * @example
 * ```typescript
 * const result = await ensureValidSession();
 * if (result.valid) {
 *   // Proceed to secure screen
 *   console.log('User:', result.user);
 * } else {
 *   // Redirect to login
 *   console.log('Session invalid:', result.reason);
 * }
 * ```
 */
export const ensureValidSession = async (): Promise<SessionValidationResult> => {
  console.log('[ensureValidSession] Starting session validation...');

  try {
    // Step 1: Check refresh token exists
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      console.log('[ensureValidSession] No refresh token found');
      return { valid: false, reason: 'missing' };
    }

    // Step 2: Check refresh token is not expired
    if (isTokenExpired(refreshToken)) {
      console.log('[ensureValidSession] Refresh token expired');
      await clearSession();
      return { valid: false, reason: 'expired' };
    }

    // Step 3: Check access token
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    // Step 4: If no access token or expiring soon, refresh proactively
    const needsRefresh = !accessToken || isTokenExpiringSoon(accessToken, EXPIRY_BUFFER_MINUTES);

    if (needsRefresh) {
      console.log('[ensureValidSession] Access token missing or expiring soon, refreshing...');

      try {
        const refreshResult = await refreshAccessToken(refreshToken);

        if (!refreshResult.success) {
          console.log('[ensureValidSession] Token refresh failed');
          await clearSession();
          return { valid: false, reason: 'refresh_failed' };
        }

        console.log('[ensureValidSession] Tokens refreshed successfully');
        // New tokens are stored by refreshAccessToken
      } catch (refreshError) {
        console.error('[ensureValidSession] Refresh error:', refreshError);

        // Check if it's a network error vs auth error
        if (isNetworkError(refreshError)) {
          return { valid: false, reason: 'network_error' };
        }

        await clearSession();
        return { valid: false, reason: 'refresh_failed' };
      }
    }

    // Step 5: Validate session with server
    console.log('[ensureValidSession] Validating with server...');

    try {
      const user = await getCurrentUser();

      if (!user) {
        console.log('[ensureValidSession] Server validation failed - no user returned');
        await clearSession();
        return { valid: false, reason: 'expired' };
      }

      console.log('[ensureValidSession] Session valid for user:', user.email);
      return { valid: true, user };
    } catch (serverError) {
      console.error('[ensureValidSession] Server validation error:', serverError);

      if (isNetworkError(serverError)) {
        // Network error during server check - tokens might still be valid
        // Return valid but log the issue (user can proceed, API calls will handle errors)
        console.warn(
          '[ensureValidSession] Network error during server check, proceeding optimistically'
        );

        // Try to get cached user data
        const cachedUserData = await SecureStore.getItemAsync(USER_DATA_KEY);
        if (cachedUserData) {
          try {
            const user = JSON.parse(cachedUserData) as SupabaseUser;
            return { valid: true, user };
          } catch {
            // Fall through to network error
          }
        }

        return { valid: false, reason: 'network_error' };
      }

      await clearSession();
      return { valid: false, reason: 'expired' };
    }
  } catch (error) {
    console.error('[ensureValidSession] Unexpected error:', error);
    return { valid: false, reason: 'network_error' };
  }
};

/**
 * Check if an error is a network error
 */
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch failed')
    );
  }
  return false;
};
````

### Part 3: Update ProtectedRoute HOC

Update `src/features/Auth/components/ProtectedRoute.tsx`:

````typescript
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Box, Text } from '@gluestack-ui/themed';

import { useAuth } from '../hooks/useAuth';
import { ensureValidSession, SessionValidationResult } from '../api/ensureValidSession';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Custom loading component */
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute HOC
 *
 * Wraps secure screens to ensure valid session before rendering.
 * Proactively validates and refreshes tokens.
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <BookACallScreen />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { setIntendedRoute } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean;
    error?: string;
  }>({
    isValidating: true,
    isValid: false,
  });

  const validateSession = useCallback(async () => {
    setValidationState({ isValidating: true, isValid: false });

    const result: SessionValidationResult = await ensureValidSession();

    if (result.valid) {
      setValidationState({ isValidating: false, isValid: true });
    } else {
      // Save current route for post-login redirect
      setIntendedRoute(route.name);

      // Determine error message based on reason
      let message: string;
      switch (result.reason) {
        case 'expired':
          message = 'Your session has expired. Please log in again.';
          break;
        case 'network_error':
          message = 'Network error. Please check your connection and try again.';
          break;
        case 'refresh_failed':
          message = 'Session refresh failed. Please log in again.';
          break;
        case 'missing':
        default:
          message = 'Please log in to continue.';
          break;
      }

      setValidationState({ isValidating: false, isValid: false, error: message });

      // Navigate to Login
      navigation.reset({
        index: 0,
        routes: [{
          name: 'Login' as never,
          params: { message },
        }],
      });
    }
  }, [navigation, route.name, setIntendedRoute]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Show loading state during validation
  if (validationState.isValidating) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="$coolGray100"
        testID="protected-route-loading"
        accessibilityLabel="Validating session"
        accessibilityHint="Please wait while we verify your session"
      >
        <ActivityIndicator size="large" color="#0891b2" />
        <Text mt="$2" color="$coolGray600" fontSize="$sm">
          Verifying session...
        </Text>
      </Box>
    );
  }

  // If not valid, render nothing (navigation already triggered)
  if (!validationState.isValid) {
    return null;
  }

  // Session valid, render protected content
  return <>{children}</>;
};
````

### Part 4: Barrel Exports

Update `src/features/Auth/api/index.ts`:

```typescript
export { ensureValidSession, clearSession } from './ensureValidSession';
export type { SessionValidationResult } from './ensureValidSession';
// ... existing exports
```

Update `src/features/Auth/utils/index.ts`:

```typescript
export { decodeJWT, isTokenExpired, isTokenExpiringSoon, getTokenExpiry } from './jwt';
```

---

## Feature-First Structure

```
src/features/Auth/
├── api/
│   ├── ensureValidSession.ts    # NEW: Proactive session validation
│   ├── refresh.ts               # Existing: Token refresh
│   ├── api.ts                   # Existing: getCurrentUser, logout
│   └── index.ts                 # Updated barrel export
├── utils/
│   ├── jwt.ts                   # NEW: JWT utilities
│   └── index.ts                 # NEW: Barrel export
├── components/
│   └── ProtectedRoute.tsx       # UPDATED: With proactive validation
├── hooks/
│   └── useAuth.ts               # Existing
├── context/
│   └── AuthContext.tsx          # Existing
└── __tests__/
    ├── ensureValidSession.rntl.tsx   # NEW: Unit tests
    ├── jwt.rntl.tsx                   # NEW: JWT utility tests
    └── ProtectedRoute.rntl.tsx        # UPDATED: Additional tests
```

---

## Acceptance Criteria

### ensureValidSession() Function

- [ ] Checks refresh token exists in SecureStore
- [ ] Validates refresh token is not expired (JWT decode)
- [ ] Checks access token validity
- [ ] Proactively refreshes if access token expires within 5 minutes
- [ ] Validates session with server via getCurrentUser()
- [ ] Returns typed `SessionValidationResult`
- [ ] Clears session on any auth failure
- [ ] Handles network errors gracefully

### JWT Utilities

- [ ] `decodeJWT()` correctly decodes Supabase JWTs
- [ ] `isTokenExpired()` checks expiry correctly
- [ ] `isTokenExpiringSoon()` uses configurable buffer
- [ ] All functions handle malformed tokens gracefully

### ProtectedRoute Integration

- [ ] Calls `ensureValidSession()` on mount
- [ ] Shows loading state during validation
- [ ] Saves intended route before redirect
- [ ] Navigates to Login with appropriate message
- [ ] Renders children only when session valid

### Testing

- [ ] 100% coverage for `ensureValidSession()`
- [ ] 100% coverage for JWT utilities
- [ ] 100% coverage for ProtectedRoute updates
- [ ] All edge cases covered (expired tokens, network errors, missing tokens)

---

## Test Scenarios

### ensureValidSession Tests

```gherkin
Feature: ensureValidSession

  Scenario: Valid session with fresh tokens
    Given user has valid refresh token (not expired)
    And user has valid access token (expires in 30 minutes)
    When ensureValidSession is called
    Then it should return { valid: true, user: {...} }
    And no token refresh should occur

  Scenario: Valid refresh token, expired access token
    Given user has valid refresh token
    And access token is expired
    When ensureValidSession is called
    Then tokens should be refreshed
    And new tokens stored in SecureStore
    And it should return { valid: true, user: {...} }

  Scenario: Access token expiring within 5 minutes
    Given user has valid refresh token
    And access token expires in 3 minutes
    When ensureValidSession is called
    Then tokens should be refreshed proactively
    And it should return { valid: true, user: {...} }

  Scenario: Expired refresh token
    Given refresh token is expired
    When ensureValidSession is called
    Then session should be cleared
    And it should return { valid: false, reason: 'expired' }

  Scenario: No tokens in SecureStore
    Given SecureStore has no auth tokens
    When ensureValidSession is called
    Then it should return { valid: false, reason: 'missing' }

  Scenario: Token refresh API failure
    Given user has valid refresh token
    And access token is expired
    And refresh API returns 401
    When ensureValidSession is called
    Then session should be cleared
    And it should return { valid: false, reason: 'refresh_failed' }

  Scenario: Network error during validation
    Given user has valid tokens
    And network is unavailable
    When ensureValidSession is called
    Then it should return { valid: false, reason: 'network_error' }
```

### JWT Utility Tests

```gherkin
Feature: JWT Utilities

  Scenario: Decode valid JWT
    Given a valid Supabase JWT token
    When decodeJWT is called
    Then it should return the payload with exp, sub, email

  Scenario: Decode malformed JWT
    Given a malformed JWT string "not.a.valid.jwt"
    When decodeJWT is called
    Then it should throw "Invalid JWT format"

  Scenario: Check expired token
    Given a JWT with exp in the past
    When isTokenExpired is called
    Then it should return true

  Scenario: Check valid token
    Given a JWT with exp 30 minutes in the future
    When isTokenExpired is called
    Then it should return false

  Scenario: Check token expiring soon
    Given a JWT with exp 3 minutes in the future
    And buffer is 5 minutes
    When isTokenExpiringSoon is called
    Then it should return true

  Scenario: Check token not expiring soon
    Given a JWT with exp 30 minutes in the future
    And buffer is 5 minutes
    When isTokenExpiringSoon is called
    Then it should return false
```

---

## Security Checklist

- [ ] Tokens stored only in SecureStore (not AsyncStorage)
- [ ] Tokens not logged (only masked references)
- [ ] Session cleared completely on any auth failure
- [ ] All API responses validated with Zod
- [ ] No tokens in component state or Redux
- [ ] Network errors don't leak token information

---

## Dependencies

### Upstream Dependencies

- TASK-333 (AuthContext) - Must be complete
- TASK-335 (ProtectedRoute) - Base HOC must exist
- Existing token refresh infrastructure (`refreshAccessToken`)
- Existing `getCurrentUser` API function

### Downstream Dependencies

- TASK-370 (Auth Flow Documentation) - Will document this functionality
- All secure screens (BookACall, Chat) - Will use updated ProtectedRoute

---

**Estimated Time**: 6 hours
**Last Updated**: 2025-11-27

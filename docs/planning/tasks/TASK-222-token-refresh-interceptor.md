# TASK-222: Token Refresh Interceptor

**ID**: TASK-222 | **Title**: Build Axios Response Interceptor for Automatic Token Refresh
**User Story**: [US-038](../stories/US-038-session-management.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 3h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

Automatic token refresh ensures users stay logged in seamlessly. When an access token expires (1 hour lifetime), the Axios interceptor automatically refreshes it using the refresh token (30-day lifetime) without user intervention.

**Flow**:

```
API request → 401 error (token expired)
  → Interceptor catches 401
  → Read refresh token from Keychain
  → Call POST /auth/v1/token?grant_type=refresh_token
  → Receive new access + refresh tokens
  → Store new tokens in Keychain
  → Retry original request with new access token
  → Return response (user never notices)
```

---

## Objective

Build Axios response interceptor that:

1. Catches 401 errors
2. Refreshes tokens automatically
3. Retries original request
4. Handles refresh failures (logout on 401/403)
5. Implements exponential backoff for network errors

---

## Implementation

### Axios Interceptor

**File**: `src/api/interceptors/authInterceptor.ts`

```typescript
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { refreshAccessToken } from '../auth/refresh';
import { store } from '../../store';
import { clearAuth } from '../../store/auth/authSlice';

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshTokenCredentials = await Keychain.getGenericPassword({
          service: 'auth_refresh_token',
        });

        if (!refreshTokenCredentials) {
          throw new Error('No refresh token found');
        }

        const refreshToken = refreshTokenCredentials.password;
        const { accessToken, refreshToken: newRefreshToken } =
          await refreshAccessToken(refreshToken);

        await Keychain.setGenericPassword('auth_access_token', accessToken, {
          service: 'auth_access_token',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        await Keychain.setGenericPassword('auth_refresh_token', newRefreshToken, {
          service: 'auth_refresh_token',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        await Keychain.resetGenericPassword({ service: 'auth_access_token' });
        await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });
        store.dispatch(clearAuth());
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
```

### Refresh Token API

**File**: `src/api/auth/refresh.ts`

```typescript
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
  const response = await retryWithExponentialBackoff(async () => {
    return axios.post(
      `${Config.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          apikey: Config.SUPABASE_ANON_KEY,
        },
      }
    );
  });

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

const retryWithExponentialBackoff = async <T>(
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

      if (error.response?.status !== undefined) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
```

---

## Acceptance Criteria

- [ ] Interceptor catches 401 errors
- [ ] Refresh token API call succeeds
- [ ] New tokens stored in Keychain
- [ ] Original request retried
- [ ] Exponential backoff on network errors (3 retries)
- [ ] Full logout on refresh failure (401/403)
- [ ] All responses validated with Zod

---

## Definition of Done

- [ ] Interceptor implemented
- [ ] Refresh API function working
- [ ] Unit tests passing (100% coverage)
- [ ] Manual testing complete
- [ ] `yarn validate` passes

---

**Dependencies**: None

**Next Task**: [TASK-223](TASK-223-inactivity-timeout.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 3 hours

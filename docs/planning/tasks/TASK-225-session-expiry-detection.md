# TASK-225: Session Expiry Detection

**ID**: TASK-225 | **Title**: Check Refresh Token Expiry on App Launch
**User Story**: [US-038](../stories/US-038-session-management.md) | **Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Effort**: 1.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## Context & Background

On app launch, check if refresh token is expired. If expired, logout user before rendering authenticated screens.

---

## Objective

Implement:

1. JWT decode utility
2. Expiry check on app launch
3. Full logout flow for expired sessions

---

## Implementation

### JWT Decode Utility

**File**: `src/utils/jwt.ts`

```typescript
import { z } from 'zod';

const jwtPayloadSchema = z.object({
  exp: z.number(),
  sub: z.string(),
  email: z.string().email().optional(),
});

export const decodeJWT = (token: string): z.infer<typeof jwtPayloadSchema> => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64').toString('utf-8');
  const parsed = JSON.parse(decoded);

  const validation = jwtPayloadSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error('Invalid JWT payload');
  }

  return validation.data;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (error) {
    return true;
  }
};
```

### App Bootstrap Logic

**File**: Update `src/App.tsx`

```typescript
import { useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain';
import { isTokenExpired } from './utils/jwt';
import { clearAuth } from './store/auth/authSlice';

const App = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    try {
      const refreshTokenCredentials = await Keychain.getGenericPassword({
        service: 'auth_refresh_token',
      });

      if (!refreshTokenCredentials) {
        setIsAuthenticated(false);
        setIsBootstrapping(false);
        return;
      }

      const refreshToken = refreshTokenCredentials.password;

      if (isTokenExpired(refreshToken)) {
        await handleExpiredSession();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsBootstrapping(false);
    }
  };

  const handleExpiredSession = async () => {
    await Keychain.resetGenericPassword({ service: 'auth_access_token' });
    await Keychain.resetGenericPassword({ service: 'auth_refresh_token' });
    dispatch(clearAuth());
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

---

## Acceptance Criteria

- [ ] JWT decode extracts expiry claim
- [ ] isTokenExpired checks expiry
- [ ] App launch checks refresh token expiry
- [ ] Expired tokens trigger logout
- [ ] All tokens cleared

---

## Definition of Done

- [ ] JWT utilities implemented
- [ ] Bootstrap logic updated
- [ ] Unit tests passing (100% coverage)
- [ ] `yarn validate` passes

---

**Dependencies**: TASK-224

**Next Task**: [TASK-226](TASK-226-session-management-rntl-tests.md)

---

**Last Updated**: 2025-11-21
**Estimated Effort**: 1.5 hours

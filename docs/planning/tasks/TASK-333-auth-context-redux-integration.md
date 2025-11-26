# TASK-333: Create AuthContext with Redux Integration

**Task ID**: TASK-333
**Title**: Create AuthContext with Redux Integration
**User Story**: [US-060](../stories/US-060-auth-navigation-foundation.md) - Auth Navigation Foundation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: Critical
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25

---

## Context

AuthContext provides a thin React context layer over the existing Redux auth state. It subscribes to Redux selectors (no state duplication) and adds navigation-specific functionality like intended route tracking for post-login redirects.

**Why a Context?**:

- Navigation helpers (`intendedRoute`, `setIntendedRoute`) don't belong in Redux
- Provides clean API for components via `useAuth` hook
- Dispatches `checkSession()` on mount for session restoration
- Encapsulates auth-related logic in one place

**Architecture**:

```
AuthProvider (mounts)
    ↓
dispatches checkSession()
    ↓
Redux auth slice handles session check
    ↓
AuthContext subscribes to selectors (isAuthenticated, isLoading, user)
    ↓
Components consume via useAuth hook
```

---

## Objective

Create AuthContext with:

1. React context with typed value
2. AuthProvider component that wraps the app
3. Redux selector subscriptions (no state duplication)
4. Session check dispatch on mount
5. Intended route tracking state
6. Proper TypeScript types

**Deliverable**: Production-ready AuthContext following feature-first architecture.

---

## Implementation Guide

### AuthContext Interface

Create `src/features/Auth/context/AuthContext.tsx`:

```typescript
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@app/store/hooks';

import { checkSession, selectAuthLoading, selectIsAuthenticated, selectUser } from '../store';
import type { AuthState } from '../store';

/**
 * AuthContext Value Interface
 */
export interface AuthContextValue {
  // State (from Redux selectors)
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthState['user'];

  // Navigation helpers
  intendedRoute: string | null;
  setIntendedRoute: (route: string | null) => void;
  clearIntendedRoute: () => void;
}

/**
 * AuthContext
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Wraps the app to provide auth context.
 * - Subscribes to Redux auth selectors
 * - Dispatches checkSession on mount
 * - Tracks intended route for post-login redirect
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Subscribe to Redux selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);

  // Local state for intended route (navigation-specific, not in Redux)
  const [intendedRoute, setIntendedRouteState] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  // Navigation helpers
  const setIntendedRoute = useCallback((route: string | null) => {
    setIntendedRouteState(route);
  }, []);

  const clearIntendedRoute = useCallback(() => {
    setIntendedRouteState(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      intendedRoute,
      setIntendedRoute,
      clearIntendedRoute,
    }),
    [isAuthenticated, isLoading, user, intendedRoute, setIntendedRoute, clearIntendedRoute]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### Barrel Export

Create `src/features/Auth/context/index.ts`:

```typescript
export { AuthContext, AuthProvider } from './AuthContext';
export type { AuthContextValue } from './AuthContext';
```

### Update Feature Export

Update `src/features/Auth/index.ts` to include context exports:

```typescript
// Context
export { AuthContext, AuthProvider } from './context';
export type { AuthContextValue } from './context';
```

---

## Feature-First Structure

```
src/features/Auth/
├── context/
│   ├── AuthContext.tsx          # AuthContext and AuthProvider
│   ├── index.ts                 # Barrel export
│   └── __tests__/
│       └── AuthContext.rntl.tsx # Unit tests (TASK-337)
├── store/                       # Existing Redux slice
├── index.ts                     # Updated with context exports
└── ...
```

---

## Acceptance Criteria

- [ ] AuthContext created with typed value interface
- [ ] AuthProvider subscribes to Redux selectors
- [ ] checkSession dispatched on AuthProvider mount
- [ ] intendedRoute state managed correctly
- [ ] setIntendedRoute and clearIntendedRoute work
- [ ] Context value memoized to prevent re-renders
- [ ] Exported from feature barrel (`src/features/Auth/index.ts`)
- [ ] TypeScript types properly defined

---

## Security Checklist

- [ ] No tokens stored in context (only in SecureStore via Redux)
- [ ] User data from Redux selectors only
- [ ] No sensitive data logged

---

**Estimated Time**: 2 hours
**Last Updated**: 2025-11-25

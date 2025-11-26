# TASK-334: Create useAuth Hook

**Task ID**: TASK-334
**Title**: Create useAuth Hook
**User Story**: [US-060](../stories/US-060-auth-navigation-foundation.md) - Auth Navigation Foundation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: Critical
**Effort**: 0.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-333

---

## Context

The `useAuth` hook provides a clean API for components to consume auth context. It throws an error if used outside AuthProvider, ensuring proper usage.

**Why a Dedicated Hook?**:

- Clean API: `const { isAuthenticated } = useAuth()`
- Error boundary: Throws if AuthProvider missing
- Type safety: Returns typed `AuthContextValue`
- Convention: Standard React pattern for context consumption

---

## Objective

Create useAuth hook that:

1. Consumes AuthContext
2. Throws descriptive error if used outside AuthProvider
3. Returns typed AuthContextValue

**Deliverable**: Production-ready useAuth hook.

---

## Implementation Guide

### useAuth Hook

Create `src/features/Auth/hooks/useAuth.ts`:

````typescript
import { useContext } from 'react';

import { AuthContext } from '../context';
import type { AuthContextValue } from '../context';

/**
 * useAuth Hook
 *
 * Provides access to auth context.
 * Must be used within AuthProvider.
 *
 * @returns AuthContextValue
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, setIntendedRoute } = useAuth();
 *
 * if (!isAuthenticated) {
 *   setIntendedRoute('BookACall');
 *   navigation.navigate('Login');
 * }
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
````

### Barrel Export

Create `src/features/Auth/hooks/index.ts`:

```typescript
export { useAuth } from './useAuth';
```

### Update Feature Export

Update `src/features/Auth/index.ts` to include hooks exports:

```typescript
// Hooks
export { useAuth } from './hooks';
```

---

## Feature-First Structure

```
src/features/Auth/
├── hooks/
│   ├── useAuth.ts               # useAuth hook
│   ├── index.ts                 # Barrel export
│   └── __tests__/
│       └── useAuth.rntl.tsx     # Unit tests (TASK-337)
├── context/                     # AuthContext (TASK-333)
├── store/                       # Existing Redux slice
└── index.ts                     # Updated with hooks exports
```

---

## Acceptance Criteria

- [ ] useAuth hook created
- [ ] Throws error with clear message if used outside AuthProvider
- [ ] Returns AuthContextValue with correct types
- [ ] Exported from feature barrel (`src/features/Auth/index.ts`)
- [ ] JSDoc documentation included

---

**Estimated Time**: 0.5 hours
**Last Updated**: 2025-11-25

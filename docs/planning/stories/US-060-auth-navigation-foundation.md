# US-060: Auth Navigation Foundation

**ID**: US-060 | **Title**: Auth Navigation Foundation (AuthContext + ProtectedRoute)
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Critical | **Story Points**: 3 | **Effort**: 7h
**Created**: 2025-11-25 | **Assignee**: Warren de Leon

---

## User Story

**As a** developer building authentication features
**I want to** have a central auth context and screen-level protection mechanism
**So that** I can easily check auth status and guard protected screens across the app

---

## Context & Background

### Why This Story Matters

This is the foundation for all authentication navigation in the hybrid portfolio app. The app needs:

1. **Public content first**: Portfolio screens (Home, Profile, Education, Work Experience) accessible without login
2. **On-demand authentication**: Protected features (Book a Call, Chat) require auth when accessed
3. **Redirect handling**: Save intended destination before login, redirect after successful auth
4. **Single source of truth**: AuthContext subscribes to Redux, no state duplication

**Architecture Decision**: Single flat stack with `ProtectedRoute` HOC guards (not conditional AuthStack/AppStack).

**Navigation Flow**:

```
App Launch → Splash → Home (public portfolio)
                      ↓
      User navigates to protected screen (e.g., BookACall)
                      ↓
      ProtectedRoute checks isAuthenticated
                      ↓
      If not authenticated → Navigate to Login (save intended route)
                      ↓
      User logs in → Redirect to intended route
```

### Current State vs Desired State

**Current State**:

- Redux auth slice exists with login, register, logout, checkSession actions
- No AuthContext or ProtectedRoute mechanism
- No intended route tracking for post-login redirects

**Desired State**:

- AuthContext wrapping the app with Redux integration
- useAuth hook for consuming auth context
- ProtectedRoute HOC for screen-level guards
- Session check on app startup via AuthProvider
- Intended route tracking for post-login redirects

---

## Acceptance Criteria

### Functional Requirements

#### AuthContext (`src/features/Auth/context/AuthContext.tsx`)

- [ ] Creates React context with auth state from Redux selectors
- [ ] Subscribes to Redux selectors (no state duplication)
- [ ] Dispatches `checkSession()` on mount for session restoration
- [ ] Tracks intended destination for post-login redirect
- [ ] Provides `setIntendedRoute` and `clearIntendedRoute` functions
- [ ] Exports `AuthProvider` component

**AuthContext Interface**:

```typescript
interface AuthContextValue {
  // State (from Redux selectors)
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthState['user'];

  // Navigation helpers
  intendedRoute: string | null;
  setIntendedRoute: (route: string | null) => void;
  clearIntendedRoute: () => void;
}
```

#### useAuth Hook (`src/features/Auth/hooks/useAuth.ts`)

- [ ] Consumes AuthContext
- [ ] Throws error if used outside AuthProvider
- [ ] Returns AuthContextValue

#### ProtectedRoute HOC (`src/components/ProtectedRoute/ProtectedRoute.tsx`)

- [ ] Wraps screen components requiring authentication
- [ ] Checks `isAuthenticated` from useAuth hook
- [ ] If not authenticated: saves current route, navigates to Login
- [ ] Shows loading indicator while `isLoading` is true
- [ ] Returns null while redirecting (prevents flash)
- [ ] Renders wrapped component when authenticated

**ProtectedRoute Implementation**:

```typescript
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return (props: P) => {
    const { isAuthenticated, isLoading, setIntendedRoute } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        setIntendedRoute(route.name);
        navigation.navigate('Login');
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) return <LoadingIndicator />;
    if (!isAuthenticated) return null;
    return <WrappedComponent {...props} />;
  };
};
```

#### App Integration (`src/app/App.tsx`)

- [ ] AuthProvider wraps app content within PersistGate
- [ ] Session check triggered automatically on app mount

**Provider Hierarchy**:

```tsx
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </PersistGate>
</Provider>
```

### Non-Functional Requirements

#### Accessibility (EAA Compliance)

- [ ] Loading indicator accessible with role and label
- [ ] Screen reader announces loading state

#### Testing

- [ ] 100% RNTL coverage for AuthContext
- [ ] 100% RNTL coverage for useAuth hook
- [ ] 100% RNTL coverage for ProtectedRoute HOC
- [ ] Integration tests for redirect flow

---

## Feature-First File Structure

Following the project's feature-first architecture:

### Files to Create

| File                                               | Purpose                             |
| -------------------------------------------------- | ----------------------------------- |
| `src/features/Auth/context/AuthContext.tsx`        | Auth context with Redux integration |
| `src/features/Auth/context/index.ts`               | Context exports                     |
| `src/features/Auth/hooks/useAuth.ts`               | Hook for consuming auth context     |
| `src/features/Auth/hooks/index.ts`                 | Hooks exports                       |
| `src/components/ProtectedRoute/ProtectedRoute.tsx` | HOC for screen-level auth guards    |
| `src/components/ProtectedRoute/index.ts`           | Component export                    |

### Files to Modify

| File                                     | Changes                         |
| ---------------------------------------- | ------------------------------- |
| `src/app/App.tsx`                        | Wrap with AuthProvider          |
| `src/features/Auth/index.ts`             | Export AuthProvider, useAuth    |
| `src/components/index.ts`                | Export ProtectedRoute, withAuth |
| `src/test-utils/renderWithProviders.tsx` | Add AuthProvider wrapper        |

### Test Files to Create

| File                                                              | Purpose                  |
| ----------------------------------------------------------------- | ------------------------ |
| `src/features/Auth/context/__tests__/AuthContext.rntl.tsx`        | AuthContext unit tests   |
| `src/features/Auth/hooks/__tests__/useAuth.rntl.tsx`              | useAuth hook tests       |
| `src/components/ProtectedRoute/__tests__/ProtectedRoute.rntl.tsx` | ProtectedRoute HOC tests |

---

## Tasks

### Task Breakdown (5 tasks, 7h total)

| ID                                                              | Task                                      | Status   | Effort | Priority | Dependencies                 |
| --------------------------------------------------------------- | ----------------------------------------- | -------- | ------ | -------- | ---------------------------- |
| [TASK-333](../tasks/TASK-333-auth-context-redux-integration.md) | Create AuthContext with Redux Integration | 📋 To Do | 2h     | Critical | None                         |
| [TASK-334](../tasks/TASK-334-use-auth-hook.md)                  | Create useAuth Hook                       | 📋 To Do | 0.5h   | Critical | TASK-333                     |
| [TASK-335](../tasks/TASK-335-protected-route-hoc.md)            | Create ProtectedRoute HOC                 | 📋 To Do | 1.5h   | Critical | TASK-334                     |
| [TASK-336](../tasks/TASK-336-session-check-app-startup.md)      | Integrate Session Check on App Startup    | 📋 To Do | 1h     | High     | TASK-333                     |
| [TASK-337](../tasks/TASK-337-auth-navigation-rntl-tests.md)     | Auth Navigation RNTL Tests                | 📋 To Do | 2h     | High     | TASK-333, TASK-334, TASK-335 |

**Total Effort**: 7 hours

**Dependency Chain**:

```
TASK-333 (AuthContext) → TASK-334 (useAuth) → TASK-335 (ProtectedRoute)
                       → TASK-336 (Session Check)
                                             → TASK-337 (Tests)
```

---

## Definition of Done

**Functional**:

- [ ] AuthContext created with Redux integration
- [ ] useAuth hook works correctly
- [ ] ProtectedRoute HOC redirects unauthenticated users
- [ ] Session restored on app startup
- [ ] Intended route saved before redirect
- [ ] Post-login redirect to intended route

**Quality**:

- [ ] 100% RNTL coverage for all new code
- [ ] `yarn validate` passes (typecheck, lint, test)
- [ ] Zero ESLint errors or warnings
- [ ] Zero TypeScript errors

**Accessibility**:

- [ ] Loading indicators accessible
- [ ] Screen reader compatible

**Architecture**:

- [ ] Follows feature-first organisation
- [ ] Proper barrel exports
- [ ] No Redux state duplication in context

---

## Risk Assessment

### Technical Risks

| Risk                     | Probability | Impact | Mitigation                       |
| ------------------------ | ----------- | ------ | -------------------------------- |
| Context re-renders       | Medium      | Medium | Use useMemo for context value    |
| Redux selector changes   | Low         | Low    | Subscribe to primitive selectors |
| Navigation timing issues | Medium      | High   | Use useEffect with proper deps   |

---

**Last Updated**: 2025-11-25
**Story Points**: 3 (based on planning)
**Priority**: Critical (foundation for all login flows)

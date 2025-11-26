# TASK-335: Create ProtectedRoute HOC

**Task ID**: TASK-335
**Title**: Create ProtectedRoute HOC
**User Story**: [US-060](../stories/US-060-auth-navigation-foundation.md) - Auth Navigation Foundation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: ⏳ In Progress
**Priority**: Critical
**Effort**: 1.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-334

---

## Context

The `ProtectedRoute` HOC (Higher-Order Component) wraps screens that require authentication. It provides screen-level guards that redirect unauthenticated users to Login, saving their intended destination for post-login redirect.

**Why HOC Pattern?**:

- Clean usage: `export default withAuth(BookACallScreen)`
- Consistent behaviour across protected screens
- Handles loading states and redirects transparently
- Works with React Navigation's screen components

**Flow**:

```
User navigates to protected screen
    ↓
ProtectedRoute checks isAuthenticated
    ↓
If loading: Show loading indicator
    ↓
If not authenticated:
  - Save current route as intended destination
  - Navigate to Login
  - Return null (prevent flash)
    ↓
If authenticated: Render wrapped component
```

---

## Objective

Create ProtectedRoute HOC that:

1. Wraps screen components requiring authentication
2. Checks isAuthenticated from useAuth hook
3. Shows loading indicator while checking auth
4. Saves intended route and redirects to Login if unauthenticated
5. Renders wrapped component when authenticated
6. Full EAA accessibility compliance

**Deliverable**: Production-ready ProtectedRoute HOC in shared components.

---

## Implementation Guide

### ProtectedRoute HOC

Create `src/components/ProtectedRoute/ProtectedRoute.tsx`:

````typescript
import React, { useEffect } from 'react';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@app/features/Auth';
import type { RootStackParamList } from '@app/navigation/RootNavigator/types';

/**
 * Loading Indicator Component
 * EAA Compliant with proper accessibility
 */
const LoadingIndicator: React.FC = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    accessibilityRole="progressbar"
    accessibilityLabel="Checking authentication status"
  >
    <ActivityIndicator size="large" />
  </View>
);

/**
 * withAuth Higher-Order Component
 *
 * Wraps screen components to require authentication.
 * Redirects to Login if not authenticated, saving intended route.
 *
 * @param WrappedComponent - Screen component to protect
 * @returns Protected screen component
 *
 * @example
 * ```tsx
 * // In screen file
 * const BookACallScreen: React.FC = () => { ... };
 * export default withAuth(BookACallScreen);
 *
 * // In navigator
 * <Stack.Screen name="BookACall" component={BookACallScreen} />
 * ```
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const ProtectedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, setIntendedRoute } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const route = useRoute();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Save intended destination for post-login redirect
        setIntendedRoute(route.name);
        // Navigate to Login
        navigation.navigate('Login');
      }
    }, [isAuthenticated, isLoading, navigation, route.name, setIntendedRoute]);

    // Show loading while checking auth status
    if (isLoading) {
      return <LoadingIndicator />;
    }

    // Return null while redirecting to prevent flash
    if (!isAuthenticated) {
      return null;
    }

    // Render protected screen when authenticated
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ProtectedComponent.displayName = `withAuth(${wrappedName})`;

  return ProtectedComponent;
};
````

### Barrel Export

Create `src/components/ProtectedRoute/index.ts`:

```typescript
export { withAuth } from './ProtectedRoute';
```

### Update Components Export

Update `src/components/index.ts`:

```typescript
export { withAuth } from './ProtectedRoute';
```

---

## File Structure

```
src/components/
├── ProtectedRoute/
│   ├── ProtectedRoute.tsx       # withAuth HOC
│   ├── index.ts                 # Barrel export
│   └── __tests__/
│       └── ProtectedRoute.rntl.tsx # Unit tests (TASK-337)
└── index.ts                     # Updated exports
```

---

## Usage in Navigator

```typescript
// src/navigation/RootNavigator/RootNavigator.tsx
import { BookACallScreen } from '@app/features/BookACall';
import { withAuth } from '@app/components';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <Stack.Navigator>
    {/* Public screens */}
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />

    {/* Auth screens */}
    <Stack.Screen name="Login" component={LoginScreen} />

    {/* Protected screens */}
    <Stack.Screen name="BookACall" component={withAuth(BookACallScreen)} />
    <Stack.Screen name="Chat" component={withAuth(ChatScreen)} />
  </Stack.Navigator>
);
```

---

## Acceptance Criteria

- [ ] withAuth HOC created
- [ ] Shows loading indicator while isLoading
- [ ] Saves intended route before redirect
- [ ] Navigates to Login when not authenticated
- [ ] Returns null while redirecting (no flash)
- [ ] Renders wrapped component when authenticated
- [ ] Display name set for debugging
- [ ] EAA compliant loading indicator
- [ ] Exported from components barrel (`src/components/index.ts`)

---

## Accessibility Checklist

- [ ] Loading indicator has `accessibilityRole="progressbar"`
- [ ] Loading indicator has descriptive `accessibilityLabel`
- [ ] No visual flash during redirect

---

**Estimated Time**: 1.5 hours
**Last Updated**: 2025-11-25

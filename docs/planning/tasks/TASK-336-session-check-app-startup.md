# TASK-336: Integrate Session Check on App Startup

**Task ID**: TASK-336
**Title**: Integrate Session Check on App Startup
**User Story**: [US-060](../stories/US-060-auth-navigation-foundation.md) - Auth Navigation Foundation
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md) - Login & Session Management
**Status**: 📋 To Do
**Priority**: High
**Effort**: 1 hour
**Owner**: Warren de Leon
**Created**: 2025-11-25
**Dependencies**: TASK-333

---

## Context

When the app starts, we need to check if the user has an existing valid session. This allows users who selected "Remember Me" to resume their session without re-logging in.

**Session Restoration Flow**:

```
App starts
    ↓
AuthProvider mounts
    ↓
Dispatches checkSession()
    ↓
Redux thunk checks SecureStore for tokens
    ├── If tokens exist: Loads user from EncryptedStore → isAuthenticated: true
    └── If no tokens: isAuthenticated: false
    ↓
isLoading: false → App renders normally
```

**Note**: The `checkSession()` action already exists in the Redux auth slice. This task integrates it with the AuthProvider.

---

## Objective

Integrate AuthProvider into the app component hierarchy so that:

1. AuthProvider wraps the app content
2. Session check happens automatically on mount
3. App renders normally after session check completes

**Deliverable**: App.tsx updated with AuthProvider integration.

---

## Implementation Guide

### Update App.tsx

Modify `src/app/App.tsx`:

```typescript
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { AuthProvider } from '@app/features/Auth';
import { RootNavigator } from '@app/navigation/RootNavigator';
import { store, persistor } from '@app/store';
import { config } from '@app/config/gluestack-ui.config';

/**
 * App Component
 *
 * Provider Hierarchy:
 * 1. Redux Provider (state management)
 * 2. PersistGate (redux-persist hydration)
 * 3. AuthProvider (auth context + session check)
 * 4. GluestackUIProvider (UI theming)
 * 5. NavigationContainer (navigation)
 * 6. RootNavigator (screens)
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <GluestackUIProvider config={config}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </GluestackUIProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
```

### Provider Order Rationale

1. **Redux Provider**: Must be outermost for state access
2. **PersistGate**: Waits for redux-persist to rehydrate
3. **AuthProvider**: After persist so checkSession has access to persisted state
4. **GluestackUIProvider**: UI theming for all components
5. **NavigationContainer**: Navigation context
6. **RootNavigator**: Actual screens

---

## Acceptance Criteria

- [ ] AuthProvider added to App.tsx
- [ ] AuthProvider positioned after PersistGate, before UI providers
- [ ] checkSession dispatched on app startup (via AuthProvider mount)
- [ ] App renders normally after session check
- [ ] Existing functionality unchanged

---

## Testing

Verify session restoration:

1. Log in with "Remember Me" checked
2. Force quit and reopen app
3. Verify user is still authenticated (no login required)

Verify no session:

1. Clear app data
2. Open app
3. Verify user is not authenticated (isAuthenticated: false)

---

**Estimated Time**: 1 hour
**Last Updated**: 2025-11-25

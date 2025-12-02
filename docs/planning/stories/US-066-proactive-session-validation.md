# US-066: Proactive Session Validation

**ID**: US-066 | **Title**: Proactive Session Validation Before Secure Screen Access
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: High | **Story Points**: 5 | **Effort**: 8.5h
**Created**: 2025-11-27 | **Assignee**: Warren de Leon

---

## User Story

**As a** logged-in user accessing secure features (Book a Call, Chat)
**I want** the app to proactively validate and refresh my session before entering secure screens
**So that** I never encounter authentication failures mid-task and my experience remains smooth

---

## Context & Background

### Why This Story Matters

The current session management (US-038) uses a **reactive** approach: tokens are refreshed only when an API call returns a 401 Unauthorized error. This works but creates a suboptimal experience:

1. **User is already mid-action** when the 401 occurs (e.g., submitting a booking form)
2. **Visible delays** while the interceptor refreshes tokens and retries the request
3. **Edge cases** where the refresh token might expire between entering a screen and making an API call
4. **No pre-emptive checks** before token expiry (user might have a token that expires in 30 seconds)

A **proactive** approach validates the session _before_ the user enters secure screens:

```
User navigates to BookACall screen
  → ensureValidSession() called
  → Check: Is access token expired or about to expire (<5 minutes)?
  → If yes: Refresh tokens proactively
  → If refresh fails: Navigate to Login (before user starts filling forms)
  → If success: Enter secure screen with fresh tokens
  → User completes task without interruption
```

### Current State vs Desired State

**Current State** (Reactive - US-038):

- Axios interceptor catches 401 errors _after_ they occur
- Token validity checked only when API calls fail
- User might start a form, submit, then see a brief loading state during refresh
- If refresh token expired, user loses form progress

**Desired State** (Proactive - This Story):

- `ensureValidSession()` function validates session before secure screen entry
- Proactive refresh if token expires within 5 minutes
- Failed session validation navigates to Login _before_ user starts tasks
- Secure screens always entered with fresh, valid tokens
- Zero authentication failures during secure screen interactions

### Success Metrics

| Metric                      | Target    | Why It Matters                                          |
| --------------------------- | --------- | ------------------------------------------------------- |
| In-Session Auth Failures    | 0         | No 401s during secure screen use                        |
| Proactive Refresh Rate      | 100%      | All nearly-expired tokens refreshed before screen entry |
| Failed Session → Login Time | <500ms    | Quick redirect if session invalid                       |
| Token Expiry Buffer         | 5 minutes | Refresh well before actual expiry                       |

---

## Acceptance Criteria

### Functional Requirements

#### ensureValidSession() Function

- [ ] Create `ensureValidSession()` async function in auth API layer
- [ ] Function checks:
  1. Refresh token exists in SecureStore
  2. Refresh token is not expired (decode JWT, check `exp` claim)
  3. Access token exists and is valid, OR
  4. Access token expired/expiring soon → proactively refresh
- [ ] "Expiring soon" defined as: token expires within 5 minutes
- [ ] On successful validation/refresh:
  - [ ] Store new tokens in SecureStore
  - [ ] Return `{ valid: true, user: SupabaseUser }`
- [ ] On failed validation:
  - [ ] Clear all tokens from SecureStore
  - [ ] Clear encrypted user data
  - [ ] Return `{ valid: false, reason: string }`

#### Integration with ProtectedRoute

- [ ] ProtectedRoute HOC calls `ensureValidSession()` before allowing navigation
- [ ] Show brief loading state during validation (<300ms typical)
- [ ] If validation fails:
  - [ ] Save intended route for post-login redirect
  - [ ] Navigate to Login screen
  - [ ] Show appropriate error message based on reason:
    - "Session expired" for expired refresh token
    - "Please log in" for missing tokens
- [ ] If validation succeeds:
  - [ ] Proceed to secure screen with fresh tokens

#### Secure Screen Integration

- [ ] BookACallScreen wrapped with ProtectedRoute
- [ ] ChatScreen wrapped with ProtectedRoute
- [ ] Any future secure screens follow same pattern
- [ ] Validation occurs on every navigation to secure screen (not cached)

#### Error Handling

- [ ] **Network error during refresh**: Retry up to 3 times with exponential backoff
- [ ] **Refresh token expired**: Clear session, navigate to Login
- [ ] **Malformed JWT**: Treat as expired, clear session
- [ ] **SecureStore read failure**: Log error, treat as no session

### Non-Functional Requirements

#### Performance

- [ ] `ensureValidSession()` completes in <500ms (typical: <200ms)
- [ ] JWT decode <10ms
- [ ] SecureStore read <50ms
- [ ] Token refresh API call <2 seconds (network dependent)

#### Security

- [ ] Tokens remain in SecureStore (hardware-backed)
- [ ] No tokens in memory longer than necessary
- [ ] All API responses validated with Zod
- [ ] Session cleared completely on any auth failure

#### Accessibility (EAA Compliance)

- [ ] Loading state during validation is accessible (announced by screen reader)
- [ ] Error messages use `accessibilityLiveRegion="assertive"`
- [ ] Session expiry message clearly communicates what happened

---

## Implementation Phases

### Phase 1: ensureValidSession() Function (3 hours)

**Task**: [TASK-369](../tasks/TASK-369-ensure-valid-session.md)

**Objective**: Create the core session validation function.

**Deliverables**:

- `ensureValidSession()` function in `src/features/Auth/api/`
- JWT decode utility with expiry buffer check
- Proactive token refresh logic
- Comprehensive error handling
- Zod schema for validation response

**Implementation Details**:

```typescript
// src/features/Auth/api/ensureValidSession.ts
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';
import { decodeJWT, isTokenExpiringSoon } from '../utils/jwt';
import { refreshAccessToken } from './refresh';
import { getCurrentUser } from './api';

const EXPIRY_BUFFER_MINUTES = 5;

export interface SessionValidationResult {
  valid: boolean;
  user?: SupabaseUser;
  reason?: 'expired' | 'missing' | 'refresh_failed' | 'network_error';
}

export const ensureValidSession = async (): Promise<SessionValidationResult> => {
  try {
    // 1. Check refresh token exists
    const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
    if (!refreshToken) {
      return { valid: false, reason: 'missing' };
    }

    // 2. Check refresh token not expired
    if (isTokenExpired(refreshToken)) {
      await clearSession();
      return { valid: false, reason: 'expired' };
    }

    // 3. Check access token
    const accessToken = await SecureStore.getItemAsync('auth_access_token');

    // 4. If no access token or expiring soon, refresh proactively
    if (!accessToken || isTokenExpiringSoon(accessToken, EXPIRY_BUFFER_MINUTES)) {
      const refreshResult = await refreshAccessToken(refreshToken);
      if (!refreshResult.success) {
        await clearSession();
        return { valid: false, reason: 'refresh_failed' };
      }
      // Tokens already stored by refreshAccessToken
    }

    // 5. Validate with server (get current user)
    const user = await getCurrentUser();
    if (!user) {
      await clearSession();
      return { valid: false, reason: 'expired' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('[ensureValidSession] Error:', error);
    return { valid: false, reason: 'network_error' };
  }
};
```

**Acceptance Criteria**:

- [ ] Function checks refresh token existence
- [ ] Function checks refresh token expiry
- [ ] Function proactively refreshes if access token expiring within 5 minutes
- [ ] Function validates session with server
- [ ] Proper error handling for all scenarios
- [ ] Session cleared on any auth failure

**Effort**: 3h

---

### Phase 2: ProtectedRoute Integration (2 hours)

**Task**: [TASK-369](../tasks/TASK-369-ensure-valid-session.md) (continued)

**Objective**: Integrate proactive validation into ProtectedRoute HOC.

**Deliverables**:

- Updated ProtectedRoute to call `ensureValidSession()`
- Loading state during validation
- Error handling with appropriate redirects
- Integration with AuthContext for intended route tracking

**Implementation Details**:

```typescript
// src/features/Auth/components/ProtectedRoute.tsx (updated)
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = <LoadingSpinner />
}) => {
  const { setIntendedRoute } = useAuth();
  const navigation = useNavigation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      setIsValidating(true);
      const result = await ensureValidSession();

      if (result.valid) {
        setIsValid(true);
      } else {
        // Save intended route for post-login redirect
        setIntendedRoute(currentRoute);

        // Navigate to login with appropriate message
        navigation.reset({
          index: 0,
          routes: [{
            name: 'Login',
            params: {
              message: result.reason === 'expired'
                ? 'Your session has expired. Please log in again.'
                : 'Please log in to continue.'
            }
          }],
        });
      }

      setIsValidating(false);
    };

    validateSession();
  }, []);

  if (isValidating) {
    return fallback;
  }

  if (!isValid) {
    return null; // Navigation already triggered
  }

  return <>{children}</>;
};
```

**Acceptance Criteria**:

- [ ] ProtectedRoute calls `ensureValidSession()` on mount
- [ ] Loading state shown during validation
- [ ] Failed validation triggers Login navigation
- [ ] Intended route saved for post-login redirect
- [ ] Appropriate error messages passed to Login screen

**Effort**: 2h

---

### Phase 3: Comprehensive Auth Flow Documentation (2.5 hours)

**Task**: [TASK-370](../tasks/TASK-370-auth-flow-documentation.md)

**Objective**: Document the complete authentication flow with visual aids.

**Deliverables**:

- `docs/readme/AUTH_FLOW.md` - Comprehensive auth flow documentation
- Visual diagrams (Mermaid):
  - Login flow (email/password, OAuth, magic link)
  - Token lifecycle diagram
  - Session management flow
  - Proactive vs reactive refresh comparison
- Documentation sections:
  - Login flow (all methods)
  - Registration flow
  - Token storage and security
  - Refresh conditions and timing
  - Logout conditions (manual and automatic)
  - Error handling scenarios
- Architecture Decision Records (ADRs) for key decisions

**Acceptance Criteria**:

- [ ] Complete auth flow documented with diagrams
- [ ] All login methods explained
- [ ] Token storage security documented
- [ ] Refresh conditions clearly listed
- [ ] Logout scenarios documented
- [ ] Visual aids (Mermaid diagrams) included

**Effort**: 2.5h

---

### Phase 4: RNTL Tests (1 hour)

**Task**: [TASK-369](../tasks/TASK-369-ensure-valid-session.md) (testing)

**Objective**: Write comprehensive unit tests.

**Test Files**:

- `src/features/Auth/api/__tests__/ensureValidSession.rntl.tsx`
- `src/features/Auth/components/__tests__/ProtectedRoute.rntl.tsx` (update)

**Test Coverage**:

```gherkin
Feature: Proactive Session Validation

  Scenario: Valid session allows screen access
    Given user has valid refresh and access tokens
    And access token expires in 30 minutes
    When ensureValidSession is called
    Then it should return { valid: true, user: {...} }
    And no token refresh should occur

  Scenario: Expiring access token triggers proactive refresh
    Given user has valid refresh token
    And access token expires in 3 minutes
    When ensureValidSession is called
    Then tokens should be refreshed proactively
    And new tokens should be stored
    And it should return { valid: true, user: {...} }

  Scenario: Expired refresh token clears session
    Given user has expired refresh token
    When ensureValidSession is called
    Then session should be cleared
    And it should return { valid: false, reason: 'expired' }

  Scenario: Missing tokens returns invalid
    Given no tokens exist in SecureStore
    When ensureValidSession is called
    Then it should return { valid: false, reason: 'missing' }

  Scenario: Network error during refresh
    Given user has valid refresh token
    And access token is expired
    And network is unavailable
    When ensureValidSession is called
    Then it should retry 3 times
    And it should return { valid: false, reason: 'network_error' }
```

**Acceptance Criteria**:

- [ ] 100% coverage for `ensureValidSession()`
- [ ] All edge cases tested
- [ ] Mock SecureStore and API calls properly
- [ ] ProtectedRoute tests updated

**Effort**: 1h

---

## Tasks

### Task Breakdown (2 tasks, 8.5h total)

| ID                                                       | Task                                                        | Status   | Effort | Priority | Dependencies       |
| -------------------------------------------------------- | ----------------------------------------------------------- | -------- | ------ | -------- | ------------------ |
| [TASK-369](../tasks/TASK-369-ensure-valid-session.md)    | Implement ensureValidSession() + ProtectedRoute Integration | 📋 To Do | 6h     | High     | TASK-333, TASK-335 |
| [TASK-370](../tasks/TASK-370-auth-flow-documentation.md) | Comprehensive Auth Flow Documentation                       | 📋 To Do | 2.5h   | Medium   | TASK-369           |

**Total Effort**: 8.5 hours

**Dependency Chain**:

```
TASK-333 (AuthContext) → TASK-335 (ProtectedRoute) → TASK-369 (ensureValidSession)
                                                           ↓
                                                    TASK-370 (Documentation)
```

---

## Benefits

### Technical Benefits

#### Reliability

- **Zero mid-action auth failures**: Session validated before user starts tasks
- **Proactive token refresh**: Tokens refreshed before they expire, not after 401
- **Predictable behaviour**: Same validation path for all secure screens

#### Code Quality

- **Centralised validation**: Single `ensureValidSession()` function for all secure screens
- **Separation of concerns**: ProtectedRoute handles auth, screens handle features
- **Type-safe**: Full TypeScript types for validation results

#### Security

- **Fresh tokens guaranteed**: Secure screens always accessed with recently validated tokens
- **Failed sessions caught early**: No lingering invalid sessions
- **Clear session cleanup**: All tokens removed on any auth failure

### User Experience Benefits

#### Seamless Flow

- **No form data loss**: Users redirected to Login before filling forms
- **Quick validation**: Typical validation <200ms (imperceptible)
- **Clear communication**: Appropriate messages for each failure scenario

#### Trust & Reliability

- **Consistent behaviour**: Auth always works or redirects immediately
- **No surprise logouts**: Session issues caught at screen entry, not mid-task

---

## Risks & Mitigation Strategies

### Implementation Risks

#### Risk 1: Excessive API calls

- **Likelihood**: Medium
- **Impact**: Medium
- **Description**: Calling `ensureValidSession()` on every secure screen navigation might create too many API calls
- **Mitigation Strategy**:
  - Cache validation result for 30 seconds (same session context)
  - Only call `getCurrentUser()` if tokens appear valid locally
  - Most validations will be local JWT checks (fast, no network)
- **Contingency Plan**: Add configurable throttling if needed

#### Risk 2: Race conditions with reactive interceptor

- **Likelihood**: Low
- **Impact**: Medium
- **Description**: Proactive validation and reactive interceptor might both try to refresh tokens simultaneously
- **Mitigation Strategy**:
  - Use mutex/lock for token refresh operations
  - Existing interceptor already handles concurrent 401s
- **Contingency Plan**: Disable proactive refresh if conflicts detected

### Performance Risks

#### Risk 1: Validation delay on secure screen entry

- **Likelihood**: Low
- **Impact**: Low
- **Description**: Users might perceive slight delay when entering secure screens
- **Mitigation Strategy**:
  - Show subtle loading indicator
  - Cache validation for recent navigations
  - Optimise JWT decode and SecureStore access
- **Contingency Plan**: Make validation async (optimistic navigation)

---

## Definition of Done

**Functional**:

- [ ] `ensureValidSession()` validates session correctly
- [ ] Proactive refresh triggers for tokens expiring within 5 minutes
- [ ] ProtectedRoute integrates with validation
- [ ] Failed validation redirects to Login with message
- [ ] Intended route saved for post-login redirect

**Quality**:

- [ ] 100% RNTL coverage for new code
- [ ] `yarn validate` passes
- [ ] Zero ESLint/TypeScript errors

**Documentation**:

- [ ] `docs/readme/AUTH_FLOW.md` created with comprehensive documentation
- [ ] Visual diagrams (Mermaid) included
- [ ] All auth scenarios documented
- [ ] JSDoc comments on new functions

**Security**:

- [ ] Tokens remain in SecureStore only
- [ ] Session cleared completely on auth failure
- [ ] All API responses validated with Zod

---

## Dependencies

### Upstream Dependencies

- **US-060** (Auth Navigation Foundation) - AuthContext and ProtectedRoute must exist
- **US-038** (Session Management) - Token refresh infrastructure must exist
- **Supabase Auth API** - Must support token refresh and getCurrentUser

### Downstream Dependencies

- **All secure screens** - Will use ProtectedRoute with proactive validation
- **Future auth features** - Will build on this validation infrastructure

---

**Last Updated**: 2025-11-27
**Story Points**: 5 (moderate complexity with integration)
**Priority**: High (improves auth reliability for secure features)
**Next Review**: Before implementation start

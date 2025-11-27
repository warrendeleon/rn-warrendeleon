# EPIC-022: Login & Session Management

**Epic ID**: EPIC-022
**Title**: Login & Session Management (Email, LinkedIn, Magic Link, Biometric Re-Auth)
**Status**: ⏳ In Progress | **Priority**: Critical | **Created**: 2025-11-21
**Owner**: Warren de Leon | **Category**: Authentication
**Timeline**: 2-3 weeks | **Effort**: 62 hours
**Dependencies**: EPIC-021 (Registration must be complete first)

---

## Executive Summary

Build comprehensive login and session management system supporting multiple authentication methods (email/password, LinkedIn OAuth, magic link), automatic token refresh, biometric re-authentication on app resume, and session expiry handling.

### Architecture Decision: Portfolio-First with Screen-Level Guards

**App Type**: Hybrid app with public portfolio content + authenticated features (Book a Call, Chat).

**Navigation Strategy**: Single flat stack with `ProtectedRoute` HOC guards (not conditional AuthStack/AppStack).

**Rationale**:

- Public portfolio screens remain accessible without login
- No navigation state reset when auth status changes
- Simpler redirect handling with `intendedRoute` tracking
- Better UX for hybrid public/authenticated apps

**Flow**:

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

**Key Features**:

- Multi-method login: Email/password, LinkedIn OAuth, passwordless magic link
- Biometric re-authentication: Face ID, Touch ID, Fingerprint, or PIN fallback
- Automatic token refresh: Transparent session extension (30-day refresh tokens)
- Inactivity timeout: Auto-logout after 5 minutes idle
- Remember Me: Persistent login across app restarts
- Session expiry: Graceful handling with re-login prompt

**Business Impact**:

Seamless, secure login experience that balances convenience (biometric re-auth, magic link) with enterprise-grade security (token refresh, session management).

**Success Metrics**:

| Metric                     | Target     | Why It Matters                       |
| -------------------------- | ---------- | ------------------------------------ |
| Login Success Rate         | 95%+       | Measures authentication reliability  |
| Biometric Re-Auth Adoption | 70%+       | Indicates user trust and convenience |
| Avg Login Time             | <5 seconds | User experience benchmark            |
| Token Refresh Success      | 99%+       | Prevents unexpected logouts          |
| Session Expiry Handling    | 100%       | Ensures users never lose data        |

---

## Problem Statement

### Why This Epic Matters

Users expect modern mobile apps to provide:

1. **Quick access**: Biometric re-auth (no password typing on app resume)
2. **Multiple login options**: Email, social (LinkedIn), passwordless (magic link)
3. **Persistent sessions**: No re-login for days/weeks (until token expires)
4. **Security without friction**: Automatic token refresh, inactivity timeout

**Current State**: No login system exists (fresh app post-registration).

**Desired State**: Complete login flow with:

- Email/password authentication via Supabase Auth API
- LinkedIn OAuth integration (reuse from registration)
- Magic link passwordless authentication
- Biometric re-authentication on app resume (Face ID/Fingerprint/PIN)
- Automatic token refresh using Axios interceptors
- Session expiry detection and handling
- Inactivity timeout (auto-logout after 5 minutes idle)
- Remember Me checkbox for persistent login

### What We're Building

**Core Login Flows**:

1. **Email/Password Login**:
   - User enters email/password → Validates with Yup → Calls Supabase Auth API → Stores tokens in Keychain → Navigates to Home

2. **LinkedIn OAuth Login**:
   - User taps "Continue with LinkedIn" → Browser opens LinkedIn authorization → Redirect callback → Extract tokens → Store in Keychain → Navigate to Home

3. **Magic Link Login**:
   - User enters email → Calls Supabase to send magic link email → User taps link in email → App handles deep link → Extracts tokens → Store in Keychain → Navigate to Home

4. **Biometric Re-Authentication** (returning users):
   - User opens app → App detects existing session → Prompts biometric (Face ID/Fingerprint) or PIN → On success, resume session → Navigate to Home

5. **Token Refresh** (automatic):
   - User makes API request → Access token expired → Axios interceptor detects 401 → Uses refresh token to get new access token → Retries original request → User unaware

6. **Session Expiry**:
   - Refresh token expired (30 days) → Show "Session expired" modal → Navigate to Login → User logs in again

7. **Inactivity Timeout**:
   - User idle for 5 minutes → Auto-logout → Clear tokens from Keychain → Navigate to Login

### Success Criteria

**Functional**:

- [ ] All 4 login methods work (email, LinkedIn, magic link, biometric re-auth)
- [ ] Token refresh automatic and transparent
- [ ] Session expiry handled gracefully
- [ ] Inactivity timeout triggers correctly
- [ ] Remember Me persists across app restarts

**Non-Functional**:

- [ ] Login time <5 seconds (95th percentile)
- [ ] Zero token refresh failures due to code bugs
- [ ] No user data loss on session expiry
- [ ] EAA compliance for all UI elements
- [ ] 100% RNTL + E2E test coverage

---

## Business Value

**Problem**: Users need quick, secure login with minimal friction.

**Opportunity**:

- **Email/password**: Standard authentication for traditional users
- **LinkedIn OAuth**: One-tap login for professionals (reuse existing credentials)
- **Magic link**: Passwordless experience (no password to remember/type)
- **Biometric re-auth**: Instant access on app resume (Face ID/Fingerprint)
- **Token refresh**: No re-login for 30 days (seamless session extension)
- **Inactivity timeout**: Security without manual logout

**Target Users**:

- Primary: Returning users who registered via EPIC-021
- Secondary: New users who navigate directly to Login

**ROI**:

- **Reduced friction**: Biometric re-auth eliminates password entry on app resume
- **Increased retention**: Persistent sessions reduce login fatigue
- **Security confidence**: Enterprise-grade token management builds trust
- **Professional appeal**: LinkedIn OAuth attracts professional users

---

## Scope

### In Scope

**Authentication Methods**:

- Email/password login (Supabase Auth API)
- LinkedIn OAuth login (OAuth 2.0 PKCE)
- Magic link login (passwordless via Supabase)
- Biometric re-authentication (Face ID, Touch ID, Fingerprint, PIN fallback)

**Session Management**:

- Automatic token refresh using Axios interceptors
- Refresh token expiry handling (30-day lifetime)
- Session expiry detection and re-login prompt
- Inactivity timeout (auto-logout after 5 minutes idle)
- App state listener (detect app resume, trigger biometric re-auth)
- Remember Me checkbox (persistent login across restarts)

**UI/UX**:

- Login screen with tabs (Email/Password, Magic Link)
- "Continue with LinkedIn" button
- "Forgot Password?" link (navigates to EPIC-024)
- Remember Me checkbox
- Session expiry modal ("Your session has expired. Please log in again.")
- Biometric re-auth modal (on app resume)

**Security**:

- Tokens stored in Keychain (hardware-backed, iOS/Android)
- No tokens in Redux (state cleared on logout)
- Zod validation for all API responses
- Yup validation for all user inputs
- HTTPS-only API communication

**Testing**:

- 100% RNTL coverage for all components/hooks
- E2E tests for all login flows (Detox + Cucumber)
- Token refresh scenario tests
- Session expiry scenario tests
- Inactivity timeout tests

### Out of Scope

- Password recovery flow (handled in EPIC-024)
- Security settings (handled in EPIC-023: change password, enable/disable biometric, etc.)
- Registration flow (handled in EPIC-021)
- Multi-factor authentication (future epic)
- Social login beyond LinkedIn (Google, Apple ID - future epics)

---

## User Stories

| ID                                                          | User Story                                                | Status         | Story Points | Effort |
| ----------------------------------------------------------- | --------------------------------------------------------- | -------------- | ------------ | ------ |
| [US-060](../stories/US-060-auth-navigation-foundation.md)   | Auth Navigation Foundation (AuthContext + ProtectedRoute) | ⏳ In Progress | 3            | 7h     |
| [US-036](../stories/US-036-email-password-login.md)         | Email/Password Login                                      | 📋 To Do       | 5            | 11h    |
| [US-037](../stories/US-037-magic-link-login.md)             | Magic Link Login                                          | 📋 To Do       | 4            | 7.5h   |
| [US-038](../stories/US-038-session-management.md)           | Session Management (Token Refresh, Expiry, Inactivity)    | 📋 To Do       | 6            | 11.5h  |
| [US-039](../stories/US-039-biometric-reauth.md)             | Biometric Re-Authentication                               | 📋 To Do       | 4            | 9h     |
| [US-061](../stories/US-061-settings-account-section.md)     | Settings Account Section                                  | 📋 To Do       | 3            | 7.5h   |
| [US-066](../stories/US-066-proactive-session-validation.md) | Proactive Session Validation                              | 📋 To Do       | 5            | 8.5h   |

**Total**: 7 stories, 30 story points, 62 hours

**Implementation Order**:

1. **US-060** (Auth Navigation Foundation) - Must be first, establishes AuthContext and ProtectedRoute
2. **US-036** (Email/Password Login) - Core login screen
3. **US-061** (Settings Account Section) - Logout + account management
4. **US-038** (Session Management) - Token refresh, expiry
5. **US-066** (Proactive Session Validation) - ensureValidSession + auth documentation
6. **US-037** (Magic Link) - Passwordless
7. **US-039** (Biometric Re-Auth) - App resume

---

## Technical Approach

### Architecture

**Login Flow Architecture**:

```
LoginScreen
  → Email/Password Tab → useAuth hook → Supabase Auth API → Store tokens (Keychain) → Navigate Home
  → Magic Link Tab → useAuth hook → Supabase Auth API → Send email → User taps link → Handle deep link → Store tokens → Navigate Home
  → LinkedIn OAuth → useLinkedInAuth hook (reuse from registration) → OAuth 2.0 PKCE → Store tokens → Navigate Home

App Resume
  → App State Listener → Detect foreground → Check if session exists → Prompt biometric re-auth → On success, resume → Navigate Home
```

**Token Management**:

```
API Request (Axios)
  → Request Interceptor (add access token to headers)
  → Supabase API
  → Response Interceptor (detect 401 Unauthorized)
  → If 401: Refresh access token using refresh token
  → Retry original request with new access token
  → If refresh fails (expired): Navigate to Login with "Session expired" modal
```

**Session Expiry Handling**:

```
User makes API request
  → Access token expired → Axios interceptor refreshes token → Success → Continue
  → Refresh token expired (30 days) → Show "Session expired" modal → Clear Keychain → Navigate to Login
```

**Inactivity Timeout**:

```
User Activity Tracker
  → Detect touch events, navigation, API calls
  → Reset 5-minute timer on activity
  → If 5 minutes pass with no activity → Auto-logout → Clear Keychain → Navigate to Login
```

### Tech Stack

**Authentication**:

- Supabase Auth API (custom REST, no SDK)
- Axios for HTTP requests
- react-native-keychain for token storage (Keychain/Keystore)
- react-native-biometrics for Face ID/Touch ID/Fingerprint

**State Management**:

- Redux Toolkit for auth state (no tokens, only user metadata)
- redux-persist for Remember Me (persist user preferences, not tokens)

**Form Validation**:

- React Hook Form for all forms
- Yup for input validation (email format, password strength)
- Zod for API response validation

**Navigation**:

- React Navigation for screen transitions
- Deep linking for magic link and LinkedIn OAuth callback

**Session Management**:

- Axios interceptors for token refresh
- App state listener (AppState API) for app resume detection
- User activity tracker (custom hook) for inactivity detection

### Security Considerations

**Token Storage**:

- Access tokens stored in Keychain (iOS) / Keystore (Android) - hardware-backed
- Refresh tokens stored in Keychain (iOS) / Keystore (Android) - hardware-backed
- NO tokens in Redux or AsyncStorage (cleared on logout)
- Tokens never logged to console in production

**Biometric Re-Authentication**:

- Required on app resume (after background >30 seconds)
- Fallback to PIN if biometric fails
- Max 3 attempts before logout

**Token Refresh**:

- Automatic via Axios interceptors (transparent to user)
- Refresh token lifetime: 30 days
- Access token lifetime: 1 hour
- On refresh failure: Clear Keychain, navigate to Login

**Inactivity Timeout**:

- 5 minutes idle → Auto-logout
- Reset timer on touch, navigation, API calls
- Warning modal 30 seconds before timeout

**Remember Me**:

- If checked: Keep refresh token in Keychain after app restart
- If unchecked: Clear Keychain on app close
- Default: Unchecked (user must opt-in)

---

## Testing Strategy

### Unit Tests (RNTL)

**Components**:

- LoginScreen (email/password tab, magic link tab, LinkedIn button)
- RememberMeCheckbox
- SessionExpiryModal
- BiometricReAuthPrompt

**Hooks**:

- useAuth (email login, magic link login)
- useLinkedInAuth (OAuth flow)
- useBiometricReAuth (Face ID/Fingerprint/PIN)
- useTokenRefresh (Axios interceptor logic)
- useInactivityTimeout (5-minute timer)
- useAppStateListener (app resume detection)

**Utilities**:

- loginSchemaValidation (Yup)
- tokenRefreshInterceptor (Axios)

**Coverage Target**: 100% for all components, hooks, utilities

### E2E Tests (Detox + Cucumber)

**Scenarios**:

- Email/password login success
- Email/password login failure (invalid credentials)
- LinkedIn OAuth login success
- Magic link login success
- Biometric re-auth on app resume (Face ID, Fingerprint, PIN)
- Token refresh automatic (simulate 401 response)
- Session expiry handling (expired refresh token)
- Inactivity timeout (5 minutes idle → logout)
- Remember Me persistence (app restart)

**Platform Coverage**: iOS (iPhone 15 Pro), Android (Pixel 7 API 34)

### Integration Tests

**API Integration**:

- Supabase Auth API login endpoint
- Supabase Auth API token refresh endpoint
- Supabase Auth API magic link endpoint

**Deep Linking**:

- LinkedIn OAuth callback
- Magic link callback

---

## Tasks

### US-060: Auth Navigation Foundation (5 tasks, 7h)

| ID                                                              | Task                                      | Status   | Effort | Priority |
| --------------------------------------------------------------- | ----------------------------------------- | -------- | ------ | -------- |
| [TASK-333](../tasks/TASK-333-auth-context-redux-integration.md) | Create AuthContext with Redux Integration | 📋 To Do | 2h     | Critical |
| [TASK-334](../tasks/TASK-334-use-auth-hook.md)                  | Create useAuth Hook                       | 📋 To Do | 0.5h   | Critical |
| [TASK-335](../tasks/TASK-335-protected-route-hoc.md)            | Create ProtectedRoute HOC                 | 📋 To Do | 1.5h   | Critical |
| [TASK-336](../tasks/TASK-336-session-check-app-startup.md)      | Integrate Session Check on App Startup    | 📋 To Do | 1h     | High     |
| [TASK-337](../tasks/TASK-337-auth-navigation-rntl-tests.md)     | Auth Navigation RNTL Tests                | 📋 To Do | 2h     | High     |

### US-036: Email/Password Login (5 tasks, 11h)

| ID                                                         | Task                                       | Status   | Effort | Priority |
| ---------------------------------------------------------- | ------------------------------------------ | -------- | ------ | -------- |
| [TASK-213](../tasks/TASK-213-login-schema-validation.md)   | Login Schema Validation (Yup)              | 📋 To Do | 1h     | High     |
| [TASK-214](../tasks/TASK-214-login-screen-ui.md)           | Login Screen UI (Tabs, Forms, Remember Me) | 📋 To Do | 3h     | Critical |
| [TASK-215](../tasks/TASK-215-remember-me-functionality.md) | Remember Me Functionality                  | 📋 To Do | 2h     | Medium   |
| [TASK-216](../tasks/TASK-216-login-rntl-tests.md)          | Login RNTL Tests (100% coverage)           | 📋 To Do | 2h     | High     |
| [TASK-217](../tasks/TASK-217-login-e2e-tests.md)           | Login E2E Tests (Detox + Cucumber)         | 📋 To Do | 3h     | High     |

### US-037: Magic Link Login (4 tasks, 7.5h)

| ID                                                     | Task                                                | Status   | Effort | Priority |
| ------------------------------------------------------ | --------------------------------------------------- | -------- | ------ | -------- |
| [TASK-218](../tasks/TASK-218-magic-link-ui.md)         | Magic Link UI Tab                                   | 📋 To Do | 2h     | Medium   |
| [TASK-219](../tasks/TASK-219-magic-link-api.md)        | Magic Link API Integration (Send + Handle Callback) | 📋 To Do | 2h     | High     |
| [TASK-220](../tasks/TASK-220-magic-link-rntl-tests.md) | Magic Link RNTL Tests                               | 📋 To Do | 1.5h   | Medium   |
| [TASK-221](../tasks/TASK-221-magic-link-e2e-tests.md)  | Magic Link E2E Tests                                | 📋 To Do | 2h     | Medium   |

### US-038: Session Management (6 tasks, 11.5h)

| ID                                                         | Task                                       | Status   | Effort | Priority |
| ---------------------------------------------------------- | ------------------------------------------ | -------- | ------ | -------- |
| [TASK-222](../tasks/TASK-222-token-refresh-interceptor.md) | Token Refresh Interceptor (Axios)          | 📋 To Do | 3h     | Critical |
| [TASK-223](../tasks/TASK-223-session-expiry-handling.md)   | Session Expiry Handling (Modal + Re-Login) | 📋 To Do | 2h     | High     |
| [TASK-224](../tasks/TASK-224-inactivity-timeout.md)        | Inactivity Timeout (5 min Auto-Logout)     | 📋 To Do | 2h     | High     |
| [TASK-225](../tasks/TASK-225-app-state-listener.md)        | App State Listener (Background/Foreground) | 📋 To Do | 2h     | High     |
| [TASK-226](../tasks/TASK-226-session-management-tests.md)  | Session Management Tests (RNTL + E2E)      | 📋 To Do | 2.5h   | High     |

### US-039: Biometric Re-Authentication (4 tasks, 9h)

| ID                                                       | Task                                           | Status   | Effort | Priority |
| -------------------------------------------------------- | ---------------------------------------------- | -------- | ------ | -------- |
| [TASK-227](../tasks/TASK-227-biometric-reauth-prompt.md) | Biometric Re-Auth Prompt (Face ID/Fingerprint) | 📋 To Do | 2.5h   | High     |
| [TASK-228](../tasks/TASK-228-pin-reauth-fallback.md)     | PIN Re-Auth Fallback (if biometric fails)      | 📋 To Do | 2h     | Medium   |
| [TASK-229](../tasks/TASK-229-reauth-rntl-tests.md)       | Re-Auth RNTL Tests                             | 📋 To Do | 2h     | Medium   |
| [TASK-230](../tasks/TASK-230-reauth-e2e-tests.md)        | Re-Auth E2E Tests (Detox)                      | 📋 To Do | 2.5h   | Medium   |

### US-061: Settings Account Section (4 tasks, 7.5h)

| ID                                                           | Task                                  | Status   | Effort | Priority |
| ------------------------------------------------------------ | ------------------------------------- | -------- | ------ | -------- |
| [TASK-338](../tasks/TASK-338-settings-account-section.md)    | Add Account Section to SettingsScreen | 📋 To Do | 2h     | High     |
| [TASK-339](../tasks/TASK-339-user-card-component.md)         | Create UserCard Component             | 📋 To Do | 1h     | Medium   |
| [TASK-340](../tasks/TASK-340-edit-account-screen.md)         | Create EditAccountScreen              | 📋 To Do | 3h     | Medium   |
| [TASK-341](../tasks/TASK-341-settings-account-rntl-tests.md) | Settings Account RNTL Tests           | 📋 To Do | 1.5h   | Medium   |

### US-066: Proactive Session Validation (2 tasks, 8.5h)

| ID                                                       | Task                                                        | Status   | Effort | Priority |
| -------------------------------------------------------- | ----------------------------------------------------------- | -------- | ------ | -------- |
| [TASK-369](../tasks/TASK-369-ensure-valid-session.md)    | Implement ensureValidSession() + ProtectedRoute Integration | 📋 To Do | 6h     | High     |
| [TASK-370](../tasks/TASK-370-auth-flow-documentation.md) | Comprehensive Auth Flow Documentation                       | 📋 To Do | 2.5h   | Medium   |

**Task Summary**: 32 tasks, 68.5 hours total

---

## Dependencies

### Upstream Dependencies (Must Complete First)

- **EPIC-021: Registration & Profile Setup** - Must be complete before login can be tested (users must exist in database)
- **Supabase Project Setup** - Database, Auth configuration, API keys

### Downstream Dependencies (Depend on This Epic)

- **EPIC-024: Password Recovery** - "Forgot Password?" link from Login screen
- **EPIC-023: Security Settings** - Change password, enable/disable biometric, etc.
- **All other epics** - Require authenticated users

---

## Risks & Mitigation

### Technical Risks

| Risk                               | Probability | Impact | Mitigation                                                         |
| ---------------------------------- | ----------- | ------ | ------------------------------------------------------------------ |
| Token refresh race conditions      | Medium      | High   | Use mutex lock in interceptor, queue concurrent requests           |
| Biometric re-auth UX confusion     | Low         | Medium | Clear modal explaining why re-auth required, show "Skip this time" |
| Inactivity timeout false positives | Medium      | Medium | Whitelist background tasks (API polling), detect real inactivity   |
| Magic link deep linking fails      | Low         | High   | Comprehensive E2E tests, fallback to manual code entry             |
| LinkedIn OAuth token expiry        | Low         | Low    | Handle in interceptor, prompt re-login if refresh fails            |

### Business Risks

| Risk                            | Probability | Impact | Mitigation                                              |
| ------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Users forget passwords          | High        | Low    | Magic link passwordless option, "Forgot Password?" link |
| Biometric re-auth adoption low  | Medium      | Medium | Educate users on security benefits, make opt-in easy    |
| Session expiry user frustration | Low         | Medium | 30-day refresh token, clear "Session expired" messaging |

---

## Definition of Done

**Functional**:

- [ ] Email/password login working (Supabase Auth API)
- [ ] LinkedIn OAuth login working (OAuth 2.0 PKCE)
- [ ] Magic link login working (passwordless)
- [ ] Biometric re-auth on app resume (Face ID, Touch ID, Fingerprint, PIN fallback)
- [ ] Automatic token refresh via Axios interceptors
- [ ] Proactive session validation before secure screen access (ensureValidSession)
- [ ] Session expiry detection and handling (modal + re-login)
- [ ] Inactivity timeout (auto-logout after 5 minutes idle)
- [ ] Remember Me checkbox persists login across app restarts
- [ ] "Forgot Password?" link navigates to password recovery (EPIC-024)

**Quality**:

- [ ] All RNTL tests passing (100% coverage)
- [ ] All E2E tests passing (Detox + Cucumber, iOS + Android)
- [ ] `yarn validate` passes (typecheck, lint, test)
- [ ] Zero ESLint errors or warnings
- [ ] Zero TypeScript errors

**Security**:

- [ ] Tokens stored in Keychain/Keystore (hardware-backed)
- [ ] No tokens in Redux or AsyncStorage
- [ ] No tokens logged in production
- [ ] HTTPS-only API communication
- [ ] Zod validation for all API responses
- [ ] Yup validation for all user inputs

**Accessibility**:

- [ ] All UI elements EAA compliant (WCAG 2.1 Level AA)
- [ ] Touch targets minimum 48×48 (iOS/Android)
- [ ] Proper accessibility labels/hints/roles
- [ ] Screen reader navigable (VoiceOver/TalkBack)

**Documentation**:

- [ ] All tasks documented with acceptance criteria
- [ ] All components documented with JSDoc
- [ ] README.md updated with login flow diagrams
- [ ] SECURITY.md updated with token management details
- [ ] AUTH_FLOW.md created with comprehensive auth documentation and visual diagrams

---

## Rollout Plan

### Phase 1: Email/Password Login (Week 1)

- Implement login schema validation (Yup)
- Build login screen UI (email/password tab, Remember Me)
- Implement email/password login API integration
- Write RNTL tests (100% coverage)
- Write E2E tests (Detox + Cucumber)

**Checkpoint**: Email/password login fully functional and tested

### Phase 2: Session Management (Week 1-2)

- Implement token refresh interceptor (Axios)
- Implement session expiry handling (modal + re-login)
- Implement inactivity timeout (5-minute auto-logout)
- Implement app state listener (background/foreground detection)
- Write comprehensive tests (RNTL + E2E)

**Checkpoint**: Token refresh automatic, session expiry handled gracefully

### Phase 3: Magic Link + LinkedIn OAuth (Week 2)

- Build magic link UI tab
- Implement magic link API integration (send + callback)
- Integrate LinkedIn OAuth (reuse from registration)
- Write tests for both flows

**Checkpoint**: All 3 login methods working (email, LinkedIn, magic link)

### Phase 4: Biometric Re-Authentication (Week 2-3)

- Implement biometric re-auth prompt (Face ID/Fingerprint)
- Implement PIN re-auth fallback
- Integrate with app resume flow
- Write comprehensive tests (RNTL + E2E)

**Checkpoint**: Biometric re-auth on app resume fully functional

### Phase 5: Integration & Testing (Week 3)

- Integration testing across all flows
- Performance testing (login time, token refresh)
- Security testing (token storage, expiry handling)
- Bug fixes and polish

**Final Checkpoint**: All acceptance criteria met, `yarn validate` passes

---

## Success Metrics

### Technical Metrics

| Metric                 | Target  | Measurement          |
| ---------------------- | ------- | -------------------- |
| Test Coverage (RNTL)   | 100%    | Jest coverage report |
| E2E Test Pass Rate     | 100%    | Detox test results   |
| `yarn validate` Status | ✅ Pass | CI/CD pipeline       |
| TypeScript Errors      | 0       | `yarn typecheck`     |
| ESLint Violations      | 0       | `yarn lint`          |

### User Experience Metrics

| Metric                     | Target     | Measurement            |
| -------------------------- | ---------- | ---------------------- |
| Login Success Rate         | 95%+       | Analytics              |
| Avg Login Time             | <5 seconds | Performance monitoring |
| Biometric Re-Auth Adoption | 70%+       | User preferences data  |
| Token Refresh Success      | 99%+       | Error logs             |
| Session Expiry Handling    | 100%       | No user data loss      |

---

**Last Updated**: 2025-11-27
**Epic Owner**: Warren de Leon
**Next Review**: Before Phase 1 kickoff

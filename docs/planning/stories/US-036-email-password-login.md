# US-036: Email/Password Login

**ID**: US-036 | **Title**: Email/Password Login with Remember Me
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Critical | **Story Points**: 5 | **Effort**: 11h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## User Story

**As a** returning user
**I want to** log in with my email and password
**So that** I can quickly access my account and resume where I left off

---

## Context & Background

### Why This Story Matters

Email/password authentication is the foundational login method expected by users. While we offer LinkedIn OAuth and magic link alternatives, email/password provides:

1. **Universal availability**: Works for all users regardless of LinkedIn membership
2. **Offline capability**: Credentials verified locally (after first login)
3. **User control**: No dependency on third-party services (LinkedIn, email provider)
4. **Familiarity**: Users expect this standard authentication method

**User Journey**:

```
User opens app
  → App checks for existing session (Keychain)
  → If session exists: Prompt biometric re-auth → Navigate to Home
  → If no session: Navigate to Login screen
  → User sees tabs: "Email/Password" (active) | "Magic Link"
  → User enters email + password
  → User checks "Remember Me" (optional)
  → User taps "Log In"
  → System validates credentials via Supabase Auth API
  → Success: Store tokens in Keychain → Navigate to Home
  → Failure: Show error message (invalid credentials, network error)
```

### Current State vs Desired State

**Current State**: No login system exists (fresh app post-registration).

**Desired State**:

- Login screen with email/password form (Yup validation)
- "Forgot Password?" link (navigates to EPIC-024 password recovery)
- "Remember Me" checkbox (persists login across app restarts)
- Supabase Auth API integration (custom REST, no SDK)
- Token storage in Keychain (hardware-backed security)
- Graceful error handling (invalid credentials, network failures)
- Biometric re-authentication on subsequent app resumes

### Success Metrics

| Metric                           | Target     | Why It Matters                                  |
| -------------------------------- | ---------- | ----------------------------------------------- |
| Login Success Rate               | 95%+       | Measures authentication reliability             |
| Login Time (95th percentile)     | <5 seconds | User experience benchmark                       |
| Error Rate (Invalid Credentials) | <5%        | Indicates good UX (clear password requirements) |
| Remember Me Adoption             | 60%+       | Shows user trust and convenience preference     |

---

## Acceptance Criteria

### Functional Requirements

#### Form Validation

- [ ] Email field with validation:
  - [ ] Required field
  - [ ] Valid email format (RFC 5322)
  - [ ] Real-time validation (on blur)
  - [ ] Error message: "Please enter a valid email address"
- [ ] Password field with validation:
  - [ ] Required field
  - [ ] Minimum 8 characters
  - [ ] Show/hide password toggle
  - [ ] Error message: "Password must be at least 8 characters"

#### UI Elements

- [ ] Tab navigation: "Email/Password" (active by default) | "Magic Link"
- [ ] "Forgot Password?" link (navigates to password recovery flow)
- [ ] "Remember Me" checkbox (unchecked by default)
- [ ] "Log In" button:
  - [ ] Disabled when form invalid
  - [ ] Shows loading state during authentication
  - [ ] Minimum 48×48 touch target (EAA compliance)

#### Authentication Flow

- [ ] On form submit:
  - [ ] Validate form with Yup schema
  - [ ] Call Supabase Auth API (email + password)
  - [ ] Handle response:
    - [ ] **Success**: Extract tokens (access + refresh) → Store in Keychain → Navigate to Home
    - [ ] **Invalid credentials**: Show error "Invalid email or password"
    - [ ] **Network error**: Show error "Network error. Please check your connection and try again."
    - [ ] **Account not verified**: Show error "Please verify your email address first"

#### Token Management

- [ ] Store access token in Keychain (service: `auth_access_token`)
- [ ] Store refresh token in Keychain (service: `auth_refresh_token`)
- [ ] Store user metadata in Redux (email, name, profile picture URL)
- [ ] **Never** store tokens in Redux or AsyncStorage
- [ ] **Never** log tokens in console (production build)

#### Remember Me Functionality

- [ ] If checked:
  - [ ] Keep refresh token in Keychain after app close/restart
  - [ ] Auto-login on next app launch (if token valid)
- [ ] If unchecked:
  - [ ] Clear Keychain on app close
  - [ ] Require full login on next app launch

#### Error Handling

- [ ] Invalid credentials (401): "Invalid email or password"
- [ ] Network error (timeout): "Network error. Please check your connection and try again."
- [ ] Email not verified (400): "Please verify your email address first"
- [ ] Rate limiting (429): "Too many login attempts. Please try again in 5 minutes."
- [ ] Server error (500): "Something went wrong. Please try again later."

### Non-Functional Requirements

#### Performance

- [ ] Form validation instant (<100ms)
- [ ] Login API call <2 seconds (95th percentile)
- [ ] Token storage <50ms
- [ ] Total login time <5 seconds

#### Security

- [ ] Tokens stored in hardware-backed Keychain (iOS/Android)
- [ ] Password field uses secure text entry (dots, not plain text)
- [ ] No tokens in Redux state or AsyncStorage
- [ ] No tokens logged in production
- [ ] HTTPS-only API communication
- [ ] Zod validation for all API responses

#### Accessibility (EAA Compliance - WCAG 2.1 Level AA)

- [ ] All form fields have accessibility labels
- [ ] Form fields announce errors to screen readers
- [ ] "Log In" button has `accessibilityRole="button"`
- [ ] "Log In" button has `accessibilityHint="Logs you in to your account"`
- [ ] All touch targets minimum 48×48 (iOS/Android)
- [ ] Color contrast 4.5:1 for text, 3:1 for UI components
- [ ] Screen reader navigable (VoiceOver/TalkBack)

#### Testing

- [ ] 100% RNTL coverage for LoginScreen component
- [ ] 100% RNTL coverage for useAuth hook
- [ ] 100% RNTL coverage for loginSchemaValidation utility
- [ ] E2E tests for all login scenarios (Detox + Cucumber):
  - [ ] Successful login
  - [ ] Invalid credentials
  - [ ] Network error
  - [ ] Remember Me enabled/disabled
  - [ ] "Forgot Password?" navigation

---

## Implementation Phases

### Phase 0: Dependencies & Prerequisites (Completed in EPIC-021)

**Prerequisites**:

- [ ] Supabase project created with Auth enabled
- [ ] User database table schema defined
- [ ] Supabase Auth API endpoints configured
- [ ] react-native-keychain installed and configured
- [ ] Axios configured with base URL

**Effort**: 0h (already completed in EPIC-021)

---

### Phase 1: Schema Validation (1 hour)

**Tasks**: [TASK-213](../tasks/TASK-213-login-schema-validation.md)

**Objective**: Define Yup validation schema for email/password login form.

**Deliverables**:

- `src/schemas/loginSchema.ts` with Yup schema
- Email validation (RFC 5322 format)
- Password validation (min 8 characters)
- Unit tests for schema validation (100% coverage)

**Key Code**:

```typescript
export const loginSchema = yup.object({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});
```

**Acceptance Criteria**:

- [ ] Schema validates correct email formats
- [ ] Schema rejects invalid email formats
- [ ] Schema validates password length
- [ ] Schema returns proper error messages
- [ ] 100% unit test coverage

**Effort**: 1h

---

### Phase 2: Login Screen UI (3 hours)

**Tasks**: [TASK-214](../tasks/TASK-214-login-screen-ui.md)

**Objective**: Build login screen UI with email/password form, tabs, and Remember Me checkbox.

**Deliverables**:

- `src/features/Auth/screens/LoginScreen.tsx` component
- Tab navigation (Email/Password | Magic Link)
- Email + password input fields
- Show/hide password toggle
- "Forgot Password?" link
- "Remember Me" checkbox
- "Log In" button with loading state
- Form validation with React Hook Form + Yup
- Full EAA compliance (accessibility labels, touch targets)

**UI Components**:

- `<Input>` with email keyboard type
- `<Input>` with secure text entry (password)
- `<Checkbox>` for Remember Me
- `<Button>` for Log In (disabled when invalid)
- `<Link>` for Forgot Password

**Key Features**:

- Real-time validation on field blur
- Error messages below invalid fields
- Loading spinner in button during login
- Disabled button during API call

**Acceptance Criteria**:

- [ ] Login screen renders correctly
- [ ] Tabs switch between Email/Password and Magic Link
- [ ] Email field validates on blur
- [ ] Password field validates on blur
- [ ] Show/hide password toggle works
- [ ] "Forgot Password?" link navigates correctly
- [ ] Remember Me checkbox toggles state
- [ ] "Log In" button disabled when form invalid
- [ ] "Log In" button shows loading state during API call
- [ ] All elements EAA compliant

**Effort**: 3h

---

### Phase 3: Remember Me Functionality (2 hours)

**Tasks**: [TASK-215](../tasks/TASK-215-remember-me-functionality.md)

**Objective**: Implement Remember Me checkbox that persists login across app restarts.

**Deliverables**:

- Remember Me checkbox logic in LoginScreen
- Keychain persistence based on Remember Me state
- Auto-login on app launch (if Remember Me checked)
- App launch listener to check for existing session

**Logic Flow**:

```
User checks "Remember Me" → User logs in → Store refresh token in Keychain with flag
User closes app → User reopens app → Check Keychain → If Remember Me flag set → Auto-login → Navigate to Home
```

**Acceptance Criteria**:

- [ ] Remember Me checkbox toggles state
- [ ] If checked: Refresh token persists in Keychain after app close
- [ ] If unchecked: Keychain cleared on app close
- [ ] App launch checks Keychain for existing session
- [ ] Auto-login works if Remember Me was checked
- [ ] Manual login required if Remember Me was unchecked

**Effort**: 2h

---

### Phase 4: API Integration & Token Storage (2 hours)

**Objective**: Integrate Supabase Auth API for email/password login and store tokens securely in Keychain.

**Deliverables**:

- `src/features/Auth/hooks/useAuth.ts` hook with login function
- Supabase Auth API client (custom REST, no SDK)
- Token storage in Keychain (access + refresh tokens)
- Redux state update with user metadata
- Error handling for all API failure scenarios

**API Endpoint**:

```
POST https://PROJECT_ID.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (Success):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.MRjVvF...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "profile_picture": "https://..."
    }
  }
}
```

**Token Storage**:

```typescript
// Access token (1 hour lifetime)
await Keychain.setGenericPassword('auth_access_token', accessToken, {
  service: 'auth_access_token',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});

// Refresh token (30 days lifetime)
await Keychain.setGenericPassword('auth_refresh_token', refreshToken, {
  service: 'auth_refresh_token',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});
```

**Redux State Update**:

```typescript
dispatch(
  setUser({
    id: user.id,
    email: user.email,
    fullName: user.user_metadata.full_name,
    profilePicture: user.user_metadata.profile_picture,
  })
);
```

**Error Handling**:

- 401 Unauthorized → "Invalid email or password"
- 400 Email not verified → "Please verify your email address first"
- 429 Rate limited → "Too many login attempts. Please try again in 5 minutes."
- Network timeout → "Network error. Please check your connection and try again."
- 500 Server error → "Something went wrong. Please try again later."

**Acceptance Criteria**:

- [ ] useAuth hook exported with login function
- [ ] Login function calls Supabase Auth API correctly
- [ ] Success response extracts tokens
- [ ] Tokens stored in Keychain (hardware-backed)
- [ ] User metadata stored in Redux (no tokens)
- [ ] All error scenarios handled with clear messages
- [ ] Zod validation for API response

**Effort**: 2h

---

### Phase 5: RNTL Tests (2 hours)

**Tasks**: [TASK-216](../tasks/TASK-216-login-rntl-tests.md)

**Objective**: Write comprehensive unit tests for LoginScreen component, useAuth hook, and loginSchema.

**Test Files**:

- `src/features/Auth/screens/__tests__/LoginScreen.rntl.tsx`
- `src/features/Auth/hooks/__tests__/useAuth.rntl.ts`
- `src/schemas/__tests__/loginSchema.rntl.ts`

**Test Coverage**:

- LoginScreen rendering
- Form validation (email, password)
- Submit button disabled when invalid
- Submit button loading state
- API success scenario
- API error scenarios (401, 400, 429, network timeout, 500)
- Remember Me checkbox functionality
- "Forgot Password?" navigation
- EAA compliance (accessibility labels, roles, hints)

**Acceptance Criteria**:

- [ ] 100% coverage for LoginScreen
- [ ] 100% coverage for useAuth hook
- [ ] 100% coverage for loginSchema
- [ ] All edge cases tested
- [ ] All error scenarios tested
- [ ] EAA compliance tested

**Effort**: 2h

---

### Phase 6: E2E Tests (3 hours)

**Tasks**: [TASK-217](../tasks/TASK-217-login-e2e-tests.md)

**Objective**: Write E2E tests for all login scenarios using Detox + Cucumber.

**Feature File**: `src/features/Auth/__tests__/Login.feature`

**Scenarios**:

- Successful email/password login
- Invalid credentials (401)
- Email not verified (400)
- Network error (timeout)
- Remember Me enabled (persists across app restart)
- Remember Me disabled (requires re-login)
- "Forgot Password?" navigation
- Tab switching (Email/Password ↔ Magic Link)

**Acceptance Criteria**:

- [ ] All scenarios pass on iOS simulator
- [ ] All scenarios pass on Android emulator
- [ ] Remember Me persistence tested across app restart
- [ ] All navigation flows tested
- [ ] All error states tested

**Effort**: 3h

---

## Tasks

### Task Breakdown (5 tasks, 11h total)

| ID                                                         | Task                                       | Status   | Effort | Priority | Dependencies       |
| ---------------------------------------------------------- | ------------------------------------------ | -------- | ------ | -------- | ------------------ |
| [TASK-213](../tasks/TASK-213-login-schema-validation.md)   | Login Schema Validation (Yup)              | 📋 To Do | 1h     | High     | None               |
| [TASK-214](../tasks/TASK-214-login-screen-ui.md)           | Login Screen UI (Tabs, Forms, Remember Me) | 📋 To Do | 3h     | Critical | TASK-213           |
| [TASK-215](../tasks/TASK-215-remember-me-functionality.md) | Remember Me Functionality                  | 📋 To Do | 2h     | Medium   | TASK-214           |
| [TASK-216](../tasks/TASK-216-login-rntl-tests.md)          | Login RNTL Tests (100% coverage)           | 📋 To Do | 2h     | High     | TASK-214, TASK-215 |
| [TASK-217](../tasks/TASK-217-login-e2e-tests.md)           | Login E2E Tests (Detox + Cucumber)         | 📋 To Do | 3h     | High     | TASK-214, TASK-215 |

**Total Effort**: 11 hours

**Dependency Chain**:

```
TASK-213 (Schema) → TASK-214 (UI) → TASK-215 (Remember Me)
                                   → TASK-216 (RNTL Tests)
                                   → TASK-217 (E2E Tests)
```

---

## Non-Functional Requirements

### Performance

- Login API call <2 seconds (95th percentile)
- Form validation instant (<100ms)
- Token storage <50ms
- Total login flow <5 seconds

### Security

- Tokens stored in hardware-backed Keychain (iOS/Android)
- Password field uses secure text entry
- No tokens in Redux or AsyncStorage
- No tokens logged in production
- HTTPS-only API communication
- Zod validation for API responses

### Accessibility (EAA Compliance)

- All form fields have accessibility labels
- Screen reader announces validation errors
- Touch targets minimum 48×48 (iOS/Android)
- Color contrast 4.5:1 (text), 3:1 (UI components)
- Screen reader navigable (VoiceOver/TalkBack)

### Testing

- 100% RNTL coverage (LoginScreen, useAuth, loginSchema)
- E2E tests for all scenarios (Detox + Cucumber)
- Platform coverage: iOS + Android

---

## Definition of Done

**Functional**:

- [ ] Email/password login working via Supabase Auth API
- [ ] Tokens stored securely in Keychain
- [ ] User metadata stored in Redux (no tokens)
- [ ] Remember Me checkbox persists login across app restarts
- [ ] "Forgot Password?" link navigates to password recovery (EPIC-024)
- [ ] All error scenarios handled with clear messages
- [ ] Tab switching works (Email/Password ↔ Magic Link)

**Quality**:

- [ ] 100% RNTL coverage (LoginScreen, useAuth, loginSchema)
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes (typecheck, lint, test)
- [ ] Zero ESLint errors or warnings
- [ ] Zero TypeScript errors

**Security**:

- [ ] Tokens in Keychain (hardware-backed)
- [ ] No tokens in Redux or AsyncStorage
- [ ] No tokens logged in production
- [ ] HTTPS-only API communication
- [ ] Zod validation for API responses

**Accessibility**:

- [ ] All UI elements EAA compliant (WCAG 2.1 Level AA)
- [ ] Touch targets minimum 48×48
- [ ] Accessibility labels/hints/roles on all elements
- [ ] Screen reader navigable

**Documentation**:

- [ ] LoginScreen component documented with JSDoc
- [ ] useAuth hook documented with JSDoc
- [ ] loginSchema documented with comments
- [ ] README.md updated with login flow diagram

---

## Risk Assessment

### Technical Risks

| Risk                                | Probability | Impact | Mitigation                                              |
| ----------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Keychain access denied by OS        | Low         | High   | Graceful fallback to AsyncStorage with warning          |
| Supabase API rate limiting          | Medium      | Medium | Implement exponential backoff, show clear error message |
| Token expiry during session         | Low         | Medium | Automatic refresh via interceptor (handled in US-038)   |
| Network timeout on slow connections | Medium      | Low    | 10-second timeout, clear error message, retry button    |

### UX Risks

| Risk                          | Probability | Impact | Mitigation                                                |
| ----------------------------- | ----------- | ------ | --------------------------------------------------------- |
| Users forget password         | High        | Low    | Prominent "Forgot Password?" link, magic link alternative |
| Users mistype email           | Medium      | Medium | Email format validation, clear error messages             |
| Users confused by Remember Me | Low         | Low    | Clear tooltip explaining functionality                    |

---

## Testing Strategy

### Unit Tests (RNTL)

**Components**:

- LoginScreen (form rendering, validation, submit)

**Hooks**:

- useAuth (login function, error handling, token storage)

**Utilities**:

- loginSchema (email validation, password validation)

**Coverage Target**: 100%

### E2E Tests (Detox + Cucumber)

**Scenarios**:

- Successful login
- Invalid credentials
- Email not verified
- Network error
- Remember Me enabled
- Remember Me disabled
- "Forgot Password?" navigation
- Tab switching

**Platform Coverage**: iOS (iPhone 15 Pro), Android (Pixel 7 API 34)

---

## Dependencies

### Upstream Dependencies

- EPIC-021 (Registration) must be complete (users must exist in database)
- Supabase Auth API must be configured
- react-native-keychain must be installed

### Downstream Dependencies

- US-038 (Session Management) depends on token storage implementation
- US-039 (Biometric Re-Auth) depends on Remember Me functionality
- EPIC-024 (Password Recovery) linked via "Forgot Password?" button

---

**Last Updated**: 2025-11-21
**Story Points**: 5 (based on planning poker with team)
**Priority**: Critical (foundation for all login flows)
**Next Review**: Before Phase 1 implementation

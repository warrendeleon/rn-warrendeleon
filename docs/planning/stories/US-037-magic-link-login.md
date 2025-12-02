# US-037: Magic Link Login (Passwordless)

**ID**: US-037 | **Title**: Magic Link Passwordless Login
**Epic**: [EPIC-022](../epics/EPIC-022-login-session-management.md)
**Status**: 📋 To Do | **Priority**: Medium | **Story Points**: 4 | **Effort**: 7.5h
**Created**: 2025-11-21 | **Assignee**: Warren de Leon

---

## User Story

**As a** returning user
**I want to** log in using a magic link sent to my email (passwordless)
**So that** I can access my account without remembering/typing a password

---

## Context & Background

### Why This Story Matters

Magic link authentication provides a password less login experience that:

1. **Eliminates password friction**: No typing, no remembering complex passwords
2. **Increases security**: No password to forget, lose, or compromise
3. **Improves conversion**: Faster login process reduces abandonment
4. **Modern UX**: Industry standard (Slack, Notion, Medium use magic links)

**User Journey**:

```
User navigates to Login screen
  → User taps "Magic Link" tab
  → User enters email address
  → User taps "Send Magic Link"
  → System sends email with unique link
  → User checks email inbox
  → User taps magic link in email
  → Device opens app via deep link
  → App extracts tokens from magic link URL
  → App stores tokens in Keychain
  → App navigates to Home
```

**Example Magic Link**:

```
warrendeleon://login?access_token=eyJhbGci...&refresh_token=v1.MRjVvF...&type=magiclink
```

### Current State vs Desired State

**Current State**: Only email/password login exists.

**Desired State**:

- Magic Link tab in Login screen
- Email-only form (no password)
- Supabase magic link API integration (send email)
- Deep link handler for magic link callback
- Token extraction from URL parameters
- Token storage in Keychain
- Automatic navigation to Home on success
- Error handling (invalid link, expired link, network failure)

### Success Metrics

| Metric                       | Target      | Why It Matters                           |
| ---------------------------- | ----------- | ---------------------------------------- |
| Magic Link Adoption          | 30%+        | Shows user preference for passwordless   |
| Magic Link Success Rate      | 90%+        | Measures email delivery + link handling  |
| Time to Login (Email → Home) | <60 seconds | UX benchmark (includes email check time) |
| Link Expiry Handling         | 100%        | Clear messaging when link expired        |

---

## Acceptance Criteria

### Functional Requirements

#### UI Elements (Magic Link Tab)

- [ ] "Magic Link" tab in Login screen (inactive by default)
- [ ] Email input field with validation:
  - [ ] Required field
  - [ ] Valid email format (RFC 5322)
  - [ ] Real-time validation (on blur)
  - [ ] Error message: "Please enter a valid email address"
- [ ] "Send Magic Link" button:
  - [ ] Disabled when email invalid
  - [ ] Shows loading state while sending
  - [ ] Minimum 48×48 touch target (EAA compliance)
- [ ] Success message after sending:
  - [ ] "Check your email! We've sent you a magic link to log in."
  - [ ] Shows user's email address
  - [ ] "Didn't receive it? Resend" button
- [ ] "Resend" functionality:
  - [ ] Disabled for 60 seconds after initial send (rate limiting)
  - [ ] Shows countdown timer: "Resend in 45s..."
  - [ ] Re-enables after 60 seconds

#### Magic Link Sending Flow

- [ ] On "Send Magic Link" button press:
  - [ ] Validate email with Yup schema
  - [ ] Call Supabase magic link API
  - [ ] Handle response:
    - [ ] **Success**: Show success message with email
    - [ ] **Network error**: Show error "Network error. Please try again."
    - [ ] **Rate limited**: Show error "Too many requests. Please wait 60 seconds."
    - [ ] **Invalid email**: Show error "Email address not found. Please register first."

#### Deep Link Handling (Magic Link Callback)

- [ ] App registers deep link scheme: `warrendeleon://login`
- [ ] On magic link tap in email:
  - [ ] Device opens app (or prompts to open if app closed)
  - [ ] App navigates to LoginCallbackScreen
  - [ ] Screen extracts tokens from URL parameters:
    - [ ] `access_token`
    - [ ] `refresh_token`
    - [ ] `type=magiclink`
  - [ ] Validate tokens with Zod schema
  - [ ] Store tokens in Keychain
  - [ ] Update Redux with user metadata
  - [ ] Navigate to Home

#### Error Handling

- [ ] Invalid link (malformed URL): "Invalid login link. Please request a new one."
- [ ] Expired link (>10 minutes old): "This login link has expired. Please request a new one."
- [ ] Network error during token validation: "Network error. Please try again."
- [ ] Link already used: "This login link has already been used. Please request a new one."

### Non-Functional Requirements

#### Performance

- [ ] Email sending API call <2 seconds
- [ ] Deep link handling <500ms
- [ ] Token storage <50ms
- [ ] Total flow (tap link → Home) <3 seconds

#### Security

- [ ] Magic links expire after 10 minutes
- [ ] One-time use (link invalidated after first use)
- [ ] Tokens stored in hardware-backed Keychain
- [ ] Deep link URL parameters validated with Zod
- [ ] HTTPS-only redirect URLs

#### Accessibility (EAA Compliance)

- [ ] Email field has accessibility label
- [ ] "Send Magic Link" button has `accessibilityRole="button"`
- [ ] "Send Magic Link" button has `accessibilityHint="Sends a login link to your email"`
- [ ] Success message announced to screen reader
- [ ] All touch targets minimum 48×48
- [ ] Color contrast 4.5:1 (text), 3:1 (UI components)

#### Testing

- [ ] 100% RNTL coverage for MagicLinkTab component
- [ ] 100% RNTL coverage for LoginCallbackScreen
- [ ] 100% RNTL coverage for useMagicLink hook
- [ ] E2E tests for magic link flow (Detox + Cucumber):
  - [ ] Successful magic link login
  - [ ] Expired link handling
  - [ ] Invalid link handling
  - [ ] Resend functionality

---

## Implementation Phases

### Phase 1: Magic Link UI Tab (2 hours)

**Tasks**: [TASK-218](../tasks/TASK-218-magic-link-ui.md)

**Objective**: Build Magic Link tab in Login screen with email-only form.

**Deliverables**:

- Magic Link tab component in LoginScreen
- Email input field with Yup validation
- "Send Magic Link" button with loading state
- Success message UI
- "Resend" button with 60-second countdown timer
- Full EAA compliance

**UI Flow**:

```
Magic Link Tab (inactive)
  → User taps tab → Tab becomes active
  → Email field appears
  → User enters email → Field validates on blur
  → User taps "Send Magic Link" → Button shows loading
  → Success → Show success message + user email
  → Show "Resend in 60s..." with countdown
  → After 60s → "Resend" button enabled
```

**Acceptance Criteria**:

- [ ] Magic Link tab renders correctly
- [ ] Tab switching works (Email/Password ↔ Magic Link)
- [ ] Email field validates on blur
- [ ] "Send Magic Link" button disabled when email invalid
- [ ] Button shows loading state during API call
- [ ] Success message appears after sending
- [ ] Resend button disabled for 60 seconds with countdown
- [ ] All elements EAA compliant

**Effort**: 2h

---

### Phase 2: Magic Link API Integration (2 hours)

**Tasks**: [TASK-219](../tasks/TASK-219-magic-link-api.md)

**Objective**: Integrate Supabase magic link API to send email and handle deep link callback.

**Deliverables**:

- `src/features/Auth/hooks/useMagicLink.ts` hook with send function
- Supabase magic link API client
- Deep link handler for callback
- Token extraction from URL parameters
- Token storage in Keychain
- Redux state update
- Error handling for all scenarios

**API Endpoint (Send Magic Link)**:

```
POST https://PROJECT_ID.supabase.co/auth/v1/magiclink
Content-Type: application/json

{
  "email": "user@example.com",
  "redirectTo": "warrendeleon://login"
}
```

**Response** (Success):

```json
{
  "message": "Check your email for the magic link"
}
```

**Magic Link Email**:

```
Subject: Your login link

Click the link below to log in to your account:

https://PROJECT_ID.supabase.co/auth/v1/verify?token=TOKEN&type=magiclink&redirect_to=warrendeleon://login

This link will expire in 10 minutes.
```

**Deep Link URL (After Click)**:

```
warrendeleon://login?access_token=eyJhbGci...&refresh_token=v1.MRjVvF...&type=magiclink
```

**Deep Link Handler**:

```typescript
// src/features/Auth/screens/LoginCallbackScreen.tsx
useEffect(() => {
  const handleDeepLink = async (url: string) => {
    const params = parseURLParams(url);

    if (params.type === 'magiclink') {
      const { access_token, refresh_token } = params;

      // Validate tokens
      const validation = tokenSchema.safeParse({ access_token, refresh_token });
      if (!validation.success) {
        showError('Invalid login link. Please request a new one.');
        return;
      }

      // Store in Keychain
      await storeTokens(access_token, refresh_token);

      // Update Redux
      dispatch(setUser(/* user metadata */));

      // Navigate to Home
      navigation.navigate('Home');
    }
  };

  Linking.getInitialURL().then(handleDeepLink);
  const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

  return () => subscription.remove();
}, []);
```

**Error Handling**:

- Network error → "Network error. Please try again."
- Rate limited (429) → "Too many requests. Please wait 60 seconds."
- Email not found (404) → "Email address not found. Please register first."
- Invalid link → "Invalid login link. Please request a new one."
- Expired link → "This login link has expired. Please request a new one."
- Link already used → "This login link has already been used. Please request a new one."

**Acceptance Criteria**:

- [ ] useMagicLink hook sends email successfully
- [ ] Deep link handler extracts tokens from URL
- [ ] Tokens validated with Zod schema
- [ ] Tokens stored in Keychain
- [ ] User metadata updated in Redux
- [ ] Navigation to Home works
- [ ] All error scenarios handled

**Effort**: 2h

---

### Phase 3: RNTL Tests (1.5 hours)

**Tasks**: [TASK-220](../tasks/TASK-220-magic-link-rntl-tests.md)

**Objective**: Write comprehensive unit tests for Magic Link components and hooks.

**Test Files**:

- `src/features/Auth/components/__tests__/MagicLinkTab.rntl.tsx`
- `src/features/Auth/screens/__tests__/LoginCallbackScreen.rntl.tsx`
- `src/features/Auth/hooks/__tests__/useMagicLink.rntl.ts`

**Test Coverage**:

- MagicLinkTab rendering
- Email validation
- Send button disabled when invalid
- Send button loading state
- Success message display
- Resend button countdown
- useMagicLink hook (send function, error handling)
- LoginCallbackScreen (URL parsing, token extraction, storage)
- Error scenarios (invalid link, expired link, network error)
- EAA compliance

**Acceptance Criteria**:

- [ ] 100% coverage for MagicLinkTab
- [ ] 100% coverage for LoginCallbackScreen
- [ ] 100% coverage for useMagicLink hook
- [ ] All edge cases tested
- [ ] All error scenarios tested
- [ ] EAA compliance tested

**Effort**: 1.5h

---

### Phase 4: E2E Tests (2 hours)

**Tasks**: [TASK-221](../tasks/TASK-221-magic-link-e2e-tests.md)

**Objective**: Write E2E tests for magic link flow using Detox + Cucumber.

**Feature File**: `src/features/Auth/__tests__/MagicLink.feature`

**Scenarios**:

- Successful magic link login
- Invalid email (not registered)
- Network error during send
- Rate limiting (too many requests)
- Expired link (>10 minutes)
- Invalid link (malformed URL)
- Link already used
- Resend functionality

**Challenge**: Cannot test actual email delivery in E2E tests. Use mock deep link URL.

**E2E Approach**:

```typescript
// Simulate magic link tap by opening deep link URL
await device.openURL({
  url: 'warrendeleon://login?access_token=MOCK_TOKEN&refresh_token=MOCK_REFRESH&type=magiclink',
});
```

**Acceptance Criteria**:

- [ ] All scenarios pass on iOS simulator
- [ ] All scenarios pass on Android emulator
- [ ] Deep link handling tested
- [ ] Token extraction tested
- [ ] All error states tested

**Effort**: 2h

---

## Tasks

### Task Breakdown (4 tasks, 7.5h total)

| ID                                                     | Task                                         | Status   | Effort | Priority | Dependencies       |
| ------------------------------------------------------ | -------------------------------------------- | -------- | ------ | -------- | ------------------ |
| [TASK-218](../tasks/TASK-218-magic-link-ui.md)         | Magic Link UI Tab                            | 📋 To Do | 2h     | Medium   | None               |
| [TASK-219](../tasks/TASK-219-magic-link-api.md)        | Magic Link API Integration (Send + Callback) | 📋 To Do | 2h     | High     | TASK-218           |
| [TASK-220](../tasks/TASK-220-magic-link-rntl-tests.md) | Magic Link RNTL Tests                        | 📋 To Do | 1.5h   | Medium   | TASK-218, TASK-219 |
| [TASK-221](../tasks/TASK-221-magic-link-e2e-tests.md)  | Magic Link E2E Tests                         | 📋 To Do | 2h     | Medium   | TASK-218, TASK-219 |

**Total Effort**: 7.5 hours

**Dependency Chain**:

```
TASK-218 (UI) → TASK-219 (API) → TASK-220 (RNTL Tests)
                                → TASK-221 (E2E Tests)
```

---

## Non-Functional Requirements

### Performance

- Email sending <2 seconds
- Deep link handling <500ms
- Token storage <50ms
- Total flow <3 seconds (tap link → Home)

### Security

- Magic links expire after 10 minutes
- One-time use (invalidated after first use)
- Tokens in hardware-backed Keychain
- URL parameters validated with Zod
- HTTPS-only redirect URLs

### Accessibility

- All form fields have accessibility labels
- Success message announced to screen reader
- Touch targets minimum 48×48
- Color contrast 4.5:1 (text), 3:1 (UI)
- Screen reader navigable

### Testing

- 100% RNTL coverage (MagicLinkTab, LoginCallbackScreen, useMagicLink)
- E2E tests for all scenarios (Detox + Cucumber)
- Platform coverage: iOS + Android

---

## Definition of Done

**Functional**:

- [ ] Magic Link tab in Login screen
- [ ] Email sending via Supabase magic link API
- [ ] Deep link handler for magic link callback
- [ ] Token extraction and storage in Keychain
- [ ] Navigation to Home on success
- [ ] Resend button with 60-second countdown
- [ ] All error scenarios handled

**Quality**:

- [ ] 100% RNTL coverage
- [ ] All E2E tests passing (iOS + Android)
- [ ] `yarn validate` passes
- [ ] Zero ESLint/TypeScript errors

**Security**:

- [ ] Links expire after 10 minutes
- [ ] One-time use (invalidated)
- [ ] Tokens in Keychain (hardware-backed)
- [ ] URL validation with Zod

**Accessibility**:

- [ ] All UI elements EAA compliant
- [ ] Touch targets minimum 48×48
- [ ] Accessibility labels/hints/roles
- [ ] Screen reader navigable

**Documentation**:

- [ ] MagicLinkTab documented with JSDoc
- [ ] LoginCallbackScreen documented
- [ ] useMagicLink hook documented
- [ ] README.md updated with deep link setup

---

## Risk Assessment

### Technical Risks

| Risk                                  | Probability | Impact | Mitigation                                                               |
| ------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------ |
| Email delivery failure                | Medium      | High   | Clear error message, "Resend" button, test with multiple email providers |
| Deep link not opening app             | Low         | High   | Test on real devices, verify URL scheme configured correctly             |
| Magic link expires before user clicks | Medium      | Low    | 10-minute expiry (industry standard), clear expiry message               |
| URL parameters malformed              | Low         | Medium | Zod validation, graceful error handling                                  |

### UX Risks

| Risk                                | Probability | Impact | Mitigation                                                 |
| ----------------------------------- | ----------- | ------ | ---------------------------------------------------------- |
| Users don't check email immediately | High        | Low    | Success message reminds users to check email               |
| Users confused by "magic link" term | Low         | Low    | Clear instructions: "We'll send you a link to log in"      |
| Email goes to spam                  | Medium      | Medium | Test email deliverability, whitelist instructions in email |

---

## Testing Strategy

### Unit Tests (RNTL)

**Components**:

- MagicLinkTab (email form, send button, success message, resend)
- LoginCallbackScreen (URL parsing, token extraction)

**Hooks**:

- useMagicLink (send function, error handling)

**Coverage Target**: 100%

### E2E Tests (Detox + Cucumber)

**Scenarios**:

- Successful magic link login
- Invalid email
- Network error
- Rate limiting
- Expired link
- Invalid link
- Resend functionality

**Platform Coverage**: iOS + Android

---

## Dependencies

### Upstream Dependencies

- EPIC-021 (Registration) must be complete
- Supabase magic link API configured
- Deep link URL scheme registered (`warrendeleon://`)

### Downstream Dependencies

- None (independent login method)

---

**Last Updated**: 2025-11-21
**Story Points**: 4 (passwordless simplicity, but deep link complexity)
**Priority**: Medium (nice-to-have alternative to email/password)
**Next Review**: Before Phase 1 implementation

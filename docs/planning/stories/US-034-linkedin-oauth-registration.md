# US-034: LinkedIn OAuth Registration

**User Story ID**: US-034
**Title**: LinkedIn OAuth Registration with Automatic Profile Picture Extraction
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: 📋 To Do
**Priority**: Medium
**Story Points**: 5
**Effort Estimate**: 10.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## User Story

**As a** new user wanting to create an account quickly,
**I want to** register using my LinkedIn account with automatic profile extraction,
**So that** I can access the application without manual data entry and with a professional profile picture.

---

## Context & Rationale

### Why This Story Exists

LinkedIn OAuth provides a frictionless registration experience for professionals, automatically extracting verified profile information and professional profile pictures. This reduces registration friction, increases conversion rates, and ensures high-quality profile data from the start.

### Business Value

**Conversion Rate Optimisation**:

- Reduces registration time from ~2 minutes to ~30 seconds
- Pre-filled form data (name, email, profile picture) from trusted source
- Single-click registration for users already logged into LinkedIn

**Data Quality**:

- Verified email addresses from LinkedIn
- Professional profile pictures (high quality, appropriate)
- Accurate name spelling from LinkedIn profile

**Professional Appeal**:

- Aligns with portfolio app's professional nature
- LinkedIn is the platform most developers/designers use
- Reinforces credibility and professional networking

### User Benefits

1. **Speed**: Register in seconds vs minutes
2. **Convenience**: No manual typing of name, email, photo upload
3. **Quality**: Professional LinkedIn photo automatically used
4. **Trust**: OAuth is more trusted than password creation
5. **Security**: No password to remember or manage

### Technical Benefits

1. **Profile Picture Guaranteed**: LinkedIn provides picture, reduces manual upload burden
2. **Email Verification**: LinkedIn emails are pre-verified
3. **Data Accuracy**: Name and email from authoritative source
4. **Reduced Support**: Fewer "forgot password" tickets for OAuth users
5. **Industry Standard**: OAuth 2.0 is battle-tested and secure

---

## Impact & Effort

### Story Points: 5

**Justification**:

- Moderate complexity (OAuth flow + profile extraction + fallback handling)
- External dependency (LinkedIn API, requires developer app setup)
- Requires platform-specific deep linking (iOS + Android)
- State management integration (Redux auth slice)
- Testing complexity (mocking OAuth flow, E2E with test credentials)

**Compared to Similar Stories**:

- More complex than magic link (US-037: 3 SP) - requires LinkedIn app setup + profile extraction
- Less complex than email/password registration (US-033: 8 SP) - no manual form, simpler validation

### Effort: 10.5 hours

**Breakdown**:

- TASK-204: LinkedIn OAuth Button Component (1.5h)
- TASK-205: LinkedIn OAuth Flow Implementation (3h)
- TASK-206: Initials Avatar Component (2h)
- TASK-207: LinkedIn OAuth RNTL Tests (2h)
- TASK-208: LinkedIn OAuth E2E Tests (2h)

**Confidence**: High - OAuth pattern is well-documented, but LinkedIn API quirks may add time

---

## Acceptance Criteria

### Functional Requirements

- [ ] **LinkedIn OAuth button** displayed on Registration screen alongside email/password form
- [ ] **Tapping button** opens LinkedIn login in system browser (iOS Safari View Controller / Android Custom Tabs)
- [ ] **OAuth callback** redirects back to app via deep link after authorization
- [ ] **Profile extraction** automatically retrieves name, email, and profile picture URL from LinkedIn
- [ ] **Account creation** completes registration using LinkedIn data (no manual form required)
- [ ] **Profile picture download** fetches LinkedIn picture, resizes to 800×800, uploads to Supabase Storage
- [ ] **Initials avatar fallback** generates avatar from user's name if LinkedIn picture unavailable or download fails
- [ ] **Duplicate account handling** checks if email already exists, shows appropriate error
- [ ] **Cancellation handling** allows user to cancel OAuth flow and return to registration screen without error
- [ ] **Error handling** gracefully handles LinkedIn API errors, network failures, invalid tokens

### Security Requirements

- [ ] **OAuth state parameter** used to prevent CSRF attacks (random generated, validated on callback)
- [ ] **PKCE flow** implemented for additional security (code verifier + challenge)
- [ ] **Token validation** verifies LinkedIn access token signature before use
- [ ] **HTTPS only** for all OAuth redirects and API calls
- [ ] **No token storage** - LinkedIn access token used immediately then discarded
- [ ] **Deep link validation** ensures redirect URI matches registered URI exactly
- [ ] **Profile picture URL validation** checks URL is from LinkedIn CDN before downloading
- [ ] **Data masking** in logs - LinkedIn tokens and user data never logged
- [ ] **Response validation** uses Zod schema to validate LinkedIn API responses

### UI/UX Requirements

- [ ] **Button styling** follows GlueStack UI design system with LinkedIn brand colours
- [ ] **Loading states** shows spinner while OAuth flow in progress ("Connecting to LinkedIn...")
- [ ] **Error messages** are user-friendly ("LinkedIn login failed. Please try again or use email registration.")
- [ ] **Success feedback** shows brief toast after successful registration ("Welcome, [Name]!")
- [ ] **Initials avatar** uses GlueStack Avatar component with first letter of first/last name
- [ ] **Avatar colours** consistent based on name hash (same name = same colour)
- [ ] **Accessibility** follows EAA compliance (accessibilityRole, label, hint, 44×44 touch target)

### Testing Requirements

- [ ] **100% RNTL coverage** for LinkedIn OAuth button component
- [ ] **100% RNTL coverage** for Initials Avatar component
- [ ] **100% RNTL coverage** for OAuth flow logic (mocked LinkedIn API)
- [ ] **Detox E2E test** for successful LinkedIn OAuth registration (happy path)
- [ ] **Detox E2E test** for LinkedIn OAuth cancellation
- [ ] **Detox E2E test** for LinkedIn OAuth error handling (network failure)
- [ ] **Detox E2E test** for initials avatar fallback when LinkedIn picture unavailable

### Performance Requirements

- [ ] **OAuth redirect** completes in <2 seconds
- [ ] **Profile picture download** completes in <5 seconds (with retry on failure)
- [ ] **Total registration time** <30 seconds from button tap to logged in
- [ ] **Avatar generation** instant (<100ms) for initials fallback

---

## Test Scenarios

### Scenario 1: Successful LinkedIn OAuth Registration

```gherkin
Feature: LinkedIn OAuth Registration

  Scenario: User successfully registers using LinkedIn
    Given I am a new user on the Registration screen
    And I have a LinkedIn account with profile picture
    When I tap the "Continue with LinkedIn" button
    Then I should see a system browser open with LinkedIn login
    When I enter my LinkedIn credentials and authorize the app
    Then I should be redirected back to the app
    And I should see a loading indicator "Connecting to LinkedIn..."
    And my profile should be created with my LinkedIn name and email
    And my LinkedIn profile picture should be downloaded and uploaded to Supabase
    And I should be logged in and redirected to the Biometric Setup screen
    And I should see a success message "Welcome, [Name]!"
```

### Scenario 2: LinkedIn OAuth with Missing Profile Picture

```gherkin
Feature: LinkedIn OAuth Registration with Fallback

  Scenario: User registers via LinkedIn but has no profile picture
    Given I am a new user on the Registration screen
    And I have a LinkedIn account without profile picture
    When I tap the "Continue with LinkedIn" button
    And I complete the LinkedIn authorization flow
    Then my profile should be created with my LinkedIn name and email
    And an initials avatar should be generated from my name
    And the avatar should use the first letter of my first and last name
    And the avatar should have a consistent colour based on my name
    And I should be logged in successfully
```

### Scenario 3: LinkedIn OAuth Cancellation

```gherkin
Feature: LinkedIn OAuth Cancellation Handling

  Scenario: User cancels LinkedIn login
    Given I am a new user on the Registration screen
    When I tap the "Continue with LinkedIn" button
    And I see the LinkedIn login page in the browser
    When I tap the "Cancel" button in the browser
    Then I should be returned to the Registration screen
    And no error message should be displayed
    And I should be able to try LinkedIn OAuth again or use email registration
```

### Scenario 4: Duplicate Account Handling

```gherkin
Feature: LinkedIn OAuth Duplicate Account Prevention

  Scenario: User tries to register with LinkedIn using email already registered
    Given an account already exists with email "user@example.com"
    And I am on the Registration screen
    When I tap "Continue with LinkedIn"
    And I authorize with LinkedIn account using email "user@example.com"
    Then I should see an error message "An account with this email already exists"
    And I should see a link "Try logging in instead"
    When I tap "Try logging in instead"
    Then I should be redirected to the Login screen
```

### Scenario 5: Network Failure During OAuth

```gherkin
Feature: LinkedIn OAuth Error Handling

  Scenario: Network fails during OAuth callback
    Given I am on the Registration screen
    And I have no internet connection
    When I tap "Continue with LinkedIn"
    Then I should see an error message "No internet connection. Please check your network and try again."
    When I restore internet connection
    And I tap "Continue with LinkedIn" again
    Then the OAuth flow should proceed normally
```

---

## Risks & Mitigation

### Risk 1: LinkedIn Developer App Approval Delay

- **Likelihood**: Medium
- **Impact**: High (blocks entire OAuth feature)
- **Mitigation**:
  - Create LinkedIn Developer account immediately (TASK-188)
  - Submit app for review early in development
  - Have email/password registration ready as alternative
  - LinkedIn OAuth is "nice to have", not blocking for MVP

### Risk 2: LinkedIn API Rate Limits

- **Likelihood**: Low
- **Impact**: Medium (users unable to register via LinkedIn)
- **Mitigation**:
  - Monitor API usage in production
  - Implement exponential backoff with retry
  - Clear error messages directing users to email registration
  - LinkedIn free tier allows 100 requests/day (sufficient for testing)

### Risk 3: Deep Link Conflicts

- **Likelihood**: Low
- **Impact**: Medium (OAuth callback fails, user stuck)
- **Mitigation**:
  - Use unique deep link scheme (e.g., `warrendeleonapp://oauth/linkedin`)
  - Test on both iOS and Android physical devices
  - Clear error handling with "Try Again" button
  - Comprehensive E2E tests for deep linking

### Risk 4: Profile Picture Download Failures

- **Likelihood**: Medium (LinkedIn CDN issues, network timeouts)
- **Impact**: Low (initials avatar fallback works)
- **Mitigation**:
  - Automatic retry with exponential backoff (3 attempts)
  - Timeout set to 10 seconds per attempt
  - Initials avatar fallback is seamless (user may not notice)
  - Log failures for monitoring but don't block registration

### Risk 5: LinkedIn API Changes

- **Likelihood**: Low
- **Impact**: High (OAuth breaks completely)
- **Mitigation**:
  - Use stable LinkedIn OAuth 2.0 API (v2)
  - Monitor LinkedIn developer announcements
  - Comprehensive E2E tests will catch breaking changes
  - Email/password registration always available as fallback

---

## Pros & Cons

### Pros

✅ **Faster Registration**: 30 seconds vs 2 minutes for email/password
✅ **Higher Conversion**: Reduced friction = more completed registrations
✅ **Better Data Quality**: Verified emails, professional pictures, accurate names
✅ **Professional Appeal**: LinkedIn aligns with portfolio app's professional focus
✅ **Less Support**: OAuth users don't forget passwords
✅ **Industry Standard**: OAuth 2.0 is battle-tested and secure
✅ **Free**: LinkedIn OAuth is free for standard authentication use cases

### Cons

❌ **External Dependency**: Relies on LinkedIn API availability and stability
❌ **Setup Complexity**: Requires LinkedIn Developer app creation and approval
❌ **Platform Differences**: Deep linking behaves differently on iOS vs Android
❌ **Testing Complexity**: Mocking OAuth flows is more complex than form testing
❌ **Limited Adoption**: Not all users have LinkedIn (need email/password fallback)
❌ **API Rate Limits**: Free tier limited to 100 requests/day (may need paid tier in production)

---

## Definition of Ready

This story is ready to start when:

- [x] **LinkedIn Developer App** created and approved (TASK-188 complete)
- [x] **OAuth credentials** (Client ID, Client Secret) obtained and stored in `.env`
- [x] **Deep link scheme** registered in iOS (Info.plist) and Android (AndroidManifest.xml)
- [x] **Supabase Auth** configured to support LinkedIn OAuth provider
- [x] **Design approval** for LinkedIn OAuth button and initials avatar
- [x] **Redux auth slice** ready to accept LinkedIn OAuth tokens (TASK-196)
- [x] **Supabase Auth REST API client** supports OAuth token exchange (TASK-192)

---

## Definition of Done

This story is complete when:

- [ ] **All acceptance criteria** are met (functional, security, UI/UX, testing, performance)
- [ ] **All 5 tasks** completed (TASK-204 through TASK-208)
- [ ] **100% RNTL coverage** for LinkedIn OAuth button and initials avatar components
- [ ] **All E2E tests passing** (success, cancellation, error, fallback)
- [ ] **Physical device testing** completed on iOS and Android
- [ ] **LinkedIn OAuth flow** works end-to-end in both development and production
- [ ] **Initials avatar** generates correctly and matches design
- [ ] **Code review** completed with no blockers
- [ ] **`yarn validate`** passes (typecheck + lint + test)
- [ ] **EAA compliance** verified (accessibilityRole, label, hint, touch targets)
- [ ] **Security audit** passed (state parameter, PKCE, token validation, deep link validation)
- [ ] **Documentation** updated (README, API docs)

---

## Dependencies

### Depends On (Blockers)

- **TASK-188**: LinkedIn Developer App Setup (CRITICAL - must be first)
- **TASK-192**: Supabase Auth REST API Client (OAuth token exchange)
- **TASK-196**: Redux Auth Slice (state management for OAuth flow)
- **TASK-191**: 3-Tier Storage Implementation (token storage in Keychain)
- **Supabase Configuration**: OAuth provider enabled in Supabase dashboard

### Blocks (Dependent Stories)

- **US-037**: Magic Link Login (shares OAuth redirect handling patterns)
- **EPIC-022**: Login & Session Management (LinkedIn OAuth login uses same flow)

---

## Tasks

| ID                                                         | Task                            | Status   | Effort | Priority |
| ---------------------------------------------------------- | ------------------------------- | -------- | ------ | -------- |
| [TASK-204](../tasks/TASK-204-linkedin-oauth-button.md)     | LinkedIn OAuth Button Component | 📋 To Do | 1.5h   | Medium   |
| [TASK-205](../tasks/TASK-205-linkedin-oauth-flow.md)       | LinkedIn OAuth Flow             | 📋 To Do | 3h     | High     |
| [TASK-206](../tasks/TASK-206-initials-avatar-component.md) | Initials Avatar Component       | 📋 To Do | 2h     | Medium   |
| [TASK-207](../tasks/TASK-207-linkedin-oauth-rntl-tests.md) | LinkedIn OAuth RNTL Tests       | 📋 To Do | 2h     | Medium   |
| [TASK-208](../tasks/TASK-208-linkedin-oauth-e2e-tests.md)  | LinkedIn OAuth E2E Tests        | 📋 To Do | 2h     | Medium   |

**Total Tasks**: 5
**Total Effort**: 10.5 hours

---

## Implementation Phases

### Phase 1: LinkedIn Developer App Setup (TASK-188) - 2h

**CRITICAL**: This must be completed FIRST before any code is written.

**Objective**: Create and configure LinkedIn Developer Application to obtain OAuth credentials.

**Steps**:

1. Create LinkedIn Developer account at https://developer.linkedin.com
2. Create new app with required details
3. Configure OAuth redirect URIs (`warrendeleonapp://oauth/linkedin/callback`)
4. Request required permissions (r_liteprofile, r_emailaddress)
5. Obtain Client ID and Client Secret
6. Store credentials in `.env.development` and `.env.production`
7. Test credentials with Postman/curl before integration

**Deliverable**: LinkedIn Client ID and Client Secret securely stored, app approved for OAuth

### Phase 2: UI Components (TASK-204, TASK-206) - 3.5h

**Objective**: Build LinkedIn OAuth button and Initials Avatar component.

**Components**:

```typescript
// LinkedInOAuthButton.tsx
<Button
  onPress={handleLinkedInLogin}
  variant="outline"
  className="w-full"
  accessibilityRole="button"
  accessibilityLabel="Continue with LinkedIn"
  accessibilityHint="Opens LinkedIn login to register quickly using your professional profile"
  style={{ minWidth: 44, minHeight: 44 }}
  testID="linkedin-oauth-button"
>
  <HStack space="sm" className="items-center">
    <LinkedInIcon />
    <ButtonText>Continue with LinkedIn</ButtonText>
  </HStack>
</Button>

// InitialsAvatar.tsx
<Avatar
  size="xl"
  bg={getConsistentColour(name)} // Hash name for consistent colour
  testID="initials-avatar"
>
  <AvatarFallbackText accessibilityLabel={`Profile picture for ${name}`}>
    {getInitials(name)} // "Warren de Leon" → "WL"
  </AvatarFallbackText>
</Avatar>
```

**Deliverable**: Fully styled, accessible components ready for integration

### Phase 3: OAuth Flow Implementation (TASK-205) - 3h

**Objective**: Implement complete LinkedIn OAuth 2.0 flow with PKCE.

**Flow**:

1. User taps "Continue with LinkedIn" button
2. Generate OAuth state (random UUID) and PKCE code verifier
3. Open system browser with LinkedIn authorization URL
4. User authorizes app on LinkedIn
5. LinkedIn redirects to `warrendeleonapp://oauth/linkedin/callback?code=...&state=...`
6. App validates state parameter matches
7. Exchange authorization code for access token (with PKCE code verifier)
8. Fetch user profile (name, email, picture URL)
9. Download profile picture, resize, upload to Supabase Storage
10. Create user account via Supabase Auth REST API
11. Store tokens in Keychain (access + refresh)
12. Update Redux auth state
13. Navigate to BiometricSetupScreen

**Libraries**:

- `react-native-app-auth` for OAuth flow (handles system browser + deep links)
- `react-native-image-resizer` for profile picture resize
- Axios for LinkedIn API calls

**Deliverable**: Complete working OAuth flow from button tap to logged in

### Phase 4: Testing (TASK-207, TASK-208) - 4h

**RNTL Tests** (2h):

- LinkedInOAuthButton renders correctly
- Button press triggers OAuth flow
- Loading state shows spinner
- Error state shows error message
- Initials avatar generates correct initials ("Warren de Leon" → "WL")
- Initials avatar colour is consistent for same name
- All accessibility props present

**Detox E2E Tests** (2h):

- Successful LinkedIn OAuth registration (requires test LinkedIn account)
- OAuth cancellation returns to registration screen
- Network failure shows error message
- Initials avatar fallback when no LinkedIn picture
- Duplicate account shows error

**Deliverable**: 100% RNTL coverage, all E2E scenarios passing

---

## Alternative Approaches Considered

### Approach 1: Use Supabase Social Auth (LinkedIn Provider)

**Pros**: Simpler setup, Supabase handles OAuth flow
**Cons**: Still requires LinkedIn Developer app, less control over flow
**Decision**: Use custom OAuth implementation for full control and learning

### Approach 2: Support Multiple Social Logins (Google, Facebook, GitHub)

**Pros**: More options for users, higher conversion
**Cons**: Each requires separate developer app setup, more complexity, more testing
**Decision**: Start with LinkedIn only (most relevant for professional portfolio), add others later if needed

### Approach 3: Skip Initials Avatar, Require Profile Picture

**Pros**: Simpler implementation, guaranteed high-quality pictures
**Cons**: Poor UX if LinkedIn picture unavailable, blocks registration unnecessarily
**Decision**: Implement initials avatar fallback for graceful degradation

### Approach 4: Use LinkedIn Picture URL Directly (No Download)

**Pros**: Faster registration, less complexity
**Cons**: LinkedIn CDN reliability, potential broken images, no control over image size
**Decision**: Download and re-upload to Supabase Storage for reliability and consistency

---

## References

### LinkedIn OAuth Documentation

- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Profile API](https://docs.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)
- [LinkedIn Developer Portal](https://developer.linkedin.com)

### React Native Libraries

- [react-native-app-auth](https://github.com/FormidableLabs/react-native-app-auth) - OAuth library
- [react-native-image-resizer](https://github.com/bamlab/react-native-image-resizer) - Image resize

### Security Standards

- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
- [Project Security Standards](../../readme/SECURITY.md)

### Internal Documentation

- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
- [US-033: Email/Password Registration](./US-033-email-password-registration.md)
- [TASK-188: LinkedIn Developer App Setup](../tasks/TASK-188-linkedin-developer-app-setup.md)

---

**Last Updated**: 2025-11-21

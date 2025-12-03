# US-033: Email/Password Registration

**Story ID**: US-033
**Title**: Email/Password Registration with Required Profile Picture
**Epic**: [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
**Status**: ⏳ In Progress
**Priority**: Critical
**Created**: 2025-11-21
**Assigned To**: Warren de Leon
**Category**: Authentication & Backend Integration

---

## User Story

**As a** new user wanting to create an account,
**I want** to register using my email, password, first name, last name, and mobile number,
**So that** I can access the application securely and add my profile picture later after verification.

---

## Context & Rationale

Currently, the app has no authentication system and uses static GitHub-hosted JSON data. To enable user accounts, personalization, real-time features (chat), and backend integration, we need a solid registration system.

**Key Decision**: Custom REST API approach instead of Supabase SDK to maintain full control over authentication flow, reduce bundle size, and follow our security-first architecture. This allows us to implement 3-tier storage (Keychain for tokens, Encrypted Storage for PII, AsyncStorage for preferences) and comply with SECURITY.md standards.

**Profile Picture Decision (Updated 2025-11-24)**: Profile picture upload moved to **post-registration** (after email verification + login). This prevents bot spam, reduces attack surface, improves conversion rate, and ensures only verified users can upload images. Users can add profile picture via Profile Settings (US-042) after login.

**Related Epic**: See [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) for complete business impact, success metrics, and technical architecture.

---

## Benefits

### User Experience

- Multiple authentication options (email/password, LinkedIn, Magic Link later)
- Required profile picture creates immediate personalization
- Professional square crop ensures consistent appearance
- Biometric setup after registration for quick future access
- Clear validation messages guide users through registration
- Modern UI with GlueStack + NativeWind

### Business Impact

- Foundation for all future features (chat, notifications, user-generated content)
- Increased user engagement (personalized profiles from day one)
- Competitive advantage (modern auth with biometrics)
- Monetization potential (user accounts enable premium features)
- GDPR/EAA compliance via secure data storage

### Technical Benefits

- Scalable backend (Supabase PostgreSQL + Storage)
- Security-first architecture (3-tier storage, no secrets in code)
- Maintainable codebase (custom REST API, full control)
- Foundation for real-time features (Supabase Realtime later)
- Comprehensive testing (RNTL + Detox E2E)

---

## Impact & Effort

**Impact**: Critical (enables all future backend features)
**Effort**: High
**Story Points**: 8

**Effort Estimate**: 40 hours (includes Supabase setup, security hardening, UI, testing)
**Actual Effort**: _To be tracked_

**Breakdown** (Updated 2025-11-24):

- Supabase setup + security: 8h
- Storage implementation: 3h
- Auth REST API client: 4h
- Response/input validation: 4h
- Redux integration: 3h
- Registration UI: 4h (no profile picture)
- Email verification: 2h
- Testing (RNTL + E2E): 7h
- Data masking + security utilities: 2h
- Security enhancements (TASK-329-332): 10.5h
- ~~Profile picture picker: 3h~~ (moved to US-042)
- ~~Storage upload: 2h~~ (moved to US-042)

---

## Risks & Mitigation

### Risk 1: Supabase Setup Complexity

**Impact**: Could delay entire epic if setup fails
**Likelihood**: Medium (first-time Supabase user)
**Mitigation**:

- TASK-187 includes extremely detailed step-by-step instructions
- Assume zero prior Supabase knowledge
- Include screenshots and verification steps
- Fallback: Supabase Discord support channel

### Risk 2: Custom Auth API Complexity

**Impact**: Authentication bugs could compromise security
**Likelihood**: Medium
**Mitigation**:

- Follow Supabase Auth REST API docs exactly
- Comprehensive Zod validation for all responses
- Extensive unit testing for auth client
- Reference SECURITY.md for all patterns
- Token refresh interceptor with automatic retry

### Risk 3: Profile Picture Upload Failures

**Impact**: Users cannot complete registration
**Likelihood**: Low
**Mitigation**:

- Multiple retry attempts with exponential backoff
- Clear error messages with resolution steps
- Validate file type/size before upload
- Strip EXIF metadata for security
- Initials avatar fallback if all else fails

### Risk 4: Security Vulnerabilities

**Impact**: Critical if authentication/storage compromised
**Likelihood**: Low (with proper implementation)
**Mitigation**:

- 3-tier storage model (Keychain + Encrypted Storage)
- NEVER store tokens in AsyncStorage or Redux
- ProGuard (Android) + ATS (iOS) enabled
- Certificate pinning for Supabase
- Root/jailbreak detection
- Complete SECURITY.md checklist before production

### Risk 5: Poor Registration Conversion

**Impact**: Users abandon registration due to complexity
**Likelihood**: Medium
**Mitigation**:

- Clear progress indicators (email → password → picture)
- Skip option for LinkedIn OAuth (faster path)
- Inline validation with helpful messages
- Professional UI with GlueStack components
- A/B test required vs optional profile picture

---

## Pros & Cons

### Pros

✅ Custom REST API = full control, no SDK bloat
✅ 3-tier storage = defense-in-depth security
✅ Required profile picture = professional appearance
✅ Supabase free tier = £0 cost
✅ Scales to 50,000 MAU on free tier
✅ Foundation for chat, notifications, real-time features
✅ GDPR/EAA compliant data storage

### Cons

❌ High implementation effort (40h for registration alone)
❌ Custom auth = more code to maintain vs SDK
❌ Required picture may reduce conversion (mitigation: LinkedIn option)
❌ First-time Supabase setup complexity
❌ Multiple new libraries (keychain, encrypted-storage, biometrics, image-picker)

**Trade-off**: Higher upfront effort for long-term maintainability, security, and full control. Essential for production-grade application.

---

## Acceptance Criteria

### Functional

- [ ] User can register with email, password, first name, last name, and mobile number
- [x] Email validation prevents invalid formats (disposable emails blocked) ✅ TASK-195
- [x] Password validation enforces 8-128 characters, uppercase, lowercase, number, special char ✅ TASK-195
- [x] Password cannot contain personal info (name, email) ✅ TASK-195
- [x] First name validation enforces 2-50 characters, no numbers/special chars/emojis ✅ TASK-195
- [x] Last name validation enforces 2-50 characters, no numbers/special chars/emojis ✅ TASK-195
- [x] Mobile number validation enforces E.164 format with country code (+44, +1, etc.) ✅ TASK-195
- [ ] Country code selector allows choosing from all countries
- [x] Phone number is validated against selected country format (libphonenumber-js) ✅ TASK-195
- [ ] ~~Profile picture upload~~ (DEFERRED to post-login via US-042)
- [ ] Email verification link sent after successful registration
- [ ] Deep link from email opens verification screen
- [ ] Successful verification redirects to login screen
- [ ] Tokens stored in Keychain (NEVER AsyncStorage)
- [ ] User PII stored in Encrypted Storage
- [ ] Redux state updated with user data

### Security

- [ ] Passwords NEVER logged (even masked)
- [ ] Tokens NEVER stored in Redux
- [ ] All API responses validated with Zod schemas
- [x] All user inputs validated with Yup schemas ✅ TASK-195
- [ ] HTTPS-only communication (Supabase enforces)
- [ ] Certificate pinning configured (optional but recommended)
- [ ] ProGuard enabled for Android
- [ ] ATS configured for iOS (HTTPS-only, no exceptions)
- [ ] Root/jailbreak detection implemented
- [ ] Data masking in logs (emails: wa\*\*\*@example.com, tokens: [REDACTED])

### UI/UX

- [ ] Registration screen uses GlueStack UI + NativeWind
- [x] Form uses React Hook Form + Yup (schemas ready) ✅ TASK-195
- [x] Inline validation with clear error messages (Yup error messages) ✅ TASK-195
- [ ] Loading spinner during registration
- [ ] Success confirmation before email verification
- [ ] Profile picture preview before upload
- [ ] Camera/library selection with clear buttons
- [ ] Square crop interface with visual guides
- [ ] All interactive elements are EAA compliant (44×44 touch targets, labels, hints, contrast)

### Testing

- [ ] 100% RNTL coverage for registration flow
- [ ] Unit tests for auth REST API client
- [ ] Unit tests for storage utilities
- [ ] Unit tests for Redux auth slice
- [ ] E2E tests for complete registration flow
- [ ] E2E tests for validation errors
- [ ] E2E tests for profile picture upload
- [ ] E2E tests for email verification
- [ ] Manual testing on physical devices (iOS + Android)

---

## Test Scenarios

### Scenario 1: Successful Registration

```gherkin
Given I am a new user
When I enter valid email "test@example.com"
And I enter valid password "Test123456"
And I confirm password "Test123456"
And I upload a profile picture
And I tap "Register"
Then my account is created in Supabase
And my tokens are stored in Keychain
And my profile data is stored in Encrypted Storage
And I receive an email verification link
And I see a success message
```

### Scenario 2: Email Validation

```gherkin
Given I am on the registration screen
When I enter invalid email "notanemail"
Then I see error "Please enter a valid email"
And the Register button is disabled
```

### Scenario 3: Password Validation

```gherkin
Given I am on the registration screen
When I enter password "weak"
Then I see error "Password must be at least 8 characters"
When I enter password "alllowercase"
Then I see error "Must contain uppercase"
When I enter password "ALLUPPERCASE"
Then I see error "Must contain lowercase"
When I enter password "NoNumbers"
Then I see error "Must contain number"
When I enter password "Valid123"
Then I see success indicator
```

### Scenario 4: Password Mismatch

```gherkin
Given I entered password "Test123456"
When I enter confirm password "Different123"
Then I see error "Passwords must match"
And the Register button is disabled
```

### Scenario 5: Email Verification

```gherkin
Given I completed registration
And I received verification email
When I click the verification link
Then the app opens to verification screen
And my email is verified in Supabase
And I am redirected to biometric setup screen
```

### Scenario 6: First Name Validation

```gherkin
Given I am on the registration screen
When I enter first name "A"
Then I see error "First name must be at least 2 characters"
When I enter first name "John123"
Then I see error "First name cannot contain numbers"
When I enter first name "John@"
Then I see error "First name cannot contain special characters"
When I enter first name "John"
Then I see no validation error for first name
```

### Scenario 7: Last Name Validation

```gherkin
Given I am on the registration screen
When I enter last name "D"
Then I see error "Last name must be at least 2 characters"
When I enter last name "Doe456"
Then I see error "Last name cannot contain numbers"
When I enter last name "Doe#"
Then I see error "Last name cannot contain special characters"
When I enter last name "Doe"
Then I see no validation error for last name
```

### Scenario 8: Phone Number Validation

```gherkin
Given I am on the registration screen
And I select country code "+44" (UK)
When I enter phone number "123"
Then I see error "Please enter a valid UK mobile number"
When I enter phone number "abcd"
Then I see error "Phone number must contain only digits"
When I enter phone number "7412345678"
Then I see no validation error for phone number
And the full number is formatted as "+447412345678"
```

### Scenario 9: Country Code Selector

```gherkin
Given I am on the registration screen
When I tap the country code selector
Then I see a list of all countries with flags
When I search for "United Kingdom"
Then I see only UK in the results
When I select UK (+44)
Then the country code selector shows "+44" with UK flag
And the phone input placeholder updates to UK format
```

### E2E Testing (Detox + Cucumber)

```gherkin
Feature: Email/Password Registration

  @registration @critical
  Scenario: Complete registration
    Given I launch the app
    When I tap "Register"
    And I enter first name "John"
    And I enter last name "Doe"
    And I enter email "test@example.com"
    And I enter password "Test123456!"
    And I confirm password "Test123456!"
    And I select country code "+44"
    And I enter phone number "7412345678"
    And I tap "Register"
    Then I see "Check your email for verification link"

  @registration @validation
  Scenario: Email validation prevents invalid input
    Given I am on the registration screen
    When I enter email "invalid"
    Then I see error "Please enter a valid email"

  @registration @security
  Scenario: Password complexity enforced
    Given I am on the registration screen
    When I enter password "weak"
    Then I see error "Password must be at least 8 characters"
```

---

## Definition of Ready

- [x] User story statement written
- [x] Acceptance criteria defined (functional, security, UI/UX, testing)
- [x] Story points estimated (8)
- [x] Dependencies identified (Supabase setup)
- [x] Epic linked (EPIC-021)
- [x] Security requirements documented
- [x] Technical approach decided (custom REST API)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All 17 tasks completed
- [ ] Code reviewed for security (SECURITY.md checklist)
- [ ] 100% RNTL test coverage
- [ ] All E2E scenarios passing
- [ ] Manual testing on physical devices (iOS + Android)
- [ ] No regressions (`yarn validate` passes)
- [ ] Documentation updated (API docs, architecture diagrams)
- [ ] Security audit completed
- [ ] Product owner approval

---

## Dependencies

### Blockers

- None (first user story in epic)

### Requires

- **Supabase Account**: Must be created before starting (TASK-187)
- **LinkedIn Developer App**: Needed for OAuth setup (TASK-188)
- **Physical Devices**: Required for biometric testing

### Enables

- [US-034](./US-034-linkedin-oauth-registration.md): LinkedIn OAuth (can start in parallel)
- [US-035](./US-035-biometric-security-setup.md): Biometric setup (shown after registration)
- [EPIC-022](../epics/EPIC-022-login-session-management.md): Login flows
- All future features requiring authentication

---

## Tasks

| ID                                                                 | Task                               | Effort | Priority | Status         |
| ------------------------------------------------------------------ | ---------------------------------- | ------ | -------- | -------------- |
| [TASK-187](../tasks/TASK-187-supabase-setup-security-config.md)    | Complete Supabase Setup + Security | 4h     | Critical | ✅ Done        |
| [TASK-188](../tasks/TASK-188-linkedin-developer-app-setup.md)      | Create LinkedIn Developer App      | 2h     | Critical | ✅ Done        |
| [TASK-189](../tasks/TASK-189-android-security-hardening.md)        | Android Security Hardening         | 1.5h   | High     | ✅ Done        |
| [TASK-190](../tasks/TASK-190-ios-security-hardening.md)            | iOS Security Hardening             | 1h     | High     | ✅ Done        |
| [TASK-191](../tasks/TASK-191-three-tier-storage-implementation.md) | 3-Tier Storage Implementation      | 3h     | Critical | ✅ Done        |
| [TASK-192](../tasks/TASK-192-supabase-auth-rest-api-client.md)     | Supabase Auth REST API Client      | 4h     | Critical | ✅ Done        |
| [TASK-193](../tasks/TASK-193-certificate-pinning.md)               | Certificate Pinning (iOS)          | 2h     | Medium   | ✅ Done        |
| [TASK-194](../tasks/TASK-194-response-validation-zod.md)           | Response Validation with Zod       | 2h     | High     | ✅ Done        |
| [TASK-195](../tasks/TASK-195-input-validation-yup.md)              | Input Validation with Yup          | 2h     | High     | ✅ Done        |
| [TASK-196](../tasks/TASK-196-redux-auth-slice.md)                  | Redux Auth Slice                   | 3h     | Critical | ✅ Done        |
| [TASK-197](../tasks/TASK-197-profile-picture-picker.md)            | Profile Picture Picker (Deferred)  | 3h     | Medium   | 📋 To Do       |
| [TASK-198](../tasks/TASK-198-supabase-storage-api-client.md)       | Storage API Client (Deferred)      | 2h     | Medium   | 📋 To Do       |
| [TASK-199](../tasks/TASK-199-registration-screen-ui.md)            | Registration Screen UI             | 4h     | Critical | 📋 To Do       |
| [TASK-200](../tasks/TASK-200-email-verification-screen.md)         | Email Verification Screen          | 2h     | High     | ⏳ In Progress |
| [TASK-201](../tasks/TASK-201-data-masking-logs.md)                 | Data Masking in Logs Utility       | 1h     | High     | 📋 To Do       |
| [TASK-202](../tasks/TASK-202-registration-rntl-tests.md)           | Registration RNTL Tests            | 3h     | High     | 📋 To Do       |
| [TASK-203](../tasks/TASK-203-registration-e2e-tests.md)            | Registration E2E Tests             | 4h     | High     | 📋 To Do       |
| [TASK-329](../tasks/TASK-329-expand-common-password-list.md)       | Expand Common Password List        | 1.5h   | Medium   | ✅ Done        |
| [TASK-330](../tasks/TASK-330-unicode-normalization-names.md)       | Unicode Normalization for Names    | 1h     | Medium   | 📋 To Do       |

**Total Tasks**: 19
**Total Effort**: 46 hours

---

## Implementation Phases

### Phase 0: Supabase Setup (Day 1) - 8h

Complete Supabase configuration before any coding:

- **TASK-187**: Create account, set up project, configure database schema, RLS policies, storage bucket
- **TASK-188**: Create LinkedIn Developer App, get OAuth credentials
- **TASK-189**: Enable ProGuard for Android
- **TASK-190**: Configure ATS for iOS

**Validation**: Supabase project accessible, database queryable, storage working, LinkedIn OAuth configured

### Phase 1: Security Foundation (Day 2-3) - 9h

Implement secure storage and API clients:

- **TASK-191**: 3-tier storage (Keychain + Encrypted Storage + AsyncStorage)
- **TASK-192**: Custom Supabase Auth REST API client with token refresh
- **TASK-193**: Certificate pinning (optional)
- **TASK-194**: Zod response validation schemas
- **TASK-195**: Yup input validation schemas

**Validation**: Tokens stored securely, API calls validated, no secrets in code

### Phase 2: State Management (Day 4) - 4h

Redux integration for authentication:

- **TASK-196**: Auth slice with async thunks (register, verify, refresh)
- **TASK-201**: Data masking utility for logs

**Validation**: Redux state management working, no sensitive data logged

### Phase 3: UI Implementation (Day 5-6) - 6h

User-facing screens:

- **TASK-199**: Registration screen with form validation
- **TASK-200**: Email verification screen with deep linking

**Validation**: UI functional, forms validate, email verification works

### Phase 4: Testing (Day 7-8) - 7h

Comprehensive test coverage:

- **TASK-202**: RNTL unit tests (100% coverage)
- **TASK-203**: Detox E2E tests (all scenarios)

**Validation**: All tests passing, no regressions

---

## Timeline & Dates

**Start Date**: TBD
**Estimated Duration**: 8 working days (47.5h / 6h per day, excluding deferred TASK-197/198)
**Completed Date**: _Not yet completed_

**Note**: Profile picture tasks (TASK-197/198) moved to US-042 (post-login). This reduces registration scope while improving security and UX.

---

## Blocked Information

**Blocked Since**: _Not blocked_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status | Notes         |
| ---------- | ------ | ------------- |
| 2025-11-21 | To Do  | Story created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Technical Debt Score**: 0

This story establishes clean architecture patterns for auth. No compromises on security.

---

## Success Criteria

This user story is complete when:

1. ✅ **Registration Functional**: Users can create accounts via email/password with required profile picture
2. ✅ **Security Hardened**: 3-tier storage, validated inputs/outputs, ProGuard+ATS enabled, no secrets in code
3. ✅ **Email Verification**: Users receive and can verify email via deep link
4. ✅ **All Tasks Complete**: 17 tasks implemented, tested, and passing
5. ✅ **100% Test Coverage**: RNTL unit tests + Detox E2E tests all passing
6. ✅ **Physical Device Testing**: Tested on real iOS and Android devices
7. ✅ **Security Audit**: SECURITY.md checklist completed
8. ✅ **Documentation**: Architecture diagrams, API docs, setup guides updated

---

## Alternative Approaches

### Alternative 1: Use Supabase JS SDK for Auth

Use `@supabase/supabase-js` SDK instead of custom REST API.

**Pros**: Faster implementation, battle-tested, official support
**Cons**: Larger bundle size, less control, mixing SDK with custom storage approach

**Decision**: Custom REST API for full control, consistency, and learning

### Alternative 2: Optional Profile Picture

Allow users to skip profile picture during registration.

**Pros**: Higher conversion rate, faster registration
**Cons**: Inconsistent user experience, less professional appearance

**Decision**: Required picture (with LinkedIn option for easier flow)

### Alternative 3: Use Firebase Auth Instead of Supabase

**Pros**: More mature, better documentation
**Cons**: More expensive, no PostgreSQL, separate services for storage/functions

**Decision**: Supabase (all-in-one platform, free tier sufficient)

---

## Notes & Learnings

_To be filled in during/after implementation_

### Technical Challenges

_Document any issues encountered_

### Performance Insights

_Note any optimization opportunities_

### Security Findings

_Log any security concerns or improvements_

---

## References

- [Supabase Auth REST API](https://supabase.com/docs/reference/javascript/auth-api)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [react-native-keychain](https://github.com/oblador/react-native-keychain)
- [react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage)
- [react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)
- [react-native-image-resizer](https://github.com/bamlab/react-native-image-resizer)
- [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
- [Project Security Standards](../../readme/SECURITY.md)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

---

**Last Updated**: 2025-11-24

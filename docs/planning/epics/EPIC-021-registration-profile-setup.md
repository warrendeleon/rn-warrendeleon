# EPIC-021: Registration & Profile Setup (Security Hardened)

**Epic ID**: EPIC-021
**Title**: Registration & Profile Setup - Supabase Integration with 3-Tier Security
**Status**: ⏳ In Progress
**Priority**: Critical
**Created**: 2025-11-21
**Owner**: Warren de Leon
**Category**: Authentication & Backend Integration
**Timeline**: 3-4 weeks

---

## Executive Summary

Implement Supabase-backed registration with custom REST API authentication (no SDK), required profile picture upload with square cropping, LinkedIn OAuth with automatic picture extraction, and biometric security (Face ID/Fingerprint/6-digit PIN). This epic establishes the foundation for secure user authentication using a 3-tier storage model and industry-standard security practices.

**Business Impact**: Seamless user onboarding with multiple authentication options, profile personalization from day one, and bank-grade security via biometric authentication.

---

## Business Value

### Problem

The current app uses GitHub-hosted JSON data with no authentication system:

- **No User Accounts**: Cannot personalize experience or store user-specific data
- **No Backend**: All data is static from GitHub repository
- **No Real-Time Features**: Cannot implement chat, notifications, or dynamic updates
- **No Authentication**: Cannot secure user data or implement role-based access

This leads to:

- Limited feature set (no chat, no dynamic profiles, no user-generated content)
- No way to monetize or scale the application
- Cannot comply with data protection regulations (GDPR, EAA)
- No competitive advantage vs modern portfolio applications

### Opportunity

By implementing Supabase authentication and data layer:

- **Modern Backend**: PostgreSQL database, real-time capabilities, storage, Edge Functions
- **Multi-Auth Options**: Email/password, LinkedIn OAuth, Magic Link (passwordless)
- **Security First**: 3-tier storage (Keychain + Encrypted Storage + AsyncStorage), biometric auth
- **Profile Personalization**: Required profile picture with professional square crop
- **Scalability**: Foundation for chat, notifications, user-generated content
- **Compliance Ready**: GDPR/EAA compliant data storage and security

### Success Metrics

| Metric                          | Current | Target  | Business Impact             |
| ------------------------------- | ------- | ------- | --------------------------- |
| User Registration Completion    | N/A     | 80%+    | High conversion rate        |
| Profile Picture Upload Rate     | N/A     | 100%    | Professional appearance     |
| LinkedIn OAuth Adoption         | N/A     | 40%+    | Reduced friction            |
| Biometric Auth Adoption         | N/A     | 70%+    | Enhanced security & UX      |
| Registration Time (avg)         | N/A     | <2 min  | Fast onboarding             |
| Security Incidents              | N/A     | 0       | Zero tolerance for breaches |
| Authentication Method Diversity | N/A     | 3 types | Flexibility for all users   |

---

## Scope

### In Scope

**Supabase Configuration (Phase 0)**:

- Account creation and project setup (first-time user guidance)
- Database schema with Row Level Security (RLS) policies
- Storage bucket for profile pictures (public access with RLS)
- LinkedIn Developer App setup
- OAuth provider configuration
- Magic Link configuration
- Environment variables and security keys

**3-Tier Storage Implementation**:

- **Tier 1 (Keychain)**: Auth tokens, encryption keys, PINs (hardware-backed security)
- **Tier 2 (Encrypted Storage)**: User PII (email, name, phone, profile picture URL)
- **Tier 3 (AsyncStorage)**: Non-sensitive preferences (theme, language) - via Redux Persist

**Custom Authentication (REST API, No SDK)**:

- Email/password registration with validation (Yup + React Hook Form)
- Supabase Auth REST API client with Axios
- Token management (access + refresh tokens) in Keychain
- Email verification flow with deep linking
- Redux auth state management

**Required Profile Picture**:

- Camera or library selection
- Square crop enforcement (1:1 aspect ratio)
- Automatic resize to 800×800px
- Compression to 80% JPEG quality
- EXIF metadata stripping (security)
- Upload to Supabase Storage
- Fallback to initials avatar if no picture

**LinkedIn OAuth**:

- "Continue with LinkedIn" button
- Automatic profile picture extraction from LinkedIn
- Profile data pre-population (name, email)
- Fallback to initials avatar if no LinkedIn picture

**Biometric Security Setup**:

- Face ID/Fingerprint detection
- 6-digit PIN as fallback
- Setup screen shown after first login
- User can decline (warning shown)
- Preference stored in Keychain

**Security Hardening**:

- Android ProGuard configuration
- iOS App Transport Security (ATS)
- Certificate pinning for Supabase (optional but recommended)
- Response validation with Zod schemas
- Input validation with Yup schemas
- Data masking in logs
- Root/jailbreak detection

### Out of Scope

- Login flow (covered in EPIC-022)
- Password recovery (covered in EPIC-024)
- Settings screen for security preferences (covered in EPIC-023)
- Real-time chat (covered in EPIC-025)
- Push notifications (covered in EPIC-026)
- Data migration from GitHub (covered in EPIC-027)
- Supabase SDK usage (custom REST API approach only, except for chat later)

---

## Timeline & Dates

**Start Date**: TBD
**Target Date**: 3-4 weeks from start
**Completed Date**: _Not yet completed_

**Estimated Duration**: 3-4 weeks (60-80 hours total effort)

**Milestones**:

- Week 1: Supabase setup complete, secure storage implemented
- Week 2: Custom auth REST API client, Redux integration
- Week 3: Registration UI, profile picture upload, email verification
- Week 4: LinkedIn OAuth, biometric setup, E2E tests

---

## Budget & Resources

**Budget**: £0 (Supabase free tier)
**Actual Cost**: _To be tracked_
**Total Effort**: 60-80 hours
**Actual Effort**: _To be tracked_

**Free Tier Limits (Supabase)**:

- Database: 500MB
- Storage: 1GB (sufficient for ~3,000-5,000 profile pictures @ 300KB each)
- Bandwidth: 5GB/month
- Monthly Active Users: 50,000
- API Requests: Unlimited

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: End users, potential employers viewing portfolio, regulatory compliance (GDPR/EAA)

---

## ROI & Risk

**ROI Score**: Very High
**Risk Level**: Medium-High

### Key Risks

**Risk 1**: Complexity of Custom Auth Implementation

- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: Follow Supabase Auth REST API documentation exactly; use Zod for response validation; comprehensive unit testing for all auth flows; reference SECURITY.md standards

**Risk 2**: Profile Picture Upload Failures

- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Multiple retries with exponential backoff; clear error messages; validate file type and size before upload; strip EXIF data for security

**Risk 3**: LinkedIn OAuth Setup Complexity

- **Likelihood**: Medium
- **Impact**: Low-Medium
- **Mitigation**: Extremely detailed setup instructions in TASK-187; test OAuth flow on both iOS and Android; fallback to email/password if OAuth fails

**Risk 4**: Security Vulnerabilities

- **Likelihood**: Low
- **Impact**: Critical
- **Mitigation**: Follow SECURITY.md standards to the letter; 3-tier storage model; no secrets in code; ProGuard + ATS enabled; certificate pinning; root/jailbreak detection; security audit before production

**Risk 5**: Biometric Auth Platform Differences

- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Test on both iOS and Android physical devices; clear fallback to PIN; graceful degradation if biometrics unavailable

---

## User Stories

| ID                                                         | User Story                  | Status   | Story Points |
| ---------------------------------------------------------- | --------------------------- | -------- | ------------ |
| [US-033](../stories/US-033-email-password-registration.md) | Email/Password Registration | 📋 To Do | 8            |
| [US-034](../stories/US-034-linkedin-oauth-registration.md) | LinkedIn OAuth Registration | 📋 To Do | 5            |
| [US-035](../stories/US-035-biometric-security-setup.md)    | Biometric Security Setup    | 📋 To Do | 4            |

**Total Stories**: 3
**Total Story Points**: 17

---

## Tasks

### US-033: Email/Password Registration (17 tasks)

| ID                                                                 | Task                               | Status         | Effort | Priority |
| ------------------------------------------------------------------ | ---------------------------------- | -------------- | ------ | -------- |
| [TASK-187](../tasks/TASK-187-supabase-setup-security-config.md)    | Complete Supabase Setup + Security | ✅ Done        | 4h     | Critical |
| [TASK-188](../tasks/TASK-188-linkedin-developer-app-setup.md)      | Create LinkedIn Developer App      | ✅ Done        | 1h     | Critical |
| [TASK-189](../tasks/TASK-189-android-security-hardening.md)        | Android Security Hardening         | ✅ Done        | 1.5h   | High     |
| [TASK-190](../tasks/TASK-190-ios-security-hardening.md)            | iOS Security Hardening             | ✅ Done        | 1h     | High     |
| [TASK-191](../tasks/TASK-191-three-tier-storage-implementation.md) | 3-Tier Storage Implementation      | ✅ Done        | 3h     | Critical |
| [TASK-192](../tasks/TASK-192-supabase-auth-rest-api-client.md)     | Supabase Auth REST API Client      | 📋 To Do       | 4h     | Critical |
| [TASK-193](../tasks/TASK-193-certificate-pinning.md)               | Certificate Pinning (iOS)          | ✅ Done        | 2h     | Medium   |
| [TASK-194](../tasks/TASK-194-response-validation-zod.md)           | Response Validation with Zod       | 📋 To Do       | 2h     | High     |
| [TASK-195](../tasks/TASK-195-input-validation-yup.md)              | Input Validation with Yup          | 📋 To Do       | 2h     | High     |
| [TASK-196](../tasks/TASK-196-redux-auth-slice.md)                  | Redux Auth Slice                   | 📋 To Do       | 3h     | Critical |
| [TASK-197](../tasks/TASK-197-profile-picture-picker.md)            | Profile Picture Picker Component   | 📋 To Do       | 3h     | High     |
| [TASK-198](../tasks/TASK-198-supabase-storage-api-client.md)       | Supabase Storage API Client        | 📋 To Do       | 2h     | High     |
| [TASK-199](../tasks/TASK-199-registration-screen-ui.md)            | Registration Screen UI             | 📋 To Do       | 4h     | Critical |
| [TASK-200](../tasks/TASK-200-email-verification-screen.md)         | Email Verification Screen          | ⏳ In Progress | 2h     | High     |
| [TASK-201](../tasks/TASK-201-data-masking-logs.md)                 | Data Masking in Logs Utility       | 📋 To Do       | 1h     | High     |
| [TASK-202](../tasks/TASK-202-registration-rntl-tests.md)           | Registration RNTL Tests            | 📋 To Do       | 3h     | High     |
| [TASK-203](../tasks/TASK-203-registration-e2e-tests.md)            | Registration E2E Tests             | 📋 To Do       | 4h     | High     |

### US-034: LinkedIn OAuth Registration (5 tasks)

| ID                                                         | Task                               | Status   | Effort | Priority |
| ---------------------------------------------------------- | ---------------------------------- | -------- | ------ | -------- |
| [TASK-204](../tasks/TASK-204-linkedin-oauth-button.md)     | LinkedIn OAuth Button Component    | 📋 To Do | 1.5h   | Medium   |
| [TASK-205](../tasks/TASK-205-linkedin-oauth-flow.md)       | LinkedIn OAuth Flow Implementation | 📋 To Do | 3h     | High     |
| [TASK-206](../tasks/TASK-206-initials-avatar-component.md) | Initials Avatar Component          | 📋 To Do | 2h     | Medium   |
| [TASK-207](../tasks/TASK-207-linkedin-oauth-rntl-tests.md) | LinkedIn OAuth RNTL Tests          | 📋 To Do | 2h     | Medium   |
| [TASK-208](../tasks/TASK-208-linkedin-oauth-e2e-tests.md)  | LinkedIn OAuth E2E Tests           | 📋 To Do | 2h     | Medium   |

### US-035: Biometric Security Setup (4 tasks)

| ID                                                              | Task                           | Status   | Effort | Priority |
| --------------------------------------------------------------- | ------------------------------ | -------- | ------ | -------- |
| [TASK-209](../tasks/TASK-209-biometric-capability-detection.md) | Biometric Capability Detection | 📋 To Do | 1.5h   | High     |
| [TASK-210](../tasks/TASK-210-biometric-setup-screen.md)         | BiometricSetupScreen UI        | 📋 To Do | 3h     | High     |
| [TASK-211](../tasks/TASK-211-pin-setup-screen.md)               | 6-Digit PIN Setup Screen       | 📋 To Do | 2.5h   | High     |
| [TASK-212](../tasks/TASK-212-biometric-setup-e2e-tests.md)      | Biometric Setup E2E Tests      | 📋 To Do | 2h     | Medium   |

**Total Tasks**: 26
**Total Effort**: 58.5 hours

---

## Definition of Done

This epic is complete when:

1. [ ] **Supabase configured**: Account created, project set up, database schema with RLS, storage bucket configured
2. [ ] **3-tier storage implemented**: Keychain (tokens), Encrypted Storage (PII), AsyncStorage (preferences)
3. [ ] **Custom auth working**: Email/password registration, token management, email verification via REST API
4. [ ] **Profile picture required**: Users cannot complete registration without uploading or taking picture
5. [ ] **LinkedIn OAuth functional**: Users can register/login via LinkedIn, picture extracted automatically
6. [ ] **Biometric security setup**: Face ID/Fingerprint/PIN setup shown after first login
7. [ ] **Security standards met**: All items in SECURITY.md checklist completed
8. [ ] **All tests passing**: 100% RNTL coverage for auth flows, E2E tests for all scenarios
9. [ ] **No regressions**: Existing features still work, `yarn validate` passes
10. [ ] **Documentation updated**: API docs, README updated with new auth flows

---

## Status History

_Auto-tracked when status changes_

| Date       | Status | Notes        |
| ---------- | ------ | ------------ |
| 2025-11-21 | To Do  | Epic created |

---

## Related Epics

- [EPIC-022](./EPIC-022-login-session-management.md) - Login & Session Management (depends on this epic)
- [EPIC-023](./EPIC-023-security-settings.md) - Security Settings (depends on this epic)
- [EPIC-024](./EPIC-024-password-recovery.md) - Password Recovery (depends on this epic)
- [EPIC-025](./EPIC-025-realtime-chat.md) - Real-Time Chat (depends on auth)

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth REST API](https://supabase.com/docs/reference/javascript/auth-api)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [LinkedIn OAuth](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [react-native-keychain](https://github.com/oblador/react-native-keychain)
- [react-native-encrypted-storage](https://github.com/emeraldsanto/react-native-encrypted-storage)
- [react-native-biometrics](https://github.com/SelfLender/react-native-biometrics)
- [Project Security Standards](../../readme/SECURITY.md)
- [GDPR Compliance](https://gdpr.eu/)
- [EAA Requirements](../../readme/ACCESSIBILITY.md)

---

**Last Updated**: 2025-11-21

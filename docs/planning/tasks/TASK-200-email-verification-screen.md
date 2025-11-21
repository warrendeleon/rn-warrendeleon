# TASK-200: Email Verification Screen

**Task ID**: TASK-200 | **User Story**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 2h | **Created**: 2025-11-21

## Objective

Build email verification screen showing "Check your email" message, resend verification email button, deep link handling for `warrendeleonapp://auth/callback`.

## Acceptance Criteria

- [ ] Display "Check your email" message
- [ ] Show email address registered
- [ ] "Resend Email" button with rate limiting (1 per minute)
- [ ] Deep link handling verifies email and navigates to BiometricSetup
- [ ] Error handling for verification failures
- [ ] EAA compliance
- [ ] RNTL + E2E tests

**Effort**: 2h | **Last Updated**: 2025-11-21

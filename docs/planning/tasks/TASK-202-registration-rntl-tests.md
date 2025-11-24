# TASK-202: Registration RNTL Tests

**ID**: TASK-202 | **US**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 3h | **Created**: 2025-11-21

## Objective

100% RNTL coverage for RegistrationScreen, ProfilePicturePicker, EmailVerificationScreen.

## Acceptance Criteria

- [ ] Test form validation (invalid firstName, invalid lastName, invalid email, weak password, mismatch, invalid phone)
- [ ] Test firstName validation (too short, contains numbers/special chars)
- [ ] Test lastName validation (too short, contains numbers/special chars)
- [ ] Test phone number validation (invalid format, missing country code, E.164 validation)
- [ ] Test country code selector interaction
- [ ] Test profile picture selection
- [ ] Test successful registration flow with all fields
- [ ] Test error handling (API failures)
- [ ] Test navigation to EmailVerification
- [ ] Test accessibility props present
- [ ] 100% coverage achieved

**Effort**: 3h | **Last Updated**: 2025-11-21

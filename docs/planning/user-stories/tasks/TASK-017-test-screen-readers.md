# TASK-017: Test VoiceOver and TalkBack

**ID**: TASK-017
**Title**: Manual Testing with VoiceOver and TalkBack
**Epic**: [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)
**User Story**: [US-003: Inclusive Screen Reader Support](../stories/US-003-inclusive-screen-reader-support.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `testing`, `accessibility`, `manual-testing`, `voiceover`, `talkback`

---

## Context

Comprehensive manual testing with VoiceOver (iOS) and TalkBack (Android) to validate accessibility implementation.

---

## Test Plan

### iOS VoiceOver Testing

**Enable VoiceOver**: Settings → Accessibility → VoiceOver → On (or triple-click side button shortcut)

**Test Scenarios**:

1. Navigate through Home screen using swipe gestures
2. Navigate to Settings screen
3. Navigate to Language screen and select a language
4. Navigate to Appearance screen and select a theme
5. Return to Home screen
6. Verify all announcements are clear and accurate

### Android TalkBack Testing

**Enable TalkBack**: Settings → Accessibility → TalkBack → On

**Test Scenarios**:

1. Same as VoiceOver scenarios above
2. Verify platform differences documented

---

## Acceptance Criteria

- [ ] All screens navigable using only screen reader
- [ ] All buttons announce correctly
- [ ] Selection states announced correctly
- [ ] User can complete primary user journeys
- [ ] Platform differences documented (if any)

---

## Test Scenarios

See [US-003 Test Scenarios](../stories/US-003-inclusive-screen-reader-support.md#test-scenarios) for detailed GIVEN/WHEN/THEN scenarios.

---

## Dependencies

**Blockers**: [TASK-016](./TASK-016-accessibility-all-screens.md)

---

## Success Criteria

✅ VoiceOver testing complete
✅ TalkBack testing complete
✅ All user journeys completable via screen reader
✅ Issues documented and fixed

---

**Last Updated**: 2025-01-11

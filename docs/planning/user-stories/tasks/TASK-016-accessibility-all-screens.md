# TASK-016: Accessibility All Screens

**ID**: TASK-016
**Title**: Add Accessibility Labels to All Screens
**Epic**: [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)
**User Story**: [US-003: Inclusive Screen Reader Support](../stories/US-003-inclusive-screen-reader-support.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `accessibility`, `a11y`, `screens`

---

## Context

Add accessibility props to screen-level elements (headers, section labels) across Home, Settings, Language, and Appearance screens.

---

## Technical Details

### Files to Modify

- `src/features/Home/HomeScreen.tsx`
- `src/features/Settings/SettingsScreen.tsx`
- `src/features/Settings/LanguageScreen.tsx`
- `src/features/Settings/AppearanceScreen.tsx`

### Elements to Label

- Screen titles (use `accessibilityRole="header"`)
- Section headers (e.g., "SETTINGS", "LANGUAGES")
- Any non-interactive text that provides context

---

## Acceptance Criteria

- [ ] All screen titles have accessibilityRole="header"
- [ ] Section headers properly labelled
- [ ] Navigation structure is logical for screen readers
- [ ] All tests pass

---

## Dependencies

**Blockers**: [TASK-015](./TASK-015-accessibility-selectable-list.md)

---

**Last Updated**: 2025-01-11

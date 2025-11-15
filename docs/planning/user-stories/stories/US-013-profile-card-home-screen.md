# US-013: Profile Card on Home Screen

**Story ID**: US-013
**Title**: Display User Profile Card on Home Screen
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Completed
**Priority**: Medium
**Created**: 2025-11-15
**Updated**: 2025-11-15
**Completed**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: UI/UX

---

## User Story

**As a** user,
**I want** to see my profile photo and name at the top of the Home screen,
**So that** I can quickly access my full profile and verify the app is displaying my correct information.

---

## Context & Rationale

Add a profile card component at the top of the Home screen that displays the user's avatar, name, and a "View Profile" action. This provides quick visual confirmation of whose profile is loaded and creates an intuitive entry point to the full profile details.

The component should follow iOS design patterns, matching the existing ChevronButtonGroup styling, and integrate with the existing Redux profile data layer.

---

## Acceptance Criteria

- [ ] ProfileCard component created with avatar, name, and chevron
- [ ] Component displays data from Redux profile slice
- [ ] Component placed at top of HomeScreen above button groups
- [ ] Pressing the card navigates to Profile Data screen
- [ ] Component follows iOS styling (rounded, white/dark background)
- [ ] Component is responsive to light/dark theme
- [ ] Unit tests written for ProfileCard component
- [ ] HomeScreen tests updated for ProfileCard integration

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 3.5 hours

---

## Tasks

| ID                                                           | Task                                | Effort | Status      |
| ------------------------------------------------------------ | ----------------------------------- | ------ | ----------- |
| [TASK-063](../tasks/TASK-063-create-profile-card.md)         | Create ProfileCard Component        | 1.5h   | Not Started |
| [TASK-064](../tasks/TASK-064-integrate-profile-card-home.md) | Integrate ProfileCard in HomeScreen | 0.5h   | Not Started |
| [TASK-065](../tasks/TASK-065-test-profile-card.md)           | Add Unit Tests for ProfileCard      | 1h     | Not Started |
| [TASK-066](../tasks/TASK-066-update-home-screen-tests.md)    | Update HomeScreen Tests             | 0.5h   | Not Started |

---

## Related User Stories

- [US-006](./US-006-data-migration-and-structure.md) - Profile data structure
- [US-007](./US-007-redux-data-layer.md) - Redux profile slice (provides data)

---

## Technical Notes

**Redux Integration:**

- Uses `selectProfile` selector from profile slice
- Accesses `profilePicture`, `name`, `lastName` fields
- No additional data fetching required

**Component Structure:**

- Similar to ButtonWithChevron but horizontal layout
- Avatar (48x48) on left
- Name/subtitle in center with flex-grow
- Chevron icon on right
- Pressable with navigation to ProfileData screen

**Design Reference:**
Based on ViewProfileButton from old app, modernised with:

- MaterialCommunityIcons for chevron (consistency)
- NativeWind/Tailwind styling
- SF Pro Text font
- iOS-style rounded card matching button groups

---

## Notes

**2025-11-15**: Created after completing HomeScreen button groups redesign. ProfileCard will be positioned above the three button groups (Work & Learning, Contact, Settings) to create a clear visual hierarchy with profile information at the top.

---

**Last Updated**: 2025-11-15

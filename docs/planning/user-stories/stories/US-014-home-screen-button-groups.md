# US-014: Home Screen Button Groups

**Story ID**: US-014
**Title**: Organised Button Groups on Home Screen
**Epic**: [EPIC-007: Home Screen UI Redesign](../epics/EPIC-007-home-screen-redesign.md)
**Status**: Completed
**Priority**: Medium
**Created**: 2025-11-15
**Updated**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: UI/UX

---

## User Story

**As a** user,
**I want** clearly organised button groups on the Home screen,
**So that** I can easily find and navigate to different sections of the app.

---

## Context & Rationale

Redesign the Home screen from individual buttons to organised button groups following iOS design patterns. This improves navigation clarity and visual hierarchy whilst matching the iOS Settings app style.

The implementation uses ChevronButtonGroup components with MaterialCommunityIcons and SF Pro Text fonts for an authentic iOS look on both platforms.

---

## Acceptance Criteria

- [x] Three button groups: Work & Learning, Contact, Settings
- [x] Work & Learning group has 4 buttons: Work Experience, Studies, My CV, Videos
- [x] Contact group has 2 buttons: Get in touch, Book a meeting
- [x] Settings group has 2 buttons: Github, Settings
- [x] All buttons use MaterialCommunityIcons with appropriate colours
- [x] SF Pro Text fonts installed for both iOS and Android
- [x] Natural translations in all 5 languages (en, es, ca, pl, tl)
- [x] Icons and fonts configured for iOS and Android
- [x] HomeScreen unit tests updated and passing

---

## Story Points & Effort

**Story Points**: 3
**Effort Estimate**: 4 hours

---

## Tasks

| ID        | Task                                               | Effort | Status    |
| --------- | -------------------------------------------------- | ------ | --------- |
| Completed | Install react-native-vector-icons                  | 0.5h   | Completed |
| Completed | Configure vector icons for iOS and Android         | 0.5h   | Completed |
| Completed | Install SF Pro Text fonts for both platforms       | 1h     | Completed |
| Completed | Redesign HomeScreen with ChevronButtonGroup        | 1.5h   | Completed |
| Completed | Add natural translations for buttons (5 languages) | 0.5h   | Completed |

---

## Related User Stories

- [US-013](./US-013-profile-card-home-screen.md) - ProfileCard (next component for Home screen)
- [US-009](./US-009-internationalization.md) - i18n infrastructure used for translations

---

## Technical Implementation

**Components Used:**

- ChevronButtonGroup - Container for grouped buttons
- ButtonWithChevron - Individual button items
- MaterialCommunityIcons - Icon library

**Fonts:**

- SF Pro Text (18 variants) installed from Apple
- Configured via react-native-asset
- Tailwind config updated to use SF Pro Text

**Icons:**

- MaterialCommunityIcons package
- 19 icon font families installed
- Icon colours follow iOS palette (#007AFF, #5856D6, #00BCD4, etc.)

**Translations:**

- home.workExperience, home.studies, home.cv, home.videos
- home.contactMe, home.bookMeeting
- home.github, home.settings
- All use natural, conversational language

---

## Testing

**Unit Tests:**

- ✅ HomeScreen renders without crashing
- ✅ All button groups render correctly
- ✅ Navigation handlers work correctly
- ✅ Translations load properly
- ✅ 5/5 tests passing

**Manual Testing:**

- ✅ Verified on iOS simulator
- ✅ Light and dark themes work correctly
- ✅ Icons display properly
- ✅ SF Pro Text font applied
- ✅ All buttons navigate correctly

---

## Notes

**2025-11-15**: Completed implementation of button groups. This work was done exploratory style and is now being formalised with proper documentation.

Key decisions:

- Chose turquoise (#00BCD4) for CV button to differentiate from YouTube red
- Used "My CV" instead of "Download CV" for more natural language
- Changed Contact icon from 'comment' to 'email' for clarity
- Used "Get in touch" instead of "Contact me" for friendlier tone

**Commit**: ed34c00 - ✨ feat(home): redesign HomeScreen with button groups and vector icons

---

**Last Updated**: 2025-11-15

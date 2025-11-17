# TASK-106: Add Profile i18n Translations (5 Languages)

**Epic**: [EPIC-012: Profile Screen Implementation](../epics/EPIC-012-profile-screen-implementation.md)
**User Story**: [US-021: Profile Screen UI Redesign](../stories/US-021-profile-screen-ui.md)
**Status**: ⭕ Not Started
**Priority**: Medium
**Estimated Effort**: 1 hour
**Created**: 2025-01-17

---

## Context

Add profile-related UI strings to i18n locale files for all 5 supported languages (English, Spanish, Catalan, Polish, Tagalog). Strings should include profile screen headings, button labels, social link labels, error messages, and loading states.

## Technical Details

### Strings to Translate

Profile screen strings that need translation:

- "Profile" (screen title/heading)
- "Edit Profile" (button label)
- "Social Links" (section heading)
- "Education" (button/link)
- "Work Experience" (button/link)
- "Curriculum Vitae" or "View CV" (button/link)
- "Send Email" (action description)
- "Contact me" (section description)
- Error messages (network error, loading failed)
- "Retry" (button label)
- "Loading..." (loading state)
- "No profile data available" (empty state)

### File Structure

Update these i18n locale files:

```
src/i18n/locales/
  en.json        (English)
  es.json        (Spanish)
  ca.json        (Catalan)
  pl.json        (Polish)
  tl.json        (Tagalog)
```

### Locale Parity

All locale files must have identical key structures. Use existing patterns from other screens (EducationDataScreen, WorkXPScreen, etc.) for consistency.

### Natural Translation Guidelines

Translations should:

- Sound natural and conversational in each language
- Match the tone of existing translations in the project
- Use proper grammar and native phrasing
- Avoid literal word-for-word translation
- Consider cultural context for each language
- Be professional but approachable

### Example Translation Keys

```json
{
  "profile": {
    "title": "Profile",
    "editButton": "Edit Profile",
    "section": {
      "socialLinks": "Social Links",
      "quickLinks": "Quick Links"
    },
    "links": {
      "education": "Education",
      "workExperience": "Work Experience",
      "cv": "View CV"
    },
    "actions": {
      "sendEmail": "Send Email",
      "retry": "Retry"
    },
    "states": {
      "loading": "Loading profile...",
      "error": "Failed to load profile",
      "empty": "No profile data available"
    }
  }
}
```

## Acceptance Criteria

- ✅ Profile strings added to en.json (English)
- ✅ Profile strings added to es.json (Spanish)
- ✅ Profile strings added to ca.json (Catalan)
- ✅ Profile strings added to pl.json (Polish)
- ✅ Profile strings added to tl.json (Tagalog)
- ✅ All locale files have identical key structure
- ✅ No missing keys across any language
- ✅ All translations are natural and professional
- ✅ localesParity.test.ts passes (validates key structure)
- ✅ No console warnings related to missing i18n keys

## Test Scenarios

### Locale File Structure

1. ✅ All keys in en.json match structure in other locale files
2. ✅ No extra keys in any locale file
3. ✅ No missing keys in non-English locale files
4. ✅ localesParity.test.ts passes without errors

### Translation Quality

5. ✅ English translations are clear and professional
6. ✅ Spanish translations use natural phrasing
7. ✅ Catalan translations are grammatically correct
8. ✅ Polish translations sound conversational
9. ✅ Tagalog translations are culturally appropriate
10. ✅ All translations fit within reasonable UI space

### Integration

11. ✅ ProfileScreen displays correct translations for current language
12. ✅ Switching language updates all profile strings
13. ✅ No missing translation warnings in console
14. ✅ All strings display correctly on UI

## Dependencies

**Prerequisites**:

- ✅ i18next configured with 5 languages (EPIC-005 - TASK-046)
- ✅ Locale files for en, es, ca, pl, tl created (EPIC-005)
- ✅ TASK-105: ProfileScreen component created

**Enables**:

- TASK-107: Unit tests for profile screen
- TASK-108: E2E tests for profile navigation

## Success Criteria

- All locale files contain profile translations
- All keys have identical structure across languages
- Translations are natural and professional
- No locale parity test failures
- ProfileScreen displays correct language

## Implementation Notes

- Reference existing translations in en.json for style and tone
- Use i18next namespace pattern if profile strings are in separate namespace
- Check localesParity.test.ts to understand validation rules
- Test language switching on ProfileScreen to verify integration
- Keep translations consistent with other screen strings
- Profile section should use consistent terminology with other sections

## Notes

- Use the same natural language translation approach as TASK-045
- Ensure all 5 language files are updated together to maintain parity
- Test locale switching before marking complete
- Consider line length for mobile UI constraints
- Translations should match professional tone of portfolio app

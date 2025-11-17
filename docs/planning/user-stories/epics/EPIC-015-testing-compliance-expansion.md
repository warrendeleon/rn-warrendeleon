# EPIC-015: Testing & Compliance Expansion

**Epic ID**: EPIC-015
**Epic Title**: Testing & Compliance Expansion
**Status**: 📋 Not Started
**Priority**: 🟡 Medium
**Progress**: 0/9 tasks completed (0%)
**Created**: 2025-01-17
**Last Updated**: 2025-01-17
**Target Date**: 2025-02-07 (2 weeks after EPIC-013)

---

## Executive Summary

Expand E2E test coverage to newly implemented screens (ProfileScreen, WebView, Language, Appearance) and complete EAA (European Accessibility Act) compliance for remaining non-compliant screens. This epic ensures comprehensive test coverage across all user journeys and full WCAG 2.1 Level AA accessibility compliance before the June 2025 EAA deadline.

---

## Business Context

### Problem Statement

Current gaps:

- **E2E Test Coverage**: ProfileScreen, WebViewScreen, LanguageScreen, AppearanceScreen have NO E2E tests
- **User Journeys Untested**: Social media navigation, email/phone links, standalone settings flows
- **EAA Non-Compliance**: WebViewScreen and ProfileDataScreen missing all accessibility props
- **Manual Testing**: No documented VoiceOver/TalkBack testing procedure

These gaps create risk of regressions, accessibility violations, and potential EAA non-compliance penalties (June 2025 deadline).

### Business Value

1. **Quality Assurance**: E2E tests catch integration bugs before production
2. **Legal Compliance**: Full EAA compliance avoids penalties in EU market
3. **Inclusive Design**: Proper accessibility benefits all users
4. **Confidence**: Automated tests enable safe refactoring
5. **Documentation**: Manual testing procedure ensures consistent accessibility validation

### Success Metrics

- 100% screen coverage with E2E tests (all screens tested)
- 100% EAA compliance (all screens WCAG 2.1 Level AA)
- Documented VoiceOver/TalkBack testing procedure
- Zero accessibility violations in automated tests
- All user journeys covered by E2E tests

---

## Scope

### In Scope

1. **E2E Test Coverage Expansion** (US-026)
   - ProfileScreen navigation flow (Home → Profile)
   - ProfileScreen social media buttons (tap → WebView)
   - WebView URL loading (open social links)
   - Email/phone link interactions (mailto:, tel:)
   - Language screen standalone flow
   - Appearance screen standalone flow

2. **EAA Compliance Completion** (US-025)
   - Add accessibility props to WebViewScreen
   - Add accessibility props to ProfileDataScreen
   - Create VoiceOver/TalkBack manual testing documentation

### Out of Scope

- Security fixes (EPIC-013)
- Performance optimizations (EPIC-014)
- New feature development
- Automated colour contrast testing (defer to future epic)

---

## User Stories

| ID                                                       | Title                       | Priority  | Tasks | Status         |
| -------------------------------------------------------- | --------------------------- | --------- | ----- | -------------- |
| [US-026](../stories/US-026-e2e-test-expansion.md)        | E2E Test Coverage Expansion | 🟡 Medium | 6     | 📋 Not Started |
| [US-025](../stories/US-025-eaa-compliance-completion.md) | EAA Compliance Completion   | 🟠 High   | 3     | 📋 Not Started |

---

## Tasks Breakdown

### US-026: E2E Test Coverage Expansion (6 tasks, 11 hours)

| Task ID                                                    | Title                                  | Effort | Priority  | Status         |
| ---------------------------------------------------------- | -------------------------------------- | ------ | --------- | -------------- |
| [TASK-137](../tasks/TASK-137-e2e-profile-navigation.md)    | E2E Test ProfileScreen Navigation      | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-e2e-profile-social-links.md)  | E2E Test ProfileScreen Social Links    | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-e2e-webview-loading.md)       | E2E Test WebView URL Loading           | 1h     | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-e2e-email-phone-links.md)     | E2E Test Email/Phone Link Interactions | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-e2e-language-standalone.md)   | E2E Test Language Screen Standalone    | 2h     | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-e2e-appearance-standalone.md) | E2E Test Appearance Screen Standalone  | 2h     | 🟡 Medium | 📋 Not Started |

### US-025: EAA Compliance Completion (3 tasks, 5 hours)

| Task ID                                                     | Title                                    | Effort | Priority | Status         |
| ----------------------------------------------------------- | ---------------------------------------- | ------ | -------- | -------------- |
| [TASK-138](../tasks/TASK-138-eaa-webview-screen.md)         | Add EAA Props to WebViewScreen           | 2h     | 🟠 High  | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-eaa-profile-data-screen.md)    | Add EAA Props to ProfileDataScreen       | 1h     | 🟠 High  | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-voiceover-talkback-testing.md) | VoiceOver/TalkBack Testing Documentation | 2h     | 🟠 High  | 📋 Not Started |

---

## Dependencies

### Upstream Dependencies

- **EPIC-013** recommended (ensures secure, tested foundation)
- Can start in parallel with EPIC-014

### Downstream Dependencies

- None

---

## Risks & Mitigation

| Risk                                  | Impact | Likelihood | Mitigation                                                          |
| ------------------------------------- | ------ | ---------- | ------------------------------------------------------------------- |
| WebView E2E tests complex             | Medium | Medium     | Research Detox WebView limitations before writing tests             |
| Email/phone links can't be E2E tested | High   | High       | Test that links exist and are tappable (not actual email/phone app) |
| Manual testing subjective             | Medium | Medium     | Create detailed checklist with pass/fail criteria                   |
| EAA June 2025 deadline                | High   | Low        | Plenty of time if completed by Feb 2025                             |

---

## Acceptance Criteria

### E2E Tests (US-026)

- [ ] ProfileScreen navigation tested (Home → Profile → Back)
- [ ] ProfileScreen social buttons tested (tap → WebView opens)
- [ ] WebView URL loading tested (validates URL opened correctly)
- [ ] Email link tested (mailto: link exists and is tappable)
- [ ] Phone link tested (tel: link exists and is tappable)
- [ ] Language screen tested (Settings → Language → Change → Back)
- [ ] Appearance screen tested (Settings → Appearance → Toggle → Back)
- [ ] All new E2E tests pass in CI/CD
- [ ] Zero Detox test failures

### EAA Compliance (US-025)

- [ ] WebViewScreen has accessibilityRole, accessibilityLabel for all interactive elements
- [ ] ProfileDataScreen has accessibilityRole, accessibilityLabel for all Text elements
- [ ] VoiceOver testing procedure documented (iOS)
- [ ] TalkBack testing procedure documented (Android)
- [ ] Manual testing checklist includes all WCAG 2.1 Level AA criteria
- [ ] `/eaa-audit` command passes with 0 violations
- [ ] All screens pass manual VoiceOver/TalkBack testing

---

## Testing Strategy

### E2E Test Approach

**ProfileScreen**:

```gherkin
Scenario: Navigate to Profile screen
  Given I am on the Home screen
  When I tap the Profile card
  Then I should see the Profile screen
  And I should see profile name "Warren de Leon"

Scenario: Open social media link
  Given I am on the Profile screen
  When I tap the LinkedIn button
  Then the WebView should open
  And the URL should contain "linkedin.com"
```

**Email/Phone Links**:

```gherkin
Scenario: Profile email link exists
  Given I am on the Profile screen
  When I look for the email button
  Then the email button should exist
  And the email button should be tappable

Note: Cannot test actual mailto: app opening in Detox
```

### EAA Testing Approach

**Automated** (RNTL tests):

- Verify `accessibilityRole` present
- Verify `accessibilityLabel` descriptive
- Verify `testID` for all interactive elements

**Manual** (VoiceOver/TalkBack):

- Enable screen reader
- Navigate through entire screen
- Verify all elements announced correctly
- Verify navigation order logical
- Verify actions can be performed

---

## EAA Compliance Checklist

- [ ] **WebViewScreen**:
  - [ ] WebView container has accessibilityLabel
  - [ ] Loading states announced to screen reader
  - [ ] Error states have accessibilityRole="alert"

- [ ] **ProfileDataScreen**:
  - [ ] All Text elements have accessibilityRole="text"
  - [ ] Loading/Error/Data states have appropriate labels
  - [ ] JSON text has accessibilityLabel="Profile data in JSON format"

---

## Notes

**Why Medium Priority (except EAA)**: These are quality improvements rather than production blockers. However, EAA compliance is HIGH priority due to legal deadline.

**Parallel Work**: Can run alongside EPIC-014 (different focus areas).

**EAA Deadline**: June 28, 2025. Completing this epic by Feb 2025 provides 4-month buffer.

---

**Related Epics**: EPIC-013 (Production Readiness), EPIC-014 (Performance)

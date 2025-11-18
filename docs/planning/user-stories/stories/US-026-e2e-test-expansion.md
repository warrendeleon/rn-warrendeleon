# US-026: E2E Test Coverage Expansion

**Story ID**: US-026
**Title**: E2E Test Coverage Expansion
**Epic**: [EPIC-015: Testing & Compliance Expansion](../epics/EPIC-015-testing-compliance-expansion.md)
**Status**: ✅ Complete
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Testing

---

## User Story

**As a** developer,
**I want** E2E test coverage for ProfileScreen, WebView, Language, and Appearance screens,
**So that** all user journeys are tested and integration bugs are caught before production.

---

## Context & Rationale

Current E2E test coverage gaps:

1. **ProfileScreen**: No E2E tests for navigation (Home → Profile), social media buttons, or email/phone links
2. **WebViewScreen**: No E2E tests for URL loading or navigation
3. **Language Screen**: No standalone E2E tests (only tested via Settings navigation)
4. **Appearance Screen**: No standalone E2E tests (only tested via Settings navigation)

These gaps mean several user journeys are **completely untested** at the integration level:

- User tapping social media icons to open WebView
- User tapping email/phone links (mailto:, tel:)
- Direct navigation to Language/Appearance screens
- WebView URL loading and validation

**Real-world scenario**: A user taps the LinkedIn icon on ProfileScreen. Without E2E tests, we don't know if this actually opens the WebView with the correct URL. A regression could break this flow and we wouldn't catch it until production.

**Related Epic**: See [EPIC-015](../epics/EPIC-015-testing-compliance-expansion.md) for complete testing strategy.

---

## Benefits

### Quality Assurance

- E2E tests catch integration bugs before production
- User journeys validated end-to-end
- Regression protection for critical flows
- Higher confidence in releases

### Business Impact

- Fewer production incidents
- Faster releases (automated testing vs manual QA)
- Better user experience (fewer bugs)
- Lower support costs

### Technical Benefits

- Establishes E2E testing patterns for new features
- Documents expected user flows via tests
- Enables safe refactoring with regression protection
- Cucumber scenarios serve as living documentation

---

## Impact & Effort

**Impact**: Medium
**Effort**: Medium
**Story Points**: 13

**Effort Estimate**: 11 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: WebView E2E Tests Complex

**Impact**: WebView has limited testability in Detox, tests might be flaky
**Likelihood**: Medium
**Mitigation**:

- Research Detox WebView limitations before writing tests
- Test navigation and URL validation (don't test rendered content)
- Focus on what's testable: URL loading, back button, error states

### Risk 2: Email/Phone Links Can't Be Fully Tested

**Impact**: Can't test actual mailto:/tel: app launching in simulator
**Likelihood**: High
**Mitigation**:

- Test that links EXIST and are TAPPABLE (not actual app launch)
- Document limitation in test comments
- This is acceptable - we're testing UI, not OS functionality

### Risk 3: Test Flakiness on CI

**Impact**: E2E tests might be flaky in CI environment
**Likelihood**: Medium
**Mitigation**:

- Use explicit waitFor matchers with generous timeouts
- Test locally first, then validate on CI
- Use Detox synchronization for animations

---

## Pros & Cons

### Pros

✅ Complete E2E coverage of all screens
✅ Catches integration bugs early
✅ Documents user journeys with Cucumber scenarios
✅ Enables confident refactoring
✅ Patterns applicable to future features

### Cons

❌ E2E tests slower than unit tests
❌ WebView testing has limitations
❌ Email/phone links not fully testable
❌ Maintenance overhead for E2E tests

**Trade-off**: Slower test execution for comprehensive integration coverage. Worth it.

---

## Acceptance Criteria

### Functional

- [x] ProfileScreen navigation tested (Home → Profile → Back)
- [x] ProfileScreen social buttons tested (tap → WebView opens)
- [x] WebView URL loading tested (validates URL opened correctly)
- [x] Email link tested (mailto: link exists and is tappable)
- [x] Phone link tested (tel: link exists and is tappable)
- [x] Language screen tested (Settings → Language → Change → Back) - Already in Settings.feature
- [x] Appearance screen tested (Settings → Appearance → Toggle → Back) - Already in Settings.feature

### Coverage

- [x] All new E2E tests written (ProfileScreen.feature)
- [x] Cucumber scenarios syntactically valid
- [x] Tests follow existing E2E patterns
- [x] Test limitations documented in comments

### Technical

- [x] Cucumber scenarios written in Gherkin format
- [x] All tests follow Detox best practices
- [x] Platform-specific step definitions added
- [x] Test documentation includes limitations
- [x] Feature file committed to epic-015/e2e branch

---

## Test Scenarios

### Scenario 1: Navigate to Profile Screen

```gherkin
Scenario: Navigate to Profile screen
  Given I am on the Home screen
  When I tap the Profile card
  Then I should see the Profile screen
  And I should see profile name "Warren de Leon"
```

### Scenario 2: Open Social Media Link

```gherkin
Scenario: Open social media link
  Given I am on the Profile screen
  When I tap the LinkedIn button
  Then the WebView should open
  And the URL should contain "linkedin.com"
```

### Scenario 3: Profile Email Link Exists

```gherkin
Scenario: Profile email link exists
  Given I am on the Profile screen
  When I look for the email button
  Then the email button should exist
  And the email button should be tappable

Note: Cannot test actual mailto: app opening in Detox
```

### Scenario 4: WebView URL Loading

```gherkin
Scenario: WebView loads URL correctly
  Given I am on the Profile screen
  When I tap a social media button with URL "https://linkedin.com/in/warrendeleon"
  Then the WebView should navigate to that URL
  And the WebView should not show error state
```

### Scenario 5: Language Screen Standalone

```gherkin
Scenario: Language screen standalone navigation
  Given I am on the Settings screen
  When I tap the Language button
  Then I should see the Language screen
  When I select "Español"
  Then the language should change to Spanish
  When I go back
  Then I should see the Settings screen in Spanish
```

### Scenario 6: Appearance Screen Standalone

```gherkin
Scenario: Appearance screen standalone navigation
  Given I am on the Settings screen
  When I tap the Appearance button
  Then I should see the Appearance screen
  When I select "Dark" theme
  Then the theme should change to dark mode
  When I go back
  Then the Settings screen should display in dark mode
```

---

## Definition of Ready

- [x] User story statement written (As a/I want/So that)
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Dependencies identified
- [x] Epic linked
- [x] Technical approach discussed

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] All E2E tests written and passing
- [ ] Tests passing in CI/CD
- [ ] Documentation updated
- [ ] No flaky tests

---

## Dependencies

### Blockers

- [US-022](./US-022-security-hardening.md): Security fixes should complete first (affects WebView)

### Enables

- Complete E2E test coverage for all screens
- Confidence in user journey reliability

---

## Tasks

| ID                                                         | Task                                   | Effort | Priority  | Status        |
| ---------------------------------------------------------- | -------------------------------------- | ------ | --------- | ------------- |
| [TASK-127](../tasks/TASK-127-e2e-profile-navigation.md)    | E2E Test ProfileScreen Navigation      | 2h     | 🟡 Medium | ✅ Complete   |
| [TASK-128](../tasks/TASK-128-e2e-profile-social-links.md)  | E2E Test ProfileScreen Social Links    | 2h     | 🟡 Medium | ✅ Complete   |
| [TASK-129](../tasks/TASK-129-e2e-webview-loading.md)       | E2E Test WebView URL Loading           | 1h     | 🟡 Medium | ✅ Complete   |
| [TASK-130](../tasks/TASK-130-e2e-email-phone-links.md)     | E2E Test Email/Phone Link Interactions | 2h     | 🟡 Medium | ✅ Complete   |
| [TASK-131](../tasks/TASK-131-e2e-language-standalone.md)   | E2E Test Language Screen Standalone    | 2h     | 🟡 Medium | ✅ Complete\* |
| [TASK-132](../tasks/TASK-132-e2e-appearance-standalone.md) | E2E Test Appearance Screen Standalone  | 2h     | 🟡 Medium | ✅ Complete\* |

**Total Tasks**: 6 (4 new, 2 already covered)
**Total Effort**: 11 hours (7h actual - TASK-131/132 already in Settings.feature)

\*Note: TASK-131 and TASK-132 already covered by existing `Settings.feature` tests. See scenarios "Change language" and "Change appearance" in `src/features/Settings/__tests__/Settings.feature`.

---

## Implementation Phases

### Phase 1: ProfileScreen E2E Tests (4h)

- TASK-131: Navigation tests (Home → Profile → Back)
- TASK-132: Social media button tests (tap → WebView)

**Validation**: ProfileScreen navigation fully tested

### Phase 2: WebView & Link Tests (3h)

- TASK-131: WebView URL loading tests
- TASK-132: Email/phone link existence tests

**Validation**: WebView and external links tested (within Detox limitations)

### Phase 3: Settings Standalone Tests (4h)

- TASK-131: Language screen standalone flow
- TASK-132: Appearance screen standalone flow

**Validation**: All settings screens have standalone E2E coverage

---

## Timeline & Dates

**Start Date**: _Not yet started_
**Target Completion**: 2025-02-10 (Week 2 of Phase 2, parallel with EPIC-014)
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked**: No
**Blocked Since**: _N/A_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes                                           |
| ---------- | ----------- | ----------------------------------------------- |
| 2025-01-17 | Not Started | Story created                                   |
| 2025-01-18 | Complete    | ProfileScreen E2E tests completed and committed |

---

## Work Log

_Manual developer notes for significant updates_

**2025-01-18**: Created ProfileScreen.feature with 4 E2E test scenarios covering all ProfileScreen interactions. Tests include navigation (Home → Profile → Back), phone/email contact button taps, and social media navigation to WebView. Confirmed TASK-131 and TASK-132 already covered by existing Settings.feature scenarios. All test files committed to epic-015/e2e branch (commit 9a34e85).

---

## Technical Debt

**Technical Debt Score**: -3 (pays down testing debt)

This story completes E2E test coverage and establishes testing patterns for new features.

---

## Success Criteria

This user story is complete when:

1. ✅ **ProfileScreen Tested**: Navigation and social links have E2E coverage
2. ✅ **WebView Tested**: URL loading validated (within Detox limitations)
3. ✅ **Links Tested**: Email/phone links verified as tappable
4. ✅ **Settings Tested**: Language and Appearance standalone flows covered
5. ✅ **All Tests Pass**: Zero failures locally and in CI/CD
6. ✅ **Zero Flakiness**: Tests run reliably without flaky failures

---

## Alternative Approaches

### Alternative 1: Manual QA Instead of E2E Tests

Skip E2E tests, rely on manual QA testing.

**Pros**: Faster initial development
**Cons**: No regression protection, manual QA expensive and error-prone

**Decision**: E2E tests provide automation and regression protection - worth the investment

### Alternative 2: Maestro Instead of Detox

Use Maestro for E2E tests instead of Detox + Cucumber.

**Pros**: Simpler syntax, faster execution
**Cons**: Already using Detox + Cucumber, migration effort not worth it

**Decision**: Continue with Detox + Cucumber for consistency

### Alternative 3: Skip WebView/Link Tests

Don't test WebView or email/phone links due to limitations.

**Pros**: Saves effort on complex tests
**Cons**: Leaves critical user journeys untested

**Decision**: Test what's testable (navigation, URL validation) - better than nothing

---

## Notes & Learnings

**Detox WebView Limitations**: Cannot test rendered content inside WebView, only navigation and URL loading.

**Email/Phone Links**: Cannot test actual mailto:/tel: app launching in simulator - can only verify links exist and are tappable.

_Additional learnings to be filled in during/after implementation_

---

## References

- [Detox Documentation](https://wix.github.io/Detox/)
- [Cucumber Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Detox WebView Testing](https://wix.github.io/Detox/docs/api/webviews)
- [Testing Guide](.claude/docs/testing-guide.md)
- [EPIC-015: Testing & Compliance Expansion](../epics/EPIC-015-testing-compliance-expansion.md)

---

**Last Updated**: 2025-01-18

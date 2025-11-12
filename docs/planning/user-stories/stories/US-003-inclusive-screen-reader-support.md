# US-003: Inclusive Screen Reader Support

**ID**: US-003
**Title**: Inclusive Screen Reader Support
**Epic**: [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 2 hours
**Tags**: `accessibility`, `wcag`, `voiceover`, `talkback`, `a11y`

---

## User Story

**As a** screen reader user (VoiceOver on iOS / TalkBack on Android),
**I want** all buttons and UI elements properly labelled with clear descriptions,
**So that** I can navigate and use the app independently without assistance.

---

## Context & Rationale

15% of the global population has some form of disability (WHO estimate), yet most mobile apps are inaccessible to screen reader users. Currently, this app has zero accessibility labels, making it completely unusable for blind or visually impaired users.

Without accessibility labels:

- VoiceOver/TalkBack users hear "Button" with no context
- Navigation is confusing and error-prone
- Users cannot complete basic tasks independently
- App fails WCAG 2.1 Level A compliance (minimum standard)

**Legal & Business Context**:

- Many jurisdictions require accessibility (ADA in US, AODA in Canada, etc.)
- App stores may reject or deprioritise inaccessible apps
- Accessibility is a competitive differentiator (most apps ignore it)
- Market opportunity: 1+ billion people with disabilities globally

**Related Epic**: See [EPIC-003](../epics/EPIC-003-accessibility-compliance.md) for business impact, WCAG compliance details, and success metrics.

---

## Benefits

### User Experience

- Full app usability for screen reader users
- Clear, descriptive labels for all interactive elements
- Logical navigation order through screens
- Professional accessibility like Apple's own apps

### Business Impact

- Market expansion to 15%+ of users (disability market)
- Legal compliance with accessibility regulations (ADA, AODA, etc.)
- Competitive advantage (few apps prioritise accessibility)
- Better app store ratings and discoverability
- Improved brand reputation as inclusive

### Technical Benefits

- Foundation for automated accessibility testing
- Better semantic HTML/component structure
- Improved usability for all users (elderly, temporary disabilities)
- Prepared for future accessibility features

---

## Risks & Mitigation

### Risk 1: Over-verbose Labels

**Impact**: Too much information overwhelms users
**Likelihood**: Medium
**Mitigation**:

- Follow WCAG concise label guidelines
- User test with screen reader users if possible
- Review Apple's accessibility guidelines
- Keep labels under 20 words

### Risk 2: Platform Differences

**Impact**: VoiceOver (iOS) and TalkBack (Android) behave differently
**Likelihood**: Medium
**Mitigation**:

- Test on both platforms
- Use platform-agnostic patterns where possible
- Document platform-specific considerations
- Follow React Native accessibility best practices

### Risk 3: Maintenance Drift

**Impact**: New features added without accessibility labels
**Likelihood**: High
**Mitigation**:

- Add accessibility checklist to PR template
- Document accessibility patterns in CONTRIBUTING.md
- Consider automated accessibility testing (future)
- Code review focus on accessibility

---

## Pros & Cons

### Pros

✅ Makes app usable for 15%+ of population
✅ Legal compliance (ADA, AODA, etc.)
✅ Competitive advantage (rare in mobile apps)
✅ Low implementation cost (2 hours)
✅ Better UX for all users (not just screen readers)

### Cons

❌ Requires ongoing maintenance (new features need labels)
❌ Platform testing complexity (iOS + Android)
❌ Limited automated testing support
❌ Requires accessibility knowledge

**Trade-off**: Small ongoing maintenance cost for significant market expansion and legal compliance. Essential for modern apps.

---

## Acceptance Criteria

### Functional

- [ ] All buttons have `accessibilityLabel` and `accessibilityRole`
- [ ] All interactive elements have appropriate hints
- [ ] VoiceOver announces all UI elements correctly
- [ ] TalkBack announces all UI elements correctly
- [ ] Navigation order is logical (top to bottom, left to right)
- [ ] Users can complete primary flows using only screen reader

### WCAG 2.1 Level AA Compliance

- [ ] **Perceivable**: All UI elements have text alternatives
- [ ] **Operable**: All functionality available via accessibility APIs
- [ ] **Understandable**: Labels are clear and descriptive
- [ ] **Robust**: Compatible with VoiceOver and TalkBack

### Coverage

- [ ] ButtonWithChevron component fully labelled
- [ ] SelectableListButton component fully labelled
- [ ] All screens (Home, Settings, Language, Appearance) fully labelled
- [ ] Manual testing on both iOS (VoiceOver) and Android (TalkBack)

---

## Test Scenarios

### VoiceOver Testing (iOS)

**Scenario 1: Settings Button Navigation**

```gherkin
Given VoiceOver is enabled on iOS
And I am on the Home screen
When I swipe right to navigate
Then VoiceOver should announce "Settings, button"
And when I double-tap to activate
Then I should navigate to the Settings screen
```

**Scenario 2: Language Selection**

```gherkin
Given VoiceOver is enabled on iOS
And I am on the Settings screen
When I swipe right to the Language button
Then VoiceOver should announce "Language, English, button"
And when I navigate to Language screen
Then VoiceOver should announce "English, selected, button"
And when I select "Spanish"
Then VoiceOver should announce "Spanish, selected, button"
```

### TalkBack Testing (Android)

**Scenario 3: Settings Button Navigation**

```gherkin
Given TalkBack is enabled on Android
And I am on the Home screen
When I swipe right to navigate
Then TalkBack should announce "Settings, button"
And when I double-tap to activate
Then I should navigate to the Settings screen
```

### WCAG Compliance Testing

**Scenario 4: Complete User Journey**

```gherkin
Given I am using only a screen reader (VoiceOver or TalkBack)
When I start the app
Then I can navigate to Settings using only swipe gestures
And I can navigate to Language settings
And I can select a different language
And I can navigate back to Home
And I can complete the entire flow without visual reference
```

### E2E Testing (Detox)

**Scenario 5: Accessibility Props Validation**

```gherkin
Given the app is running
When I inspect the Settings button
Then it should have accessibilityLabel="Settings"
And it should have accessibilityRole="button"
And when I inspect the Language button
Then it should have accessibilityLabel="Language"
And it should have an end label indicating current language
```

---

## Dependencies

### Blockers

- [US-001](./US-001-smooth-responsive-interactions.md): Components should be stable and performant first
- [EPIC-002](../epics/EPIC-002-quality-reliability.md): Tests should be in place to verify accessibility

### Enables

- Production release (regulatory requirement)
- App store accessibility review
- Public accessibility marketing
- Future automated accessibility testing

---

## Tasks

| ID                                                                 | Task                               | Effort | Priority | Status      |
| ------------------------------------------------------------------ | ---------------------------------- | ------ | -------- | ----------- |
| [TASK-014](../tasks/TASK-014-accessibility-button-with-chevron.md) | Accessibility ButtonWithChevron    | 0.5h   | High     | Not Started |
| [TASK-015](../tasks/TASK-015-accessibility-selectable-list.md)     | Accessibility SelectableListButton | 0.5h   | High     | Not Started |
| [TASK-016](../tasks/TASK-016-accessibility-all-screens.md)         | Accessibility All Screens          | 0.5h   | High     | Not Started |
| [TASK-017](../tasks/TASK-017-test-screen-readers.md)               | Test VoiceOver and TalkBack        | 0.5h   | High     | Not Started |

**Total**: 4 tasks, 2 hours

---

## Implementation Phases

### Phase 1: Component Accessibility (1h)

Add accessibility props to reusable components:

- TASK-014: ButtonWithChevron (accessibilityLabel, accessibilityHint, accessibilityRole)
- TASK-015: SelectableListButton (selection state announcements)

**Validation**: Components announce correctly in isolation

### Phase 2: Screen Accessibility (0.5h)

Add accessibility props to all screens:

- TASK-016: Home, Settings, Language, Appearance screens
- Screen titles, section headers, navigation elements

**Validation**: Complete screen navigation using screen reader

### Phase 3: Platform Testing (0.5h)

Manual testing on both platforms:

- TASK-017: VoiceOver (iOS Simulator + physical device)
- TASK-017: TalkBack (Android Emulator + physical device)
- Document platform differences

**Validation**: All user journeys completable via screen reader

---

## Success Criteria

This user story is complete when:

1. ✅ **Full Label Coverage**: All interactive elements have accessibility labels
2. ✅ **WCAG 2.1 Level AA**: Meets all four WCAG principles
3. ✅ **Platform Compatibility**: Works correctly on VoiceOver (iOS) and TalkBack (Android)
4. ✅ **User Flow Completion**: Screen reader users can complete all primary user journeys
5. ✅ **Documentation**: Accessibility guidelines added to [CONTRIBUTING.md](../../CONTRIBUTING.md)
6. ✅ **Manual Testing**: Tested on both platforms with real screen readers

---

## Accessibility Considerations

### Label Best Practices

- **Concise**: Keep under 20 words, avoid redundancy
- **Descriptive**: Explain what the element is and does
- **Context-aware**: Include current state (e.g., "English, selected")
- **No redundancy**: Don't repeat role (e.g., avoid "Settings button button")

### Role Types

- `button`: Interactive buttons and pressable elements
- `header`: Screen titles and section headers
- `link`: Navigation links
- `text`: Non-interactive text content

### Hints vs Labels

- **accessibilityLabel**: What the element is (e.g., "Settings")
- **accessibilityHint**: What happens when activated (e.g., "Opens settings menu")
- Hints are optional; use when action isn't obvious from label

### Example Implementation

```typescript
<ButtonWithChevron
  label="Language"
  endLabel="English"
  accessibilityLabel="Language, English"
  accessibilityHint="Opens language selection"
  accessibilityRole="button"
  onPress={handlePress}
/>
```

---

## Alternative Approaches

### Alternative 1: Automated Accessibility Testing

Use tools like Axe or react-native-accessibility-testing.

**Pros**: Catches issues automatically, runs in CI
**Cons**: Limited mobile support, false positives, doesn't replace manual testing

**Decision**: Manual testing first, automated testing in future iteration

### Alternative 2: Third-party Accessibility Library

Use library for accessibility utilities.

**Pros**: Pre-built patterns, community support
**Cons**: Dependency overhead, React Native built-in props sufficient

**Decision**: Use React Native built-in accessibility props (no dependency needed)

---

## Notes & Learnings

_To be filled in during/after implementation_

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS VoiceOver Guide](https://developer.apple.com/documentation/accessibility/voiceover)
- [Android TalkBack Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [WHO Disability Statistics](https://www.who.int/news-room/fact-sheets/detail/disability-and-health)
- [Apple Accessibility Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)

---

**Last Updated**: 2025-01-11

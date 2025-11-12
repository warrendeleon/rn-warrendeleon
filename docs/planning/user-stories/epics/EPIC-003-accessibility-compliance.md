# EPIC-003: Accessibility & Compliance

**ID**: EPIC-003
**Title**: Accessibility & Compliance - Inclusive Screen Reader Support
**Created**: 2025-01-11
**Status**: Not Started
**Priority**: High
**Total Effort**: 2 hours
**Total Tasks**: 4

---

## Executive Summary

Achieve WCAG 2.1 Level AA compliance by adding comprehensive VoiceOver and TalkBack support, making the app accessible to 15%+ of users with disabilities and meeting regulatory requirements.

**Business Impact**: Larger addressable market, regulatory compliance, improved brand reputation, competitive advantage

---

## Business Value

### Problem

Accessibility barriers exclude users and create risks:

- **Excluded Users**: 15% of global population has disabilities (WHO estimate)
- **Legal Risk**: Non-compliance with accessibility regulations (ADA, AODA, etc.)
- **Poor UX**: Screen reader users encounter unlabelled buttons, unclear navigation
- **Brand Impact**: Accessibility failures damage reputation in inclusive communities
- **App Store**: May fail accessibility review guidelines

This leads to:

- Lost market opportunity (1+ billion potential users globally)
- Potential legal action for non-compliance
- Negative reviews from accessibility advocates
- App store rejection or removal in certain jurisdictions
- Reputational damage in disability communities

### Opportunity

By implementing WCAG 2.1 Level AA compliance:

- **Market Expansion**: Tap into disability market (15%+ of users)
- **Legal Compliance**: Meet ADA, AODA, and international accessibility standards
- **Competitive Edge**: Most apps ignore accessibility - stand out
- **Brand Reputation**: Demonstrate commitment to inclusive design
- **Better UX**: Accessibility improvements benefit all users (elderly, temporary disabilities)

### Success Metrics

| Metric                         | Current | Target   | Business Impact        |
| ------------------------------ | ------- | -------- | ---------------------- |
| WCAG 2.1 compliance            | Level D | Level AA | Regulatory compliance  |
| Accessibility labels coverage  | 0%      | 100%     | Full screen reader UX  |
| Screen reader user retention   | Unknown | 70%+     | Inclusive user base    |
| Accessibility complaints       | 0       | 0        | Risk mitigation        |
| App Store accessibility rating | N/A     | ✅       | Better discoverability |

---

## Scope

### In Scope

**Component Accessibility** (US-003):

- Accessibility labels for ButtonWithChevron
- Accessibility labels for SelectableListButton
- Accessibility labels for all screens (Settings, Language, Appearance, Home)
- VoiceOver (iOS) and TalkBack (Android) testing

**WCAG 2.1 Level AA Requirements**:

- Perceivable: All UI elements have text alternatives
- Operable: All functionality available via accessibility APIs
- Understandable: Clear, descriptive labels and hints
- Robust: Compatible with assistive technologies

### Out of Scope

- Colour contrast adjustments (already handled by Gluestack UI)
- Font scaling (system-level, already supported)
- Haptic feedback (future enhancement)
- Localised accessibility labels (covered by i18n - see [I18N.md](../../I18N.md))
- Custom accessibility actions (future enhancement)

---

## User Stories

### [US-003: Inclusive Screen Reader Support](../stories/US-003-inclusive-screen-reader-support.md)

**As a** screen reader user (VoiceOver/TalkBack),
**I want** all buttons and UI elements properly labelled with clear descriptions,
**So that** I can navigate and use the app independently.

**Value**: Makes app usable for visually impaired users, meets legal requirements

**Tasks**: 4 tasks (TASK-014, TASK-015, TASK-016, TASK-017)

---

## Technical Approach

### Accessibility Labels Pattern

React Native provides accessibility props for screen reader support:

```typescript
<TouchableOpacity
  accessibilityLabel="Settings" // What the element is
  accessibilityHint="Opens settings menu" // What it does
  accessibilityRole="button" // Element type
>
  <Text>Settings</Text>
</TouchableOpacity>
```

**Key Principles**:

- `accessibilityLabel`: Concise, descriptive name
- `accessibilityHint`: Optional context about what happens on activation
- `accessibilityRole`: Semantic role (button, header, link, etc.)
- Avoid redundancy: Don't repeat "button" in label if role is "button"

**Impact**: Screen readers announce meaningful information, users understand UI

### Testing Strategy

VoiceOver (iOS) and TalkBack (Android) manual testing:

1. **Navigation Testing**: Swipe through all screens, verify logical order
2. **Activation Testing**: Double-tap all interactive elements, verify actions
3. **Context Testing**: Verify labels provide sufficient context
4. **Flow Testing**: Complete user journeys using only screen reader

**Tools**: iOS Simulator VoiceOver, Android Emulator TalkBack

**Impact**: Validates real-world screen reader experience

---

## Dependencies

### Prerequisites

- [EPIC-001: Performance](./EPIC-001-performance-optimization.md): Components must be stable before adding labels
- [EPIC-002: Quality](./EPIC-002-quality-reliability.md): Tests verify accessibility implementation

### Blocks

This epic should be completed before:

- Production release (regulatory requirement)
- App store submission (accessibility review)
- Public marketing of accessibility features

---

## Risks & Mitigation

### Risk 1: Over-verbose Labels

**Risk**: Too much information overwhelms screen reader users
**Likelihood**: Medium
**Mitigation**: Follow WCAG guidelines for concise labels; user test with screen reader users

### Risk 2: Platform Differences

**Risk**: VoiceOver and TalkBack behave differently
**Likelihood**: Medium
**Mitigation**: Test on both platforms; use platform-agnostic patterns where possible

### Risk 3: Maintenance Drift

**Risk**: New features added without accessibility labels
**Likelihood**: High
**Mitigation**: Add accessibility checks to PR template; automated accessibility testing (future); developer education

---

## Timeline

**Estimated Duration**: 1 day (2 hours total)

### Day 1 (2 hours)

- ButtonWithChevron accessibility (TASK-014): 0.5h
- SelectableListButton accessibility (TASK-015): 0.5h
- All screens accessibility (TASK-016): 0.5h
- VoiceOver/TalkBack testing (TASK-017): 0.5h

**Note**: Can be completed in parallel with EPIC-002 testing tasks

---

## Tasks

| ID                                                                 | Task                               | Effort | Priority |
| ------------------------------------------------------------------ | ---------------------------------- | ------ | -------- |
| [TASK-014](../tasks/TASK-014-accessibility-button-with-chevron.md) | Accessibility ButtonWithChevron    | 0.5h   | High     |
| [TASK-015](../tasks/TASK-015-accessibility-selectable-list.md)     | Accessibility SelectableListButton | 0.5h   | High     |
| [TASK-016](../tasks/TASK-016-accessibility-all-screens.md)         | Accessibility All Screens          | 0.5h   | High     |
| [TASK-017](../tasks/TASK-017-test-screen-readers.md)               | Test VoiceOver and TalkBack        | 0.5h   | High     |

**Total**: 4 tasks, 2 hours

---

## Success Criteria

This epic is successful when:

1. ✅ **Full Label Coverage**: All interactive elements have accessibility labels
2. ✅ **WCAG 2.1 Level AA**: Meets perceivable, operable, understandable, robust criteria
3. ✅ **Platform Compatibility**: Works correctly on VoiceOver (iOS) and TalkBack (Android)
4. ✅ **User Flow Completion**: Screen reader users can complete all primary user journeys
5. ✅ **Documentation**: Accessibility guidelines added to [CONTRIBUTING.md](../../CONTRIBUTING.md)

**Validation**: Manual testing with VoiceOver/TalkBack + accessibility audit

---

## Related Epics

- [EPIC-001: Performance](./EPIC-001-performance-optimization.md) - Components stable before accessibility
- [EPIC-002: Quality](./EPIC-002-quality-reliability.md) - Tests verify accessibility
- [EPIC-004: Code Quality](./EPIC-004-code-quality-tech-debt.md) - May extract accessibility utilities

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS VoiceOver Guide](https://developer.apple.com/documentation/accessibility/voiceover)
- [Android TalkBack Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [WHO Disability Statistics](https://www.who.int/news-room/fact-sheets/detail/disability-and-health)

---

**Last Updated**: 2025-01-11

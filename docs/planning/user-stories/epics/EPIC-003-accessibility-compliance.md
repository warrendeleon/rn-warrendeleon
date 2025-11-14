# EPIC-003: Accessibility & Compliance

**Epic ID**: EPIC-003
**Title**: Accessibility & Compliance - Inclusive Screen Reader Support
**Status**: In Progress
**Priority**: High
**Created**: 2025-01-11
**Owner**: Warren de Leon
**Category**: Accessibility

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
- Localised accessibility labels (covered by i18n)
- Custom accessibility actions (future enhancement)

---

## Timeline & Dates

**Start Date**: 2025-01-11
**Target Date**: 2025-01-12
**Completed Date**: _Not yet completed_

**Estimated Duration**: 1 day (2 hours total)

---

## Budget & Resources

**Budget**: £0
**Actual Cost**: _To be tracked_
**Total Effort**: 2 hours
**Actual Effort**: _To be tracked_

---

## Stakeholders

**Owner**: Warren de Leon
**Stakeholders**: Development team, accessibility advocates, disabled users, legal/compliance

---

## ROI & Risk

**ROI Score**: High
**Risk Level**: Low

### Key Risks

**Risk 1**: Over-verbose Labels

- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Follow WCAG guidelines for concise labels; user test with screen reader users

**Risk 2**: Platform Differences

- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**: Test on both platforms; use platform-agnostic patterns where possible

**Risk 3**: Maintenance Drift

- **Likelihood**: High
- **Impact**: Medium
- **Mitigation**: Add accessibility checks to PR template; automated accessibility testing (future); developer education

---

## User Stories

| ID                                                             | User Story                      | Status      | Story Points |
| -------------------------------------------------------------- | ------------------------------- | ----------- | ------------ |
| [US-003](../stories/US-003-inclusive-screen-reader-support.md) | Inclusive Screen Reader Support | In Progress | 2            |

**Total Stories**: 1

---

## Tasks

| ID                                                                 | Task                               | Status      | Effort | Priority |
| ------------------------------------------------------------------ | ---------------------------------- | ----------- | ------ | -------- |
| [TASK-014](../tasks/TASK-014-accessibility-button-with-chevron.md) | Accessibility ButtonWithChevron    | Completed   | 0.5h   | High     |
| [TASK-015](../tasks/TASK-015-accessibility-selectable-list.md)     | Accessibility SelectableListButton | Completed   | 0.5h   | High     |
| [TASK-016](../tasks/TASK-016-accessibility-all-screens.md)         | Accessibility All Screens          | Completed   | 0.5h   | High     |
| [TASK-017](../tasks/TASK-017-test-screen-readers.md)               | Test VoiceOver and TalkBack        | Not Started | 0.5h   | High     |

**Total Tasks**: 4
**Total Effort**: 2 hours

---

## Definition of Done

This epic is complete when:

1. ✅ Full Label Coverage: All interactive elements have accessibility labels
2. ✅ WCAG 2.1 Level AA: Meets perceivable, operable, understandable, robust criteria
3. ✅ Platform Compatibility: Works correctly on VoiceOver (iOS) and TalkBack (Android)
4. ✅ User Flow Completion: Screen reader users can complete all primary user journeys
5. ✅ Documentation: Accessibility guidelines added to CONTRIBUTING.md

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes                                                     |
| ---------- | ----------- | --------------------------------------------------------- |
| 2025-01-11 | Not Started | Epic created                                              |
| 2025-01-14 | In Progress | 3 of 4 tasks completed (pending manual VoiceOver testing) |

---

## Related Epics

- [EPIC-001](./EPIC-001-performance-optimization.md) - Components stable before accessibility
- [EPIC-002](./EPIC-002-quality-reliability.md) - Tests verify accessibility
- [EPIC-004](./EPIC-004-code-quality-tech-debt.md) - May extract accessibility utilities

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS VoiceOver Guide](https://developer.apple.com/documentation/accessibility/voiceover)
- [Android TalkBack Guide](https://developer.android.com/guide/topics/ui/accessibility)
- [WHO Disability Statistics](https://www.who.int/news-room/fact-sheets/detail/disability-and-health)

---

**Last Updated**: 2025-01-12

# TASK-014: Accessibility ButtonWithChevron

**ID**: TASK-014
**Title**: Add Accessibility Labels to ButtonWithChevron
**Epic**: [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)
**User Story**: [US-003: Inclusive Screen Reader Support](../stories/US-003-inclusive-screen-reader-support.md)
**Created**: 2025-01-11
**Completed**: _Not yet completed_
**Status**: Not Started
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `accessibility`, `a11y`, `wcag`, `voiceover`, `talkback`

---

## Context

Add accessibility props to ButtonWithChevron so VoiceOver/TalkBack users can understand and interact with buttons.

**Pattern**: See [EPIC-003 Technical Approach](../epics/EPIC-003-accessibility-compliance.md#accessibility-labels-pattern) and [US-003 Accessibility Considerations](../stories/US-003-inclusive-screen-reader-support.md#accessibility-considerations).

---

## Technical Details

### Files to Modify

- `src/features/Home/components/ButtonWithChevron/ButtonWithChevron.tsx`

### Implementation

Add accessibility props to the TouchableOpacity/Pressable:

```typescript
<TouchableOpacity
  accessibilityLabel={label + (endLabel ? `, ${endLabel}` : '')}
  accessibilityRole="button"
  accessibilityHint={accessibilityHint} // Optional, if provided as prop
  onPress={onPress}
>
  {/* existing button content */}
</TouchableOpacity>
```

**Label Format**: Combine label and endLabel (e.g., "Language, English").

---

## Acceptance Criteria

- [ ] accessibilityLabel combines label + endLabel
- [ ] accessibilityRole set to "button"
- [ ] Optional accessibilityHint prop supported
- [ ] VoiceOver announces correctly (manual test)
- [ ] TalkBack announces correctly (manual test)
- [ ] All existing tests pass

---

## Test Scenarios

**Scenario 1: VoiceOver Announces Button**

```gherkin
Given VoiceOver is enabled on iOS
And ButtonWithChevron has label="Language" and endLabel="English"
When I swipe to the button
Then VoiceOver should announce "Language, English, button"
```

**Scenario 2: Component Without endLabel**

```gherkin
Given ButtonWithChevron has only label="Settings"
When screen reader focuses the button
Then it should announce "Settings, button"
```

---

## Dependencies

**Blockers**: [TASK-001](./TASK-001-memo-button-with-chevron.md)

---

## Success Criteria

✅ Accessibility props added correctly
✅ VoiceOver and TalkBack announcements verified
✅ WCAG 2.1 Level AA compliance

---

**Last Updated**: 2025-01-11

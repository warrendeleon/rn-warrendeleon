# TASK-015: Accessibility SelectableListButton

**ID**: TASK-015
**Title**: Add Accessibility Labels to SelectableListButton
**Epic**: [EPIC-003: Accessibility & Compliance](../epics/EPIC-003-accessibility-compliance.md)
**User Story**: [US-003: Inclusive Screen Reader Support](../stories/US-003-inclusive-screen-reader-support.md)
**Created**: 2025-01-11
**Completed**: 2025-11-12
**Status**: Completed
**Priority**: High
**Effort Estimate**: 0.5 hours
**Tags**: `accessibility`, `a11y`, `wcag`

---

## Context

Add accessibility labels to SelectableListButton, including selection state announcements.

**Pattern**: See [TASK-014](./TASK-014-accessibility-button-with-chevron.md) for similar implementation.

---

## Technical Details

### Files to Modify

- Find SelectableListButton component file

### Implementation

```typescript
<TouchableOpacity
  accessibilityLabel={label + (isSelected ? ', selected' : '')}
  accessibilityRole="button"
  accessibilityState={{selected: isSelected}}
  onPress={onPress}
>
  {/* button content */}
</TouchableOpacity>
```

**Key**: Use `accessibilityState` to indicate selection status.

---

## Acceptance Criteria

- [x] accessibilityLabel includes selection state
- [x] accessibilityState.selected set correctly
- [x] accessibilityRole="button"
- [x] Screen readers announce selection state
- [x] All tests pass

---

## Dependencies

**Blockers**: [TASK-002](./TASK-002-memo-selectable-list-button.md)

---

**Last Updated**: 2025-11-12

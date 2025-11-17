# TASK-124: Add EAA Props to WebViewScreen

**Task ID**: TASK-124
**Title**: Add EAA Props to WebViewScreen
**Epic**: [EPIC-015: Testing & Compliance Expansion](../epics/EPIC-015-testing-compliance-expansion.md)
**User Story**: [US-025: EAA Compliance Completion](../stories/US-025-eaa-compliance-completion.md)
**Status**: 📋 Not Started
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Accessibility

---

## Context

WebViewScreen missing ALL accessibility props. Must add accessibilityRole, accessibilityLabel, and proper state announcements for EAA compliance.

**Legal requirement**: June 28, 2025 (EAA enforcement deadline)

---

## Technical Details

### Files to Modify

- `src/features/WebView/WebViewScreen.tsx`

### Implementation

```typescript
<Box
  flex={1}
  accessibilityRole="none"
  accessibilityLabel="Web content container"
>
  {loading && (
    <Text accessibilityRole="progressbar" accessibilityLabel="Loading web content">
      Loading...
    </Text>
  )}

  {error && (
    <Text
      accessibilityRole="alert"
      accessibilityLabel={`Error loading web content: ${error}`}
    >
      Error: {error}
    </Text>
  )}

  {!loading && !error && (
    <WebView
      source={{ uri: url }}
      accessible={true}
      accessibilityLabel="Web content loaded"
    />
  )}
</Box>
```

---

## Acceptance Criteria

- [ ] WebView container has accessibilityRole
- [ ] Loading states announced to screen reader
- [ ] Error states have accessibilityRole="alert"
- [ ] All interactive elements have accessibility props
- [ ] VoiceOver testing passes
- [ ] `/eaa-audit` passes for WebViewScreen
- [ ] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 2 hours

---

**Last Updated**: 2025-01-17

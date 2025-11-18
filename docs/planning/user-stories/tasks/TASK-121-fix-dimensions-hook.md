# TASK-121: Replace Dimensions.get() with useWindowDimensions

**Task ID**: TASK-121
**Title**: Replace Dimensions.get() with useWindowDimensions
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-024: Performance Optimization Phase 2](../stories/US-024-performance-optimization-phase-2.md)
**Status**: ✅ Done
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Performance

---

## Context

ProfileScreen uses `Dimensions.get()` at module level (lines 163-164), which doesn't update on device rotation. Must replace with `useWindowDimensions` hook.

---

## Technical Details

### Files to Modify

- `src/features/Profile/ProfileScreen.tsx`

### Implementation

**Before**:

```typescript
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = WINDOW_HEIGHT * 0.4;
```

**After**:

```typescript
import { useWindowDimensions } from 'react-native';

export const ProfileScreen: React.FC = () => {
  const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = useWindowDimensions();
  const CAROUSEL_HEIGHT = WINDOW_HEIGHT * 0.4;

  // rest of component
```

---

## Acceptance Criteria

- [x] Dimensions.get() replaced with useWindowDimensions
- [x] Layout updates correctly on device rotation
- [x] Tested in portrait and landscape modes
- [x] No layout issues
- [x] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 1 hour

---

**Last Updated**: 2025-01-17

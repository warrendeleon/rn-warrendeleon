# TASK-122: Optimize Splash Screen Data Loading

**Task ID**: TASK-122
**Title**: Optimize Splash Screen Data Loading
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-024: Performance Optimization Phase 2](../stories/US-024-performance-optimization-phase-2.md)
**Status**: ✅ Done
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Performance

---

## Context

SplashScreen currently shows fixed 4.5 seconds, even if data loads in 1 second. Must implement parallel loading with dynamic timing.

---

## Technical Details

### Implementation

```typescript
// Parallel data loading with Promise.all
const SPLASH_MINIMUM_DURATION = 1500; // 1.5s

const loadAppData = async () => {
  const startTime = Date.now();

  // Load all data in parallel
  await Promise.all([
    dispatch(fetchProfile()),
    dispatch(fetchEducation()),
    dispatch(fetchWorkExperience()),
  ]);

  // Ensure minimum splash duration
  const elapsed = Date.now() - startTime;
  if (elapsed < SPLASH_MINIMUM_DURATION) {
    await new Promise(resolve => setTimeout(resolve, SPLASH_MINIMUM_DURATION - elapsed));
  }
};
```

---

## Acceptance Criteria

- [x] Data loads in parallel with Promise.all
- [x] Minimum 1.5s splash duration enforced
- [x] Splash closes when data ready (not fixed 4.5s)
- [x] Faster perceived app launch
- [x] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 2 hours

---

**Last Updated**: 2025-01-17

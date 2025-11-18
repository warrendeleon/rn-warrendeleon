# TASK-123: Implement RTK Query for API Caching

**Task ID**: TASK-123
**Title**: Implement RTK Query for API Caching (OPTIONAL)
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**User Story**: [US-024: Performance Optimization Phase 2](../stories/US-024-performance-optimization-phase-2.md)
**Status**: 📋 To Do
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Performance

---

## Context

**OPTIONAL TASK** - Can defer if timeline tight. Implementing RTK Query provides automatic API caching, reducing duplicate API calls by 50%.

---

## Technical Details

### Implementation

Migrate Profile/Education/WorkExperience endpoints to RTK Query:

```typescript
// src/store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.GITHUB_API_URL }),
  endpoints: builder => ({
    getProfile: builder.query({
      query: () => 'profile.json',
      keepUnusedDataFor: 60, // Cache for 60 seconds
    }),
  }),
});
```

---

## Acceptance Criteria

- [ ] RTK Query configured
- [ ] Profile/Education/WorkExperience migrated
- [ ] 50% reduction in duplicate API calls
- [ ] Cache invalidation working
- [ ] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 8 hours (OPTIONAL)

---

**Last Updated**: 2025-01-17

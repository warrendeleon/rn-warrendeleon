# EPIC-017: Test Coverage Improvements

**Status**: ⏳ In Progress
**Priority**: High
**Estimated Effort**: 7h
**Target Coverage**: 85%+

---

## Overview

Improve test coverage from current 75% to 85%+ by addressing identified gaps in screens, components, utilities, and action tests. Based on comprehensive coverage analysis comparing RNTL unit tests and Detox E2E tests.

## Current Coverage Breakdown

| Area          | Current | Target  |
| ------------- | ------- | ------- |
| Store (Redux) | 100%    | 100%    |
| Components    | 92%     | 100%    |
| Screens       | 77%     | 90%     |
| API Clients   | 75%     | 85%     |
| Utilities     | 33%     | 80%     |
| **Overall**   | **75%** | **85%** |

## Goals

- Add missing RNTL tests for untested screens
- Convert story-only components to full unit tests
- Add utility function tests
- Improve async thunk action testing
- Close error handling test gaps

## Tasks

| Task ID                                                       | Title                                      | Effort | Priority |
| ------------------------------------------------------------- | ------------------------------------------ | ------ | -------- |
| [TASK-150](../tasks/TASK-150-test-work-experience-details.md) | RNTL Tests for WorkExperienceDetailsScreen | 1.5h   | High     |
| [TASK-151](../tasks/TASK-151-test-work-experience-clients.md) | RNTL Tests for WorkExperienceClientsScreen | 1h     | High     |
| [TASK-152](../tasks/TASK-152-test-async-thunk-actions.md)     | Explicit Async Thunk Action Tests          | 1.5h   | High     |
| [TASK-153](../tasks/TASK-153-test-logger-utility.md)          | RNTL Tests for Logger Utility              | 0.5h   | Medium   |
| [TASK-154](../tasks/TASK-154-test-button-group-component.md)  | Unit Tests for ButtonGroup Component       | 0.75h  | Medium   |
| [TASK-155](../tasks/TASK-155-test-header-back-button.md)      | Unit Tests for HeaderBackButton Component  | 0.75h  | Medium   |
| [TASK-156](../tasks/TASK-156-test-mock-status-screen.md)      | RNTL Tests for MockStatusScreen            | 1h     | Low      |

## Acceptance Criteria

- [ ] All new tests pass with `yarn test`
- [ ] Overall coverage reaches 85%+
- [ ] No new ESLint or TypeScript errors
- [ ] Tests follow existing patterns and conventions
- [ ] E2E tests remain passing

## Technical Notes

- WorkExperienceDetailsScreen has complex styling helpers that need unit testing
- WorkExperienceClientsScreen uses selectors that need isolation testing
- Logger utility should test dev mode vs production silence
- ButtonGroup and HeaderBackButton currently only have story tests

## Dependencies

- None (can be worked on independently)

## Related

- Based on coverage analysis from 2024-11-19
- Addresses gaps identified in comprehensive RNTL + Detox coverage audit

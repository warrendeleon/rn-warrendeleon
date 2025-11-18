# US-027: Code Quality & Tech Debt

**Story ID**: US-027
**Title**: Code Quality & Technical Debt Cleanup
**Epic**: [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)
**Status**: 📋 Not Started
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Code Quality

---

## User Story

**As a** developer,
**I want** consistent code patterns, proper error handling, and clean architecture,
**So that** the codebase is maintainable, professional, and easy to extend.

---

## Context & Rationale

Several code quality issues and technical debt items need addressing:

1. **Inconsistent Error Handling**: Profile, Education, WorkExperience features handle errors differently (some log, some don't, inconsistent patterns)
2. **Magic Numbers**: Hard-coded values like `4.5` (splash duration), `0.4` (carousel height multiplier) scattered throughout code without named constants
3. **TODO Comments**: HomeScreen has TODO comments for handlers that should be implemented or removed (dead code uncertainty)
4. **MSW Dead Code**: MSW library in devDependencies but no longer used (removed in favour of Metro runtime mocking)
5. **Outdated Comments**: MockStatusScreen comments reference MSW, but app now uses Metro runtime mocking
6. **StyleSheet.create Mixing**: ProfileDataScreen and WebViewScreen use StyleSheet.create instead of GlueStack UI + NativeWind patterns

These issues create maintenance overhead, inconsistency, and make the codebase harder to understand and extend.

**Real-world scenario**: A developer adds a new feature screen and copies error handling from ProfileScreen. They implement one pattern. Another developer copies from EducationScreen and implements a different pattern. Over time, error handling becomes inconsistent and hard to maintain. When a bug occurs, debugging is complicated by different approaches.

**Related Epic**: See [EPIC-014](../epics/EPIC-014-performance-quality-phase-2.md) for complete quality strategy.

---

## Benefits

### Code Quality

- Consistent error handling across all features
- Named constants make code self-documenting
- No dead code or confusing comments
- Standardized UI patterns (GlueStack UI + NativeWind)

### Developer Experience

- Easier to understand codebase
- Faster onboarding for new developers
- Less time debugging inconsistencies
- Clear patterns to follow for new features

### Maintainability

- Easier to refactor and extend
- Reduced cognitive load
- Fewer bugs from inconsistencies
- Professional, production-ready code

---

## Impact & Effort

**Impact**: Medium
**Effort**: Medium
**Story Points**: 13

**Effort Estimate**: 10.75 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: Refactoring Introduces Bugs

**Impact**: Standardization might accidentally change behaviour
**Likelihood**: Low
**Mitigation**:

- Comprehensive testing after each change
- Test-before-commit workflow (ZERO TOLERANCE)
- Code review focus on behaviour preservation
- Run `yarn validate` after each task

### Risk 2: GlueStack UI Migration Complex

**Impact**: Converting StyleSheet.create to GlueStack might be tricky
**Likelihood**: Medium
**Mitigation**:

- Study existing GlueStack patterns in ProfileScreen
- Convert one component at a time
- Test thoroughly after each conversion
- Keep original styling as reference during migration

### Risk 3: Magic Number Extraction Over-Engineering

**Impact**: Might create too many constants
**Likelihood**: Low
**Mitigation**:

- Only extract truly "magic" numbers (unclear meaning)
- Use descriptive constant names
- Group related constants together
- Don't extract obvious values (e.g., 0, 1, 100%)

---

## Pros & Cons

### Pros

✅ Consistent, professional codebase
✅ Easier maintenance and debugging
✅ Clear patterns for future development
✅ Removes dead code and confusion
✅ Standardized on GlueStack UI + NativeWind

### Cons

❌ Time investment with no immediate user-facing value
❌ Risk of introducing bugs during refactoring
❌ Requires discipline to maintain standards
❌ Some arbitrary decisions (which error pattern to standardize on)

**Trade-off**: Short-term effort for long-term maintainability. Worth it for professional codebase.

---

## Acceptance Criteria

### Functional

- [ ] Error handling standardized across Profile/Education/WorkExperience
- [ ] All magic numbers replaced with named constants
- [ ] HomeScreen TODO handlers implemented or removed (decision documented)
- [ ] MSW removed from package.json devDependencies
- [ ] MockStatusScreen comments updated (no MSW references)
- [ ] ProfileDataScreen/WebViewScreen use GlueStack UI (no StyleSheet.create)

### Coverage

- [ ] All refactored code has tests
- [ ] No regressions in existing functionality
- [ ] Test coverage maintained at 85%+

### Technical

- [ ] `yarn validate` passes (0 errors, 0 failures)
- [ ] All code follows GlueStack UI + NativeWind patterns
- [ ] Constants defined in appropriate files
- [ ] Error handling documented in code comments
- [ ] No dead code or confusing comments

---

## Test Scenarios

### Scenario 1: Standardized Error Handling

```gherkin
Given all features use standardized error handling
When an API error occurs in ProfileScreen
Then the error should be handled consistently
When an API error occurs in EducationScreen
Then the error should be handled identically
And error messages should follow same format
```

### Scenario 2: Named Constants

```gherkin
Given magic numbers have been replaced with constants
When I read the code
Then constants like SPLASH_MINIMUM_DURATION should be self-explanatory
And CAROUSEL_HEIGHT_RATIO should describe its purpose
And values should be defined in a central constants file
```

### Scenario 3: GlueStack UI Migration

```gherkin
Given ProfileDataScreen has been migrated to GlueStack UI
When I render the screen
Then styling should match exactly as before
And no StyleSheet.create should be used
And all styles should use GlueStack UI components and NativeWind utilities
```

### Scenario 4: Dead Code Removal

```gherkin
Given MSW has been removed from devDependencies
When I run yarn install
Then MSW should not be installed
When I search codebase for MSW references
Then no code should reference MSW library
And MockStatusScreen comments should reference Metro runtime mocking
```

---

## Definition of Ready

- [x] User story statement written (As a/I want/So that)
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Dependencies identified
- [x] Epic linked
- [x] Technical approach discussed

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No regressions
- [ ] `yarn validate` passes

---

## Dependencies

### Blockers

- [US-022](./US-022-security-hardening.md): Security fixes should complete first
- [US-023](./US-023-test-coverage-completion.md): Testing foundation should be solid

### Enables

- Future development with consistent patterns
- Easier maintenance and debugging

---

## Tasks

| ID                                                                  | Task                                              | Effort | Priority  | Status         |
| ------------------------------------------------------------------- | ------------------------------------------------- | ------ | --------- | -------------- |
| [TASK-133](../tasks/TASK-133-standardize-error-handling.md)         | Standardize Error Handling Patterns               | 3h     | 🟡 Medium | ✅ Complete    |
| [TASK-134](../tasks/TASK-134-replace-magic-numbers.md)              | Replace Magic Numbers with Constants              | 2h     | 🟡 Medium | ✅ Complete    |
| [TASK-135](../tasks/TASK-135-implement-todo-handlers.md)            | Implement or Remove TODO Handlers                 | 2h     | 🟡 Medium | ✅ Complete    |
| [TASK-136](../tasks/TASK-136-remove-msw-devdependency.md)           | Remove MSW from devDependencies                   | 0.5h   | 🟡 Medium | 📋 Not Started |
| [TASK-137](../tasks/TASK-137-update-mockstatus-comments.md)         | Update MockStatusScreen Comments                  | 0.25h  | 🟡 Medium | 📋 Not Started |
| [TASK-138](../tasks/TASK-138-standardize-gluestack-ui.md)           | Standardize on GlueStack UI Patterns              | 3h     | 🟡 Medium | ✅ Completed   |
| [TASK-142](../tasks/TASK-142-document-stylesheet-justifications.md) | Document StyleSheet.create() Usage Justifications | 1h     | 🟢 Low    | ✅ Complete    |

**Total Tasks**: 7
**Total Effort**: 11.75 hours

---

## Implementation Phases

### Phase 1: Error Handling (3h)

- TASK-137: Standardize error patterns across features
- Define error handling strategy in documentation

**Validation**: All features handle errors consistently

### Phase 2: Code Cleanup (4.75h)

- TASK-138: Replace magic numbers with named constants
- TASK-137: Implement or remove TODO handlers
- TASK-138: Remove MSW from devDependencies
- TASK-137: Update MockStatusScreen comments

**Validation**: No magic numbers, no dead code, clear comments

### Phase 3: UI Standardization (3h)

- TASK-138: Migrate ProfileDataScreen and WebViewScreen to GlueStack UI
- Remove all StyleSheet.create usage

**Validation**: 100% GlueStack UI + NativeWind usage

---

## Timeline & Dates

**Start Date**: _Not yet started_
**Target Completion**: 2025-02-10 (Week 2 of Phase 2, parallel with EPIC-015)
**Completed Date**: _Not yet completed_

---

## Blocked Information

**Blocked**: No
**Blocked Since**: _N/A_
**Blocked Reason**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes         |
| ---------- | ----------- | ------------- |
| 2025-01-17 | Not Started | Story created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Technical Debt Score**: -5 (significantly pays down technical debt)

This story is specifically designed to pay down accumulated technical debt.

---

## Success Criteria

This user story is complete when:

1. ✅ **Error Handling Standardized**: Consistent pattern across all features
2. ✅ **Magic Numbers Eliminated**: All hard-coded values replaced with named constants
3. ✅ **TODO Handlers Resolved**: Implemented or removed with clear decisions
4. ✅ **Dead Code Removed**: MSW gone, comments updated
5. ✅ **GlueStack UI Standard**: ProfileDataScreen and WebViewScreen migrated
6. ✅ **All Tests Pass**: `yarn validate` passes with 0 errors, 0 failures

---

## Alternative Approaches

### Alternative 1: Leave Technical Debt

Don't address these issues now, defer indefinitely.

**Pros**: No time investment
**Cons**: Technical debt accumulates, maintenance becomes harder over time

**Decision**: Address now while codebase is small and manageable

### Alternative 2: Big Bang Refactoring

Refactor everything at once in one massive PR.

**Pros**: Complete transformation faster
**Cons**: High risk, difficult to review, harder to isolate regressions

**Decision**: Incremental refactoring with 6 focused tasks is safer

### Alternative 3: Keep StyleSheet.create

Don't migrate to GlueStack UI, allow mixing of patterns.

**Pros**: Less effort
**Cons**: Inconsistent codebase, harder to maintain, violates architectural standard

**Decision**: Standardize on GlueStack UI + NativeWind as architectural decision

---

## Notes & Learnings

**Key Principle**: Consistency over cleverness. Simple, consistent patterns are easier to maintain than clever, inconsistent ones.

**GlueStack UI + NativeWind**: This is our architectural standard for styling - utility-first CSS approach.

_Additional learnings to be filled in during/after implementation_

---

## References

- [GlueStack UI Documentation](https://gluestack.io/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Technical Debt Management](https://martinfowler.com/bliki/TechnicalDebt.html)
- [EPIC-014: Performance & Quality Phase 2](../epics/EPIC-014-performance-quality-phase-2.md)

---

**Last Updated**: 2025-01-17

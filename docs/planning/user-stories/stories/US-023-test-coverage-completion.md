# US-023: Test Coverage Completion

**Story ID**: US-023
**Title**: Test Coverage Completion
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**Status**: 📋 Not Started
**Priority**: 🔴 Critical
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Testing

---

## User Story

**As a** developer,
**I want** 100% test coverage on all Redux selectors, API logic, and infrastructure code,
**So that** I can confidently deploy to production knowing critical logic is properly tested.

---

## Context & Rationale

Several critical pieces of infrastructure currently have zero or incomplete test coverage:

1. **selectWorkExperienceOrClientById Selector**: Complex 40-line nested logic handling both work experience and client lookups - **completely untested**
2. **E2E Mocking Logic**: Metro runtime mocking branches in Profile/Education/WorkExperience API files - **completely untested** (discovered during "mocked"/"not mocked" incident)
3. **GithubApiClient**: HTTP client configuration and error handling - **completely untested**
4. **Missing Selector Exports**: WorkExperience selectors not exported from store/index.ts, making them hard to test

These gaps create serious risks:

- Complex selector could have bugs that only surface in production
- E2E tests could break due to untested mocking logic
- API client errors could cause crashes
- Missing exports make testing inconsistent

**Real-world scenario**: The "mocked"/"not mocked" incident showed that our E2E mocking logic was untested. A simple logic error caused tests to pass with wrong data. This story prevents similar incidents.

**Related Epic**: See [EPIC-013](../epics/EPIC-013-production-readiness.md) for complete testing strategy and business value.

---

## Benefits

### Quality Assurance

- 100% coverage on critical Redux/API infrastructure
- Catches bugs before they reach production
- Prevents false positives in E2E tests
- Establishes testing patterns for future code

### Business Impact

- Reduces production incidents significantly
- Faster debugging when issues occur
- Higher confidence in releases
- Lower support costs from fewer bugs

### Technical Benefits

- Complete test coverage enables safe refactoring
- Documented behaviour via tests
- Regression protection
- Easier onboarding for new developers

---

## Impact & Effort

**Impact**: Critical
**Effort**: Medium
**Story Points**: 13

**Effort Estimate**: 8.5 hours
**Actual Effort**: _To be tracked_

---

## Risks & Mitigation

### Risk 1: Tests Reveal Existing Bugs

**Impact**: Might discover bugs in untested code
**Likelihood**: High
**Mitigation**:

- This is GOOD - better to find bugs now than in production
- Fix discovered bugs before production launch
- Document bugs found and resolutions

### Risk 2: Mocking Logic Complex to Test

**Impact**: E2E mocking tests might be difficult to write
**Likelihood**: Medium
**Mitigation**:

- Study existing Metro runtime mocking documentation
- Test both mocked and non-mocked branches
- Use environment variable toggling for test scenarios

### Risk 3: Selector Testing Uncovers Edge Cases

**Impact**: Complex selector might fail on edge cases
**Likelihood**: Medium
**Mitigation**:

- Write comprehensive test cases for all scenarios
- Test both work experience and client lookup paths
- Test error cases (not found, invalid IDs, etc.)

---

## Pros & Cons

### Pros

✅ Eliminates critical testing gaps before production
✅ Prevents "mocked"/"not mocked" incidents
✅ 100% confidence in Redux/API infrastructure
✅ Enables safe refactoring later
✅ Documents expected behaviour

### Cons

❌ Takes time to write comprehensive tests
❌ Might reveal bugs requiring fixes
❌ Testing mocking logic is meta and complex
❌ Maintenance overhead for selector tests

**Trade-off**: Short-term effort for long-term quality and confidence. Non-negotiable for production.

---

## Acceptance Criteria

### Functional

- [ ] `selectWorkExperienceOrClientById` has 100% test coverage
- [ ] All E2E mocking branches tested (Profile, Education, WorkExperience APIs)
- [ ] GithubApiClient has comprehensive test coverage
- [ ] All WorkExperience selectors exported from store/index.ts

### Coverage

- [ ] 100% line coverage for all tested code
- [ ] All edge cases covered (not found, errors, etc.)
- [ ] Both success and error paths tested

### Technical

- [ ] All tests pass with 85%+ overall coverage
- [ ] Zero test failures
- [ ] TypeScript compilation successful
- [ ] Tests follow RNTL/Jest best practices
- [ ] MSW removed from devDependencies (dead code cleanup)

---

## Test Scenarios

### Scenario 1: Selector Tests for Work Experience

```gherkin
Given a Redux state with work experience entries
When I call selectWorkExperienceOrClientById with a valid work experience ID
Then the correct work experience object should be returned

Given a Redux state with work experience entries
When I call selectWorkExperienceOrClientById with an invalid ID
Then undefined should be returned
```

### Scenario 2: Selector Tests for Client Lookup

```gherkin
Given a Redux state with work experience containing client entries
When I call selectWorkExperienceOrClientById with a valid client ID
Then the correct client object should be returned

Given a Redux state without matching client
When I call selectWorkExperienceOrClientById with a client ID
Then undefined should be returned
```

### Scenario 3: E2E Mocking Logic Tests

```gherkin
Given E2E_MOCK environment variable is "true"
When the Profile API endpoint is called
Then it should return mock data from fixtures

Given E2E_MOCK environment variable is "false"
When the Profile API endpoint is called
Then it should make real API request to GitHub
```

### Scenario 4: GithubApiClient Tests

```gherkin
Given GithubApiClient is instantiated
When a successful API request is made
Then the response should be returned correctly

Given GithubApiClient is instantiated
When an API request fails with 404
Then an appropriate error should be thrown
And the error should contain status code information
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
- [ ] Tests written and passing (100% coverage for targeted code)
- [ ] Documentation updated
- [ ] No regressions
- [ ] MSW removed from package.json

---

## Dependencies

### Blockers

None - can start immediately (parallel with US-022)

### Enables

- All future epics (EPIC-014, EPIC-015) - ensures tested foundation

---

## Tasks

| ID                                                                     | Task                                  | Effort | Priority  | Status         |
| ---------------------------------------------------------------------- | ------------------------------------- | ------ | --------- | -------------- |
| [TASK-115](../tasks/TASK-115-test-select-work-experience-or-client.md) | Test selectWorkExperienceOrClientById | 2h     | 🟠 High   | 📋 Not Started |
| [TASK-116](../tasks/TASK-116-test-e2e-mocking-logic.md)                | Test E2E Mocking Logic in API Files   | 4h     | 🟠 High   | 📋 Not Started |
| [TASK-117](../tasks/TASK-117-test-github-api-client.md)                | Create GithubApiClient Tests          | 1h     | 🟠 High   | 📋 Not Started |
| [TASK-118](../tasks/TASK-118-export-missing-selectors.md)              | Export Missing Redux Selectors        | 0.5h   | 🟡 Medium | 📋 Not Started |
| [TASK-119](../tasks/TASK-119-remove-msw-dead-code.md)                  | Remove MSW from devDependencies       | 1h     | 🟡 Medium | 📋 Not Started |

**Total Tasks**: 5
**Total Effort**: 8.5 hours

---

## Implementation Phases

### Phase 1: Selector Testing (2.5h)

- TASK-119: Test complex selector with all edge cases
- TASK-118: Export missing selectors from store/index.ts

**Validation**: 100% selector coverage, all tests passing

### Phase 2: E2E Mocking Logic (4h)

- TASK-118: Test mocking branches in Profile/Education/WorkExperience
- Test both E2E_MOCK=true and E2E_MOCK=false paths

**Validation**: Zero false positives, mocking logic bulletproof

### Phase 3: Infrastructure & Cleanup (2h)

- TASK-119: Comprehensive GithubApiClient tests
- TASK-119: Remove MSW dead code from devDependencies

**Validation**: All infrastructure tested, dead code removed

---

## Timeline & Dates

**Start Date**: _Not yet started_
**Target Completion**: 2025-01-21 (3 days, parallel with US-022)
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

**Technical Debt Score**: -5 (significantly pays down testing debt)

This story eliminates critical testing gaps and establishes comprehensive testing patterns.

---

## Success Criteria

This user story is complete when:

1. ✅ **100% Selector Coverage**: selectWorkExperienceOrClientById fully tested
2. ✅ **E2E Mocking Tested**: All mocking branches covered with tests
3. ✅ **API Client Tested**: GithubApiClient has comprehensive coverage
4. ✅ **Exports Complete**: All selectors properly exported
5. ✅ **Dead Code Removed**: MSW removed from devDependencies
6. ✅ **All Tests Pass**: Zero failures, 85%+ overall coverage maintained

---

## Alternative Approaches

### Alternative 1: Skip E2E Mocking Tests

Accept the risk and don't test mocking logic.

**Pros**: Saves 4 hours of effort
**Cons**: Repeats "mocked"/"not mocked" incident risk, no confidence in E2E tests

**Decision**: Testing mocking logic is critical after previous incident - must test

### Alternative 2: Integration Tests Instead of Unit Tests

Test selectors via integration tests with full Redux store.

**Pros**: Tests more realistic scenarios
**Cons**: Slower tests, harder to isolate edge cases, longer feedback loop

**Decision**: Unit tests are faster and better for testing edge cases in selectors

---

## Notes & Learnings

**Lesson from "mocked"/"not mocked" incident**: Always test your testing infrastructure. Untested mocking logic can create false positives that waste hours of debugging time.

---

## References

- [Redux Toolkit Testing](https://redux-toolkit.js.org/usage/usage-guide#testing)
- [Jest Testing Best Practices](https://jestjs.io/docs/testing-best-practices)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Metro Runtime Mocking](https://facebook.github.io/metro/docs/configuration)
- [EPIC-013: Production Readiness](../epics/EPIC-013-production-readiness.md)

---

**Last Updated**: 2025-01-17

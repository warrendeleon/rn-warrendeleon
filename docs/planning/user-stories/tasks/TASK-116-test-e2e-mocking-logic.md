# TASK-116: Test E2E Mocking Logic in API Files

**Task ID**: TASK-116
**Title**: Test E2E Mocking Logic in API Files
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-023: Test Coverage Completion](../stories/US-023-test-coverage-completion.md)
**Status**: 📋 Not Started
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Context

Metro runtime mocking branches in Profile/Education/WorkExperience API files are completely untested. The "mocked"/"not mocked" incident showed this is critical to test.

---

## Technical Details

### Files to Test

- `src/features/Profile/api/ProfileAPI.ts`
- `src/features/Education/api/EducationAPI.ts`
- `src/features/WorkExperience/api/WorkExperienceAPI.ts`

### Test Scenarios

**For each API file**:

1. **E2E_MOCK=true**: Returns mock data from fixtures
2. **E2E_MOCK=false**: Makes real API call to GitHub
3. **E2E_MOCK undefined**: Default behaviour tested

### Implementation Approach

```typescript
describe('ProfileAPI E2E Mocking', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns mock data when E2E_MOCK=true', async () => {
    process.env.E2E_MOCK = 'true';
    const { fetchProfile } = require('../ProfileAPI');
    const result = await fetchProfile();
    expect(result).toEqual(mockProfileData);
  });

  it('makes real API call when E2E_MOCK=false', async () => {
    process.env.E2E_MOCK = 'false';
    const { fetchProfile } = require('../ProfileAPI');
    // Mock GitHub API client
    // Verify real API call made
  });
});
```

---

## Acceptance Criteria

- [ ] All 3 API files have mocking logic tests
- [ ] Both E2E_MOCK=true and E2E_MOCK=false paths tested
- [ ] Mock data returns correctly
- [ ] Real API calls tested (mocked at HTTP layer)
- [ ] 100% coverage of mocking branches
- [ ] All tests passing

---

## Story Points & Effort

**Effort Estimate**: 4 hours

**Breakdown**:

- ProfileAPI tests: 1.5h
- EducationAPI tests: 1.25h
- WorkExperienceAPI tests: 1.25h

---

**Last Updated**: 2025-01-17

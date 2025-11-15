# TASK-057: Create API Tests for Profile Feature

**Task ID**: TASK-057
**Title**: Create API Tests for Profile Feature
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**User Story**: [US-012: API Layer Unit Testing](../stories/US-012-api-layer-testing.md)
**Status**: Not Started
**Priority**: High
**Created**: 2025-11-15
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Context

Extract Profile API logic from Redux thunk and create dedicated unit tests using axios-mock-adapter.

---

## Acceptance Criteria

- [ ] API function extracted to `src/features/Profile/api/api.ts`
- [ ] Test file created at `src/features/Profile/api/__tests__/api.test.ts`
- [ ] Tests use MockAdapter pattern (like old app)
- [ ] Test success scenario (200 response)
- [ ] Test network error scenario
- [ ] Test 404 error scenario
- [ ] Test correct URL construction with locale
- [ ] 100% coverage for Profile API functions
- [ ] Redux thunk updated to use extracted API function
- [ ] All tests passing

---

## Story Points & Effort

**Story Points**: N/A
**Effort Estimate**: 1h

---

## Implementation Pattern

Follow old app pattern from:
https://github.com/warrendeleon/rn-warrendeleon/blob/salve-tech-test/src/modules/profile/__test__/api.unit.ts

```typescript
// src/features/Profile/api/api.ts
export const fetchProfileData = async (language: string) => {
  return GithubApiClient.get<Profile>(`/${language}/profile.json`);
};

// src/features/Profile/api/__tests__/api.test.ts
import MockAdapter from 'axios-mock-adapter';
import { GithubApiClient } from '@app/httpClients/GithubApiClient';
import { fetchProfileData } from '../api';

describe('Profile API', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(GithubApiClient);
  });

  it('should fetch profile with correct locale', async () => {
    mock.onGet('/en/profile.json').reply(200, profileFixture);
    const response = await fetchProfileData('en');
    expect(response.data).toEqual(profileFixture);
  });
});
```

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] axios-mock-adapter installed

---

## Definition of Done

- [ ] API function extracted
- [ ] Tests written and passing
- [ ] 100% coverage
- [ ] Redux thunk refactored
- [ ] No regressions

---

**Last Updated**: 2025-11-15

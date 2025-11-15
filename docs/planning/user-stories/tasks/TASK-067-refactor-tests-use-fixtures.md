# TASK-067: Refactor Tests to Use Centralized Fixtures

**Task ID**: TASK-067
**Title**: Refactor All Tests to Use Centralized Test Fixtures
**User Story**: New - Quality Improvement
**Epic**: [EPIC-002: Quality & Reliability](../epics/EPIC-002-quality-reliability.md)
**Status**: Not Started
**Priority**: Medium
**Created**: 2025-11-15
**Effort Estimate**: 2 hours

---

## Description

Refactor all test files across the project to use the centralized test fixtures exported from `@app/test-utils` instead of duplicating mock data inline. This improves test maintainability, ensures consistency, and makes tests more readable.

**Current Problem**:

- Tests duplicate mock data with incomplete/empty fields
- Inconsistent mock data across different test files
- Changes to data structure require updating multiple files
- Tests are longer and harder to read

**Solution**:

- All fixtures already exist in `src/test-utils/fixtures/api/`
- Fixtures now exported from `@app/test-utils` (completed)
- HomeScreen tests already refactored as example (completed)
- Need to audit and refactor remaining test files

---

## Acceptance Criteria

- [ ] All test files import fixtures from `@app/test-utils`
- [ ] No inline mock data that duplicates fixture structure
- [ ] Tests use `mockProfile`, `mockEducation`, `mockWorkXP` consistently
- [ ] All tests still pass after refactoring
- [ ] Test code is shorter and more readable
- [ ] Documentation updated with fixture usage guidelines

---

## Implementation Details

**Fixtures Available**:

```typescript
import {
  mockProfile, // Default English profile
  mockEducation, // Default English education
  mockWorkXP, // Default English work experience
  mockProfileEN, // Explicit English profile
  mockProfileES, // Spanish profile
  mockProfileCA, // Catalan profile
  mockProfilePL, // Polish profile
  mockProfileTL, // Tagalog profile
  // ... same pattern for education and workXP
} from '@app/test-utils';
```

**Example Refactoring** (HomeScreen already done):

**Before**:

```typescript
const mockProfile = {
  profilePicture: 'https://example.com/avatar.jpg',
  name: 'Warren',
  lastName: 'de Leon',
  headline: 'Senior Software Engineer',
  // ... 20+ lines of mock data
};

const { getByTestId } = renderWithProviders(<Component />, {
  preloadedState: { profile: { data: mockProfile, loading: false, error: null } }
});
```

**After**:

```typescript
import { mockProfile, renderWithProviders } from '@app/test-utils';

const { getByTestId } = renderWithProviders(<Component />, {
  preloadedState: { profile: { data: mockProfile, loading: false, error: null } }
});
```

---

## Technical Approach

1. **Audit Phase** (0.5h):
   - Search for inline mock data patterns
   - Identify files with duplicated mock structures
   - Create checklist of files to refactor

2. **Refactor Phase** (1h):
   - Update imports to include fixtures
   - Replace inline mocks with imported fixtures
   - Run tests after each file to ensure no regressions

3. **Validation Phase** (0.5h):
   - Run full test suite
   - Verify test coverage hasn't decreased
   - Check all tests pass

**Search Command**:

```bash
# Find files with potential inline mock data
grep -r "const mock" src --include="*.test.ts" --include="*.test.tsx" --include="*.rntl.ts" --include="*.rntl.tsx"
```

---

## Files Likely to Need Refactoring

Based on common patterns, likely candidates:

- `src/features/Profile/**/__tests__/*.rntl.tsx`
- `src/features/Education/**/__tests__/*.rntl.tsx`
- `src/features/WorkXP/**/__tests__/*.rntl.tsx`
- `src/components/**/__tests__/*.rntl.tsx` (if they use profile data)
- `src/navigation/**/__tests__/*.rntl.tsx`

**Completed**:

- ✅ `src/features/Home/__tests__/HomeScreen.rntl.tsx`

---

## Benefits

**Maintainability**:

- Single source of truth for test data
- Changes to data structure only need updating in fixtures
- Easier to add new fixture variations

**Consistency**:

- All tests use same realistic data
- Reduces test flakiness from inconsistent mocks
- Makes test behavior predictable

**Readability**:

- Tests focus on behavior, not data setup
- Reduced line count in test files
- Clear intent when using named fixtures

---

## Edge Cases to Consider

- Tests that need modified data can still spread fixtures:
  ```typescript
  const customProfile = { ...mockProfile, name: 'Custom' };
  ```
- Tests that specifically test empty/null states should still use inline:
  ```typescript
  const emptyProfile = null; // Explicit intent
  ```
- Multi-language tests should use language-specific fixtures:
  ```typescript
  import { mockProfileES, mockProfileCA } from '@app/test-utils';
  ```

---

## Related Tasks

- ✅ Centralized fixtures exported from test-utils (completed with TASK-067)
- [TASK-068](./TASK-068-audit-usecallback-handlers.md) - useCallback audit (separate refactoring)

---

## Notes

This is a code quality improvement that makes tests more maintainable. It doesn't change test behavior or coverage, just improves the test code itself.

**Priority Justification**: Medium priority because:

- Not blocking any features
- Tests currently work fine
- But provides significant long-term maintenance benefit
- Low risk refactoring with high value

---

**Last Updated**: 2025-11-15

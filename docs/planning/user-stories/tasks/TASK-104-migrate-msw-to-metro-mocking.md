# TASK-104: Migrate from MSW to Metro-based Mocking for E2E Tests

**Task ID**: TASK-104
**Title**: Replace MSW with Metro bundler mocking for Detox E2E tests
**Epic**: [EPIC-005: Multi-Language Portfolio Data Layer](../epics/EPIC-005-multi-language-portfolio-data-layer.md)
**User Story**: [US-010: Data Layer Testing](../stories/US-010-data-layer-testing.md)
**Status**: ✅ Completed
**Priority**: High
**Created**: 2025-01-16
**Completed**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Testing Infrastructure

---

## Context

After implementing TASK-103 with MSW (Mock Service Worker), E2E tests revealed that MSW cannot intercept network requests in React Native apps running in iOS simulator/Android emulator. This is because:

1. **Separate Processes**: Test runner (Node.js) and React Native app (simulator) run in completely separate processes
2. **MSW Limitation**: MSW intercepts requests in Node.js process only, not native iOS/Android networking
3. **False Positive**: Original test passed due to flawed assertion (checking `.includes("Mocked")` matched "Not Mocked")

**Current State**:

- TASK-103 implemented with MSW approach
- E2E test falsely passing (assertion bug)
- MSW setup in hooks but not functional
- Mock Status screen showing "Not Mocked" during tests

**Desired State**:

- Metro bundler configured to use `.mock.ts` files during E2E tests
- Mock API service files return mocked data with `mocked: true` flag
- MSW setup completely removed from project
- E2E test accurately verifies mocking works
- Documentation updated to explain Metro mocking approach

---

## Technical Details

### Implementation Approach (per Detox Official Docs)

Metro bundler uses `sourceExts` configuration to resolve file imports. We can leverage this to prefer `.mock.ts` files over `.ts` files when E2E_MOCK environment variable is set.

### Files to Create

1. **Mock API Service** - `src/services/github-api.mock.ts`
   - Export same interface as `github-api.ts`
   - Return static mock data with `mocked: true` flag
   - Mock all endpoints: profile, education, workExperience (all languages)

### Files to Modify

1. **Metro Config** - `metro.config.js`
   - Add conditional `sourceExts` based on `process.env.E2E_MOCK`
   - When `E2E_MOCK=true`: `sourceExts: ['mock.ts', 'mock.tsx', 'ts', 'tsx', ...]`
   - When `E2E_MOCK=false`: default sourceExts

2. **Package.json** - Update Detox scripts
   - `detox:ios:test`: Add `E2E_MOCK=true` environment variable
   - `detox:android:test`: Add `E2E_MOCK=true` environment variable
   - Ensure Metro bundler respects the environment variable

3. **Remove MSW Files**:
   - Delete `src/test-utils/cucumber/mocks/handlers/index.ts`
   - Delete `src/test-utils/cucumber/mocks/server.ts`
   - Remove MSW setup from `src/test-utils/cucumber/support/hooks.ts`

4. **Update Test Assertion** - `src/features/MockStatus/__tests__/MockStatus.cucumber.tsx`
   - Change from `.includes("Mocked")` to exact match `===  "Mocked"`
   - Remove screenshot capture step after verification

5. **Update Documentation**:
   - `.claude/docs/detox-cucumber.md` - Explain Metro mocking approach
   - `.claude/docs/architecture-testing.md` - Remove MSW references, add Metro mocking
   - `README.md` or relevant docs - Update E2E testing section

---

## Acceptance Criteria

- [x] Runtime mocking implemented in API functions with `isE2EMockEnabled` check
- [x] `src/config/e2e.ts` created with `isE2EMockEnabled` flag
- [x] `babel.config.js` updated with `transform-inline-environment-variables` plugin
- [x] `package.json` Detox scripts updated with `E2E_MOCK=true`
- [x] All MSW-related files removed from project
- [x] MSW setup removed from Cucumber hooks
- [x] Test assertion fixed to use exact match (not `.includes()`)
- [x] E2E test passing with Metro mocking (Mock Status shows "Mocked")
- [x] Documentation updated to explain Metro runtime mocking approach
- [x] All MSW references removed from documentation
- [x] TypeScript + Lint validation passes
- [x] Full test suite passes (unit + E2E)

---

## Definition of Ready

- [x] Task description clear
- [x] Acceptance criteria defined
- [x] Technical approach researched and validated (Detox official docs)
- [x] Blockers identified (TASK-103 needs rework)

---

## Definition of Done

- [x] All acceptance criteria met
- [x] E2E test passing with actual mocking verified
- [x] Full validation passing (typecheck + lint + test)
- [x] No MSW references remaining in codebase or docs
- [x] Code follows CLAUDE.md guidelines
- [x] TASK-103 updated to reflect Metro approach

---

## Notes

- **Root Cause**: MSW cannot intercept native networking in React Native apps
- **Solution Implemented**: Runtime mocking with Babel environment variable transformation
- **Key Insight**: Bundle-time environment variables transformed by Babel provide React Native mocking

**Last Updated**: 2025-01-16
**Completed**: 2025-01-16

## Implementation Summary

Instead of using `.mock.ts` file resolution (which proved complex with Metro config), the implementation uses:

1. **Babel Plugin**: `transform-inline-environment-variables` transforms `process.env.E2E_MOCK` at build time
2. **Runtime Check**: `isE2EMockEnabled = process.env.E2E_MOCK === 'true'` in `src/config/e2e.ts`
3. **API Functions**: Check `isE2EMockEnabled` and return fixture data with `mocked: true` flag
4. **Detox Scripts**: Set `E2E_MOCK=true` environment variable before running tests
5. **Metro Restart**: Required when switching between mocked/real modes

This approach is simpler, more maintainable, and follows React Native best practices for environment-specific behaviour.

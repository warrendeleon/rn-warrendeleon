# TASK-102: Fix App Restart E2E Step Timeout

**Task ID**: TASK-102
**Title**: Fix "I restart the app" E2E step timeout issue
**Epic**: N/A
**User Story**: N/A
**Status**: To Do
**Priority**: High
**Created**: 2025-01-16
**Assigned To**: Warren de Leon
**Reviewer**: Warren de Leon
**Category**: Bug Fix - E2E Tests

---

## Context

The "I restart the app" E2E step is timing out after 5 seconds, causing the "Language persists after app restart" scenario to fail.

**Current State**:

- Step `I restart the app` times out after 5000ms
- App restart may be taking longer than expected timeout
- Only 1 scenario affected but critical for testing data persistence

**Desired State**: App restart step completes successfully within reasonable timeout

**Failing Scenarios**:

- Language Switching: "Language persists after app restart" (1 scenario)

**Error**: `function timed out, ensure the promise resolves within 5000 milliseconds`

---

## Technical Details

### Root Cause Investigation

Need to investigate why app restart is timing out:

1. **Check step definition implementation**
   - Verify Detox `device.launchApp({ newInstance: true })` is awaited properly
   - Confirm timeout is set appropriately for device/simulator restart time

2. **Check app launch performance**
   - Measure actual app restart time on iOS simulator
   - May need to increase timeout if app legitimately takes >5 seconds to restart

3. **Check for blocking operations**
   - Verify no blocking operations during app launch
   - Check Redux persist rehydration time

### Files to Investigate

1. **Step Definition File** - Where "I restart the app" is defined
   - Check timeout configuration
   - Ensure proper async/await usage
   - Consider increasing timeout to 10-15 seconds for app restart

2. **Detox Configuration** (`.detoxrc.js`)
   - Check global timeout settings
   - Verify device/simulator configuration

### Potential Solutions

1. **Increase timeout** for app restart step specifically
2. **Add wait conditions** after restart before continuing
3. **Optimize app launch** if genuinely slow
4. **Add retry logic** for flaky restart operations

---

## Acceptance Criteria

- [ ] "I restart the app" step completes successfully
- [ ] "Language persists after app restart" scenario passes
- [ ] Timeout is appropriate for reliable test execution
- [ ] No flakiness in app restart behavior
- [ ] `yarn detox:ios:test -f "Language persists"` passes reliably

---

## Testing Strategy

**Efficient E2E Testing** (per CLAUDE.md):

1. **First run** (after fixing):
   - ❌ DON'T rebuild unless native code changed
   - ✅ Run ONLY failing test: `yarn detox:ios:test -f "Language persists"`

2. **Fix iterations**:
   - ✅ Run only this specific test to verify fix
   - Measure actual app restart time
   - Adjust timeout if needed

3. **Final validation**:
   - Run full Language Switching feature
   - Verify no regressions in other restart-related tests

---

## Story Points & Effort

**Effort Estimate**: 1 hour

---

## Dependencies

**Blockers**: None

---

**Last Updated**: 2025-01-16

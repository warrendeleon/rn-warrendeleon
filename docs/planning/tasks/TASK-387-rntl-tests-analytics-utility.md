# TASK-387: RNTL Tests for Analytics Utility

**Task ID**: TASK-387
**Title**: RNTL Tests for Analytics Utility
**Epic**: [EPIC-033: Product Analytics & Consent Management](../epics/EPIC-033-product-analytics-consent-management.md)
**User Story**: [US-071: PostHog Analytics Integration](../stories/US-071-posthog-analytics-integration.md)
**Status**: 📋 To Do
**Priority**: High
**Created**: 2025-12-09
**Assigned To**: Warren de Leon
**Category**: Testing

---

## Overview

Create unit tests for the analytics utility and PostHog configuration modules. Tests should verify correct behaviour in both development and production modes, consent gating, and sensitive data masking.

---

## Technical Details

### Test File Structure

**`src/utils/__tests__/analytics.rntl.tsx`**:

```typescript
import { trackEvent, trackScreen, identifyUser, resetAnalytics } from '../analytics';
import { getPostHog } from '@app/config/posthog';
import { maskSensitiveData } from '@app/utils/logging/maskSensitiveData';

jest.mock('@app/config/posthog');
jest.mock('@app/utils/logging/maskSensitiveData', () => ({
  maskSensitiveData: jest.fn(data => data),
}));

const mockGetPostHog = getPostHog as jest.MockedFunction<typeof getPostHog>;

describe('Analytics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Development Mode (__DEV__ = true)', () => {
    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    it('should log trackEvent to console, not PostHog', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      trackEvent('test_event', { key: 'value' });

      expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', 'test_event', { key: 'value' });
      expect(mockGetPostHog).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log trackScreen to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      trackScreen('HomeScreen');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log identifyUser to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      identifyUser('user123', { name: 'Test' });

      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Identify:', 'user123', { name: 'Test' });
      consoleSpy.mockRestore();
    });
  });

  describe('Production Mode (__DEV__ = false)', () => {
    const mockCapture = jest.fn();
    const mockIdentify = jest.fn();
    const mockReset = jest.fn();

    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = false;
    });

    afterAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    beforeEach(() => {
      mockGetPostHog.mockReturnValue({
        capture: mockCapture,
        identify: mockIdentify,
        reset: mockReset,
      } as unknown as ReturnType<typeof getPostHog>);
    });

    it('should send trackEvent to PostHog', () => {
      trackEvent('button_click', { button: 'submit' });

      expect(mockCapture).toHaveBeenCalledWith('button_click', { button: 'submit' });
    });

    it('should mask sensitive data before sending', () => {
      trackEvent('form_submit', { email: 'test@example.com' });

      expect(maskSensitiveData).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should send trackScreen as $screen event', () => {
      trackScreen('ProfileScreen', { from: 'home' });

      expect(mockCapture).toHaveBeenCalledWith('$screen', {
        $screen_name: 'ProfileScreen',
        from: 'home',
      });
    });

    it('should call PostHog identify', () => {
      identifyUser('user456', { plan: 'premium' });

      expect(mockIdentify).toHaveBeenCalledWith('user456', { plan: 'premium' });
    });

    it('should call PostHog reset on resetAnalytics', () => {
      resetAnalytics();

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Null Client Handling', () => {
    beforeAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = false;
    });

    afterAll(() => {
      (global as { __DEV__: boolean }).__DEV__ = true;
    });

    it('should not throw when PostHog is null', () => {
      mockGetPostHog.mockReturnValue(null);

      expect(() => trackEvent('test_event')).not.toThrow();
      expect(() => identifyUser('user123')).not.toThrow();
      expect(() => resetAnalytics()).not.toThrow();
    });
  });
});
```

**`src/config/__tests__/posthog.rntl.tsx`**:

```typescript
import { initPostHog, getPostHog, shutdownPostHog, isPostHogActive } from '../posthog';

// Mock PostHog SDK
jest.mock('posthog-react-native', () => ({
  initAsync: jest.fn().mockResolvedValue({
    shutdown: jest.fn(),
  }),
}));

jest.mock('react-native-config', () => ({
  POSTHOG_API_KEY: 'test_api_key',
  POSTHOG_HOST: 'https://eu.posthog.com',
}));

describe('PostHog Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initPostHog', () => {
    it('should not initialise in dev mode', async () => {
      (global as { __DEV__: boolean }).__DEV__ = true;

      await initPostHog(true);

      expect(getPostHog()).toBeNull();
    });

    it('should not initialise without consent', async () => {
      (global as { __DEV__: boolean }).__DEV__ = false;

      await initPostHog(false);

      expect(getPostHog()).toBeNull();
    });

    // Additional tests for production initialisation...
  });

  describe('isPostHogActive', () => {
    it('should return false when not initialised', () => {
      expect(isPostHogActive()).toBe(false);
    });
  });
});
```

---

## Files to Create

| File                                     | Purpose                          |
| ---------------------------------------- | -------------------------------- |
| `src/utils/__tests__/analytics.rntl.tsx` | Unit tests for analytics utility |
| `src/config/__tests__/posthog.rntl.tsx`  | Unit tests for PostHog config    |
| `src/__mocks__/posthog-react-native.ts`  | Jest mock for PostHog SDK        |

---

## Acceptance Criteria

- [ ] Unit tests for all analytics utility functions
- [ ] Unit tests for PostHog configuration module
- [ ] Tests verify dev mode logging (console only)
- [ ] Tests verify prod mode PostHog calls
- [ ] Tests verify sensitive data masking is called
- [ ] Tests verify null client handling (no throws)
- [ ] Tests verify consent gating works correctly
- [ ] 100% code coverage on `analytics.ts`
- [ ] 100% code coverage on `posthog.ts`
- [ ] `yarn test src/utils/__tests__/analytics.rntl.tsx` passes
- [ ] `yarn test src/config/__tests__/posthog.rntl.tsx` passes
- [ ] `yarn validate` passes with 0 errors

---

## Test Scenarios

**Scenario 1: Test Coverage**

```gherkin
Given all test files are complete
When I run yarn test:coverage
Then analytics.ts should have 100% coverage
And posthog.ts should have 100% coverage
```

**Scenario 2: Mock Isolation**

```gherkin
Given PostHog SDK is mocked
When tests run
Then no actual network calls should be made
And PostHog cloud should not be contacted
```

---

## Dependencies

**Blocked By**: TASK-385 (Analytics utility layer)

**Blocks**: None

---

## Notes

**Mock Setup**:
The PostHog SDK mock should be placed in `src/__mocks__/posthog-react-native.ts` for automatic jest resolution.

**Testing Strategy**:

- Use `__DEV__` manipulation to test both dev and prod paths
- Mock `getPostHog` to return controlled client instances
- Verify `maskSensitiveData` is always called for properties

---

**Last Updated**: 2025-12-09

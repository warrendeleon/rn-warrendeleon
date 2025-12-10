/**
 * PIN Lockout Service Tests
 *
 * Tests for Apple-style incremental lockout mechanism.
 */

import {
  mockAsyncStorage,
  mockGetItem,
  mockRemoveItem,
  mockSetItem,
  setupDefaultAsyncStorageMocks,
} from '@app/test-utils/mocks/asyncStorage';

import {
  checkPINLockout,
  clearAllLockoutData,
  getFailedAttemptCount,
  recordFailedPINAttempt,
  resetPINLockout,
} from '../pinLockoutService';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('pinLockoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultAsyncStorageMocks();
  });

  describe('checkPINLockout', () => {
    it('should return not locked when no previous attempts', async () => {
      const result = await checkPINLockout();

      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(3);
      expect(result.lockoutEndTime).toBeNull();
    });

    it('should return not locked when under 4 attempts', async () => {
      const mockState = {
        failedAttempts: 2,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await checkPINLockout();

      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(1);
    });

    it('should return locked when lockout is active', async () => {
      const futureTime = Date.now() + 60000;
      const mockState = {
        failedAttempts: 4,
        lockedUntil: futureTime,
        lastAttemptTime: Date.now() - 1000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await checkPINLockout();

      expect(result.isLocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockoutEndTime).toBe(futureTime);
      expect(result.message).toContain('Try again in');
    });

    it('should return not locked when lockout has expired', async () => {
      const pastTime = Date.now() - 60000;
      const mockState = {
        failedAttempts: 4,
        lockedUntil: pastTime,
        lastAttemptTime: Date.now() - 120000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await checkPINLockout();

      expect(result.isLocked).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const result = await checkPINLockout();

      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(3);
    });
  });

  describe('recordFailedPINAttempt', () => {
    it('should increment failed attempts', async () => {
      await recordFailedPINAttempt();

      expect(mockSetItem).toHaveBeenCalled();
      const savedData = JSON.parse(mockSetItem.mock.calls[0]![1] as string);
      expect(savedData.failedAttempts).toBe(1);
    });

    it('should not trigger lockout for first 3 attempts', async () => {
      const mockState = {
        failedAttempts: 2,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should trigger 1-minute lockout on 4th attempt', async () => {
      const mockState = {
        failedAttempts: 3,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(60000);
      expect(result.message).toContain('1 minute');
    });

    it('should trigger 5-minute lockout on 6th attempt', async () => {
      const mockState = {
        failedAttempts: 5,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(5 * 60 * 1000);
      expect(result.message).toContain('5 minutes');
    });

    it('should trigger 15-minute lockout on 7th attempt', async () => {
      const mockState = {
        failedAttempts: 6,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(15 * 60 * 1000);
      expect(result.message).toContain('15 minutes');
    });

    it('should trigger 1-hour lockout on 8th attempt', async () => {
      const mockState = {
        failedAttempts: 7,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(60 * 60 * 1000);
      expect(result.message).toContain('1 hour');
    });

    it('should trigger 24-hour lockout on 9+ attempts', async () => {
      const mockState = {
        failedAttempts: 8,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(24 * 60 * 60 * 1000);
      expect(result.message).toContain('24 hours');
    });

    it('should reset attempts when lockout has expired', async () => {
      const pastTime = Date.now() - 60000;
      const mockState = {
        failedAttempts: 4,
        lockedUntil: pastTime,
        lastAttemptTime: Date.now() - 120000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const result = await recordFailedPINAttempt();

      const savedData = JSON.parse(mockSetItem.mock.calls[0]![1] as string);
      expect(savedData.failedAttempts).toBe(1);
      expect(result.isLocked).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      const result = await recordFailedPINAttempt();

      expect(result.isLocked).toBe(false);
    });
  });

  describe('resetPINLockout', () => {
    it('should remove lockout data', async () => {
      await resetPINLockout();

      expect(mockRemoveItem).toHaveBeenCalledWith('@pin_lockout');
    });

    it('should not throw on storage error', async () => {
      mockRemoveItem.mockRejectedValue(new Error('Storage error'));

      await expect(resetPINLockout()).resolves.toBeUndefined();
    });
  });

  describe('getFailedAttemptCount', () => {
    it('should return 0 when no previous attempts', async () => {
      const count = await getFailedAttemptCount();

      expect(count).toBe(0);
    });

    it('should return correct count', async () => {
      const mockState = {
        failedAttempts: 3,
        lockedUntil: null,
        lastAttemptTime: Date.now() - 10000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const count = await getFailedAttemptCount();

      expect(count).toBe(3);
    });

    it('should return 0 when lockout has expired', async () => {
      const pastTime = Date.now() - 60000;
      const mockState = {
        failedAttempts: 4,
        lockedUntil: pastTime,
        lastAttemptTime: Date.now() - 120000,
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockState));

      const count = await getFailedAttemptCount();

      expect(count).toBe(0);
    });
  });

  describe('clearAllLockoutData', () => {
    it('should remove all lockout data', async () => {
      await clearAllLockoutData();

      expect(mockRemoveItem).toHaveBeenCalledWith('@pin_lockout');
    });

    it('should not throw on storage error', async () => {
      mockRemoveItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearAllLockoutData()).resolves.toBeUndefined();
    });
  });

  describe('Integration: Lockout Schedule', () => {
    it('should follow Apple-style incremental lockout schedule', async () => {
      let callCount = 0;
      let currentState = {
        failedAttempts: 0,
        lockedUntil: null as number | null,
        lastAttemptTime: 0,
      };

      mockGetItem.mockImplementation(async () => {
        if (currentState.failedAttempts === 0) {
          return null;
        }
        return JSON.stringify(currentState);
      });

      mockSetItem.mockImplementation(async (_key, value) => {
        currentState = JSON.parse(value);
      });

      // Attempts 1-3: No lockout
      for (let i = 0; i < 3; i++) {
        const result = await recordFailedPINAttempt();
        callCount++;
        expect(result.isLocked).toBe(false);
      }

      // Attempts 4-5: 1 minute lockout
      currentState.lockedUntil = null;
      let result = await recordFailedPINAttempt();
      callCount++;
      expect(result.isLocked).toBe(true);
      expect(result.lockoutDurationMs).toBe(60000);

      // Reset lockout for next test
      currentState.lockedUntil = null;
      result = await recordFailedPINAttempt();
      callCount++;
      expect(result.lockoutDurationMs).toBe(60000);

      // Attempt 6: 5 minutes
      currentState.lockedUntil = null;
      result = await recordFailedPINAttempt();
      callCount++;
      expect(result.lockoutDurationMs).toBe(5 * 60 * 1000);

      // Attempt 7: 15 minutes
      currentState.lockedUntil = null;
      result = await recordFailedPINAttempt();
      callCount++;
      expect(result.lockoutDurationMs).toBe(15 * 60 * 1000);

      // Attempt 8: 1 hour
      currentState.lockedUntil = null;
      result = await recordFailedPINAttempt();
      callCount++;
      expect(result.lockoutDurationMs).toBe(60 * 60 * 1000);

      // Attempt 9+: 24 hours
      currentState.lockedUntil = null;
      result = await recordFailedPINAttempt();
      callCount++;
      expect(result.lockoutDurationMs).toBe(24 * 60 * 60 * 1000);

      expect(callCount).toBe(9);
    });
  });
});

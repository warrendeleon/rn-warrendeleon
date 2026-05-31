import {
  mockAsyncStorage,
  mockGetAllKeys,
  mockGetItem,
  mockRemoveItem,
  mockSetItem,
  setupDefaultAsyncStorageMocks,
} from '@app/test-utils/mocks/asyncStorage';

import {
  checkPasswordResetRateLimit,
  clearAllRateLimits,
  clearPasswordResetRateLimit,
  getRateLimitStatus,
  recordPasswordResetRequest,
} from '../rateLimiter';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('rateLimiter', () => {
  const testEmail = 'user@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultAsyncStorageMocks();
  });

  describe('checkPasswordResetRateLimit', () => {
    it('should allow request when no previous requests', async () => {
      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(3);
      expect(result.error).toBeUndefined();
    });

    it('should allow request when under rate limit', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 10000, now - 5000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(1);
    });

    it('should block request when rate limit exceeded', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000, now - 20000, now - 10000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(false);
      expect(result.requestsRemaining).toBe(0);
      expect(result.resetTime).toBeInstanceOf(Date);
      expect(result.error).toContain('exceeded the maximum number of password reset requests');
    });

    it('should clean up expired timestamps', async () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      const mockLog = {
        timestamps: [twoHoursAgo, oneHourAgo - 1000, now - 10000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(2);
    });

    it('should handle AsyncStorage errors gracefully (fail open)', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(3);
    });

    it('should normalise email to lowercase', async () => {
      await checkPasswordResetRateLimit('USER@EXAMPLE.COM');

      expect(mockGetItem).toHaveBeenCalledWith(expect.stringContaining('user@example.com'));
    });

    it('should calculate correct reset time', async () => {
      const now = Date.now();
      const oldestTimestamp = now - 30 * 60 * 1000;

      const mockLog = {
        timestamps: [oldestTimestamp, now - 20000, now - 10000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(false);
      expect(result.resetTime).toBeInstanceOf(Date);

      const expectedResetTime = new Date(oldestTimestamp + 60 * 60 * 1000);
      expect(result.resetTime?.getTime()).toBe(expectedResetTime.getTime());
    });
  });

  describe('recordPasswordResetRequest', () => {
    it('should record new request timestamp', async () => {
      await recordPasswordResetRequest(testEmail);

      expect(mockSetItem).toHaveBeenCalledWith(
        expect.stringContaining(testEmail),
        expect.stringContaining('"timestamps"')
      );
    });

    it('should append to existing timestamps', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      await recordPasswordResetRequest(testEmail);

      expect(mockSetItem.mock.calls[0]).toBeDefined();
      const savedData = JSON.parse(mockSetItem.mock.calls[0]![1] as string);
      expect(savedData.timestamps).toHaveLength(2);
      expect(savedData.timestamps[0]).toBe(now - 30000);
      expect(savedData.timestamps[1]).toBeGreaterThan(now - 1000);
    });

    it('should clean up expired timestamps when recording', async () => {
      const now = Date.now();
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      const mockLog = {
        timestamps: [twoHoursAgo, now - 30000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      await recordPasswordResetRequest(testEmail);

      expect(mockSetItem.mock.calls[0]).toBeDefined();
      const savedData = JSON.parse(mockSetItem.mock.calls[0]![1] as string);
      expect(savedData.timestamps).toHaveLength(2);
    });

    it('should not throw error on storage failure', async () => {
      mockSetItem.mockRejectedValue(new Error('Storage error'));

      await expect(recordPasswordResetRequest(testEmail)).resolves.toBeUndefined();
    });
  });

  describe('clearPasswordResetRateLimit', () => {
    it('should remove rate limit data for email', async () => {
      await clearPasswordResetRateLimit(testEmail);

      expect(mockRemoveItem).toHaveBeenCalledWith(expect.stringContaining(testEmail));
    });

    it('should not throw error on storage failure', async () => {
      mockRemoveItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearPasswordResetRateLimit(testEmail)).resolves.toBeUndefined();
    });
  });

  describe('clearAllRateLimits', () => {
    it('should remove all rate limit data', async () => {
      mockGetAllKeys.mockResolvedValue([
        '@rate_limit:password_reset:user1@example.com',
        '@rate_limit:password_reset:user2@example.com',
        '@some_other_key',
      ]);

      await clearAllRateLimits();

      // async-storage 3 dropped multiRemove; clearAllRateLimits now removes
      // each rate-limit key individually and leaves unrelated keys untouched.
      expect(mockRemoveItem).toHaveBeenCalledWith('@rate_limit:password_reset:user1@example.com');
      expect(mockRemoveItem).toHaveBeenCalledWith('@rate_limit:password_reset:user2@example.com');
      expect(mockRemoveItem).not.toHaveBeenCalledWith('@some_other_key');
    });

    it('should not throw error on storage failure', async () => {
      mockGetAllKeys.mockRejectedValue(new Error('Storage error'));

      await expect(clearAllRateLimits()).resolves.toBeUndefined();
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct status for active requests', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000, now - 20000],
      };

      mockGetItem.mockResolvedValue(JSON.stringify(mockLog));

      const status = await getRateLimitStatus(testEmail);

      expect(status.activeRequests).toBe(2);
      expect(status.requestsRemaining).toBe(1);
      expect(status.timestamps).toHaveLength(2);
      expect(status.resetTime).toBeInstanceOf(Date);
    });

    it('should return correct status when no requests', async () => {
      const status = await getRateLimitStatus(testEmail);

      expect(status.activeRequests).toBe(0);
      expect(status.requestsRemaining).toBe(3);
      expect(status.timestamps).toHaveLength(0);
      expect(status.resetTime).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should enforce rate limit across multiple requests', async () => {
      let callCount = 0;
      const timestamps: number[] = [];

      // Mock to simulate state persistence
      mockGetItem.mockImplementation(async () => {
        if (timestamps.length === 0) {
          return null;
        }
        return JSON.stringify({ timestamps });
      });

      mockSetItem.mockImplementation(async (_key, value) => {
        const parsed = JSON.parse(value);
        timestamps.length = 0;
        timestamps.push(...parsed.timestamps);
      });

      // First request - allowed
      let result = await checkPasswordResetRateLimit(testEmail);
      expect(result.allowed).toBe(true);
      await recordPasswordResetRequest(testEmail);
      callCount++;

      // Second request - allowed
      result = await checkPasswordResetRateLimit(testEmail);
      expect(result.allowed).toBe(true);
      await recordPasswordResetRequest(testEmail);
      callCount++;

      // Third request - allowed
      result = await checkPasswordResetRateLimit(testEmail);
      expect(result.allowed).toBe(true);
      await recordPasswordResetRequest(testEmail);
      callCount++;

      // Fourth request - blocked
      result = await checkPasswordResetRateLimit(testEmail);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('exceeded the maximum number of password reset requests');

      expect(callCount).toBe(3);
    });
  });
});

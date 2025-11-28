import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  checkPasswordResetRateLimit,
  clearAllRateLimits,
  clearPasswordResetRateLimit,
  getRateLimitStatus,
  recordPasswordResetRequest,
} from '../rateLimiter';

jest.mock('@react-native-async-storage/async-storage');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('rateLimiter', () => {
  const testEmail = 'user@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    mockAsyncStorage.getAllKeys.mockResolvedValue([]);
    mockAsyncStorage.multiRemove.mockResolvedValue(undefined);
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

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(1);
    });

    it('should block request when rate limit exceeded', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000, now - 20000, now - 10000],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

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

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(2);
    });

    it('should handle AsyncStorage errors gracefully (fail open)', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await checkPasswordResetRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.requestsRemaining).toBe(3);
    });

    it('should normalise email to lowercase', async () => {
      await checkPasswordResetRateLimit('USER@EXAMPLE.COM');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        expect.stringContaining('user@example.com')
      );
    });

    it('should calculate correct reset time', async () => {
      const now = Date.now();
      const oldestTimestamp = now - 30 * 60 * 1000;

      const mockLog = {
        timestamps: [oldestTimestamp, now - 20000, now - 10000],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

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

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining(testEmail),
        expect.stringContaining('"timestamps"')
      );
    });

    it('should append to existing timestamps', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

      await recordPasswordResetRequest(testEmail);

      expect(mockAsyncStorage.setItem.mock.calls[0]).toBeDefined();
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0]![1] as string);
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

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

      await recordPasswordResetRequest(testEmail);

      expect(mockAsyncStorage.setItem.mock.calls[0]).toBeDefined();
      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0]![1] as string);
      expect(savedData.timestamps).toHaveLength(2);
    });

    it('should not throw error on storage failure', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(recordPasswordResetRequest(testEmail)).resolves.toBeUndefined();
    });
  });

  describe('clearPasswordResetRateLimit', () => {
    it('should remove rate limit data for email', async () => {
      await clearPasswordResetRateLimit(testEmail);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(expect.stringContaining(testEmail));
    });

    it('should not throw error on storage failure', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearPasswordResetRateLimit(testEmail)).resolves.toBeUndefined();
    });
  });

  describe('clearAllRateLimits', () => {
    it('should remove all rate limit data', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        '@rate_limit:password_reset:user1@example.com',
        '@rate_limit:password_reset:user2@example.com',
        '@some_other_key',
      ]);

      await clearAllRateLimits();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@rate_limit:password_reset:user1@example.com',
        '@rate_limit:password_reset:user2@example.com',
      ]);
    });

    it('should not throw error on storage failure', async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

      await expect(clearAllRateLimits()).resolves.toBeUndefined();
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return correct status for active requests', async () => {
      const now = Date.now();
      const mockLog = {
        timestamps: [now - 30000, now - 20000],
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockLog));

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
      mockAsyncStorage.getItem.mockImplementation(async () => {
        if (timestamps.length === 0) {
          return null;
        }
        return JSON.stringify({ timestamps });
      });

      mockAsyncStorage.setItem.mockImplementation(async (_key, value) => {
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

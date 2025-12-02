/**
 * Tests for email resend rate limiter
 * @jest-environment node
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  checkEmailResendRateLimit,
  clearEmailResendRateLimit,
  getEmailResendRateLimitStatus,
  recordEmailResendRequest,
} from '../emailResendRateLimiter';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('emailResendRateLimiter', () => {
  const testEmail = 'test@example.com';
  const expectedKey = '@rate_limit:email_resend:test@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkEmailResendRateLimit', () => {
    it('should allow request when no previous request exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.secondsRemaining).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should deny request when within cooldown period', async () => {
      const now = Date.now();
      const thirtySecondsAgo = now - 30 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: thirtySecondsAgo })
      );

      jest.setSystemTime(now);

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(false);
      expect(result.secondsRemaining).toBe(30);
      expect(result.error).toContain('Please wait 30 seconds');
    });

    it('should allow request when cooldown has passed', async () => {
      const now = Date.now();
      const twoMinutesAgo = now - 120 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: twoMinutesAgo })
      );

      jest.setSystemTime(now);

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.secondsRemaining).toBe(0);
    });

    it('should normalise email to lowercase', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await checkEmailResendRateLimit('TEST@EXAMPLE.COM');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should trim email whitespace', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await checkEmailResendRateLimit('  test@example.com  ');

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should handle AsyncStorage errors gracefully (fail open)', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.secondsRemaining).toBe(0);
    });

    it('should handle corrupted storage data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid-json');

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(true);
      expect(result.secondsRemaining).toBe(0);
    });

    it('should use singular "second" when 1 second remaining', async () => {
      const now = Date.now();
      const almostOneMinuteAgo = now - 59 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: almostOneMinuteAgo })
      );

      jest.setSystemTime(now);

      const result = await checkEmailResendRateLimit(testEmail);

      expect(result.allowed).toBe(false);
      expect(result.secondsRemaining).toBe(1);
      expect(result.error).toContain('1 second');
      expect(result.error).not.toContain('1 seconds');
    });
  });

  describe('recordEmailResendRequest', () => {
    it('should store timestamp in AsyncStorage', async () => {
      const now = Date.now();
      jest.setSystemTime(now);

      await recordEmailResendRequest(testEmail);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expectedKey,
        JSON.stringify({ lastRequestTimestamp: now })
      );
    });

    it('should normalise email to lowercase', async () => {
      await recordEmailResendRequest('TEST@EXAMPLE.COM');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(expectedKey, expect.any(String));
    });

    it('should not throw on AsyncStorage errors', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(recordEmailResendRequest(testEmail)).resolves.not.toThrow();
    });
  });

  describe('clearEmailResendRateLimit', () => {
    it('should remove rate limit from AsyncStorage', async () => {
      await clearEmailResendRateLimit(testEmail);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should normalise email to lowercase', async () => {
      await clearEmailResendRateLimit('TEST@EXAMPLE.COM');

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should not throw on AsyncStorage errors', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(clearEmailResendRateLimit(testEmail)).resolves.not.toThrow();
    });
  });

  describe('getEmailResendRateLimitStatus', () => {
    it('should return status when no previous request exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getEmailResendRateLimitStatus(testEmail);

      expect(result.lastRequestTime).toBeNull();
      expect(result.secondsRemaining).toBe(0);
      expect(result.canResend).toBe(true);
    });

    it('should return status when within cooldown', async () => {
      const now = Date.now();
      const thirtySecondsAgo = now - 30 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: thirtySecondsAgo })
      );

      jest.setSystemTime(now);

      const result = await getEmailResendRateLimitStatus(testEmail);

      expect(result.lastRequestTime).toEqual(new Date(thirtySecondsAgo));
      expect(result.secondsRemaining).toBe(30);
      expect(result.canResend).toBe(false);
    });

    it('should return status when cooldown has passed', async () => {
      const now = Date.now();
      const twoMinutesAgo = now - 120 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: twoMinutesAgo })
      );

      jest.setSystemTime(now);

      const result = await getEmailResendRateLimitStatus(testEmail);

      expect(result.lastRequestTime).toEqual(new Date(twoMinutesAgo));
      expect(result.secondsRemaining).toBe(0);
      expect(result.canResend).toBe(true);
    });

    it('should handle exact cooldown boundary', async () => {
      const now = Date.now();
      const exactlyOneMinuteAgo = now - 60 * 1000;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: exactlyOneMinuteAgo })
      );

      jest.setSystemTime(now);

      const result = await getEmailResendRateLimitStatus(testEmail);

      expect(result.secondsRemaining).toBe(0);
      expect(result.canResend).toBe(true);
    });
  });

  describe('cooldown period', () => {
    it('should use 60 second cooldown', async () => {
      const now = Date.now();
      const fiftyNineSecondsAgo = now - 59 * 1000;
      const sixtyOneSecondsAgo = now - 61 * 1000;

      jest.setSystemTime(now);

      // Just under cooldown - should be denied
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: fiftyNineSecondsAgo })
      );
      const deniedResult = await checkEmailResendRateLimit(testEmail);
      expect(deniedResult.allowed).toBe(false);

      // Just over cooldown - should be allowed
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({ lastRequestTimestamp: sixtyOneSecondsAgo })
      );
      const allowedResult = await checkEmailResendRateLimit(testEmail);
      expect(allowedResult.allowed).toBe(true);
    });
  });
});

/**
 * Tests for Rate Limit Schema validation
 *
 * Security tests for rate limiting error and status responses.
 */

import { rateLimitErrorSchema, rateLimitStatusSchema } from '../rateLimitSchema';

describe('rateLimitErrorSchema', () => {
  const validErrorData = {
    message: 'Too many requests',
    retryAfter: 60,
    attemptsRemaining: 0,
    endpoint: '/auth/login',
  };

  describe('valid data', () => {
    it('should validate correct rate limit error data', async () => {
      await expect(rateLimitErrorSchema.validate(validErrorData)).resolves.toMatchObject({
        message: 'Too many requests',
        retryAfter: 60,
        attemptsRemaining: 0,
        endpoint: '/auth/login',
      });
    });

    it('should validate minimal required fields', async () => {
      const minimalData = {
        message: 'Rate limited',
        retryAfter: 30,
      };

      await expect(rateLimitErrorSchema.validate(minimalData)).resolves.toMatchObject({
        message: 'Rate limited',
        retryAfter: 30,
      });
    });

    it('should allow endpoint to be optional', async () => {
      const dataWithoutEndpoint = {
        message: 'Too many requests',
        retryAfter: 120,
      };

      await expect(rateLimitErrorSchema.validate(dataWithoutEndpoint)).resolves.toBeDefined();
    });

    it('should allow attemptsRemaining to be zero', async () => {
      const data = { ...validErrorData, attemptsRemaining: 0 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        attemptsRemaining: 0,
      });
    });
  });

  describe('message validation', () => {
    it('should reject missing message', async () => {
      const data = { retryAfter: 60 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Rate limit error message is required'
      );
    });

    it('should reject empty message', async () => {
      const data = { message: '', retryAfter: 60 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow();
    });
  });

  describe('retryAfter validation', () => {
    it('should reject missing retryAfter', async () => {
      const data = { message: 'Rate limited' };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Retry after time is required'
      );
    });

    it('should reject negative retryAfter', async () => {
      const data = { message: 'Rate limited', retryAfter: -10 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Retry after must be positive'
      );
    });

    it('should reject zero retryAfter', async () => {
      const data = { message: 'Rate limited', retryAfter: 0 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Retry after must be positive'
      );
    });

    it('should reject decimal retryAfter', async () => {
      const data = { message: 'Rate limited', retryAfter: 30.5 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Retry after must be an integer'
      );
    });

    it('should accept large retryAfter values', async () => {
      const data = { message: 'Rate limited', retryAfter: 3600 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        retryAfter: 3600,
      });
    });
  });

  describe('attemptsRemaining validation', () => {
    it('should reject negative attemptsRemaining', async () => {
      const data = { ...validErrorData, attemptsRemaining: -1 };

      await expect(rateLimitErrorSchema.validate(data)).rejects.toThrow(
        'Attempts remaining cannot be negative'
      );
    });

    it('should accept positive attemptsRemaining', async () => {
      const data = { ...validErrorData, attemptsRemaining: 5 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        attemptsRemaining: 5,
      });
    });
  });

  describe('security edge cases', () => {
    it('should handle very long message strings', async () => {
      const longMessage = 'A'.repeat(1000);
      const data = { message: longMessage, retryAfter: 60 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        message: longMessage,
      });
    });

    it('should handle special characters in message', async () => {
      const specialMessage = 'Rate limit: <script>alert(1)</script> exceeded';
      const data = { message: specialMessage, retryAfter: 60 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        message: specialMessage,
      });
    });

    it('should handle unicode in message', async () => {
      const unicodeMessage = 'Dépassement de limite 超過限制 🚫';
      const data = { message: unicodeMessage, retryAfter: 60 };

      await expect(rateLimitErrorSchema.validate(data)).resolves.toMatchObject({
        message: unicodeMessage,
      });
    });
  });
});

describe('rateLimitStatusSchema', () => {
  // Get a future date for valid resetAt
  const getFutureDate = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);
    return date;
  };

  const getValidStatusData = () => ({
    isLimited: false,
    attemptsRemaining: 5,
    resetAt: getFutureDate(),
    windowSeconds: 300,
  });

  describe('valid data', () => {
    it('should validate correct rate limit status data', async () => {
      const data = getValidStatusData();

      const result = await rateLimitStatusSchema.validate(data);
      expect(result.isLimited).toBe(false);
      expect(result.attemptsRemaining).toBe(5);
      expect(result.windowSeconds).toBe(300);
    });

    it('should validate limited status', async () => {
      const data = {
        ...getValidStatusData(),
        isLimited: true,
        attemptsRemaining: 0,
      };

      const result = await rateLimitStatusSchema.validate(data);
      expect(result.isLimited).toBe(true);
      expect(result.attemptsRemaining).toBe(0);
    });
  });

  describe('isLimited validation', () => {
    it('should reject missing isLimited', async () => {
      const data = {
        attemptsRemaining: 5,
        resetAt: getFutureDate(),
        windowSeconds: 300,
      };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow();
    });

    it('should accept true value', async () => {
      const data = { ...getValidStatusData(), isLimited: true };

      await expect(rateLimitStatusSchema.validate(data)).resolves.toMatchObject({
        isLimited: true,
      });
    });

    it('should accept false value', async () => {
      const data = { ...getValidStatusData(), isLimited: false };

      await expect(rateLimitStatusSchema.validate(data)).resolves.toMatchObject({
        isLimited: false,
      });
    });
  });

  describe('attemptsRemaining validation', () => {
    it('should reject missing attemptsRemaining', async () => {
      const data = {
        isLimited: false,
        resetAt: getFutureDate(),
        windowSeconds: 300,
      };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Attempts remaining is required'
      );
    });

    it('should reject negative attemptsRemaining', async () => {
      const data = { ...getValidStatusData(), attemptsRemaining: -1 };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Attempts remaining cannot be negative'
      );
    });

    it('should accept zero attemptsRemaining', async () => {
      const data = { ...getValidStatusData(), attemptsRemaining: 0 };

      await expect(rateLimitStatusSchema.validate(data)).resolves.toMatchObject({
        attemptsRemaining: 0,
      });
    });
  });

  describe('resetAt validation', () => {
    it('should reject missing resetAt', async () => {
      const data = {
        isLimited: false,
        attemptsRemaining: 5,
        windowSeconds: 300,
      };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow('Reset time is required');
    });

    it('should reject past resetAt date', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 5);

      const data = { ...getValidStatusData(), resetAt: pastDate };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Reset time must be in the future'
      );
    });

    it('should accept valid future resetAt', async () => {
      const data = getValidStatusData();

      await expect(rateLimitStatusSchema.validate(data)).resolves.toBeDefined();
    });
  });

  describe('windowSeconds validation', () => {
    it('should reject missing windowSeconds', async () => {
      const data = {
        isLimited: false,
        attemptsRemaining: 5,
        resetAt: getFutureDate(),
      };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Window duration is required'
      );
    });

    it('should reject negative windowSeconds', async () => {
      const data = { ...getValidStatusData(), windowSeconds: -60 };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Window duration must be positive'
      );
    });

    it('should reject zero windowSeconds', async () => {
      const data = { ...getValidStatusData(), windowSeconds: 0 };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow(
        'Window duration must be positive'
      );
    });

    it('should reject decimal windowSeconds', async () => {
      const data = { ...getValidStatusData(), windowSeconds: 60.5 };

      await expect(rateLimitStatusSchema.validate(data)).rejects.toThrow();
    });

    it('should accept large windowSeconds values', async () => {
      const data = { ...getValidStatusData(), windowSeconds: 86400 };

      await expect(rateLimitStatusSchema.validate(data)).resolves.toMatchObject({
        windowSeconds: 86400,
      });
    });
  });

  describe('security integration', () => {
    it('should validate complete rate limit scenario', async () => {
      // Simulate a user hitting rate limit
      const limitedStatus = {
        isLimited: true,
        attemptsRemaining: 0,
        resetAt: getFutureDate(),
        windowSeconds: 300,
      };

      const result = await rateLimitStatusSchema.validate(limitedStatus);
      expect(result.isLimited).toBe(true);
      expect(result.attemptsRemaining).toBe(0);
    });

    it('should validate status with remaining attempts', async () => {
      // Simulate a user with remaining attempts
      const status = {
        isLimited: false,
        attemptsRemaining: 3,
        resetAt: getFutureDate(),
        windowSeconds: 300,
      };

      const result = await rateLimitStatusSchema.validate(status);
      expect(result.isLimited).toBe(false);
      expect(result.attemptsRemaining).toBe(3);
    });
  });
});

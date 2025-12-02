import { logDebug, logError, logWarning } from '../logger';

describe('logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('logError', () => {
    it('calls console.error with message in dev mode', () => {
      const message = 'Test error message';
      logError(message);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DEV] Test error message',
        undefined,
        undefined
      );
    });

    it('calls console.error with message and error object in dev mode', () => {
      const message = 'Test error message';
      const error = new Error('Something went wrong');
      logError(message, error);

      // Error object is masked (returns same structure for Error objects)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DEV] Test error message',
        expect.any(Object),
        undefined
      );
    });

    it('calls console.error with message, error, and context in dev mode', () => {
      const message = 'Test error message';
      const error = new Error('Something went wrong');
      const context = { userId: '123', action: 'fetchData' };
      logError(message, error, context);

      // Context is masked (non-sensitive fields remain unchanged)
      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEV] Test error message', expect.any(Object), {
        userId: '123',
        action: 'fetchData',
      });
    });

    it('includes [DEV] prefix in error message', () => {
      logError('Error occurred');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEV]'),
        undefined,
        undefined
      );
    });
  });

  describe('logWarning', () => {
    it('calls console.warn with message in dev mode', () => {
      const message = 'Test warning message';
      logWarning(message);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[DEV] Test warning message', undefined);
    });

    it('calls console.warn with message and context in dev mode', () => {
      const message = 'Test warning message';
      const context = { component: 'UserProfile', value: null };
      logWarning(message, context);

      // Non-sensitive context remains unchanged after masking
      expect(consoleWarnSpy).toHaveBeenCalledWith('[DEV] Test warning message', {
        component: 'UserProfile',
        value: null,
      });
    });

    it('includes [DEV] prefix in warning message', () => {
      logWarning('Warning occurred');

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[DEV]'), undefined);
    });
  });

  describe('logDebug', () => {
    it('calls console.log with message in dev mode', () => {
      const message = 'Test debug message';
      logDebug(message);

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEV] Test debug message', undefined);
    });

    it('calls console.log with message and data in dev mode', () => {
      const message = 'Test debug message';
      const data = { items: [1, 2, 3], total: 3 };
      logDebug(message, data);

      // Non-sensitive data remains unchanged after masking
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEV] Test debug message', {
        items: [1, 2, 3],
        total: 3,
      });
    });

    it('includes [DEV] prefix in debug message', () => {
      logDebug('Debug info');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[DEV]'), undefined);
    });
  });

  describe('correct console method usage', () => {
    it('uses console.error for logError', () => {
      logError('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('uses console.warn for logWarning', () => {
      logWarning('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('uses console.log for logDebug', () => {
      logDebug('Debug message');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('sensitive data masking integration', () => {
    it('masks email in context', () => {
      logError('Auth error', undefined, { email: 'user@example.com', action: 'login' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEV] Auth error', undefined, {
        email: '[MASKED_EMAIL]',
        action: 'login',
      });
    });

    it('masks password in context', () => {
      logWarning('Validation warning', { password: 'secret123', field: 'password' });

      expect(consoleWarnSpy).toHaveBeenCalledWith('[DEV] Validation warning', {
        password: '[MASKED]',
        field: 'password',
      });
    });

    it('masks phone in context', () => {
      logDebug('User data', { phone: '+447123456789', name: 'John' });

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEV] User data', {
        phone: '[MASKED_PHONE]',
        name: 'John',
      });
    });

    it('masks token in context', () => {
      logError('Token refresh failed', undefined, { token: 'abc123xyz', userId: '1' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEV] Token refresh failed', undefined, {
        token: '[MASKED]',
        userId: '1',
      });
    });

    it('masks nested sensitive data', () => {
      const context = {
        user: {
          email: 'test@test.com',
          profile: {
            address: '123 Main St',
          },
        },
        action: 'update',
      };
      logWarning('Profile update', context);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[DEV] Profile update', {
        user: {
          email: '[MASKED_EMAIL]',
          profile: {
            address: '[MASKED_ADDRESS]',
          },
        },
        action: 'update',
      });
    });

    it('masks JWT tokens in data', () => {
      const data = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.test';
      logDebug('Auth header', data);

      // JWT pattern catches the token, resulting in masked output
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[DEV] Auth header',
        expect.stringContaining('[MASKED_TOKEN]')
      );
    });
  });
});

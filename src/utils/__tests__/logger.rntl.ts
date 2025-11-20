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

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEV] Test error message', error, undefined);
    });

    it('calls console.error with message, error, and context in dev mode', () => {
      const message = 'Test error message';
      const error = new Error('Something went wrong');
      const context = { userId: '123', action: 'fetchData' };
      logError(message, error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[DEV] Test error message', error, context);
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

      expect(consoleWarnSpy).toHaveBeenCalledWith('[DEV] Test warning message', context);
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

      expect(consoleLogSpy).toHaveBeenCalledWith('[DEV] Test debug message', data);
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
});

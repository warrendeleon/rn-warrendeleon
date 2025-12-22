import * as Keychain from 'react-native-keychain';

import { SecureStore, SecureStoreKey } from '../SecureStore';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BIOMETRY_ANY_OR_DEVICE_PASSCODE',
  },
}));

describe('SecureStore', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('set', () => {
    it('should store a key-value pair in Keychain with unique service per key', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'test_token');

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStoreKey.ACCESS_TOKEN,
        'test_token',
        expect.objectContaining({
          service: `com.warrendeleon.portfolio.${SecureStoreKey.ACCESS_TOKEN}`,
          accessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
          accessControl: 'BIOMETRY_ANY_OR_DEVICE_PASSCODE',
        })
      );
    });

    it('should return false on error', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      const result = await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'test_token');

      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a value from Keychain using unique service', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        username: SecureStoreKey.ACCESS_TOKEN,
        password: 'test_token',
      });

      const value = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(value).toBe('test_token');
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: `com.warrendeleon.portfolio.${SecureStoreKey.ACCESS_TOKEN}`,
      });
    });

    it('should return null if key not found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      const value = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(value).toBeNull();
    });

    it('should return null on error', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      const value = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(value).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a specific key from Keychain using unique service', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: `com.warrendeleon.portfolio.${SecureStoreKey.ACCESS_TOKEN}`,
      });
    });

    it('should return false on error', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain error')
      );

      const result = await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all Keychain keys', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await SecureStore.clear();

      expect(result).toBe(true);
      // Should be called once for each SecureStoreKey
      expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(
        Object.values(SecureStoreKey).length
      );
    });

    it('should return false on error', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain error')
      );

      const result = await SecureStore.clear();

      expect(result).toBe(false);
    });
  });

  describe('isBiometricAvailable', () => {
    it('should return true if biometrics available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce('FaceID');

      const available = await SecureStore.isBiometricAvailable();

      expect(available).toBe(true);
    });

    it('should return false if biometrics not available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);

      const available = await SecureStore.isBiometricAvailable();

      expect(available).toBe(false);
    });

    it('should return false on error', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockRejectedValueOnce(
        new Error('Biometry error')
      );

      const available = await SecureStore.isBiometricAvailable();

      expect(available).toBe(false);
    });
  });

  describe('getBiometryType', () => {
    it('should return biometry type when available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce('FaceID');

      const type = await SecureStore.getBiometryType();

      expect(type).toBe('FaceID');
    });

    it('should return null when biometry not available', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);

      const type = await SecureStore.getBiometryType();

      expect(type).toBeNull();
    });

    it('should return null on error', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockRejectedValueOnce(
        new Error('Biometry error')
      );

      const type = await SecureStore.getBiometryType();

      expect(type).toBeNull();
    });
  });

  describe('security configuration', () => {
    it('should use WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility level', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'secure_token');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          accessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
        })
      );
    });

    it('should require biometric or device passcode for access', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, 'refresh_token');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          accessControl: 'BIOMETRY_ANY_OR_DEVICE_PASSCODE',
        })
      );
    });

    it('should use unique service per key to prevent overwrites', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'access');
      await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, 'refresh');

      const calls = (Keychain.setGenericPassword as jest.Mock).mock.calls;

      // Each key should have unique service
      expect(calls[0][2].service).toBe('com.warrendeleon.portfolio.accessToken');
      expect(calls[1][2].service).toBe('com.warrendeleon.portfolio.refreshToken');
      expect(calls[0][2].service).not.toBe(calls[1][2].service);
    });

    it('should store encryption key with biometric protection', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      await SecureStore.set(SecureStoreKey.ENCRYPTION_KEY, 'encryption_key_value');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStoreKey.ENCRYPTION_KEY,
        'encryption_key_value',
        expect.objectContaining({
          service: 'com.warrendeleon.portfolio.encryptionKey',
          accessControl: 'BIOMETRY_ANY_OR_DEVICE_PASSCODE',
        })
      );
    });

    it('should store hashed PIN securely', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      await SecureStore.set(SecureStoreKey.HASHED_PIN, 'hashed_pin_value');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStoreKey.HASHED_PIN,
        'hashed_pin_value',
        expect.objectContaining({
          service: 'com.warrendeleon.portfolio.hashedPIN',
          accessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
        })
      );
    });
  });

  describe('key isolation', () => {
    it('should retrieve correct value when multiple keys stored', async () => {
      // Setup: different values for different keys
      (Keychain.getGenericPassword as jest.Mock).mockImplementation(
        ({ service }: { service: string }) => {
          if (service.includes('accessToken')) {
            return Promise.resolve({ password: 'access_value' });
          }
          if (service.includes('refreshToken')) {
            return Promise.resolve({ password: 'refresh_value' });
          }
          return Promise.resolve(false);
        }
      );

      const accessValue = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);
      const refreshValue = await SecureStore.get(SecureStoreKey.REFRESH_TOKEN);

      expect(accessValue).toBe('access_value');
      expect(refreshValue).toBe('refresh_value');
    });

    it('should remove only specified key without affecting others', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

      // Should only be called once for the specified key
      expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'com.warrendeleon.portfolio.accessToken',
      });
    });
  });

  describe('error handling security', () => {
    it('should not expose sensitive data in error logs', async () => {
      const sensitiveToken = 'super_secret_token_12345';
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Storage failed'));

      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, sensitiveToken);

      // Check that the error was logged but NOT the sensitive value
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0].join(' ');
      expect(loggedMessage).not.toContain(sensitiveToken);
    });

    it('should fail gracefully without crashing on Keychain errors', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Keychain access denied')
      );

      // Should not throw, should return null
      const result = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(result).toBeNull();
    });
  });
});

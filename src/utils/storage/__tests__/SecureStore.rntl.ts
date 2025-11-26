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
});

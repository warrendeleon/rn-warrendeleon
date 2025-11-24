import EncryptedStorage from 'react-native-encrypted-storage';

import { EncryptedStore, EncryptedStoreKey } from '../EncryptedStore';

// Mock react-native-encrypted-storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('EncryptedStore', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('set', () => {
    it('should store a key-value pair in Encrypted Storage', async () => {
      (EncryptedStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, 'test@example.com');

      expect(result).toBe(true);
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        'test@example.com'
      );
    });

    it('should return false on error', async () => {
      (EncryptedStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, 'test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a value from Encrypted Storage', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce('test@example.com');

      const value = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);

      expect(value).toBe('test@example.com');
      expect(EncryptedStorage.getItem).toHaveBeenCalledWith(EncryptedStoreKey.USER_EMAIL);
    });

    it('should return null if key not found', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const value = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);

      expect(value).toBeNull();
    });

    it('should return null on error', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const value = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);

      expect(value).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a key from Encrypted Storage', async () => {
      (EncryptedStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await EncryptedStore.remove(EncryptedStoreKey.USER_EMAIL);

      expect(result).toBe(true);
      expect(EncryptedStorage.removeItem).toHaveBeenCalledWith(EncryptedStoreKey.USER_EMAIL);
    });

    it('should return false on error', async () => {
      (EncryptedStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await EncryptedStore.remove(EncryptedStoreKey.USER_EMAIL);

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all Encrypted Storage data', async () => {
      (EncryptedStorage.clear as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await EncryptedStore.clear();

      expect(result).toBe(true);
      expect(EncryptedStorage.clear).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      (EncryptedStorage.clear as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await EncryptedStore.clear();

      expect(result).toBe(false);
    });
  });

  describe('setMultiple', () => {
    it('should store multiple key-value pairs at once', async () => {
      (EncryptedStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const items = [
        { key: EncryptedStoreKey.USER_EMAIL, value: 'test@example.com' },
        { key: EncryptedStoreKey.USER_FIRST_NAME, value: 'John' },
        { key: EncryptedStoreKey.USER_LAST_NAME, value: 'Doe' },
      ];

      const result = await EncryptedStore.setMultiple(items);

      expect(result).toBe(true);
      expect(EncryptedStorage.setItem).toHaveBeenCalledTimes(3);
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        'test@example.com'
      );
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_FIRST_NAME,
        'John'
      );
      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_LAST_NAME,
        'Doe'
      );
    });

    it('should return false if any set operation fails', async () => {
      (EncryptedStorage.setItem as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Storage error'));

      const items = [
        { key: EncryptedStoreKey.USER_EMAIL, value: 'test@example.com' },
        { key: EncryptedStoreKey.USER_FIRST_NAME, value: 'John' },
      ];

      const result = await EncryptedStore.setMultiple(items);

      expect(result).toBe(false);
    });
  });

  describe('getMultiple', () => {
    it('should retrieve multiple values at once', async () => {
      (EncryptedStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('test@example.com')
        .mockResolvedValueOnce('John')
        .mockResolvedValueOnce('Doe');

      const keys = [
        EncryptedStoreKey.USER_EMAIL,
        EncryptedStoreKey.USER_FIRST_NAME,
        EncryptedStoreKey.USER_LAST_NAME,
      ];
      const values = await EncryptedStore.getMultiple(keys);

      expect(values).toEqual({
        [EncryptedStoreKey.USER_EMAIL]: 'test@example.com',
        [EncryptedStoreKey.USER_FIRST_NAME]: 'John',
        [EncryptedStoreKey.USER_LAST_NAME]: 'Doe',
      });
      expect(EncryptedStorage.getItem).toHaveBeenCalledTimes(3);
    });

    it('should handle null values in batch retrieval', async () => {
      (EncryptedStorage.getItem as jest.Mock)
        .mockResolvedValueOnce('test@example.com')
        .mockResolvedValueOnce(null);

      const keys = [EncryptedStoreKey.USER_EMAIL, EncryptedStoreKey.USER_FIRST_NAME];
      const values = await EncryptedStore.getMultiple(keys);

      expect(values).toEqual({
        [EncryptedStoreKey.USER_EMAIL]: 'test@example.com',
        [EncryptedStoreKey.USER_FIRST_NAME]: null,
      });
    });

    it('should return empty object on error', async () => {
      (EncryptedStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const keys = [EncryptedStoreKey.USER_EMAIL];
      const values = await EncryptedStore.getMultiple(keys);

      expect(values).toEqual({});
    });
  });
});

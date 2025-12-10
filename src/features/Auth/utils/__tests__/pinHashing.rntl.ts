/**
 * PIN Hashing Security Tests
 *
 * Tests bcrypt hashing and Keychain storage security for PIN hashes.
 */

import bcrypt from 'react-native-bcrypt';
import * as Keychain from 'react-native-keychain';

import {
  deletePINHash,
  hashPIN,
  hasPINSetup,
  retrievePINHash,
  storePINHash,
  verifyPIN,
} from '../pinHashing';

// Get mock references
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('pinHashing', () => {
  // Reset bcrypt mocks with their callback implementations
  const resetBcryptMocks = () => {
    mockBcrypt.genSalt.mockImplementation((_rounds, callback) => {
      callback(null, '$2a$10$mockSalt');
    });
    mockBcrypt.hash.mockImplementation((_data, _salt, callback) => {
      callback(null, '$2a$10$hashedValue');
    });
    mockBcrypt.compare.mockImplementation((_data, _hash, callback) => {
      callback(null, true);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetBcryptMocks();
  });

  describe('hashPIN', () => {
    it('should generate salt with 10 rounds', async () => {
      await hashPIN('742589');

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    });

    it('should hash PIN with generated salt', async () => {
      await hashPIN('742589');

      expect(mockBcrypt.hash).toHaveBeenCalledWith(
        '742589',
        '$2a$10$mockSalt',
        expect.any(Function)
      );
    });

    it('should return bcrypt hash format', async () => {
      const result = await hashPIN('742589');

      expect(result).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should throw error when salt generation fails', async () => {
      mockBcrypt.genSalt.mockImplementationOnce((_rounds, callback) => {
        callback(new Error('Salt generation failed'), '');
      });

      await expect(hashPIN('742589')).rejects.toThrow('Failed to generate salt for PIN hashing');
    });

    it('should throw error when hashing fails', async () => {
      mockBcrypt.genSalt.mockImplementationOnce((_rounds, callback) => {
        callback(null, '$2a$10$salt');
      });
      mockBcrypt.hash.mockImplementationOnce((_data, _salt, callback) => {
        callback(new Error('Hash failed'), '');
      });

      await expect(hashPIN('742589')).rejects.toThrow('Failed to hash PIN');
    });
  });

  describe('verifyPIN', () => {
    it('should compare PIN with hash', async () => {
      const hash = '$2a$10$storedHash';

      await verifyPIN('742589', hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith('742589', hash, expect.any(Function));
    });

    it('should return true for matching PIN', async () => {
      const result = await verifyPIN('742589', '$2a$10$hash');

      expect(result).toBe(true);
    });

    it('should return false for non-matching PIN', async () => {
      mockBcrypt.compare.mockImplementationOnce((_data, _hash, callback) => {
        callback(null, false);
      });

      const result = await verifyPIN('wrong', '$2a$10$hash');

      expect(result).toBe(false);
    });

    it('should return false on comparison error', async () => {
      mockBcrypt.compare.mockImplementationOnce((_data, _hash, callback) => {
        callback(new Error('Comparison failed'), false);
      });

      const result = await verifyPIN('742589', '$2a$10$hash');

      expect(result).toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      mockBcrypt.compare.mockImplementationOnce((_data, _hash, callback) => {
        callback(new Error('Invalid hash'), false);
      });

      const result = await verifyPIN('742589', '');

      expect(result).toBe(false);
    });

    it('should handle malformed hash gracefully', async () => {
      mockBcrypt.compare.mockImplementationOnce((_data, _hash, callback) => {
        callback(new Error('Invalid hash format'), false);
      });

      const result = await verifyPIN('742589', 'not-a-bcrypt-hash');

      expect(result).toBe(false);
    });
  });

  describe('storePINHash', () => {
    it('should store hash in Keychain with correct service', async () => {
      const hash = '$2a$10$hashedValue';

      await storePINHash(hash);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'pin_hash',
        hash,
        expect.objectContaining({
          service: 'auth_pin_hash',
        })
      );
    });

    it('should use WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility', async () => {
      const hash = '$2a$10$hashedValue';

      await storePINHash(hash);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'pin_hash',
        hash,
        expect.objectContaining({
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        })
      );
    });

    it('should throw error when storage fails', async () => {
      mockKeychain.setGenericPassword.mockRejectedValueOnce(new Error('Storage failed'));

      await expect(storePINHash('$2a$10$hash')).rejects.toThrow(
        'Failed to store PIN hash in Keychain'
      );
    });
  });

  describe('retrievePINHash', () => {
    it('should retrieve hash from Keychain', async () => {
      const storedHash = '$2a$10$storedHashValue';
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'pin_hash',
        password: storedHash,
        service: 'auth_pin_hash',
        storage: 'keychain' as Keychain.STORAGE_TYPE,
      });

      const result = await retrievePINHash();

      expect(result).toBe(storedHash);
      expect(mockKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'auth_pin_hash',
      });
    });

    it('should return null when no hash stored', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce(false);

      const result = await retrievePINHash();

      expect(result).toBeNull();
    });

    it('should return null on retrieval error', async () => {
      mockKeychain.getGenericPassword.mockRejectedValueOnce(new Error('Retrieval failed'));

      const result = await retrievePINHash();

      expect(result).toBeNull();
    });

    it('should return null when password is empty string', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'pin_hash',
        password: '',
        service: 'auth_pin_hash',
        storage: 'keychain' as Keychain.STORAGE_TYPE,
      });

      const result = await retrievePINHash();

      expect(result).toBeNull();
    });
  });

  describe('hasPINSetup', () => {
    it('should return true when PIN hash exists', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce({
        username: 'pin_hash',
        password: '$2a$10$hash',
        service: 'auth_pin_hash',
        storage: 'keychain' as Keychain.STORAGE_TYPE,
      });

      const result = await hasPINSetup();

      expect(result).toBe(true);
    });

    it('should return false when no PIN hash exists', async () => {
      mockKeychain.getGenericPassword.mockResolvedValueOnce(false);

      const result = await hasPINSetup();

      expect(result).toBe(false);
    });

    it('should return false on Keychain error', async () => {
      mockKeychain.getGenericPassword.mockRejectedValueOnce(new Error('Keychain error'));

      const result = await hasPINSetup();

      expect(result).toBe(false);
    });
  });

  describe('deletePINHash', () => {
    it('should reset Keychain with correct service', async () => {
      await deletePINHash();

      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_pin_hash',
      });
    });

    it('should not throw on deletion error', async () => {
      mockKeychain.resetGenericPassword.mockRejectedValueOnce(new Error('Delete failed'));

      // Should not throw
      await expect(deletePINHash()).resolves.toBeUndefined();
    });
  });

  describe('Security Properties', () => {
    it('should never store plaintext PIN', async () => {
      const pin = '742589';

      const hash = await hashPIN(pin);
      await storePINHash(hash);

      // Verify the stored value is a hash, not the PIN
      const storedValue = mockKeychain.setGenericPassword.mock.calls[0]?.[1];
      expect(storedValue).not.toBe(pin);
      expect(storedValue).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should use unique service identifier for PIN storage', async () => {
      await storePINHash('$2a$10$hash');

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          service: 'auth_pin_hash',
        })
      );
    });

    it('should use 10 bcrypt rounds for security', async () => {
      await hashPIN('742589');

      // Verify 10 rounds are used (balance between security and performance)
      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
    });

    it('should hash different PINs consistently', async () => {
      // Test with various valid PINs to ensure no hardcoding
      const testPins = ['839271', '503816', '927461', '158034'];

      for (const pin of testPins) {
        jest.clearAllMocks();
        resetBcryptMocks();

        await hashPIN(pin);

        expect(mockBcrypt.hash).toHaveBeenCalledWith(pin, expect.any(String), expect.any(Function));
      }
    });

    it('should verify different PINs correctly', async () => {
      // Test verification with various PINs
      const testPins = ['839271', '503816', '927461'];

      for (const pin of testPins) {
        jest.clearAllMocks();
        resetBcryptMocks();

        await verifyPIN(pin, '$2a$10$someHash');

        expect(mockBcrypt.compare).toHaveBeenCalledWith(
          pin,
          '$2a$10$someHash',
          expect.any(Function)
        );
      }
    });
  });
});

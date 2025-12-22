/**
 * Cryptographic Security Validation Tests
 *
 * Tests for validating cryptographic security practices:
 * - Token format validation
 * - Secure storage key isolation
 * - Credential handling
 * - Key enumeration prevention
 *
 * Note: Actual cryptographic operations (AES-256, Keychain) are tested
 * at the integration level. These tests validate the security patterns
 * used in the application's cryptographic infrastructure.
 */

import { MOCK_TOKENS, SECURITY_TEST_VALUES, TEST_CREDENTIALS } from '@app/test-utils/constants';

// Mock the native modules before imports
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue({ password: 'mock_value' }),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  getSupportedBiometryType: jest.fn().mockResolvedValue('FaceID'),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  },
}));

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@app/utils/logger', () => ({
  logError: jest.fn(),
}));

import EncryptedStorage from 'react-native-encrypted-storage';
import * as Keychain from 'react-native-keychain';

import { EncryptedStore, EncryptedStoreKey } from '@app/utils/storage/EncryptedStore';
import { SecureStore, SecureStoreKey } from '@app/utils/storage/SecureStore';

describe('Cryptographic Security Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Format Validation', () => {
    it('should recognise valid JWT-like token format', () => {
      // JWT format: header.payload.signature (base64 encoded parts)
      const validJwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

      // Mock valid tokens should follow expected patterns
      expect(MOCK_TOKENS.ACCESS_TOKEN).toBeDefined();
      expect(MOCK_TOKENS.REFRESH_TOKEN).toBeDefined();

      // Expired and malformed tokens should be identifiable
      expect(MOCK_TOKENS.EXPIRED_TOKEN).toBe('expired_token');
      expect(MOCK_TOKENS.MALFORMED_TOKEN).toBe('not.a.valid.jwt');

      // Malformed token should fail JWT pattern
      expect(validJwtPattern.test(MOCK_TOKENS.MALFORMED_TOKEN)).toBe(false);
    });

    it('should reject empty tokens', () => {
      const validateToken = (token: string | null | undefined): boolean => {
        if (!token || token.trim() === '') {
          return false;
        }
        return true;
      };

      expect(validateToken('')).toBe(false);
      expect(validateToken(null)).toBe(false);
      expect(validateToken(undefined)).toBe(false);
      expect(validateToken('   ')).toBe(false);
      expect(validateToken('valid_token')).toBe(true);
    });

    it('should handle tokens with special characters safely', () => {
      const sanitiseToken = (token: string): string => {
        // Remove potentially dangerous characters
        return token.replace(/[<>'"]/g, '');
      };

      const xssToken = '<script>alert(1)</script>';
      expect(sanitiseToken(xssToken)).toBe('scriptalert(1)/script');
      expect(sanitiseToken(xssToken)).not.toContain('<');
      expect(sanitiseToken(xssToken)).not.toContain('>');
    });

    it('should reject tokens with null bytes', () => {
      const validateTokenFormat = (token: string): boolean => {
        // Null bytes should never appear in valid tokens
        return !token.includes('\x00');
      };

      expect(validateTokenFormat(SECURITY_TEST_VALUES.NULL_BYTES)).toBe(false);
      expect(validateTokenFormat('valid_token_123')).toBe(true);
    });
  });

  describe('SecureStore Key Isolation', () => {
    it('should use unique service names for each key', async () => {
      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'token1');
      await SecureStore.set(SecureStoreKey.REFRESH_TOKEN, 'token2');

      // Each key should get its own service
      const setPasswordCalls = (Keychain.setGenericPassword as jest.Mock).mock.calls;

      expect(setPasswordCalls[0][2].service).toContain(SecureStoreKey.ACCESS_TOKEN);
      expect(setPasswordCalls[1][2].service).toContain(SecureStoreKey.REFRESH_TOKEN);
      expect(setPasswordCalls[0][2].service).not.toBe(setPasswordCalls[1][2].service);
    });

    it('should use secure accessibility settings', async () => {
      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'token');

      const setPasswordCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0];

      // Should use WHEN_UNLOCKED_THIS_DEVICE_ONLY for security
      expect(setPasswordCall[2].accessible).toBe(
        Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
      );
    });

    it('should require biometry or device passcode', async () => {
      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'token');

      const setPasswordCall = (Keychain.setGenericPassword as jest.Mock).mock.calls[0];

      // Should require biometry or device passcode
      expect(setPasswordCall[2].accessControl).toBe(
        Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE
      );
    });

    it('should clear all keys on logout', async () => {
      await SecureStore.clear();

      // Should clear all defined keys
      const resetCalls = (Keychain.resetGenericPassword as jest.Mock).mock.calls;
      expect(resetCalls.length).toBe(Object.values(SecureStoreKey).length);
    });

    it('should handle storage errors gracefully', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'token');

      // Should return false on error, not throw
      expect(result).toBe(false);
    });

    it('should return null for non-existent keys', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      const result = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(result).toBeNull();
    });
  });

  describe('EncryptedStore Security', () => {
    it('should store PII in encrypted storage', async () => {
      await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, TEST_CREDENTIALS.VALID_EMAIL);

      expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
        EncryptedStoreKey.USER_EMAIL,
        TEST_CREDENTIALS.VALID_EMAIL
      );
    });

    it('should clear all encrypted data on logout', async () => {
      await EncryptedStore.clear();

      expect(EncryptedStorage.clear).toHaveBeenCalled();
    });

    it('should handle encrypted storage errors gracefully', async () => {
      (EncryptedStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const result = await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, 'test@example.com');

      // Should return false on error, not throw
      expect(result).toBe(false);
    });

    it('should support batch operations for PII', async () => {
      await EncryptedStore.setMultiple([
        { key: EncryptedStoreKey.USER_EMAIL, value: 'test@example.com' },
        { key: EncryptedStoreKey.USER_FIRST_NAME, value: 'John' },
        { key: EncryptedStoreKey.USER_LAST_NAME, value: 'Doe' },
      ]);

      // Should call setItem for each key
      expect(EncryptedStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Key Enumeration Prevention', () => {
    it('should use enum for SecureStore keys', () => {
      // Keys should be defined as enum values, not arbitrary strings
      expect(SecureStoreKey.ACCESS_TOKEN).toBe('accessToken');
      expect(SecureStoreKey.REFRESH_TOKEN).toBe('refreshToken');
      expect(SecureStoreKey.USER_ID).toBe('userId');
      expect(SecureStoreKey.HASHED_PIN).toBe('hashedPIN');
    });

    it('should use enum for EncryptedStore keys', () => {
      expect(EncryptedStoreKey.USER_EMAIL).toBe('userEmail');
      expect(EncryptedStoreKey.USER_FIRST_NAME).toBe('userFirstName');
      expect(EncryptedStoreKey.USER_LAST_NAME).toBe('userLastName');
    });

    it('should have consistent key naming convention', () => {
      // All keys should follow camelCase convention
      const camelCasePattern = /^[a-z][a-zA-Z]*$/;

      Object.values(SecureStoreKey).forEach(key => {
        expect(camelCasePattern.test(key)).toBe(true);
      });

      Object.values(EncryptedStoreKey).forEach(key => {
        expect(camelCasePattern.test(key)).toBe(true);
      });
    });
  });

  describe('Credential Handling Security', () => {
    it('should not store passwords in plain text', () => {
      // Verify that passwords are handled securely (hashed, not stored)
      // The app should hash passwords client-side before storage
      const hashedPinKey = SecureStoreKey.HASHED_PIN;
      expect(hashedPinKey).toBe('hashedPIN');

      // There should be no plain password key
      const allKeys = Object.values(SecureStoreKey);
      expect(allKeys).not.toContain('password');
      expect(allKeys).not.toContain('plainPassword');
      expect(allKeys).not.toContain('userPassword');
    });

    it('should separate auth tokens from user data', () => {
      // Auth tokens should be in SecureStore (Keychain)
      expect(Object.values(SecureStoreKey)).toContain('accessToken');
      expect(Object.values(SecureStoreKey)).toContain('refreshToken');

      // User data should be in EncryptedStore
      expect(Object.values(EncryptedStoreKey)).toContain('userEmail');
      expect(Object.values(EncryptedStoreKey)).toContain('userFirstName');

      // Cross-check: User data should NOT be in SecureStore
      expect(Object.values(SecureStoreKey)).not.toContain('userEmail');
      expect(Object.values(SecureStoreKey)).not.toContain('userFirstName');
    });

    it('should store encryption key separately from encrypted data', () => {
      // Encryption key should be in Keychain (SecureStore)
      expect(Object.values(SecureStoreKey)).toContain('encryptionKey');

      // Encrypted data uses EncryptedStorage (separate layer)
      // This separation prevents single-point-of-failure
    });
  });

  describe('Biometric Security', () => {
    it('should check biometric availability', async () => {
      const isAvailable = await SecureStore.isBiometricAvailable();

      expect(Keychain.getSupportedBiometryType).toHaveBeenCalled();
      expect(isAvailable).toBe(true);
    });

    it('should handle biometric unavailability', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce(null);

      const isAvailable = await SecureStore.isBiometricAvailable();

      expect(isAvailable).toBe(false);
    });

    it('should get biometry type', async () => {
      // Reset the mock to ensure it returns FaceID
      (Keychain.getSupportedBiometryType as jest.Mock).mockResolvedValueOnce('FaceID');

      const biometryType = await SecureStore.getBiometryType();

      expect(biometryType).toBe('FaceID');
    });

    it('should handle biometry check errors', async () => {
      (Keychain.getSupportedBiometryType as jest.Mock).mockRejectedValueOnce(
        new Error('Biometry error')
      );

      const isAvailable = await SecureStore.isBiometricAvailable();

      // Should return false on error, not throw
      expect(isAvailable).toBe(false);
    });

    it('should store biometric preference securely', async () => {
      expect(Object.values(SecureStoreKey)).toContain('biometricPreference');

      await SecureStore.set(SecureStoreKey.BIOMETRIC_PREFERENCE, 'enabled');

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStoreKey.BIOMETRIC_PREFERENCE,
        'enabled',
        expect.any(Object)
      );
    });
  });

  describe('Storage Tier Separation', () => {
    it('should have clear separation between Tier 1 (Keychain) and Tier 2 (Encrypted)', () => {
      // Tier 1 (SecureStore/Keychain): Most sensitive - auth tokens, keys
      const tier1Keys = Object.values(SecureStoreKey);
      expect(tier1Keys).toContain('accessToken');
      expect(tier1Keys).toContain('refreshToken');
      expect(tier1Keys).toContain('encryptionKey');
      expect(tier1Keys).toContain('hashedPIN');

      // Tier 2 (EncryptedStore): Sensitive PII
      const tier2Keys = Object.values(EncryptedStoreKey);
      expect(tier2Keys).toContain('userEmail');
      expect(tier2Keys).toContain('userFirstName');
      expect(tier2Keys).toContain('userLastName');
      expect(tier2Keys).toContain('userPhoneNumber');
    });

    it('should not mix tiers', () => {
      const tier1Keys = Object.values(SecureStoreKey);
      const tier2Keys = Object.values(EncryptedStoreKey);

      // No overlapping keys between tiers
      tier1Keys.forEach(key => {
        expect(tier2Keys).not.toContain(key);
      });

      tier2Keys.forEach(key => {
        expect(tier1Keys).not.toContain(key);
      });
    });
  });

  describe('Error Logging Security', () => {
    it('should log errors without exposing sensitive data', async () => {
      const { logError } = require('@app/utils/logger');

      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'sensitive_token_value');

      // Error should be logged
      expect(logError).toHaveBeenCalled();

      // But sensitive value should not be in the log
      const logCall = (logError as jest.Mock).mock.calls[0];
      expect(logCall[0]).not.toContain('sensitive_token_value');
    });

    it('should include key name in error context', async () => {
      const { logError } = require('@app/utils/logger');

      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'value');

      // Error message should include the key for debugging
      const logCall = (logError as jest.Mock).mock.calls[0];
      expect(logCall[0]).toContain(SecureStoreKey.ACCESS_TOKEN);
    });
  });
});

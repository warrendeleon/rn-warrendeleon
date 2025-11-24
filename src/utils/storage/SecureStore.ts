/**
 * SecureStore - Tier 1 Storage (Keychain)
 *
 * Use for:
 * - Auth tokens (access + refresh)
 * - Encryption keys
 * - Hashed PINs
 * - Biometric preferences
 *
 * Security: Hardware-backed, biometric-protected, survives uninstall (optional)
 */

import * as Keychain from 'react-native-keychain';

/**
 * SecureStore keys enum for type safety
 */
export enum SecureStoreKey {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
  USER_ID = 'userId',
  BIOMETRIC_PREFERENCE = 'biometricPreference',
  HASHED_PIN = 'hashedPIN',
  ENCRYPTION_KEY = 'encryptionKey',
}

/**
 * Keychain service name (grouping key-value pairs)
 */
const SERVICE_NAME = 'com.warrendeleon.portfolio';

class SecureStoreClass {
  /**
   * Store a key-value pair in Keychain
   *
   * @param key - SecureStoreKey enum value
   * @param value - String value to store
   * @returns Promise<boolean> - Success status
   */
  async set(key: SecureStoreKey, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      });
      return true;
    } catch (error) {
      console.error(`SecureStore.set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value from Keychain
   *
   * @param key - SecureStoreKey enum value
   * @returns Promise<string | null> - Stored value or null if not found
   */
  async get(key: SecureStoreKey): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });

      if (credentials && credentials.username === key) {
        return credentials.password;
      }

      return null;
    } catch (error) {
      console.error(`SecureStore.get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a key-value pair from Keychain
   *
   * @param key - SecureStoreKey enum value
   * @returns Promise<boolean> - Success status
   */
  async remove(key: SecureStoreKey): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      return true;
    } catch (error) {
      console.error(`SecureStore.remove error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all Keychain data (use with caution - logout only)
   *
   * @returns Promise<boolean> - Success status
   */
  async clear(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_NAME });
      return true;
    } catch (error) {
      console.error('SecureStore.clear error:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is available
   *
   * @returns Promise<boolean> - True if biometrics available
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error('SecureStore.isBiometricAvailable error:', error);
      return false;
    }
  }

  /**
   * Get supported biometry type
   *
   * @returns Promise<string | null> - 'FaceID', 'TouchID', 'Fingerprint', or null
   */
  async getBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('SecureStore.getBiometryType error:', error);
      return null;
    }
  }
}

export const SecureStore = new SecureStoreClass();

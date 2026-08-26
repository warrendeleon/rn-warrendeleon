/**
 * SecureStore - Tier 1 Storage (Keychain)
 *
 * Use for:
 * - Auth tokens (access + refresh)
 * - Hashed PINs
 *
 * Security: OS key storage (hardware-backed on iOS; device-dependent on
 * Android, see Keychain.getSecurityLevel()). Only the hashed PIN is gated
 * behind biometrics/passcode; tokens stay un-gated so background refresh
 * and the cold-start session check never prompt. Survives uninstall (iOS).
 */

import * as Keychain from 'react-native-keychain';

import { logError } from '../logger';

/**
 * SecureStore keys enum for type safety
 */
export enum SecureStoreKey {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
  USER_ID = 'userId',
  HASHED_PIN = 'hashedPIN',
}

/**
 * Keys the user should re-authenticate to read. Tokens stay un-gated so the
 * refresh interceptor and cold-start session check never trigger a prompt.
 */
const BIOMETRIC_GATED: SecureStoreKey[] = [SecureStoreKey.HASHED_PIN];

/**
 * Base service name - each key gets its own service to avoid overwrites
 * (Keychain stores ONE credential per service)
 */
const SERVICE_BASE = 'com.warrendeleon.portfolio';

/**
 * Get unique service name for a key
 */
const getServiceName = (key: SecureStoreKey): string => `${SERVICE_BASE}.${key}`;

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
        service: getServiceName(key),
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        ...(BIOMETRIC_GATED.includes(key) && {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        }),
      });
      return true;
    } catch (error) {
      logError(`SecureStore.set error for key ${key}`, error);
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
        service: getServiceName(key),
      });

      if (credentials) {
        return credentials.password;
      }

      return null;
    } catch (error) {
      logError(`SecureStore.get error for key ${key}`, error);
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
      await Keychain.resetGenericPassword({ service: getServiceName(key) });
      return true;
    } catch (error) {
      logError(`SecureStore.remove error for key ${key}`, error);
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
      // Clear all known keys
      await Promise.all(
        Object.values(SecureStoreKey).map(key =>
          Keychain.resetGenericPassword({ service: getServiceName(key) })
        )
      );
      return true;
    } catch (error) {
      logError('SecureStore.clear error', error);
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
      logError('SecureStore.isBiometricAvailable error', error);
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
      logError('SecureStore.getBiometryType error', error);
      return null;
    }
  }
}

export const SecureStore = new SecureStoreClass();

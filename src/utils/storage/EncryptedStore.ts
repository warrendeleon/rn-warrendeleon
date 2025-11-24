/**
 * EncryptedStore - Tier 2 Storage (Encrypted Storage)
 *
 * Use for:
 * - User PII (email, name, phone, birthday, address)
 * - Profile picture URL
 * - Sensitive preferences
 *
 * Security: AES-256 encrypted, encryption key in Keychain, faster than Keychain
 */

import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * EncryptedStore keys enum for type safety
 */
export enum EncryptedStoreKey {
  USER_EMAIL = 'userEmail',
  USER_FULL_NAME = 'userFullName',
  USER_PHONE = 'userPhone',
  PROFILE_PICTURE_URL = 'profilePictureURL',
  AUTH_PROVIDER = 'authProvider',
}

class EncryptedStoreClass {
  /**
   * Store a key-value pair in Encrypted Storage
   *
   * @param key - EncryptedStoreKey enum value
   * @param value - String value to store
   * @returns Promise<boolean> - Success status
   */
  async set(key: EncryptedStoreKey, value: string): Promise<boolean> {
    try {
      await EncryptedStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`EncryptedStore.set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value from Encrypted Storage
   *
   * @param key - EncryptedStoreKey enum value
   * @returns Promise<string | null> - Stored value or null if not found
   */
  async get(key: EncryptedStoreKey): Promise<string | null> {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value ?? null;
    } catch (error) {
      console.error(`EncryptedStore.get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a key-value pair from Encrypted Storage
   *
   * @param key - EncryptedStoreKey enum value
   * @returns Promise<boolean> - Success status
   */
  async remove(key: EncryptedStoreKey): Promise<boolean> {
    try {
      await EncryptedStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`EncryptedStore.remove error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all Encrypted Storage data (use with caution - logout only)
   *
   * @returns Promise<boolean> - Success status
   */
  async clear(): Promise<boolean> {
    try {
      await EncryptedStorage.clear();
      return true;
    } catch (error) {
      console.error('EncryptedStore.clear error:', error);
      return false;
    }
  }

  /**
   * Store multiple key-value pairs at once
   *
   * @param items - Array of {key, value} objects
   * @returns Promise<boolean> - Success status
   */
  async setMultiple(items: Array<{ key: EncryptedStoreKey; value: string }>): Promise<boolean> {
    try {
      const results = await Promise.all(items.map(({ key, value }) => this.set(key, value)));
      return results.every(result => result === true);
    } catch (error) {
      console.error('EncryptedStore.setMultiple error:', error);
      return false;
    }
  }

  /**
   * Get multiple values at once
   *
   * @param keys - Array of EncryptedStoreKey enum values
   * @returns Promise<Record<EncryptedStoreKey, string | null>> - Object with key-value pairs
   */
  async getMultiple(keys: EncryptedStoreKey[]): Promise<Record<string, string | null>> {
    try {
      const values = await Promise.all(keys.map(key => EncryptedStorage.getItem(key)));
      return keys.reduce(
        (acc, key, index) => {
          acc[key] = values[index] ?? null;
          return acc;
        },
        {} as Record<string, string | null>
      );
    } catch (error) {
      console.error('EncryptedStore.getMultiple error:', error);
      return {};
    }
  }
}

export const EncryptedStore = new EncryptedStoreClass();

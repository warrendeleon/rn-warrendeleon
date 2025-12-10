/**
 * PIN Hashing Utilities
 *
 * Secure PIN hashing with bcrypt and Keychain storage.
 * Never stores plain-text PINs - only bcrypt hashes.
 */

import bcrypt from 'react-native-bcrypt';
import * as Keychain from 'react-native-keychain';

const BCRYPT_ROUNDS = 10;
const KEYCHAIN_SERVICE = 'auth_pin_hash';

/**
 * Hash PIN with bcrypt
 *
 * Uses 10 rounds for balance between security and performance.
 * Each round doubles the computation time.
 *
 * @param pin - Plain-text 6-digit PIN
 * @returns Promise resolving to bcrypt hash string
 * @throws Error if hashing fails
 *
 * @example
 * const hash = await hashPIN('159487');
 * // Returns: '$2a$10$N9qo8uLOickgx2ZMRZoMy...'
 */
export const hashPIN = async (pin: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(BCRYPT_ROUNDS, (saltError: Error | null, salt: string) => {
      if (saltError) {
        reject(new Error('Failed to generate salt for PIN hashing'));
        return;
      }

      bcrypt.hash(pin, salt, (hashError: Error | null, hash: string) => {
        if (hashError) {
          reject(new Error('Failed to hash PIN'));
          return;
        }

        resolve(hash);
      });
    });
  });
};

/**
 * Verify PIN against stored hash
 *
 * @param pin - Plain-text PIN to verify
 * @param hash - Stored bcrypt hash
 * @returns Promise resolving to true if PIN matches hash
 *
 * @example
 * const isValid = await verifyPIN('159487', storedHash);
 */
export const verifyPIN = async (pin: string, hash: string): Promise<boolean> => {
  return new Promise(resolve => {
    bcrypt.compare(pin, hash, (error: Error | null, result: boolean) => {
      if (error) {
        resolve(false);
        return;
      }

      resolve(result);
    });
  });
};

/**
 * Store hashed PIN in Keychain
 *
 * Uses ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY for maximum security.
 * PIN hash is only accessible when device is unlocked and never syncs to iCloud.
 *
 * @param hashedPin - bcrypt hash to store
 * @throws Error if storage fails
 */
export const storePINHash = async (hashedPin: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('pin_hash', hashedPin, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  } catch {
    throw new Error('Failed to store PIN hash in Keychain');
  }
};

/**
 * Retrieve hashed PIN from Keychain
 *
 * @returns Stored PIN hash or null if not found
 */
export const retrievePINHash = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Check if PIN has been set up
 *
 * @returns true if a PIN hash exists in Keychain
 */
export const hasPINSetup = async (): Promise<boolean> => {
  const hash = await retrievePINHash();
  return hash !== null;
};

/**
 * Delete PIN hash from Keychain
 *
 * Used during logout or account deletion.
 */
export const deletePINHash = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
  } catch {
    // Silently fail - deletion is best effort
  }
};

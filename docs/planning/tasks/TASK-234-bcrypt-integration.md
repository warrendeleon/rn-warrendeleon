# TASK-234: bcrypt Integration for PIN Hashing

**ID**: TASK-234 | **Epic**: [EPIC-023](../epics/EPIC-023-security-settings.md) | **User Story**: [US-040](../stories/US-040-change-pin.md)
**Status**: 📋 To Do | **Effort**: 1.5h

---

## Task Description

Integrate bcrypt for secure PIN hashing and verification. Implement functions to hash PINs before storing in Keychain, verify PINs during authentication, and handle PIN changes. Use 10 salt rounds for optimal security/performance balance.

---

## Acceptance Criteria

- [ ] bcrypt library installed (`react-native-bcrypt`)
- [ ] `hashPIN` function implemented
- [ ] `verifyPIN` function implemented
- [ ] `changePIN` function implemented with verification
- [ ] All functions use 10 salt rounds
- [ ] Keychain integration for secure storage
- [ ] Error handling for hashing failures
- [ ] TypeScript type definitions
- [ ] 100% unit test coverage

---

## Implementation Details

### Installation

```bash
yarn add react-native-bcrypt
```

### PIN Hashing Service

```typescript
// src/services/security/pinHashingService.ts

import bcrypt from 'react-native-bcrypt';
import * as Keychain from 'react-native-keychain';

/**
 * Number of salt rounds for bcrypt hashing
 * 10 rounds provides strong security with acceptable performance (~100ms)
 */
const SALT_ROUNDS = 10;

/**
 * Keychain service identifier for PIN hash
 */
const PIN_HASH_SERVICE = 'auth_pin_hash';

/**
 * Hashes a PIN using bcrypt
 *
 * @param pin - 6-digit PIN to hash
 * @returns Promise resolving to bcrypt hash
 * @throws Error if hashing fails
 *
 * @example
 * const hash = await hashPIN('123456');
 * console.log(hash); // "$2b$10$..."
 */
export const hashPIN = async (pin: string): Promise<string> => {
  try {
    const hash = await bcrypt.hash(pin, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Failed to hash PIN:', error);
    throw new Error('Failed to hash PIN. Please try again.');
  }
};

/**
 * Verifies a PIN against a stored hash
 *
 * @param pin - 6-digit PIN to verify
 * @param hash - bcrypt hash to compare against
 * @returns Promise resolving to true if PIN matches, false otherwise
 *
 * @example
 * const isValid = await verifyPIN('123456', storedHash);
 * if (isValid) {
 *   console.log('PIN correct');
 * }
 */
export const verifyPIN = async (pin: string, hash: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(pin, hash);
    return isMatch;
  } catch (error) {
    console.error('Failed to verify PIN:', error);
    return false;
  }
};

/**
 * Stores a hashed PIN in Keychain
 *
 * @param hash - bcrypt hash to store
 * @throws Error if Keychain storage fails
 *
 * @example
 * const hash = await hashPIN('123456');
 * await storePINHash(hash);
 */
export const storePINHash = async (hash: string): Promise<void> => {
  try {
    await Keychain.setGenericPassword('pin_hash', hash, {
      service: PIN_HASH_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
    });
  } catch (error) {
    console.error('Failed to store PIN hash:', error);
    throw new Error('Failed to store PIN securely. Please try again.');
  }
};

/**
 * Retrieves stored PIN hash from Keychain
 *
 * @returns Promise resolving to PIN hash or null if not found
 *
 * @example
 * const hash = await retrievePINHash();
 * if (hash) {
 *   const isValid = await verifyPIN(inputPIN, hash);
 * }
 */
export const retrievePINHash = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: PIN_HASH_SERVICE,
    });

    if (!credentials) {
      return null;
    }

    return credentials.password;
  } catch (error) {
    console.error('Failed to retrieve PIN hash:', error);
    return null;
  }
};

/**
 * Changes the user's PIN by verifying the current PIN and storing the new one
 *
 * @param currentPIN - Current 6-digit PIN
 * @param newPIN - New 6-digit PIN
 * @throws Error if current PIN is incorrect or storage fails
 *
 * @example
 * try {
 *   await changePIN('123456', '654321');
 *   console.log('PIN changed successfully');
 * } catch (error) {
 *   console.error('Failed to change PIN:', error.message);
 * }
 */
export const changePIN = async (currentPIN: string, newPIN: string): Promise<void> => {
  // Retrieve current PIN hash
  const currentHash = await retrievePINHash();

  if (!currentHash) {
    throw new Error('No PIN is currently set. Please set a PIN first.');
  }

  // Verify current PIN
  const isCurrentPINValid = await verifyPIN(currentPIN, currentHash);

  if (!isCurrentPINValid) {
    throw new Error('Current PIN is incorrect. Please try again.');
  }

  // Hash new PIN
  const newHash = await hashPIN(newPIN);

  // Store new PIN hash
  await storePINHash(newHash);
};

/**
 * Sets up a new PIN (for first-time setup)
 *
 * @param pin - 6-digit PIN to set
 * @throws Error if storage fails
 *
 * @example
 * await setupPIN('123456');
 */
export const setupPIN = async (pin: string): Promise<void> => {
  const hash = await hashPIN(pin);
  await storePINHash(hash);
};

/**
 * Removes the PIN from Keychain (for logout/reset)
 *
 * @example
 * await removePIN();
 */
export const removePIN = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword({
      service: PIN_HASH_SERVICE,
    });
  } catch (error) {
    console.error('Failed to remove PIN:', error);
    throw new Error('Failed to remove PIN. Please try again.');
  }
};
```

---

## Testing Requirements

### Unit Tests

```typescript
// src/services/security/__tests__/pinHashingService.test.ts

import bcrypt from 'react-native-bcrypt';
import * as Keychain from 'react-native-keychain';
import {
  hashPIN,
  verifyPIN,
  storePINHash,
  retrievePINHash,
  changePIN,
  setupPIN,
  removePIN,
} from '../pinHashingService';

// Mock dependencies
jest.mock('react-native-bcrypt');
jest.mock('react-native-keychain');

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockKeychain = Keychain as jest.Mocked<typeof Keychain>;

describe('pinHashingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPIN', () => {
    it('should hash PIN with 10 salt rounds', async () => {
      const pin = '123456';
      const expectedHash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockBcrypt.hash.mockResolvedValue(expectedHash);

      const hash = await hashPIN(pin);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(pin, 10);
      expect(hash).toBe(expectedHash);
    });

    it('should throw error if hashing fails', async () => {
      const pin = '123456';

      mockBcrypt.hash.mockRejectedValue(new Error('Hashing error'));

      await expect(hashPIN(pin)).rejects.toThrow('Failed to hash PIN. Please try again.');
    });
  });

  describe('verifyPIN', () => {
    it('should return true if PIN matches hash', async () => {
      const pin = '123456';
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockBcrypt.compare.mockResolvedValue(true);

      const isValid = await verifyPIN(pin, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(pin, hash);
      expect(isValid).toBe(true);
    });

    it('should return false if PIN does not match hash', async () => {
      const pin = '123456';
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockBcrypt.compare.mockResolvedValue(false);

      const isValid = await verifyPIN(pin, hash);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(pin, hash);
      expect(isValid).toBe(false);
    });

    it('should return false if verification fails', async () => {
      const pin = '123456';
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockBcrypt.compare.mockRejectedValue(new Error('Verification error'));

      const isValid = await verifyPIN(pin, hash);

      expect(isValid).toBe(false);
    });
  });

  describe('storePINHash', () => {
    it('should store hash in Keychain with correct configuration', async () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockKeychain.setGenericPassword.mockResolvedValue({ service: 'auth_pin_hash' });

      await storePINHash(hash);

      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith('pin_hash', hash, {
        service: 'auth_pin_hash',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      });
    });

    it('should throw error if Keychain storage fails', async () => {
      const hash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockKeychain.setGenericPassword.mockRejectedValue(new Error('Keychain error'));

      await expect(storePINHash(hash)).rejects.toThrow(
        'Failed to store PIN securely. Please try again.'
      );
    });
  });

  describe('retrievePINHash', () => {
    it('should retrieve hash from Keychain', async () => {
      const expectedHash = '$2b$10$abcdefghijklmnopqrstuvwxyz';

      mockKeychain.getGenericPassword.mockResolvedValue({
        service: 'auth_pin_hash',
        username: 'pin_hash',
        password: expectedHash,
      });

      const hash = await retrievePINHash();

      expect(mockKeychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'auth_pin_hash',
      });
      expect(hash).toBe(expectedHash);
    });

    it('should return null if no hash is stored', async () => {
      mockKeychain.getGenericPassword.mockResolvedValue(false);

      const hash = await retrievePINHash();

      expect(hash).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      mockKeychain.getGenericPassword.mockRejectedValue(new Error('Keychain error'));

      const hash = await retrievePINHash();

      expect(hash).toBeNull();
    });
  });

  describe('changePIN', () => {
    it('should change PIN if current PIN is correct', async () => {
      const currentPIN = '123456';
      const newPIN = '654321';
      const currentHash = '$2b$10$current_hash';
      const newHash = '$2b$10$new_hash';

      mockKeychain.getGenericPassword.mockResolvedValue({
        service: 'auth_pin_hash',
        username: 'pin_hash',
        password: currentHash,
      });
      mockBcrypt.compare.mockResolvedValue(true);
      mockBcrypt.hash.mockResolvedValue(newHash);
      mockKeychain.setGenericPassword.mockResolvedValue({ service: 'auth_pin_hash' });

      await changePIN(currentPIN, newPIN);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(currentPIN, currentHash);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPIN, 10);
      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'pin_hash',
        newHash,
        expect.any(Object)
      );
    });

    it('should throw error if no PIN is set', async () => {
      mockKeychain.getGenericPassword.mockResolvedValue(false);

      await expect(changePIN('123456', '654321')).rejects.toThrow(
        'No PIN is currently set. Please set a PIN first.'
      );
    });

    it('should throw error if current PIN is incorrect', async () => {
      const currentHash = '$2b$10$current_hash';

      mockKeychain.getGenericPassword.mockResolvedValue({
        service: 'auth_pin_hash',
        username: 'pin_hash',
        password: currentHash,
      });
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(changePIN('123456', '654321')).rejects.toThrow(
        'Current PIN is incorrect. Please try again.'
      );
    });
  });

  describe('setupPIN', () => {
    it('should hash and store new PIN', async () => {
      const pin = '123456';
      const hash = '$2b$10$new_hash';

      mockBcrypt.hash.mockResolvedValue(hash);
      mockKeychain.setGenericPassword.mockResolvedValue({ service: 'auth_pin_hash' });

      await setupPIN(pin);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(pin, 10);
      expect(mockKeychain.setGenericPassword).toHaveBeenCalledWith(
        'pin_hash',
        hash,
        expect.any(Object)
      );
    });
  });

  describe('removePIN', () => {
    it('should remove PIN from Keychain', async () => {
      mockKeychain.resetGenericPassword.mockResolvedValue(true);

      await removePIN();

      expect(mockKeychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'auth_pin_hash',
      });
    });

    it('should throw error if removal fails', async () => {
      mockKeychain.resetGenericPassword.mockRejectedValue(new Error('Keychain error'));

      await expect(removePIN()).rejects.toThrow('Failed to remove PIN. Please try again.');
    });
  });
});
```

---

## Dependencies

- `react-native-bcrypt` - bcrypt implementation for React Native
- `react-native-keychain` - Secure storage for PIN hash

---

## Definition of Done

- [ ] bcrypt library installed
- [ ] All hashing/verification functions implemented
- [ ] Keychain integration complete
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] 100% unit test coverage achieved
- [ ] All tests passing
- [ ] Code reviewed and merged

---

**Last Updated**: 2025-11-21
**Related**: [US-040](../stories/US-040-change-pin.md), [TASK-233](TASK-233-pin-validation-logic.md), [TASK-232](TASK-232-change-pin-ui.md)

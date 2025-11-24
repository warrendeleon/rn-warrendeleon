# TASK-191: 3-Tier Storage Implementation (Keychain + Encrypted Storage + AsyncStorage)

**Task ID**: TASK-191
**Title**: 3-Tier Storage Implementation (Keychain + Encrypted Storage + AsyncStorage)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ✅ Done
**Priority**: Critical
**Effort**: 3 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21
**Started**: 2025-11-24
**Completed**: 2025-11-24

---

## Context

Secure mobile apps use a layered storage approach based on data sensitivity:

**Tier 1 - Keychain (Highest Security)**:

- **What**: Hardware-backed secure storage (iOS Keychain, Android Keystore)
- **When**: Auth tokens, encryption keys, hashed PINs, biometric preferences
- **Why**: Hardware-level encryption, survives app uninstall (optional), biometric-protected

**Tier 2 - Encrypted Storage (Medium Security)**:

- **What**: AES-256 encrypted storage with keys in Keychain
- **When**: User PII (email, name, phone), profile picture URL, sensitive preferences
- **Why**: Faster than Keychain for larger data, encrypted at rest, app-specific

**Tier 3 - AsyncStorage (No Encryption)**:

- **What**: Plain text key-value storage
- **When**: Non-sensitive preferences (theme, language), Redux Persist state (non-PII)
- **Why**: Fast, simple, sufficient for non-sensitive data

**Anti-Pattern** (NEVER DO THIS):

- ❌ Storing tokens in AsyncStorage (easily extracted from device)
- ❌ Storing passwords anywhere (even hashed - use Keychain only)
- ❌ Storing PII in AsyncStorage (GDPR violation if device stolen)

This task implements all three tiers with a clean, type-safe API.

---

## Objective

Implement 3-tier storage architecture:

1. **Tier 1 (Keychain)**: Install `react-native-keychain`, create SecureStore utility
2. **Tier 2 (Encrypted Storage)**: Install `react-native-encrypted-storage`, create EncryptedStore utility
3. **Tier 3 (AsyncStorage)**: Already installed, configure for Redux Persist
4. Create TypeScript utilities for each tier with consistent API
5. Add comprehensive unit tests for all storage operations
6. Document what data belongs in which tier

**Deliverable**: Production-ready 3-tier storage system with full test coverage.

---

## Acceptance Criteria

- [ ] **react-native-keychain installed** and linked (iOS + Android)
- [ ] **react-native-encrypted-storage installed** and linked (iOS + Android)
- [ ] **SecureStore utility** created for Tier 1 (Keychain)
- [ ] **EncryptedStore utility** created for Tier 2 (Encrypted Storage)
- [ ] **StorageService** created as unified interface
- [ ] **TypeScript types** for all storage operations
- [ ] **Error handling** with graceful fallbacks
- [ ] **100% unit test coverage** for all utilities (RNTL)
- [ ] **Data classification guide** documented (what goes where)
- [ ] **No sensitive data** in AsyncStorage (verified)

---

## Detailed Implementation Guide

### Phase 1: Install Dependencies (15 minutes)

#### Step 1.1: Install react-native-keychain

```bash
yarn add react-native-keychain
```

**iOS setup**:

```bash
cd ios
pod install
cd ..
```

**Android setup**: Auto-linked by React Native.

#### Step 1.2: Install react-native-encrypted-storage

```bash
yarn add react-native-encrypted-storage
```

**iOS setup**:

```bash
cd ios
pod install
cd ..
```

**Android setup**: Auto-linked.

#### Step 1.3: Verify Installation

**Test on iOS**:

```bash
yarn ios
```

**Test on Android**:

```bash
yarn android
```

**Expected**: App builds successfully on both platforms.

---

### Phase 2: Tier 1 - SecureStore Utility (Keychain) - (45 minutes)

#### Step 2.1: Create SecureStore Utility

Create `/Users/warrendeleon/Developer/warrendeleon/src/utils/storage/SecureStore.ts`:

```typescript
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
```

**Save file**.

---

### Phase 3: Tier 2 - EncryptedStore Utility (Encrypted Storage) - (45 minutes)

#### Step 3.1: Create EncryptedStore Utility

Create `/Users/warrendeleon/Developer/warrendeleon/src/utils/storage/EncryptedStore.ts`:

```typescript
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
      return value;
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
      await Promise.all(items.map(({ key, value }) => this.set(key, value)));
      return true;
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
      const values = await Promise.all(keys.map(key => this.get(key)));
      return keys.reduce(
        (acc, key, index) => {
          acc[key] = values[index];
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
```

**Save file**.

---

### Phase 4: Tier 3 - AsyncStorage (Redux Persist) - (15 minutes)

#### Step 4.1: Verify AsyncStorage Installed

AsyncStorage should already be installed from project setup:

```bash
yarn list @react-native-async-storage/async-storage
```

**Expected**: Version 1.x.x installed.

**If not installed**:

```bash
yarn add @react-native-async-storage/async-storage
cd ios && pod install && cd ..
```

#### Step 4.2: Document AsyncStorage Usage

Create `/Users/warrendeleon/Developer/warrendeleon/src/utils/storage/README.md`:

```markdown
# 3-Tier Storage Architecture

## Overview

This app uses a 3-tier storage system based on data sensitivity:

### Tier 1: SecureStore (Keychain/Keystore)

**Library**: `react-native-keychain`

**Security**: Hardware-backed, biometric-protected, highest security

**Use for**:

- ✅ Auth tokens (access + refresh)
- ✅ Encryption keys
- ✅ Hashed PINs
- ✅ Biometric preferences

**DO NOT use for**:

- ❌ Large data (slow performance)
- ❌ Non-sensitive preferences

**API**:
\`\`\`typescript
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';

// Store token
await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'jwt_token_here');

// Retrieve token
const token = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

// Remove token
await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

// Clear all (logout)
await SecureStore.clear();
\`\`\`

---

### Tier 2: EncryptedStore (Encrypted Storage)

**Library**: `react-native-encrypted-storage`

**Security**: AES-256 encrypted, encryption key in Keychain, medium security

**Use for**:

- ✅ User PII (email, name, phone, birthday, address)
- ✅ Profile picture URL
- ✅ Sensitive preferences

**DO NOT use for**:

- ❌ Auth tokens (use SecureStore)
- ❌ Non-sensitive data (use AsyncStorage, faster)

**API**:
\`\`\`typescript
import { EncryptedStore, EncryptedStoreKey } from '@/utils/storage/EncryptedStore';

// Store email
await EncryptedStore.set(EncryptedStoreKey.USER_EMAIL, 'user@example.com');

// Retrieve email
const email = await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL);

// Store multiple
await EncryptedStore.setMultiple([
{ key: EncryptedStoreKey.USER_EMAIL, value: 'user@example.com' },
{ key: EncryptedStoreKey.USER_FULL_NAME, value: 'Warren de Leon' },
]);

// Clear all (logout)
await EncryptedStore.clear();
\`\`\`

---

### Tier 3: AsyncStorage (Plain Text)

**Library**: `@react-native-async-storage/async-storage`

**Security**: No encryption, plain text, lowest security

**Use for**:

- ✅ Theme preference (light/dark)
- ✅ Language selection (en/es)
- ✅ Redux Persist state (non-PII)
- ✅ Last selected tab

**DO NOT use for**:

- ❌ Auth tokens (CRITICAL - use SecureStore)
- ❌ User PII (email, name, etc. - use EncryptedStore)
- ❌ Passwords (NEVER store passwords anywhere)

**API** (via Redux Persist):
\`\`\`typescript
// Configure in src/redux/store.ts
const persistConfig = {
key: 'root',
storage: AsyncStorage, // Uses AsyncStorage
whitelist: ['settings', 'ui'], // Only non-sensitive slices
blacklist: ['auth'], // NEVER persist auth slice (has tokens)
};
\`\`\`

---

## Data Classification Guide

| Data Type            | Tier 1 (SecureStore) | Tier 2 (EncryptedStore) | Tier 3 (AsyncStorage) |
| -------------------- | -------------------- | ----------------------- | --------------------- |
| Access Token         | ✅                   | ❌                      | ❌                    |
| Refresh Token        | ✅                   | ❌                      | ❌                    |
| Hashed PIN           | ✅                   | ❌                      | ❌                    |
| Biometric Preference | ✅                   | ❌                      | ❌                    |
| User Email           | ❌                   | ✅                      | ❌                    |
| User Name            | ❌                   | ✅                      | ❌                    |
| Profile Picture URL  | ❌                   | ✅                      | ❌                    |
| Theme Preference     | ❌                   | ❌                      | ✅                    |
| Language             | ❌                   | ❌                      | ✅                    |
| Last Selected Tab    | ❌                   | ❌                      | ✅                    |

---

## Security Best Practices

1. **NEVER store tokens in AsyncStorage** - Always use SecureStore
2. **NEVER store passwords** - Even hashed, use Keychain only
3. **Validate before storing** - Use Yup/Zod to validate data structure
4. **Mask sensitive logs** - Never log tokens, PINs, or PII
5. **Clear on logout** - Clear all tiers when user logs out
6. **Test on devices** - Storage behaves differently on simulators vs devices
7. **Handle errors gracefully** - Storage operations can fail (device locked, storage full)

---

## Logout Sequence

When user logs out, clear all tiers:

\`\`\`typescript
// 1. Clear Tier 1 (SecureStore)
await SecureStore.clear();

// 2. Clear Tier 2 (EncryptedStore)
await EncryptedStore.clear();

// 3. Clear Tier 3 (AsyncStorage) - Only auth-related data
await AsyncStorage.multiRemove(['lastLoginTimestamp', 'authMethod']);

// 4. Clear Redux state
dispatch(logout());
\`\`\`
```

**Save file**.

---

## Files Created

```
src/utils/storage/
├── SecureStore.ts           # Created - Tier 1 (Keychain) utility
├── EncryptedStore.ts        # Created - Tier 2 (Encrypted Storage) utility
└── README.md                # Created - 3-tier architecture documentation
```

---

## Validation

### Unit Tests (100% Coverage Required)

Create `/Users/warrendeleon/Developer/warrendeleon/src/utils/storage/__tests__/SecureStore.test.ts`:

```typescript
import { SecureStore, SecureStoreKey } from '../SecureStore';
import * as Keychain from 'react-native-keychain';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('set', () => {
    it('should store a key-value pair in Keychain', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'test_token');

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStoreKey.ACCESS_TOKEN,
        'test_token',
        expect.objectContaining({
          service: 'com.warrendeleon.portfolio',
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
    it('should retrieve a value from Keychain', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        username: SecureStoreKey.ACCESS_TOKEN,
        password: 'test_token',
      });

      const value = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(value).toBe('test_token');
    });

    it('should return null if key not found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      const value = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

      expect(value).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a key from Keychain', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all Keychain data', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      const result = await SecureStore.clear();

      expect(result).toBe(true);
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
  });
});
```

**Similar tests required for EncryptedStore** (create EncryptedStore.test.ts).

**Run tests**:

```bash
yarn test src/utils/storage
```

**Expected**: 100% coverage, all tests passing.

---

## Troubleshooting

### Issue 1: "Could not find Keychain module" on Android

**Cause**: Auto-linking failed.

**Fix**:

```bash
cd android
./gradlew clean
cd ..
yarn android
```

### Issue 2: Keychain Access Denied on iOS

**Cause**: Missing Keychain Sharing entitlement.

**Fix**: Complete TASK-190 (iOS Security Hardening) to add Keychain entitlements.

### Issue 3: Encrypted Storage Returns Null

**Cause**: Data cleared or never set.

**Fix**: Always check for null values and handle gracefully:

```typescript
const email = (await EncryptedStore.get(EncryptedStoreKey.USER_EMAIL)) ?? 'unknown@example.com';
```

---

## Security Checklist

- [ ] **SecureStore** never stores plain text passwords
- [ ] **EncryptedStore** never stores tokens
- [ ] **AsyncStorage** never stores PII or tokens
- [ ] **All storage operations** have error handling
- [ ] **Logout clears** all three tiers
- [ ] **100% test coverage** for all utilities
- [ ] **Documentation** complete (README.md)

---

## Dependencies

### Depends On (Blockers)

**TASK-190**: iOS Security Hardening (Keychain entitlements)

### Blocks (Dependent Tasks)

- **TASK-192**: Supabase Auth REST API Client (needs SecureStore for tokens)
- **TASK-196**: Redux Auth Slice (needs EncryptedStore for user data)
- **TASK-210**: BiometricSetupScreen (needs SecureStore for biometric preference)

---

## Additional Resources

- [react-native-keychain Documentation](https://github.com/oblador/react-native-keychain)
- [react-native-encrypted-storage Documentation](https://github.com/emeraldsanto/react-native-encrypted-storage)
- [Project Security Standards](../../readme/SECURITY.md)

---

**Estimated Time**: 3 hours

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-21

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

```typescript
import { SecureStore, SecureStoreKey } from '@/utils/storage/SecureStore';

// Store token
await SecureStore.set(SecureStoreKey.ACCESS_TOKEN, 'jwt_token_here');

// Retrieve token
const token = await SecureStore.get(SecureStoreKey.ACCESS_TOKEN);

// Remove token
await SecureStore.remove(SecureStoreKey.ACCESS_TOKEN);

// Clear all (logout)
await SecureStore.clear();
```

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

```typescript
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
```

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

```typescript
// Configure in src/redux/store.ts
const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // Uses AsyncStorage
  whitelist: ['settings', 'ui'], // Only non-sensitive slices
  blacklist: ['auth'], // NEVER persist auth slice (has tokens)
};
```

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

```typescript
// 1. Clear Tier 1 (SecureStore)
await SecureStore.clear();

// 2. Clear Tier 2 (EncryptedStore)
await EncryptedStore.clear();

// 3. Clear Tier 3 (AsyncStorage) - Only auth-related data
await AsyncStorage.multiRemove(['lastLoginTimestamp', 'authMethod']);

// 4. Clear Redux state
dispatch(logout());
```

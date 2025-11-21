# TASK-325: Data Storage Testing

**ID**: TASK-325 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Conduct penetration testing for data storage security. Verify 3-tier storage architecture (Keychain, EncryptedStorage, AsyncStorage), test encryption implementation, validate data classification, and ensure no sensitive data leakage in logs, cache, or backups.

---

## Acceptance Criteria

- [ ] 3-tier storage architecture verified
- [ ] Keychain security tested (iOS/Android)
- [ ] EncryptedStorage implementation validated
- [ ] AsyncStorage data classification verified
- [ ] Encryption strength tested
- [ ] Data remnants in cache/temp checked
- [ ] Backup security validated
- [ ] Log sanitization verified
- [ ] All vulnerabilities documented

---

## Data Storage Security Test Plan

### 1. 3-Tier Storage Architecture Verification

#### Test 1.1: Storage Tier Classification

**Objective**: Verify sensitive data stored in correct tier

**Test Steps**:

```typescript
// src/services/storage/__tests__/StorageTier.security.test.ts

import { SecureStorageService } from '../SecureStorageService';
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('3-Tier Storage Architecture', () => {
  afterEach(async () => {
    // Clean up all storage
    await Keychain.resetGenericPassword();
    await EncryptedStorage.clear();
    await AsyncStorage.clear();
  });

  describe('Tier 1: Keychain (Critical Secrets)', () => {
    it('should store access token in Keychain only', async () => {
      const token = 'test-access-token-123';
      await SecureStorageService.setAccessToken(token);

      // ✅ Should be in Keychain
      const keychainData = await Keychain.getGenericPassword({
        service: 'supabase_access_token',
      });
      expect(keychainData.password).toBe(token);

      // ❌ Should NOT be in EncryptedStorage
      const encryptedData = await EncryptedStorage.getItem('access_token');
      expect(encryptedData).toBeNull();

      // ❌ Should NOT be in AsyncStorage
      const asyncData = await AsyncStorage.getItem('access_token');
      expect(asyncData).toBeNull();
    });

    it('should store refresh token in Keychain only', async () => {
      const token = 'test-refresh-token-456';
      await SecureStorageService.setRefreshToken(token);

      const keychainData = await Keychain.getGenericPassword({
        service: 'supabase_refresh_token',
      });
      expect(keychainData.password).toBe(token);
    });

    it('should store encryption key in Keychain only', async () => {
      const key = await SecureStorageService.getEncryptionKey();

      const keychainData = await Keychain.getGenericPassword({
        service: 'encryption_master_key',
      });
      expect(keychainData.password).toBe(key);
    });

    it('should store PIN hash in Keychain only', async () => {
      const pinHash = await SecureStorageService.getPINHash();

      const keychainData = await Keychain.getGenericPassword({
        service: 'pin_hash',
      });
      expect(keychainData).toBeTruthy();
    });
  });

  describe('Tier 2: EncryptedStorage (PII)', () => {
    it('should store user profile in EncryptedStorage only', async () => {
      const profile = {
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
      };

      await SecureStorageService.setUserProfile(profile);

      // ✅ Should be in EncryptedStorage
      const encryptedData = await EncryptedStorage.getItem('user_profile');
      expect(encryptedData).toBeTruthy();

      // Verify it's encrypted (not plaintext)
      expect(encryptedData).not.toContain('user@example.com');

      // ❌ Should NOT be in AsyncStorage
      const asyncData = await AsyncStorage.getItem('user_profile');
      expect(asyncData).toBeNull();

      // ❌ Should NOT be in Keychain
      const keychainData = await Keychain.getGenericPassword({
        service: 'user_profile',
      });
      expect(keychainData).toBeFalsy();
    });

    it('should encrypt all PII fields', async () => {
      const pii = {
        ssn: '123-45-6789',
        creditCard: '4111111111111111',
        address: '123 Main St, City, State',
      };

      await SecureStorageService.setPII('sensitive_data', pii);

      // Get raw encrypted data
      const encrypted = await EncryptedStorage.getItem('sensitive_data');

      // Verify none of the PII is readable
      expect(encrypted).not.toContain('123-45-6789');
      expect(encrypted).not.toContain('4111111111111111');
      expect(encrypted).not.toContain('123 Main St');
    });
  });

  describe('Tier 3: AsyncStorage (Non-Sensitive)', () => {
    it('should store UI preferences in AsyncStorage only', async () => {
      const prefs = {
        theme: 'dark',
        language: 'en',
        notificationsEnabled: true,
      };

      await SecureStorageService.setUIPreferences(prefs);

      // ✅ Should be in AsyncStorage
      const asyncData = await AsyncStorage.getItem('ui_preferences');
      expect(JSON.parse(asyncData)).toEqual(prefs);

      // ❌ Should NOT be in EncryptedStorage
      const encryptedData = await EncryptedStorage.getItem('ui_preferences');
      expect(encryptedData).toBeNull();

      // ❌ Should NOT be in Keychain
      const keychainData = await Keychain.getGenericPassword({
        service: 'ui_preferences',
      });
      expect(keychainData).toBeFalsy();
    });

    it('should NOT store any PII in AsyncStorage', async () => {
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);

      // Check for common PII patterns
      const piiPatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
        /\+?[1-9]\d{1,14}/, // Phone
        /\d{3}-\d{2}-\d{4}/, // SSN
        /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/, // Credit card
      ];

      for (const [key, value] of allData) {
        if (!value) continue;

        for (const pattern of piiPatterns) {
          expect(value).not.toMatch(pattern);
        }
      }
    });
  });

  describe('Data Classification Enforcement', () => {
    it('should classify data correctly', () => {
      const testData = {
        accessToken: 'token123', // Keychain
        refreshToken: 'refresh456', // Keychain
        email: 'user@example.com', // EncryptedStorage
        phone: '+1234567890', // EncryptedStorage
        theme: 'dark', // AsyncStorage
        language: 'en', // AsyncStorage
      };

      const classification = SecureStorageService.classifyData(testData);

      expect(classification).toEqual({
        keychain: ['accessToken', 'refreshToken'],
        encrypted: ['email', 'phone'],
        async: ['theme', 'language'],
      });
    });

    it('should throw error when storing PII in wrong tier', async () => {
      await expect(AsyncStorage.setItem('email', 'user@example.com')).rejects.toThrow(
        'PII cannot be stored in AsyncStorage'
      );
    });
  });
});
```

---

### 2. Keychain Security Testing

#### Test 2.1: Hardware-Backed Storage (iOS)

**Objective**: Verify Keychain uses hardware-backed secure enclave when available

**Test Steps**:

```typescript
// src/services/storage/__tests__/KeychainSecurity.security.test.ts

describe('Keychain Security (iOS)', () => {
  it('should use hardware-backed security when available', async () => {
    const token = 'test-token';

    await Keychain.setGenericPassword('username', token, {
      service: 'test_service',
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // On devices with Secure Enclave, this should be hardware-backed
    // Can verify via native logs or device capabilities
    const capabilities = await Keychain.getSupportedBiometryType();
    if (capabilities) {
      // Device supports biometry, likely has Secure Enclave
      expect(capabilities).toBeTruthy();
    }
  });

  it('should require device unlock to access Keychain', async () => {
    await Keychain.setGenericPassword('username', 'password', {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // On locked device, this should fail
    // (Requires manual testing on physical device)
  });

  it('should invalidate Keychain on passcode removal', async () => {
    // Set item with authentication requirement
    await Keychain.setGenericPassword('username', 'password', {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
    });

    // If user removes device passcode, Keychain item should be invalidated
    // (Requires manual testing - simulate passcode removal)
  });
});
```

---

#### Test 2.2: Android Keystore Security

**Objective**: Verify Android Keystore uses hardware-backed storage

**Test Steps**:

```typescript
describe('Keychain Security (Android)', () => {
  it('should use Android Keystore for keys', async () => {
    const key = await SecureStorageService.getEncryptionKey();

    // On Android, encryption key should be generated in Keystore
    // and never exported

    // Verify key exists in Keystore
    // (Native implementation verification)
  });

  it('should use hardware-backed keystore when available', async () => {
    // Check if device has hardware-backed keystore
    // StrongBox (Android 9+) or TEE (Trusted Execution Environment)
    // Manual verification via:
    // adb shell getprop ro.hardware.keystore
  });

  it('should require lock screen to access keys', async () => {
    await Keychain.setGenericPassword('username', 'password', {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
    });

    // On unlocked device, should succeed
    const result = await Keychain.getGenericPassword();
    expect(result).toBeTruthy();

    // On locked device, should require authentication
    // (Manual testing required)
  });
});
```

---

### 3. Encryption Implementation Testing

#### Test 3.1: Encryption Strength

**Objective**: Verify AES-256-GCM encryption with proper key derivation

**Test Steps**:

```typescript
// src/services/storage/__tests__/EncryptionStrength.security.test.ts

import { EncryptionService } from '../EncryptionService';

describe('Encryption Implementation', () => {
  describe('Algorithm Strength', () => {
    it('should use AES-256-GCM', () => {
      const algorithm = EncryptionService.getAlgorithm();
      expect(algorithm).toBe('aes-256-gcm');
    });

    it('should use 256-bit keys', async () => {
      const key = await EncryptionService.generateKey();

      // 256 bits = 32 bytes = 64 hex characters
      expect(key.length).toBe(64);
    });

    it('should include authentication tag (GCM)', async () => {
      const plaintext = 'sensitive data';
      const encrypted = await EncryptionService.encrypt(plaintext);

      // GCM format: IV:ciphertext:authTag
      const parts = encrypted.split(':');
      expect(parts.length).toBe(3);

      const [iv, ciphertext, authTag] = parts;
      expect(iv).toBeTruthy();
      expect(ciphertext).toBeTruthy();
      expect(authTag).toBeTruthy();
    });
  });

  describe('IV (Initialization Vector)', () => {
    it('should generate unique IV for each encryption', async () => {
      const plaintext = 'test data';

      const encrypted1 = await EncryptionService.encrypt(plaintext);
      const encrypted2 = await EncryptionService.encrypt(plaintext);

      // IVs should be different
      const iv1 = encrypted1.split(':')[0];
      const iv2 = encrypted2.split(':')[0];
      expect(iv1).not.toBe(iv2);
    });

    it('should use cryptographically secure random IV', async () => {
      const encrypted = await EncryptionService.encrypt('test');
      const iv = encrypted.split(':')[0];

      // IV should be 12 bytes for GCM (24 hex characters)
      expect(iv.length).toBe(24);

      // Should not be all zeros or predictable
      expect(iv).not.toBe('000000000000000000000000');
    });
  });

  describe('Authentication Tag Validation', () => {
    it('should detect tampering via auth tag', async () => {
      const plaintext = 'sensitive data';
      const encrypted = await EncryptionService.encrypt(plaintext);

      // Tamper with ciphertext
      const parts = encrypted.split(':');
      parts[1] = parts[1].replace('a', 'b'); // Change one character
      const tampered = parts.join(':');

      // Decryption should fail
      await expect(EncryptionService.decrypt(tampered)).rejects.toThrow('Decryption failed');
    });

    it('should detect IV tampering', async () => {
      const encrypted = await EncryptionService.encrypt('data');

      // Tamper with IV
      const parts = encrypted.split(':');
      parts[0] = '000000000000000000000000'; // Replace IV
      const tampered = parts.join(':');

      await expect(EncryptionService.decrypt(tampered)).rejects.toThrow();
    });

    it('should detect auth tag tampering', async () => {
      const encrypted = await EncryptionService.encrypt('data');

      // Tamper with auth tag
      const parts = encrypted.split(':');
      parts[2] = parts[2].replace('a', 'b');
      const tampered = parts.join(':');

      await expect(EncryptionService.decrypt(tampered)).rejects.toThrow();
    });
  });

  describe('Key Derivation', () => {
    it('should use PBKDF2 for key derivation', () => {
      const config = EncryptionService.getKDFConfig();

      expect(config.algorithm).toBe('pbkdf2');
      expect(config.iterations).toBeGreaterThanOrEqual(10000);
      expect(config.hashFunction).toBe('sha256');
    });

    it('should use unique salt for each user', async () => {
      const salt1 = await EncryptionService.generateSalt('user1');
      const salt2 = await EncryptionService.generateSalt('user2');

      expect(salt1).not.toBe(salt2);
    });

    it('should derive same key from same password+salt', async () => {
      const password = 'TestPassword123!';
      const salt = await EncryptionService.generateSalt('user1');

      const key1 = await EncryptionService.deriveKey(password, salt);
      const key2 = await EncryptionService.deriveKey(password, salt);

      expect(key1).toBe(key2);
    });
  });
});
```

---

### 4. Data Remnants Testing

#### Test 4.1: Cache and Temporary Files

**Objective**: Verify no sensitive data in cache/temp directories

**Test Steps**:

```bash
# scripts/security/check-remnants.sh

#!/bin/bash

echo "Checking for data remnants..."

# iOS Simulator
IOS_DATA_DIR="$HOME/Library/Developer/CoreSimulator/Devices"

# Android Emulator
ANDROID_DATA_DIR="$HOME/.android/avd"

# Check for common PII patterns in cache
check_for_pii() {
  local dir=$1

  echo "Scanning $dir..."

  # Search for email addresses
  grep -r -E '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b' "$dir" 2>/dev/null

  # Search for phone numbers
  grep -r -E '\+?[1-9]\d{1,14}' "$dir" 2>/dev/null

  # Search for tokens
  grep -r -E 'eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*' "$dir" 2>/dev/null

  # Search for SSN
  grep -r -E '\d{3}-\d{2}-\d{4}' "$dir" 2>/dev/null
}

# Check iOS cache
if [ -d "$IOS_DATA_DIR" ]; then
  check_for_pii "$IOS_DATA_DIR/*/data/Containers/Data/Application/*/Library/Caches"
fi

# Check Android cache
if [ -d "$ANDROID_DATA_DIR" ]; then
  check_for_pii "$ANDROID_DATA_DIR/*/data/data/com.warrendeleon/cache"
fi

echo "✅ Remnant check complete"
```

---

#### Test 4.2: Screenshot Protection

**Objective**: Verify sensitive screens obscured in app switcher

**Test Steps**:

```typescript
// src/screens/__tests__/ScreenshotProtection.security.test.ts

describe('Screenshot Protection', () => {
  it('should mark sensitive screens as secure', () => {
    // On Android, FLAG_SECURE should be set
    // On iOS, implement willResignActive handler

    // Check if PINEntryScreen has protection
    const pinScreen = render(<PINEntryScreen />);

    // Platform-specific verification
    if (Platform.OS === 'android') {
      // Verify FLAG_SECURE set in native code
    } else {
      // Verify blur overlay shown on iOS
    }
  });

  it('should blur sensitive content in app switcher', async () => {
    // Navigate to profile screen (contains PII)
    navigation.navigate('Profile');

    // Simulate app backgrounding
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        // Capture what's shown in app switcher
        // Should be blurred or placeholder
      }
    });
  });
});
```

---

### 5. Backup Security Testing

#### Test 5.1: iCloud Backup Exclusion

**Objective**: Verify sensitive data excluded from iOS backups

**Test Steps**:

```typescript
// src/services/storage/__tests__/BackupSecurity.security.test.ts

describe('Backup Security', () => {
  it('should exclude Keychain from backups (iOS)', async () => {
    await Keychain.setGenericPassword('username', 'password', {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    // Items with THIS_DEVICE_ONLY are not backed up to iCloud
  });

  it('should exclude EncryptedStorage from backups', async () => {
    // Check file protection attributes
    // On iOS: NSFileProtectionComplete
    // On Android: allowBackup="false" in manifest
  });

  it('should mark sensitive files as non-backed-up', () => {
    // Verify Info.plist or AndroidManifest.xml
    // iOS: Add files to .nobackup directory
    // Android: android:allowBackup="false"
  });
});
```

---

### 6. Log Sanitization Testing

#### Test 6.1: Sensitive Data in Logs

**Objective**: Verify no PII or tokens in console logs

**Test Steps**:

```typescript
// src/utils/__tests__/LogSanitization.security.test.ts

import { Logger } from '../Logger';

describe('Log Sanitization', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should sanitize email addresses from logs', () => {
    Logger.info('User logged in', { email: 'user@example.com' });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
    expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('user@example.com'));
  });

  it('should sanitize tokens from logs', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.abc123';

    Logger.error('API error', { token });

    expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining(token));
  });

  it('should sanitize phone numbers from logs', () => {
    Logger.info('Profile updated', { phone: '+1234567890' });

    expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('+1234567890'));
  });

  it('should sanitize credit card numbers', () => {
    Logger.warn('Payment processing', { card: '4111111111111111' });

    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('4111111111111111'));
  });

  it('should allow non-sensitive data in logs', () => {
    Logger.info('User action', { action: 'button_click', screen: 'home' });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('button_click'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('home'));
  });
});
```

---

## Manual Testing Procedures

### Test Procedure 1: Extract App Data

**Tools**: iMazing (iOS), adb (Android)

**iOS Steps**:

```bash
# Extract app container
ideviceinstaller -l  # List installed apps
ideviceinstaller -U com.warrendeleon  # Get app bundle ID

# Pull app data
# Use iMazing GUI to extract app data folder

# Analyze extracted data
cd ~/Desktop/extracted-data
find . -type f -name "*.plist" -exec cat {} \;
find . -type f -name "*.sqlite" -exec sqlite3 {} ".dump" \;
```

**Android Steps**:

```bash
# Backup app data
adb backup -f backup.ab -noapk com.warrendeleon

# Convert backup to tar
dd if=backup.ab bs=1 skip=24 | python -c "import zlib,sys;sys.stdout.write(zlib.decompress(sys.stdin.read()))" > backup.tar

# Extract tar
tar -xvf backup.tar

# Search for sensitive data
grep -r "email\|phone\|token" .
```

**Expected**: No plaintext PII or tokens in extracted data

---

### Test Procedure 2: Memory Dump Analysis

**Tools**: Frida, memory dumper

**Steps**:

```bash
# Attach to running app
frida -U -n "warrendeleon"

# Dump memory
frida-trace -U -n "warrendeleon" -o memory.log

# Search memory for sensitive data
grep -i "password\|token\|email" memory.log
```

**Expected**: Sensitive data encrypted in memory or zeroed after use

---

## Reporting Template

```markdown
## Data Storage Security Test Report

**Test Date**: 2025-11-21
**Tester**: [Name]

---

### Summary

| Test Category       | Result     | Risk   |
| ------------------- | ---------- | ------ |
| 3-Tier Architecture | ✅ Pass    | Low    |
| Keychain Security   | ✅ Pass    | Low    |
| Encryption Strength | ✅ Pass    | Low    |
| Data Remnants       | ⚠️ Partial | Medium |
| Backup Security     | ✅ Pass    | Low    |
| Log Sanitization    | ✅ Pass    | Low    |

**Overall Risk**: ⚠️ Medium

---

### Findings

#### Finding: Sensitive Data in Cache

**Severity**: Medium
**Details**: Email addresses found in HTTP cache
**Remediation**: Disable caching for API responses containing PII
```

---

## Definition of Done

- [ ] 3-tier storage architecture verified
- [ ] Keychain security tested
- [ ] EncryptedStorage implementation validated
- [ ] Encryption strength confirmed (AES-256-GCM)
- [ ] Data remnants testing complete
- [ ] Backup exclusion verified
- [ ] Log sanitization validated
- [ ] Manual data extraction tests complete
- [ ] All findings documented
- [ ] Test report generated

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-324](TASK-324-authentication-testing.md)

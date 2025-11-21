# TASK-320: OWASP M6-M10 Audit

**ID**: TASK-320 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2.5h

---

## Task Description

Conduct security audit for OWASP Mobile Top 10 vulnerabilities M6-M10: Inadequate Privacy Controls, Insufficient Binary Protections, Security Misconfiguration, Insecure Data Storage, and Insufficient Cryptography.

---

## Acceptance Criteria

- [ ] M6: Inadequate Privacy Controls audited
- [ ] M7: Insufficient Binary Protections audited
- [ ] M8: Security Misconfiguration audited
- [ ] M9: Insecure Data Storage audited
- [ ] M10: Insufficient Cryptography audited
- [ ] Findings documented with severity levels
- [ ] Remediation recommendations provided
- [ ] Test cases for verification created

---

## Audit Checklist

### M6: Inadequate Privacy Controls

#### Privacy Policy Implementation

- [ ] Privacy policy accessible within app
- [ ] Privacy policy version tracking
- [ ] User consent management system
- [ ] Data collection disclosure
- [ ] Third-party data sharing disclosure
- [ ] Data retention policies documented
- [ ] User data deletion capabilities

#### User Consent Management

```typescript
// src/services/privacy/ConsentManager.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: string;
  version: string; // Privacy policy version
}

export type ConsentType =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'third_party_sharing'
  | 'location'
  | 'camera'
  | 'notifications';

export class ConsentManager {
  private static readonly CONSENT_KEY = '@consent_records';
  private static readonly POLICY_VERSION = '2.0.0';

  /**
   * Request user consent for specific data usage
   */
  static async requestConsent(userId: string, consentType: ConsentType): Promise<ConsentRecord> {
    // Display consent dialog
    const granted = await this.showConsentDialog(consentType);

    const record: ConsentRecord = {
      userId,
      consentType,
      granted,
      timestamp: new Date().toISOString(),
      version: this.POLICY_VERSION,
    };

    await this.saveConsentRecord(record);
    return record;
  }

  /**
   * Check if user has granted consent
   */
  static async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const records = await this.getConsentRecords(userId);
    const record = records.find(r => r.consentType === consentType);

    if (!record) return false;
    if (record.version !== this.POLICY_VERSION) return false; // Policy updated, need new consent
    return record.granted;
  }

  /**
   * Revoke user consent
   */
  static async revokeConsent(userId: string, consentType: ConsentType): Promise<void> {
    const record: ConsentRecord = {
      userId,
      consentType,
      granted: false,
      timestamp: new Date().toISOString(),
      version: this.POLICY_VERSION,
    };

    await this.saveConsentRecord(record);
    await this.deleteRelatedData(userId, consentType);
  }

  /**
   * Get all consent records for user
   */
  static async getConsentRecords(userId: string): Promise<ConsentRecord[]> {
    try {
      const json = await AsyncStorage.getItem(this.CONSENT_KEY);
      if (!json) return [];

      const allRecords: ConsentRecord[] = JSON.parse(json);
      return allRecords.filter(r => r.userId === userId);
    } catch (error) {
      console.error('Failed to get consent records:', error);
      return [];
    }
  }

  /**
   * Save consent record
   */
  private static async saveConsentRecord(record: ConsentRecord): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(this.CONSENT_KEY);
      const allRecords: ConsentRecord[] = json ? JSON.parse(json) : [];

      // Remove old record for same user+type
      const filtered = allRecords.filter(
        r => !(r.userId === record.userId && r.consentType === record.consentType)
      );

      filtered.push(record);

      await AsyncStorage.setItem(this.CONSENT_KEY, JSON.stringify(filtered));

      // Log consent change to audit trail
      await this.logConsentChange(record);
    } catch (error) {
      console.error('Failed to save consent record:', error);
      throw error;
    }
  }

  /**
   * Delete data associated with revoked consent
   */
  private static async deleteRelatedData(userId: string, consentType: ConsentType): Promise<void> {
    switch (consentType) {
      case 'analytics':
        await this.deleteAnalyticsData(userId);
        break;
      case 'marketing':
        await this.deleteMarketingData(userId);
        break;
      case 'location':
        await this.deleteLocationData(userId);
        break;
      default:
        break;
    }
  }

  /**
   * Show consent dialog to user
   */
  private static async showConsentDialog(consentType: ConsentType): Promise<boolean> {
    // Implementation would show native alert/modal
    // Return true if user grants, false if denies
    return new Promise(resolve => {
      // Placeholder - actual implementation would use Alert or custom modal
      resolve(false);
    });
  }

  /**
   * Log consent change to audit trail
   */
  private static async logConsentChange(record: ConsentRecord): Promise<void> {
    // Send to backend audit log
    console.log('Consent change:', record);
  }

  private static async deleteAnalyticsData(userId: string): Promise<void> {
    // Implementation to delete analytics data
    console.log('Deleting analytics data for user:', userId);
  }

  private static async deleteMarketingData(userId: string): Promise<void> {
    // Implementation to delete marketing data
    console.log('Deleting marketing data for user:', userId);
  }

  private static async deleteLocationData(userId: string): Promise<void> {
    // Implementation to delete location data
    console.log('Deleting location data for user:', userId);
  }
}
```

#### Data Minimization Checks

- [ ] Collect only necessary data for functionality
- [ ] No excessive permission requests
- [ ] Clear justification for each data point collected
- [ ] Data retention periods defined and enforced
- [ ] Automatic data deletion after retention period

#### Privacy Controls UI

```typescript
// src/screens/settings/PrivacySettingsScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Switch, Alert } from 'react-native';
import { ConsentManager, ConsentType, ConsentRecord } from '@/services/privacy/ConsentManager';
import { useAuth } from '@/hooks/useAuth';

export const PrivacySettingsScreen: React.FC = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    if (!user) return;
    const records = await ConsentManager.getConsentRecords(user.id);
    setConsents(records);
    setLoading(false);
  };

  const toggleConsent = async (consentType: ConsentType, currentValue: boolean) => {
    if (!user) return;

    if (currentValue) {
      // Revoking consent - confirm first
      Alert.alert(
        'Revoke Consent',
        'This will delete all related data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Revoke',
            style: 'destructive',
            onPress: async () => {
              await ConsentManager.revokeConsent(user.id, consentType);
              await loadConsents();
            },
          },
        ]
      );
    } else {
      // Granting consent
      await ConsentManager.requestConsent(user.id, consentType);
      await loadConsents();
    }
  };

  const hasConsent = (type: ConsentType): boolean => {
    const record = consents.find((c) => c.consentType === type);
    return record?.granted ?? false;
  };

  return (
    <ScrollView>
      <View>
        <Text>Privacy Settings</Text>

        <View>
          <Text>Analytics</Text>
          <Switch
            value={hasConsent('analytics')}
            onValueChange={() => toggleConsent('analytics', hasConsent('analytics'))}
          />
        </View>

        <View>
          <Text>Marketing Communications</Text>
          <Switch
            value={hasConsent('marketing')}
            onValueChange={() => toggleConsent('marketing', hasConsent('marketing'))}
          />
        </View>

        <View>
          <Text>Location Tracking</Text>
          <Switch
            value={hasConsent('location')}
            onValueChange={() => toggleConsent('location', hasConsent('location'))}
          />
        </View>

        <View>
          <Text>Third-Party Data Sharing</Text>
          <Switch
            value={hasConsent('third_party_sharing')}
            onValueChange={() =>
              toggleConsent('third_party_sharing', hasConsent('third_party_sharing'))
            }
          />
        </View>
      </View>
    </ScrollView>
  );
};
```

---

### M7: Insufficient Binary Protections

#### Code Obfuscation

- [ ] ProGuard enabled for Android release builds
- [ ] R8 code shrinking enabled
- [ ] JavaScript bundle obfuscation (Metro config)
- [ ] Source maps NOT included in production builds
- [ ] Debug symbols stripped from binaries

**Android ProGuard Configuration**:

```proguard
# android/app/proguard-rules.pro

# Keep React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep application classes
-keep class com.warrendeleon.** { *; }

# Obfuscate everything else
-obfuscate
-repackageclasses
-allowaccessmodification

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
```

#### Jailbreak/Root Detection

```typescript
// src/services/security/DeviceIntegrityCheck.ts

import JailMonkey from 'jail-monkey';
import { Alert, Platform } from 'react-native';

export class DeviceIntegrityCheck {
  /**
   * Check if device is jailbroken (iOS) or rooted (Android)
   */
  static async checkDeviceSecurity(): Promise<boolean> {
    const isJailBroken = JailMonkey.isJailBroken();
    const canMockLocation = JailMonkey.canMockLocation();
    const isOnExternalStorage = Platform.OS === 'android' && JailMonkey.isOnExternalStorage();
    const isDebuggedMode = JailMonkey.isDebuggedMode();

    if (isJailBroken || canMockLocation || isOnExternalStorage || isDebuggedMode) {
      this.showSecurityWarning();
      return false;
    }

    return true;
  }

  /**
   * Check for debugger attached
   */
  static isDebuggerAttached(): boolean {
    return JailMonkey.isDebuggedMode();
  }

  /**
   * Check for running on emulator/simulator
   */
  static isEmulator(): boolean {
    // JailMonkey doesn't provide this, would need custom implementation
    return false;
  }

  /**
   * Show security warning to user
   */
  private static showSecurityWarning(): void {
    Alert.alert(
      'Security Warning',
      'This device appears to be jailbroken/rooted or running in an insecure environment. Some features may be disabled.',
      [{ text: 'OK' }]
    );
  }
}
```

#### Binary Hardening

- [ ] ASLR (Address Space Layout Randomization) enabled
- [ ] Stack canaries enabled
- [ ] DEP (Data Execution Prevention) enabled
- [ ] Position Independent Executables (PIE) enabled
- [ ] Code signing properly configured

#### Anti-Tampering Checks

```typescript
// src/services/security/IntegrityCheck.ts

import { NativeModules, Platform } from 'react-native';

export class IntegrityCheck {
  /**
   * Verify app signature matches expected signature
   */
  static async verifyAppSignature(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS code signing verification
      return true; // iOS enforces code signing at OS level
    } else {
      // Android signature verification
      const { SignatureChecker } = NativeModules;
      if (!SignatureChecker) return false;

      const expectedSignature = 'YOUR_RELEASE_SIGNATURE_HASH';
      const actualSignature = await SignatureChecker.getSignature();

      return actualSignature === expectedSignature;
    }
  }

  /**
   * Check if binary has been modified
   */
  static async checkBinaryIntegrity(): Promise<boolean> {
    // Check file hash matches expected
    // Implementation would use native modules
    return true;
  }
}
```

---

### M8: Security Misconfiguration

#### Build Configuration Audit

- [ ] Debug mode disabled in production builds
- [ ] Logging disabled in production
- [ ] Development servers not accessible in production
- [ ] Proper environment variable management
- [ ] No hardcoded secrets in config files

**Metro Configuration Security**:

```javascript
// metro.config.js

const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  return {
    ...config,
    transformer: {
      ...config.transformer,
      minifierConfig: {
        keep_classnames: false,
        keep_fnames: false,
        mangle: {
          toplevel: true,
        },
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
        },
      },
    },
  };
})();
```

#### Network Security Configuration

**Android Network Security Config**:

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->

<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <!-- Production configuration -->
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <!-- Trust system CAs -->
      <certificates src="system" />
    </trust-anchors>
  </base-config>

  <!-- Certificate pinning for Supabase -->
  <domain-config>
    <domain includeSubdomains="true">your-project.supabase.co</domain>
    <pin-set expiration="2026-01-01">
      <!-- SHA-256 hash of public key -->
      <pin digest="SHA-256">base64==</pin>
      <!-- Backup pin -->
      <pin digest="SHA-256">backup-base64==</pin>
    </pin-set>
  </domain-config>

  <!-- Debug configuration (debug builds only) -->
  <debug-overrides>
    <trust-anchors>
      <certificates src="user" />
    </trust-anchors>
  </debug-overrides>
</network-security-config>
```

#### Info.plist Security (iOS)

```xml
<!-- ios/warrendeleon/Info.plist -->

<!-- Disable arbitrary loads -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <false/>

  <!-- Exception domains (if needed) -->
  <key>NSExceptionDomains</key>
  <dict>
    <key>your-project.supabase.co</key>
    <dict>
      <key>NSExceptionRequiresForwardSecrecy</key>
      <true/>
      <key>NSExceptionMinimumTLSVersion</key>
      <string>TLSv1.2</string>
      <key>NSIncludesSubdomains</key>
      <true/>
      <key>NSThirdPartyExceptionRequiresForwardSecrecy</key>
      <true/>
    </dict>
  </dict>
</dict>

<!-- Disable screenshot in app switcher (optional) -->
<key>UIApplicationSupportsIndirectInputEvents</key>
<true/>
```

#### Environment Variable Security

- [ ] `.env` files in `.gitignore`
- [ ] Separate configs for dev/staging/prod
- [ ] No API keys in source code
- [ ] Runtime environment validation

```typescript
// src/config/env.ts

import Config from 'react-native-config';

export const ENV_CONFIG = {
  SUPABASE_URL: Config.SUPABASE_URL,
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY,
  API_BASE_URL: Config.API_BASE_URL,
  ENVIRONMENT: Config.ENVIRONMENT,
};

// Validate required environment variables
export function validateEnvConfig(): void {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'API_BASE_URL'];

  const missing = required.filter(key => !ENV_CONFIG[key as keyof typeof ENV_CONFIG]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate URLs are HTTPS in production
  if (ENV_CONFIG.ENVIRONMENT === 'production') {
    if (!ENV_CONFIG.SUPABASE_URL?.startsWith('https://')) {
      throw new Error('SUPABASE_URL must use HTTPS in production');
    }
    if (!ENV_CONFIG.API_BASE_URL?.startsWith('https://')) {
      throw new Error('API_BASE_URL must use HTTPS in production');
    }
  }
}

// Run validation on app start
validateEnvConfig();
```

---

### M9: Insecure Data Storage

#### Storage Security Audit

- [ ] **Keychain (iOS) / Keystore (Android)**: Tokens, encryption keys, PIN hashes
- [ ] **Encrypted Storage**: PII (name, email, phone, DOB)
- [ ] **AsyncStorage**: ONLY non-sensitive UI state
- [ ] No sensitive data in app logs
- [ ] No sensitive data in crash reports
- [ ] Clipboard cleared after sensitive copy operations

#### Secure Storage Implementation Verification

```typescript
// src/services/storage/__tests__/SecureStorage.test.ts

import { SecureStorageService } from '../SecureStorageService';
import * as Keychain from 'react-native-keychain';
import { EncryptedStorage } from '../EncryptedStorage';

describe('SecureStorageService - M9 Audit', () => {
  describe('Access Token Storage', () => {
    it('should store access token in Keychain only', async () => {
      const token = 'test-access-token';
      await SecureStorageService.setAccessToken(token);

      // Verify stored in Keychain
      const keychainCreds = await Keychain.getGenericPassword({
        service: 'supabase_access_token',
      });
      expect(keychainCreds).toBeTruthy();
      expect(keychainCreds.password).toBe(token);

      // Verify NOT in AsyncStorage
      const asyncValue = await AsyncStorage.getItem('access_token');
      expect(asyncValue).toBeNull();

      // Verify NOT in EncryptedStorage
      const encryptedValue = await EncryptedStorage.getItem('access_token');
      expect(encryptedValue).toBeNull();
    });
  });

  describe('PII Storage', () => {
    it('should store PII in EncryptedStorage only', async () => {
      const pii = { email: 'user@example.com', phone: '+1234567890' };
      await SecureStorageService.setUserProfile(pii);

      // Verify stored in EncryptedStorage
      const encrypted = await EncryptedStorage.getItem('user_profile');
      expect(encrypted).toBeTruthy();

      // Verify NOT in AsyncStorage
      const asyncValue = await AsyncStorage.getItem('user_profile');
      expect(asyncValue).toBeNull();

      // Verify NOT in Keychain
      const keychainCreds = await Keychain.getGenericPassword({
        service: 'user_profile',
      });
      expect(keychainCreds).toBeFalsy();
    });
  });

  describe('UI State Storage', () => {
    it('should store non-sensitive UI state in AsyncStorage only', async () => {
      const uiState = { theme: 'dark', language: 'en' };
      await SecureStorageService.setUIState(uiState);

      // Verify stored in AsyncStorage
      const asyncValue = await AsyncStorage.getItem('ui_state');
      expect(asyncValue).toBe(JSON.stringify(uiState));

      // Verify NOT in EncryptedStorage
      const encrypted = await EncryptedStorage.getItem('ui_state');
      expect(encrypted).toBeNull();

      // Verify NOT in Keychain
      const keychainCreds = await Keychain.getGenericPassword({
        service: 'ui_state',
      });
      expect(keychainCreds).toBeFalsy();
    });
  });

  describe('Data Classification Compliance', () => {
    it('should enforce 3-tier storage architecture', async () => {
      const classification = SecureStorageService.classifyData({
        accessToken: 'token123',
        email: 'user@example.com',
        theme: 'dark',
      });

      expect(classification).toEqual({
        keychain: ['accessToken'],
        encrypted: ['email'],
        async: ['theme'],
      });
    });
  });

  describe('Log Sanitization', () => {
    it('should sanitize sensitive data from logs', () => {
      const logMessage = 'User email: user@example.com, token: abc123xyz';
      const sanitized = SecureStorageService.sanitizeLog(logMessage);

      expect(sanitized).not.toContain('user@example.com');
      expect(sanitized).not.toContain('abc123xyz');
      expect(sanitized).toContain('[REDACTED]');
    });
  });
});
```

#### Clipboard Security

```typescript
// src/utils/secureClipboard.ts

import Clipboard from '@react-native-clipboard/clipboard';

export class SecureClipboard {
  /**
   * Copy sensitive data with auto-clear after timeout
   */
  static async copySensitive(text: string, clearAfterMs: number = 60000): Promise<void> {
    Clipboard.setString(text);

    // Clear clipboard after timeout
    setTimeout(() => {
      this.clearIfMatches(text);
    }, clearAfterMs);
  }

  /**
   * Clear clipboard only if content matches
   */
  private static async clearIfMatches(expectedContent: string): Promise<void> {
    const current = await Clipboard.getString();
    if (current === expectedContent) {
      Clipboard.setString(''); // Clear clipboard
    }
  }
}
```

---

### M10: Insufficient Cryptography

#### Encryption Standards Verification

- [ ] **AES-256-GCM** for data encryption (authenticated encryption)
- [ ] **bcrypt** for password/PIN hashing (cost factor 10)
- [ ] **RSA-2048** or **ECDSA P-256** for key exchange
- [ ] **TLS 1.2+** for network communication
- [ ] **PBKDF2** with 10,000+ iterations for key derivation
- [ ] No custom crypto implementations
- [ ] Use battle-tested libraries only

#### Crypto Implementation Audit

```typescript
// src/services/security/__tests__/CryptoService.test.ts

import { CryptoService } from '../CryptoService';
import { EncryptionKeyManager } from '../EncryptionKeyManager';

describe('CryptoService - M10 Audit', () => {
  describe('Encryption Algorithm', () => {
    it('should use AES-256-GCM', () => {
      const algorithm = CryptoService.getAlgorithm();
      expect(algorithm).toBe('aes-256-gcm');
    });

    it('should include authentication tag', async () => {
      const plaintext = 'sensitive data';
      const encrypted = await CryptoService.encrypt(plaintext);

      // GCM should produce: IV + ciphertext + authTag
      expect(encrypted.split(':').length).toBe(3);
    });

    it('should detect tampering via authentication tag', async () => {
      const plaintext = 'sensitive data';
      const encrypted = await CryptoService.encrypt(plaintext);

      // Tamper with ciphertext
      const parts = encrypted.split(':');
      parts[1] = parts[1].replace('a', 'b'); // Change one character
      const tampered = parts.join(':');

      await expect(CryptoService.decrypt(tampered)).rejects.toThrow();
    });
  });

  describe('Key Generation', () => {
    it('should use cryptographically secure random', async () => {
      const key1 = await EncryptionKeyManager.generateKey();
      const key2 = await EncryptionKeyManager.generateKey();

      // Keys should be unique
      expect(key1).not.toBe(key2);

      // Keys should be 256 bits (32 bytes = 64 hex characters)
      expect(key1.length).toBe(64);
    });

    it('should use hardware-backed keystore when available', async () => {
      const keyInfo = await EncryptionKeyManager.getKeyInfo();

      if (keyInfo.isHardwareBacked) {
        expect(keyInfo.isInsideSecureHardware).toBe(true);
      }
    });
  });

  describe('Password Hashing', () => {
    it('should use bcrypt with cost factor 10', async () => {
      const password = 'TestPassword123!';
      const hash = await CryptoService.hashPassword(password);

      // bcrypt hash format: $2a$10$... (cost factor 10)
      expect(hash).toMatch(/^\$2[aby]\$10\$/);
    });

    it('should produce unique salts', async () => {
      const password = 'TestPassword123!';
      const hash1 = await CryptoService.hashPassword(password);
      const hash2 = await CryptoService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should verify password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await CryptoService.hashPassword(password);

      const isValid = await CryptoService.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await CryptoService.verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Key Derivation', () => {
    it('should use PBKDF2 with 10,000+ iterations', async () => {
      const config = CryptoService.getKDFConfig();

      expect(config.algorithm).toBe('pbkdf2');
      expect(config.iterations).toBeGreaterThanOrEqual(10000);
      expect(config.keyLength).toBe(32); // 256 bits
    });
  });

  describe('Weak Crypto Detection', () => {
    it('should reject MD5 hashes', () => {
      expect(() => CryptoService.setHashAlgorithm('md5')).toThrow('Weak algorithm detected: md5');
    });

    it('should reject SHA1 hashes', () => {
      expect(() => CryptoService.setHashAlgorithm('sha1')).toThrow('Weak algorithm detected: sha1');
    });

    it('should reject DES encryption', () => {
      expect(() => CryptoService.setEncryptionAlgorithm('des')).toThrow(
        'Weak algorithm detected: des'
      );
    });

    it('should reject 3DES encryption', () => {
      expect(() => CryptoService.setEncryptionAlgorithm('3des')).toThrow(
        'Weak algorithm detected: 3des'
      );
    });
  });

  describe('Random Number Generation', () => {
    it('should use crypto.getRandomValues', () => {
      const random1 = CryptoService.getRandomBytes(32);
      const random2 = CryptoService.getRandomBytes(32);

      // Should be different
      expect(random1).not.toEqual(random2);

      // Should be correct length
      expect(random1.length).toBe(32);
    });

    it('should NOT use Math.random for security', () => {
      // This test ensures we never use Math.random for crypto operations
      const spy = jest.spyOn(Math, 'random');

      CryptoService.generateToken();

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
```

#### No Custom Crypto Policy

- [ ] Use `react-native-keychain` for secure storage
- [ ] Use `crypto.getRandomValues()` for random generation
- [ ] Use `bcrypt` or `scrypt` for password hashing
- [ ] Use native crypto libraries (CommonCrypto, AndroidKeyStore)
- [ ] NO custom implementations of cryptographic algorithms
- [ ] NO "roll your own crypto"

---

## Audit Findings Template

### Finding Format

````markdown
## Finding #[NUMBER]: [TITLE]

**Severity**: Critical / High / Medium / Low
**OWASP Category**: M6 | M7 | M8 | M9 | M10
**CVSS Score**: [0.0-10.0]

**Description**:
[Detailed description of the vulnerability]

**Affected Component**:

- File: `src/path/to/file.ts`
- Function: `functionName()`
- Line: 123-145

**Proof of Concept**:

```typescript
// Code demonstrating the vulnerability
```
````

**Impact**:

- Data exposure risk: [Low/Medium/High]
- Attack complexity: [Low/Medium/High]
- User interaction required: Yes/No
- Exploitability: [Low/Medium/High]

**Remediation**:

1. [Step 1 to fix]
2. [Step 2 to fix]
3. [Verification step]

**Verification Test**:

```typescript
// Test case to verify fix
```

**References**:

- OWASP Mobile Top 10 2024: [Link]
- CWE-XXX: [Link]

````

---

## Testing Requirements

### M6 Tests

```typescript
// src/services/privacy/__tests__/ConsentManager.test.ts

describe('M6: Inadequate Privacy Controls', () => {
  it('should track consent with version', async () => {
    const record = await ConsentManager.requestConsent('user123', 'analytics');
    expect(record.version).toBeDefined();
  });

  it('should invalidate consent when policy version changes', async () => {
    // Grant consent with version 1.0.0
    await ConsentManager.requestConsent('user123', 'marketing');

    // Simulate policy update to 2.0.0
    // ...

    // Old consent should be invalid
    const hasConsent = await ConsentManager.hasConsent('user123', 'marketing');
    expect(hasConsent).toBe(false);
  });

  it('should delete data when consent revoked', async () => {
    await ConsentManager.revokeConsent('user123', 'analytics');

    // Verify analytics data deleted
    const data = await getAnalyticsData('user123');
    expect(data).toBeNull();
  });
});
````

### M7 Tests

```typescript
// src/services/security/__tests__/DeviceIntegrityCheck.test.ts

describe('M7: Insufficient Binary Protections', () => {
  it('should detect jailbroken device', async () => {
    jest.spyOn(JailMonkey, 'isJailBroken').mockReturnValue(true);

    const isSecure = await DeviceIntegrityCheck.checkDeviceSecurity();
    expect(isSecure).toBe(false);
  });

  it('should detect debugger attached', () => {
    const isDebugging = DeviceIntegrityCheck.isDebuggerAttached();
    expect(typeof isDebugging).toBe('boolean');
  });

  it('should verify app signature', async () => {
    const isValid = await IntegrityCheck.verifyAppSignature();
    expect(isValid).toBe(true);
  });
});
```

### M8 Tests

```typescript
// src/config/__tests__/env.test.ts

describe('M8: Security Misconfiguration', () => {
  it('should validate required environment variables', () => {
    expect(() => validateEnvConfig()).not.toThrow();
  });

  it('should require HTTPS in production', () => {
    process.env.ENVIRONMENT = 'production';
    process.env.SUPABASE_URL = 'http://insecure.com'; // HTTP!

    expect(() => validateEnvConfig()).toThrow('must use HTTPS');
  });

  it('should not expose secrets in config', () => {
    const configString = JSON.stringify(ENV_CONFIG);
    expect(configString).not.toContain('password');
    expect(configString).not.toContain('secret');
  });
});
```

### M9 Tests

```typescript
// See implementation verification tests above
```

### M10 Tests

```typescript
// See crypto implementation audit tests above
```

---

## Definition of Done

- [ ] All M6-M10 vulnerabilities audited
- [ ] Findings documented with severity levels
- [ ] CVSS scores calculated for each finding
- [ ] Remediation recommendations provided
- [ ] Verification test cases written
- [ ] Audit report generated
- [ ] Code examples for fixes provided

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-319](TASK-319-owasp-m1-m5-audit.md)

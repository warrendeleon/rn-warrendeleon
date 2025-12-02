# EPIC-029: Security Audit & Penetration Testing

**ID**: EPIC-029 | **Title**: Full Security Audit and Penetration Testing
**Status**: 📋 To Do | **Priority**: High | **Start Date**: TBD | **Target Date**: TBD
**Owner**: Warren de Leon | **Total Story Points**: 8 | **Total Effort**: 19h

---

## Epic Overview

Conduct full security audit and penetration testing of the entire application to identify and fix vulnerabilities before production release. Ensures compliance with OWASP Mobile Top 10 and industry security standards.

**Key Features**:

- OWASP Mobile Top 10 compliance audit
- Authentication and authorization testing
- Data storage security audit (Keychain, Encrypted Storage, AsyncStorage)
- Network security testing (HTTPS, certificate pinning)
- Code security analysis (static analysis, dependency scanning)
- Penetration testing (manual + automated)
- Security documentation and remediation plan

---

## Business Value

### Why This Epic Matters

1. **Risk Mitigation**: 43% of mobile apps have at least one high-risk security vulnerability (Veracode)
2. **User Trust**: Security breaches destroy user confidence and brand reputation
3. **Compliance**: Required for financial/healthcare apps, App Store security review
4. **Data Protection**: Protects user PII (email, phone, profile pictures, messages)
5. **Legal Protection**: Reduces liability from data breaches (GDPR fines up to €20M)
6. **Competitive Advantage**: Security-conscious users prefer audited apps

### Success Metrics

| Metric                         | Target  | Why It Matters                       |
| ------------------------------ | ------- | ------------------------------------ |
| OWASP Mobile Top 10 Compliance | 100%    | Industry standard security checklist |
| Critical Vulnerabilities       | 0       | No showstoppers in production        |
| High Vulnerabilities           | <3      | Acceptable risk level                |
| Remediation Time               | <1 week | Fast response to findings            |

---

## User Stories

### Overview

| ID                                                    | Title                     | Priority | Story Points | Effort | Status   |
| ----------------------------------------------------- | ------------------------- | -------- | ------------ | ------ | -------- |
| [US-057](../stories/US-057-owasp-compliance-audit.md) | OWASP Mobile Top 10 Audit | High     | 4            | 9.5h   | 📋 To Do |
| [US-058](../stories/US-058-penetration-testing.md)    | Penetration Testing       | High     | 4            | 9.5h   | 📋 To Do |

**Total**: 2 user stories, 8 story points, 19 hours

---

## Technical Architecture

### Security Audit Framework

**Four-Phase Approach**:

1. **Static Analysis** (Code review without execution)
   - Source code security review
   - Dependency vulnerability scanning
   - Configuration file audit
   - Secrets detection

2. **Dynamic Analysis** (Runtime testing)
   - Network traffic interception
   - Authentication/authorization testing
   - Data storage inspection
   - API security testing

3. **Penetration Testing** (Simulated attacks)
   - Manual exploitation attempts
   - Automated vulnerability scanning
   - Social engineering tests
   - Physical device attacks

4. **Remediation** (Fix vulnerabilities)
   - Prioritize by severity (Critical → High → Medium → Low)
   - Implement fixes
   - Re-test to verify
   - Document changes

### OWASP Mobile Top 10 (2024)

**M1: Improper Platform Usage**

- **Risk**: Misuse of platform features (biometrics, Keychain, permissions)
- **Audit**: Verify proper Keychain usage, biometric fallback, permission requests

**M2: Insecure Data Storage**

- **Risk**: Sensitive data stored in plain text (logs, AsyncStorage, files)
- **Audit**: Check all storage locations (Keychain, Encrypted Storage, AsyncStorage, logs)

**M3: Insecure Communication**

- **Risk**: HTTP instead of HTTPS, no certificate pinning, weak TLS
- **Audit**: Verify HTTPS-only, ATS (iOS), cleartext traffic disabled (Android)

**M4: Insecure Authentication**

- **Risk**: Weak passwords, no rate limiting, insecure token storage
- **Audit**: Test password policies, rate limiting, token storage in Keychain

**M5: Insufficient Cryptography**

- **Risk**: Weak algorithms (MD5, SHA-1), hardcoded keys, improper key storage
- **Audit**: Verify bcrypt for PINs, AES-256 for encryption, hardware-backed Keychain

**M6: Insecure Authorization**

- **Risk**: Missing access controls, privilege escalation, IDOR
- **Audit**: Test RLS policies, token validation, user-level access controls

**M7: Client Code Quality**

- **Risk**: Memory leaks, buffer overflows, unhandled exceptions
- **Audit**: Code review, static analysis (ESLint, TypeScript), crash reporting

**M8: Code Tampering**

- **Risk**: Reverse engineering, code injection, binary patching
- **Audit**: ProGuard (Android), root/jailbreak detection, integrity checks

**M9: Reverse Engineering**

- **Risk**: Extracting API keys, algorithms, business logic from binary
- **Audit**: Obfuscation (ProGuard), no secrets in code, react-native-config

**M10: Extraneous Functionality**

- **Risk**: Debug endpoints, test users, hidden features in production
- **Audit**: Verify no development code, no test users, no debug logs

---

## Security Testing Tools

### Static Analysis Tools

**1. ESLint Security Plugins**

```bash
yarn add --dev eslint-plugin-security eslint-plugin-react-native-security
```

**Configuration** (`.eslintrc.js`):

```javascript
module.exports = {
  plugins: ['security', 'react-native-security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'react-native-security/no-inline-styles': 'warn',
  },
};
```

**2. npm audit**

```bash
npm audit --production
npm audit fix --force  # Auto-fix vulnerabilities
```

**3. Snyk (Dependency Scanning)**

```bash
yarn global add snyk
snyk auth
snyk test  # Scan dependencies
snyk monitor  # Continuous monitoring
```

**4. GitGuardian (Secrets Detection)**

```bash
brew install gitguardian/tap/ggshield
ggshield secret scan repo .  # Scan for exposed secrets
```

### Dynamic Analysis Tools

**1. Proxyman / Charles Proxy (Network Traffic Interception)**

**Setup**:

1. Install Proxyman (macOS): https://proxyman.io/
2. Configure iOS Simulator to use proxy
3. Install SSL certificate on simulator
4. Intercept all HTTP/HTTPS traffic

**Audit Checklist**:

- ✅ All API calls use HTTPS
- ✅ No sensitive data in query parameters (tokens, passwords)
- ✅ Authorization header present on protected endpoints
- ✅ Tokens not exposed in logs

**2. Frida (Runtime Instrumentation)**

**Setup**:

```bash
brew install frida-tools
pip install frida-tools
```

**Test Biometric Bypass**:

```javascript
// bypass-biometrics.js
Java.perform(() => {
  const BiometricManager = Java.use('androidx.biometric.BiometricPrompt');
  BiometricManager.authenticate.implementation = function () {
    console.log('[+] Biometric authentication bypassed');
    return true;
  };
});

// Run: frida -U -f com.warrendeleon -l bypass-biometrics.js
```

**3. Objection (Mobile Exploration Toolkit)**

**Setup**:

```bash
pip install objection
```

**Commands**:

```bash
objection --gadget com.warrendeleon explore

# Explore app
ios keychain dump  # Dump Keychain
ios nsuserdefaults get  # Dump AsyncStorage
ios cookies get  # Dump cookies
memory list modules  # List loaded libraries
```

### Penetration Testing Scenarios

**Scenario 1: Token Theft**

- **Attack**: Intercept network traffic, extract access token
- **Expected Behavior**: Token stored in Keychain, not accessible via logs
- **Verification**: Search logs for "token", "bearer", "auth" - should be redacted

**Scenario 2: PIN Brute Force**

- **Attack**: Attempt 10,000 PIN combinations
- **Expected Behavior**: Rate limiting blocks after 5 failed attempts
- **Verification**: Check `src/screens/auth/PINScreen.tsx` for rate limiting logic

**Scenario 3: Root Detection Bypass**

- **Attack**: Patch root detection checks in binary
- **Expected Behavior**: App warns user but allows usage (user choice)
- **Verification**: Test on rooted/jailbroken device

**Scenario 4: Data Extraction from Backup**

- **Attack**: Extract app backup via iTunes/iCloud, inspect data
- **Expected Behavior**: Keychain excluded from backup, Encrypted Storage encrypted
- **Verification**: Check Keychain `accessible` flag, EncryptedStorage encryption

**Scenario 5: Man-in-the-Middle (MITM) Attack**

- **Attack**: Intercept HTTPS traffic via proxy, modify requests
- **Expected Behavior**: Certificate pinning prevents MITM (optional)
- **Verification**: Configure Charles Proxy, verify app detects invalid certificate

**Scenario 6: Insecure Data Storage**

- **Attack**: Inspect AsyncStorage, logs, temp files for sensitive data
- **Expected Behavior**: No PII in AsyncStorage, no tokens in logs
- **Verification**: Search for email, phone, tokens in all storage locations

---

## Security Audit Checklist

### Authentication & Authorization

- [ ] **Passwords**: Minimum 8 characters, complexity requirements enforced
- [ ] **PIN**: 6 digits, weak PIN detection (123456, 000000, etc.)
- [ ] **Biometric**: Hardware-backed, PIN fallback available
- [ ] **Tokens**: Access token (1h expiry), refresh token (30d expiry), stored in Keychain
- [ ] **Rate Limiting**: Max 5 failed login attempts per 15 minutes
- [ ] **Session Timeout**: 5 minutes inactivity auto-logout
- [ ] **Multi-Device**: Users can see active sessions, revoke devices

### Data Storage

- [ ] **Keychain (Tier 1)**: Access tokens, refresh tokens, encryption keys, PIN hashes
- [ ] **Encrypted Storage (Tier 2)**: User PII (email, name, phone, birthday, profile picture URL)
- [ ] **AsyncStorage (Tier 3)**: Only non-sensitive data (theme, language, UI state)
- [ ] **Logs**: No sensitive data logged (tokens, passwords, PINs, emails)
- [ ] **Crash Reports**: PII redacted before sending to error tracking
- [ ] **Clipboard**: Sensitive fields (password, PIN) disable copy/paste

### Network Security

- [ ] **HTTPS Only**: All API calls use HTTPS, no HTTP fallback
- [ ] **ATS (iOS)**: App Transport Security enabled, no exceptions
- [ ] **Cleartext Traffic (Android)**: Disabled in `AndroidManifest.xml`
- [ ] **Certificate Pinning** (Optional): Public key pinning for Supabase API
- [ ] **API Keys**: Never hardcoded, stored in `.env` files (excluded from git)
- [ ] **Sensitive Data**: Not sent in URL query parameters (use POST body)

### Code Security

- [ ] **Dependencies**: No known vulnerabilities (`npm audit` clean)
- [ ] **ESLint Security**: No security warnings
- [ ] **TypeScript**: Strict mode enabled, no `@ts-ignore`
- [ ] **Obfuscation** (Android): ProGuard enabled for release builds
- [ ] **Debug Code**: No development code in production (console.log, test users)
- [ ] **Error Handling**: All API calls have try/catch, user-friendly error messages

### Platform Security

- [ ] **Root/Jailbreak Detection**: Warn user about risks
- [ ] **Screen Capture**: Disabled for sensitive screens (PIN, password)
- [ ] **Keyboard Cache**: Disabled for sensitive inputs (`secureTextEntry`)
- [ ] **Biometric Invalidation**: Biometric re-auth required after 30min background
- [ ] **App Backgrounding**: Session locked after 5min, full logout after 24h

### Compliance

- [ ] **OWASP Mobile Top 10**: All 10 categories addressed
- [ ] **GDPR**: User data encrypted, right to deletion, data portability
- [ ] **WCAG 2.1 Level AA**: EAA compliance (accessibility)
- [ ] **App Store Guidelines**: Privacy policy, data usage disclosure

---

## Penetration Testing Report Template

```markdown
# Security Penetration Test Report

**App**: Warren de Leon Portfolio App
**Date**: [Test Date]
**Tester**: [Tester Name]
**Version**: [App Version]

---

## Executive Summary

**Overall Risk Level**: [Low / Medium / High]

**Summary**: [Brief overview of findings]

**Critical Vulnerabilities**: [Count]
**High Vulnerabilities**: [Count]
**Medium Vulnerabilities**: [Count]
**Low Vulnerabilities**: [Count]

---

## Vulnerabilities

### [VULN-001] [Title]

**Severity**: [Critical / High / Medium / Low]
**OWASP Category**: [M1-M10]
**CVSS Score**: [0.0-10.0]

**Description**:
[Detailed description of vulnerability]

**Steps to Reproduce**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Impact**:
[What an attacker could do with this vulnerability]

**Affected Components**:

- [File path or component name]

**Recommendation**:
[How to fix the vulnerability]

**References**:

- [OWASP link]
- [CVE link if applicable]

---

## Remediation Plan

| Vulnerability | Severity | Owner  | ETA        | Status         |
| ------------- | -------- | ------ | ---------- | -------------- |
| VULN-001      | Critical | Warren | 2025-12-01 | 🔴 Open        |
| VULN-002      | High     | Warren | 2025-12-05 | 🟡 In Progress |

---

## Re-Test Results

**Re-Test Date**: [Date]
**Re-Test Result**: [Pass / Fail]

[Results of re-testing after fixes]

---

## Conclusion

[Final assessment, remaining risks, recommendations]
```

---

## Implementation Phases

### Phase 1: OWASP Mobile Top 10 Audit (9.5h)

**User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)

**Tasks**:

1. Static analysis setup (ESLint security plugins, npm audit, Snyk)
2. OWASP M1-M5 audit (Platform usage, data storage, communication, auth, crypto)
3. OWASP M6-M10 audit (Authorization, code quality, tampering, reverse engineering, extraneous functionality)
4. Vulnerability documentation (spreadsheet with findings)
5. Remediation plan (prioritized by severity)

**Deliverables**:

- Security audit report (OWASP compliance)
- Vulnerability spreadsheet
- Remediation plan
- Fixed vulnerabilities

---

### Phase 2: Penetration Testing (9.5h)

**User Story**: [US-058](../stories/US-058-penetration-testing.md)

**Tasks**:

1. Dynamic analysis setup (Proxyman, Frida, Objection)
2. Authentication testing (brute force, token theft, session hijacking)
3. Data storage testing (Keychain, Encrypted Storage, AsyncStorage inspection)
4. Network security testing (MITM, HTTPS, certificate pinning)
5. Penetration test report

**Deliverables**:

- Penetration test report
- Network traffic analysis
- Data storage inspection results
- Security recommendations

---

## Security Best Practices

### Secure Coding Guidelines

**1. Never Hardcode Secrets**

```typescript
// ❌ BAD
const API_KEY = 'sk_live_123456789';

// ✅ GOOD
import Config from 'react-native-config';
const API_KEY = Config.SUPABASE_ANON_KEY;
```

**2. Always Validate Input**

```typescript
// ❌ BAD
const email = req.body.email;
await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ GOOD
const emailSchema = z.string().email();
const email = emailSchema.parse(req.body.email);
await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

**3. Hash Passwords Properly**

```typescript
// ❌ BAD
const passwordHash = md5(password);

// ✅ GOOD
import bcrypt from 'bcryptjs';
const passwordHash = await bcrypt.hash(password, 10);
```

**4. Store Tokens Securely**

```typescript
// ❌ BAD
await AsyncStorage.setItem('access_token', token);

// ✅ GOOD
import * as Keychain from 'react-native-keychain';
await Keychain.setGenericPassword('auth_access_token', token, {
  service: 'auth_access_token',
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
});
```

**5. Sanitize Logs**

```typescript
// ❌ BAD
console.log('Login response:', response);

// ✅ GOOD
console.log('Login successful', {
  userId: response.user.id,
  email: '[REDACTED]',
  token: '[REDACTED]',
});
```

---

## Non-Functional Requirements

### Performance

- Static analysis: <5 minutes
- Dependency scanning: <3 minutes
- Penetration testing: 8-16 hours (manual)

### Security

- Zero critical vulnerabilities in production
- All high vulnerabilities fixed within 1 week
- Continuous monitoring (Snyk, npm audit)

### Compliance

- OWASP Mobile Top 10 compliance: 100%
- App Store security review: Pass
- GDPR compliance: Data encryption, right to deletion

---

## Dependencies

### Upstream Dependencies

- All epics complete (EPIC-021 through EPIC-028)
- App feature-complete and tested
- Production environment configured

### Downstream Dependencies

- Production release depends on this epic
- App Store submission depends on security review

---

## Risks & Mitigation

### Technical Risks

| Risk                               | Probability | Impact | Mitigation                               |
| ---------------------------------- | ----------- | ------ | ---------------------------------------- |
| Critical vulnerability found late  | Medium      | High   | Early security audits during development |
| Dependency vulnerabilities         | High        | Medium | Continuous monitoring with Snyk          |
| False positives in static analysis | Medium      | Low    | Manual review of all findings            |

### Business Risks

| Risk                                | Probability | Impact   | Mitigation                                 |
| ----------------------------------- | ----------- | -------- | ------------------------------------------ |
| App Store rejection due to security | Low         | High     | Pre-submission security review             |
| Data breach in production           | Low         | Critical | Defense in depth, multiple security layers |
| User trust loss from vulnerability  | Low         | High     | Responsible disclosure, fast patching      |

---

## Definition of Done

**Functional**:

- [ ] Both user stories complete
- [ ] OWASP Mobile Top 10 audit complete
- [ ] Penetration testing complete
- [ ] All critical/high vulnerabilities fixed
- [ ] Security audit report written

**Quality**:

- [ ] Zero critical vulnerabilities
- [ ] <3 high vulnerabilities
- [ ] All findings documented
- [ ] Remediation plan complete

**Compliance**:

- [ ] OWASP Mobile Top 10: 100%
- [ ] npm audit: 0 high/critical
- [ ] Snyk scan: 0 high/critical
- [ ] ESLint security: 0 errors

**Documentation**:

- [ ] Security audit report
- [ ] Penetration test report
- [ ] Vulnerability spreadsheet
- [ ] Remediation plan
- [ ] Security best practices guide

---

**Last Updated**: 2025-11-21
**Status**: Ready for implementation
**Next Review**: Before production release

# TASK-322: Remediation Plan

**ID**: TASK-322 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 1h

---

## Task Description

Create comprehensive remediation plan for all security findings from OWASP audit. Prioritise fixes by severity, estimate effort, assign owners, and establish timeline for resolution. Track progress and verify fixes.

---

## Acceptance Criteria

- [ ] Remediation plan created for all findings
- [ ] Fixes prioritised by severity (Critical → Low)
- [ ] Effort estimates provided for each fix
- [ ] Owners assigned to each remediation task
- [ ] Timeline established with milestones
- [ ] Verification criteria defined
- [ ] Progress tracking mechanism implemented
- [ ] Stakeholder communication plan created

---

## Remediation Plan Template

### Remediation Roadmap

```markdown
# Security Remediation Roadmap

**Project**: Warren DeLeon Portfolio Mobile App
**Version**: 1.0.0
**Date**: 2025-11-21
**Last Updated**: 2025-11-21

---

## Overview

**Total Findings**: [X]
**Findings by Severity**:

- Critical: [X] (100% must be fixed immediately)
- High: [X] (Fix within 1 week)
- Medium: [X] (Fix within 1 month)
- Low: [X] (Fix within 3 months)

**Estimated Total Effort**: [X] hours / [Y] days
**Target Completion**: [Date]

---

## Priority Matrix

| Severity | Count | Estimated Effort | Target Date | Status                 |
| -------- | ----- | ---------------- | ----------- | ---------------------- |
| Critical | X     | Y hours          | [Date]      | [In Progress/Complete] |
| High     | X     | Y hours          | [Date]      | [Pending/In Progress]  |
| Medium   | X     | Y hours          | [Date]      | [Pending]              |
| Low      | X     | Y hours          | [Date]      | [Pending]              |

---

## Immediate Actions (Critical - Within 24 Hours)

### Finding #001: [Title]

**Severity**: Critical
**CVSS**: 9.1
**Owner**: [Name]
**Effort**: 2 hours
**Target**: 2025-11-22
**Status**: 🔴 Not Started

**Fix Summary**:
[1-2 sentence description of fix]

**Implementation**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Verification**:

- [ ] Unit tests pass
- [ ] Manual verification complete
- [ ] Code review approved
- [ ] Deployed to production

**Blocker/Dependencies**: [None / List any]

---

### Finding #002: [Title]

[Repeat structure]

---

## Short-term Actions (High - Within 1 Week)

[List all high-severity findings with same structure]

---

## Medium-term Actions (Medium - Within 1 Month)

[List all medium-severity findings with same structure]

---

## Long-term Actions (Low - Within 3 Months)

[List all low-severity findings with same structure]

---

## Progress Tracking

### Week 1 (2025-11-21 to 2025-11-27)

- [ ] Critical Finding #001 - [Title]
- [ ] Critical Finding #002 - [Title]
- [ ] High Finding #003 - [Title]

**Weekly Goal**: All critical findings resolved

### Week 2 (2025-11-28 to 2025-12-04)

- [ ] High Finding #004 - [Title]
- [ ] High Finding #005 - [Title]
- [ ] Medium Finding #006 - [Title]

**Weekly Goal**: All high findings resolved

### Week 3-4 (2025-12-05 to 2025-12-18)

- [ ] Medium findings

**Monthly Goal**: 50% medium findings resolved

---

## Resource Allocation

| Team Member     | Assigned Findings | Total Effort | Timeline |
| --------------- | ----------------- | ------------ | -------- |
| [Developer 1]   | #001, #003, #005  | 12 hours     | Week 1-2 |
| [Developer 2]   | #002, #004, #006  | 10 hours     | Week 1-2 |
| [Security Lead] | All reviews       | 8 hours      | Week 1-3 |

---

## Risk Assessment

### Blockers

1. [Potential blocker 1] - **Mitigation**: [Plan]
2. [Potential blocker 2] - **Mitigation**: [Plan]

### Dependencies

1. [External dependency] - **Owner**: [Name] - **ETA**: [Date]

---

## Communication Plan

**Daily Standup**: 9:00 AM - Security fix progress
**Weekly Review**: Friday 3:00 PM - Completed fixes, upcoming priorities
**Stakeholder Update**: Monday mornings - Executive summary

**Escalation Path**:

1. Developer → Team Lead (< 4 hours stuck)
2. Team Lead → Security Lead (blocker identified)
3. Security Lead → CTO (timeline at risk)

---

## Verification Checklist

For each finding remediation:

- [ ] Code changes implemented
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Manual testing complete
- [ ] Code review approved
- [ ] Security review approved
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Verified in staging
- [ ] Deployed to production
- [ ] Verified in production
- [ ] Finding marked as "Fixed"

---

## Post-Remediation Actions

After all findings resolved:

- [ ] Re-run security audit (OWASP M1-M10)
- [ ] Update security documentation
- [ ] Schedule follow-up audit (3 months)
- [ ] Implement continuous security monitoring
- [ ] Train team on secure coding practices
- [ ] Update security policies
```

---

## Example Remediation Plan

### Finding #001: Hardcoded API Key

**Severity**: Critical
**CVSS**: 9.1
**OWASP**: M2 - Inadequate Supply Chain Security
**Owner**: Backend Team
**Effort**: 2 hours
**Target**: 2025-11-22 12:00 PM
**Status**: 🔴 Not Started → 🟡 In Progress → 🟢 Complete

---

#### Implementation Plan

**Step 1: Install react-native-config** (15 min)

```bash
yarn add react-native-config
cd ios && pod install && cd ..
```

**Step 2: Create environment files** (10 min)

```bash
# .env.development
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=eyJ...dev-key

# .env.production
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=eyJ...prod-key
```

**Step 3: Update .gitignore** (5 min)

```bash
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

**Step 4: Update supabaseClient.ts** (15 min)

```typescript
// src/services/api/supabaseClient.ts
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL;
const SUPABASE_ANON_KEY = Config.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase configuration');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Step 5: Remove hardcoded keys** (10 min)

- Search entire codebase for hardcoded keys
- Remove all instances
- Commit changes

**Step 6: Rotate API keys** (20 min)

- Log into Supabase dashboard
- Generate new anon key
- Update `.env.production` with new key
- Update CI/CD secrets
- Deploy

**Step 7: Verification** (15 min)

- Run unit tests
- Build production app
- Decompile and verify no hardcoded keys
- Test API connectivity

---

#### Verification Criteria

**Automated Tests**:

```typescript
// src/services/api/__tests__/supabaseClient.test.ts

describe('Finding #001 Remediation', () => {
  it('should load API key from environment', () => {
    expect(Config.SUPABASE_URL).toBeDefined();
    expect(Config.SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should not contain hardcoded keys in source', () => {
    const sourceCode = fs.readFileSync('src/services/api/supabaseClient.ts', 'utf8');
    expect(sourceCode).not.toMatch(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/);
  });
});
```

**Manual Verification**:

1. ✅ Search codebase for "supabase.co" - only in .env files
2. ✅ Decompile production APK/IPA - no readable API keys
3. ✅ Verify .env files in .gitignore
4. ✅ Check git history - rotate keys if found
5. ✅ Test app connectivity to Supabase
6. ✅ Code review by security lead

**Deployment Checklist**:

- [ ] Changes merged to main
- [ ] CI/CD environment variables updated
- [ ] Deployed to staging
- [ ] Verified in staging environment
- [ ] Deployed to production
- [ ] Verified in production environment
- [ ] Old API keys revoked in Supabase dashboard

---

#### Progress Log

**2025-11-21 10:00 AM**: Finding identified, assigned to Backend Team
**2025-11-21 11:00 AM**: Implementation started
**2025-11-21 12:30 PM**: Code changes complete, tests passing
**2025-11-21 2:00 PM**: Code review approved
**2025-11-21 3:00 PM**: Deployed to staging
**2025-11-21 4:00 PM**: Verified in staging
**2025-11-21 5:00 PM**: Deployed to production
**2025-11-21 6:00 PM**: Verified in production
**2025-11-21 6:30 PM**: Old keys revoked
**2025-11-21 7:00 PM**: ✅ Finding marked as FIXED

---

### Finding #002: Missing Certificate Pinning

**Severity**: High
**CVSS**: 7.4
**OWASP**: M5 - Insecure Communication
**Owner**: Mobile Team
**Effort**: 4 hours
**Target**: 2025-11-25
**Status**: 🔴 Not Started

---

#### Implementation Plan

**Step 1: Obtain certificate pins** (30 min)

```bash
# Get public key hash from Supabase certificate
openssl s_client -servername your-project.supabase.co -connect your-project.supabase.co:443 \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**Step 2: Android implementation** (1 hour)

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config>
    <domain includeSubdomains="true">your-project.supabase.co</domain>
    <pin-set expiration="2026-12-31">
      <pin digest="SHA-256">[PRIMARY_PIN]</pin>
      <pin digest="SHA-256">[BACKUP_PIN]</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
  android:networkSecurityConfig="@xml/network_security_config">
```

**Step 3: iOS implementation** (1.5 hours)

```bash
cd ios
pod 'TrustKit'
pod install
```

```swift
// ios/warrendeleon/AppDelegate.mm
#import <TrustKit/TrustKit.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSDictionary *trustKitConfig = @{
    kTSKSwizzleNetworkDelegates: @YES,
    kTSKPinnedDomains: @{
      @"your-project.supabase.co": @{
        kTSKPublicKeyHashes: @[
          @"[PRIMARY_PIN]",
          @"[BACKUP_PIN]",
        ],
      }
    }
  };

  [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];

  // ... rest of method
}
```

**Step 4: Testing** (1 hour)

- Test with valid certificate (should connect)
- Test with invalid certificate via proxy (should reject)
- Test with expired pin (should use backup)

---

#### Verification Criteria

**Manual Testing**:

1. ✅ Normal app usage - all API calls succeed
2. ✅ Proxy with self-signed cert - app rejects connection
3. ✅ Monitor logs for TrustKit errors
4. ✅ Verify backup pin is different from primary
5. ✅ Check expiration date is in future

**Deployment**:

- [ ] Staged rollout (10% users first)
- [ ] Monitor for increased network errors
- [ ] Full rollout if no issues

---

## Tracking Dashboard

### Overall Progress

```
Critical: ██████████ 100% (2/2 complete)
High:     █████░░░░░  50% (3/6 complete)
Medium:   ██░░░░░░░░  20% (2/10 complete)
Low:      ░░░░░░░░░░   0% (0/5 complete)

Overall:  ████░░░░░░  35% (7/23 complete)
```

### Velocity Tracking

| Week | Findings Resolved | Cumulative | Target |
| ---- | ----------------- | ---------- | ------ |
| 1    | 5                 | 5          | 8      |
| 2    | 4                 | 9          | 15     |
| 3    | 6                 | 15         | 20     |
| 4    | 8                 | 23         | 23 ✅  |

---

## Continuous Improvement

### Post-Fix Actions

1. **Update Security Checklist**
   - Add items to prevent recurrence
   - Update code review guidelines
   - Enhance static analysis rules

2. **Training**
   - Secure coding workshop
   - OWASP Mobile Top 10 training
   - Lunch & learn sessions

3. **Process Improvements**
   - Security requirements in all user stories
   - Security review in PR template
   - Automated security scanning in CI/CD

4. **Monitoring**
   - Set up security metrics dashboard
   - Track new vulnerabilities
   - Schedule quarterly audits

---

## Definition of Done

- [ ] Remediation plan created for all findings
- [ ] All findings prioritised by severity
- [ ] Effort estimates assigned
- [ ] Owners assigned to each task
- [ ] Timeline with milestones established
- [ ] Verification criteria defined for each finding
- [ ] Progress tracking dashboard created
- [ ] Stakeholder communication plan established
- [ ] Plan reviewed by security lead
- [ ] Plan approved by CTO

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-321](TASK-321-vulnerability-documentation.md)

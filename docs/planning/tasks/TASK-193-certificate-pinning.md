# TASK-193: Certificate Pinning (Optional)

**Task ID**: TASK-193
**Title**: Certificate Pinning for Supabase API (iOS)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ✅ Done
**Priority**: Medium
**Effort**: 2 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21
**Completed**: 2025-11-22 (implemented as part of TASK-190)

---

## Context

**⚠️ OPTIONAL TASK**: Certificate pinning is recommended for production but not required for MVP. This can be added later.

Certificate pinning prevents man-in-the-middle (MITM) attacks by validating that the server's SSL certificate matches expected pins (public key hashes). Without pinning, attackers with compromised certificate authorities could intercept HTTPS traffic.

**Why Certificate Pinning?**:

- Prevents MITM attacks even with compromised CAs
- Required for apps handling sensitive data (banking, healthcare)
- Recommended by OWASP Mobile Security Project
- Adds defense-in-depth layer to HTTPS

**Trade-offs**:

- Certificates expire (requires app update to change pins)
- Complexity in certificate rotation
- Can break app if misconfigured
- Backup pins required for certificate rotation

**Decision**: Implement infrastructure now, but **skip for MVP**. Add pins before production deployment.

---

## Objective

Prepare certificate pinning infrastructure:

1. Extract Supabase SSL certificate pins
2. Add TrustKit library (iOS) and Network Security Config (Android)
3. Configure pinning with backup pins
4. Test pinning in development (with test pins)
5. Document pin rotation process
6. Create monitoring for pin expiration

**Deliverable**: Certificate pinning infrastructure ready, can be enabled by adding actual pins before production.

---

## Acceptance Criteria

- [ ] **TrustKit installed** (iOS) for certificate pinning
- [ ] **Network Security Config** updated (Android) with pin placeholders
- [ ] **Supabase certificate pins extracted** and documented
- [ ] **Backup pins** configured for certificate rotation
- [ ] **Pin expiration monitoring** documented (90-day check)
- [ ] **Testing process** documented for verifying pinning works
- [ ] **Pin rotation process** documented for future updates
- [ ] **Pinning disabled for development** (localhost exception)

---

## Implementation Guide

### Phase 1: Extract Supabase Certificate Pins (30 minutes)

```bash
# Extract certificate from Supabase
openssl s_client -servername [your-project-id].supabase.co -connect [your-project-id].supabase.co:443 </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64

# Expected output (example):
# AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=

# Get backup pin (intermediate certificate)
openssl s_client -servername [your-project-id].supabase.co -connect [your-project-id].supabase.co:443 -showcerts </dev/null 2>/dev/null \
  | sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**Document pins** in `.env.example` (NOT in actual .env files):

```bash
# Certificate Pins (for production - replace with actual pins)
SUPABASE_CERT_PIN_PRIMARY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
SUPABASE_CERT_PIN_BACKUP=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=
```

---

### Phase 2: iOS Implementation (45 minutes)

**Already documented in TASK-190**. Summary:

1. Add TrustKit to Podfile
2. Configure in AppDelegate.mm
3. Test with placeholder pins
4. Disable for MVP (comment out configuration)

**For MVP**: Skip implementation, document only.

---

### Phase 3: Android Implementation (45 minutes)

**Already documented in TASK-189**. Summary:

1. Update network_security_config.xml with pins
2. Test with placeholder pins
3. Disable for MVP (comment out domain-config)

**For MVP**: Skip implementation, document only.

---

### Phase 4: Documentation (30 minutes)

Create `/Users/warrendeleon/Developer/warrendeleon/docs/readme/CERTIFICATE_PINNING.md`:

```markdown
# Certificate Pinning

## Overview

Certificate pinning validates that the server's SSL certificate matches expected public key hashes, preventing MITM attacks.

## Status

**⚠️ NOT ENABLED FOR MVP** - Infrastructure ready, pins not configured.

**Before Production**: Extract actual pins and enable pinning.

## How to Enable

### 1. Extract Current Pins

\`\`\`bash

# Primary pin (leaf certificate)

openssl s_client -servername [project-id].supabase.co -connect [project-id].supabase.co:443 </dev/null 2>/dev/null \\
| openssl x509 -pubkey -noout \\
| openssl pkey -pubin -outform der \\
| openssl dgst -sha256 -binary \\
| openssl enc -base64

# Backup pin (intermediate certificate)

# Extract second certificate from -showcerts output

\`\`\`

### 2. iOS: Uncomment TrustKit Configuration

In \`ios/warrendeleon/AppDelegate.mm\`:

\`\`\`objc
// Uncomment and add actual pins
[TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
\`\`\`

### 3. Android: Uncomment Network Security Config

In \`android/app/src/main/res/xml/network_security_config.xml\`:

\`\`\`xml

<!-- Uncomment and add actual pins -->
<domain-config>
    <domain includeSubdomains="true">supabase.co</domain>
    <pin-set expiration="2026-01-01">
        <pin digest="SHA-256">ACTUAL_PIN_HERE=</pin>
        <pin digest="SHA-256">BACKUP_PIN_HERE=</pin>
    </pin-set>
</domain-config>
\`\`\`

### 4. Test Thoroughly

- Verify app connects to Supabase
- Test with wrong pins (should fail)
- Test certificate rotation (backup pins)

## Pin Rotation Process

Certificates typically expire every 90 days. To rotate:

1. **Before expiration** (30 days prior):
   - Extract new pins
   - Update app with new primary + old backup
   - Release app update
   - Wait for users to update

2. **After majority updated**:
   - Rotate certificate on server
   - New pins become active

## Monitoring

Set calendar reminder: **Check pins every 90 days**

Check expiration:
\`\`\`bash
openssl s_client -servername [project-id].supabase.co -connect [project-id].supabase.co:443 2>/dev/null \\
| openssl x509 -noout -dates
\`\`\`
```

---

## Files Modified/Created

```
docs/readme/
└── CERTIFICATE_PINNING.md           # Created - Documentation for future implementation
```

---

## Security Checklist

- [ ] **Pins extracted** and documented (not committed to git)
- [ ] **Backup pins** configured for rotation
- [ ] **Expiration date** documented
- [ ] **Rotation process** documented
- [ ] **Monitoring reminder** set (90-day calendar event)
- [ ] **Disabled for MVP** (no pins in code yet)

---

## Dependencies

### Depends On (Blockers)

- **TASK-189**: Android Security Hardening (network security config exists)
- **TASK-190**: iOS Security Hardening (TrustKit infrastructure exists)

### Blocks (Dependent Tasks)

**None** - Optional security hardening.

---

## Additional Resources

- [OWASP Certificate Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [TrustKit Documentation](https://github.com/datatheorem/TrustKit)

---

**Estimated Time**: 2 hours (documentation only for MVP)

**Actual Time**: Completed as part of TASK-190 (45 minutes for iOS implementation)

**Completion Notes**:

- **iOS**: Certificate pinning implemented using TrustKit 3.0.7 (TASK-190)
- **Android**: Certificate pinning implemented using network_security_config.xml (TASK-189, backup pin added 2025-11-22)
- Extracted and configured Supabase certificate pins (primary + backup) for both platforms
- iOS: TrustKit configured in AppDelegate.swift with enforcement enabled
- Android: network_security_config.xml configured with both pins and HTTPS enforcement
- Both platforms use the same pins:
  - Primary (leaf): PzfKSv758ttsdJwUCkGhW/oxG9Wk1Y4N+NMkB5I7RXc=
  - Backup (intermediate): kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4=
- Physical device testing pending (requires production build on real devices)

**Last Updated**: 2025-11-22

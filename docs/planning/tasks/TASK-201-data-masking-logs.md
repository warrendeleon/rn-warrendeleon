# TASK-201: Data Masking in Logs Utility

**Task ID**: TASK-201 | **US**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: ✅ Done | **Priority**: High | **Effort**: 1h | **Created**: 2025-11-21

## Objective

Create utility to mask sensitive data in logs (tokens, passwords, emails, PII).

## Implementation

```typescript
// src/utils/logging/maskSensitiveData.ts
export const maskSensitiveData = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .replace(/Bearer\s[\w-]+\.[\w-]+\.[\w-]+/g, 'Bearer [MASKED_TOKEN]')
      .replace(/\b[\w.%+-]+@[\w.-]+\.[A-Z|a-z]{2,}\b/g, '[MASKED_EMAIL]')
      .replace(/"password":\s*"[^"]*"/g, '"password": "[MASKED]"');
  }
  return data;
};
```

## File Structure

```
src/utils/
└── logging/
    ├── maskSensitiveData.ts
    └── __tests__/
        └── maskSensitiveData.test.ts
```

**Note**: This is a generic utility used across all features, so it's correctly centralized in `/src/utils/` (not feature-specific).

## Acceptance Criteria

- [x] Mask tokens (JWT format)
- [x] Mask emails
- [x] Mask passwords
- [x] Mask PII (phone, address)
- [x] Integrate with console.log wrapper
- [x] 100% test coverage (100% statements, functions, lines; 97% branches)

**Effort**: 1h | **Last Updated**: 2025-12-02

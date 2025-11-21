# TASK-201: Data Masking in Logs Utility

**Task ID**: TASK-201 | **US**: [US-033](../stories/US-033-email-password-registration.md) | **Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md)
**Status**: 📋 To Do | **Priority**: High | **Effort**: 1h | **Created**: 2025-11-21

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

## Acceptance Criteria

- [ ] Mask tokens (JWT format)
- [ ] Mask emails
- [ ] Mask passwords
- [ ] Mask PII (phone, address)
- [ ] Integrate with console.log wrapper
- [ ] 100% test coverage

**Effort**: 1h | **Last Updated**: 2025-11-21

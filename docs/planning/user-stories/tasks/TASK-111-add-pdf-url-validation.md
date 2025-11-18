# TASK-111: Add PDF URL Validation

**Task ID**: TASK-111
**Title**: Add PDF URL Validation
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-022: Security Hardening](../stories/US-022-security-hardening.md)
**Status**: ✅ Done
**Priority**: 🟠 High
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Reviewer**: _Not assigned_
**Category**: Security

---

## Context

PDF viewer screen accepts arbitrary URLs without validation. Must validate that URLs are HTTPS and actually point to PDF files.

**Security risk**: Unvalidated PDF URLs can load malicious content or non-PDF files.

---

## Technical Details

### Files to Modify

- PDF viewer screen (locate the file first)
- Reuse `src/utils/urlValidator.ts` (add PDF validation)

### Implementation

```typescript
// Add to src/utils/urlValidator.ts
export const isPdfUrlValid = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Check if URL ends with .pdf
    const pathname = parsedUrl.pathname.toLowerCase();
    return pathname.endsWith('.pdf');
  } catch (error) {
    return false;
  }
};
```

---

## Acceptance Criteria

- [x] PDF URL validator function created
- [x] Only HTTPS URLs allowed
- [x] URLs must end with .pdf extension
- [x] Invalid URLs show error message
- [x] All tests pass (100% coverage)

---

## Story Points & Effort

**Effort Estimate**: 1 hour

---

## Success Criteria

✅ PDF URL validator implemented
✅ HTTPS enforcement
✅ .pdf extension validation
✅ 100% test coverage

---

**Last Updated**: 2025-01-17

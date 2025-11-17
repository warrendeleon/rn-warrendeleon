# TASK-112: Audit SVG Files for HTTP URLs

**Task ID**: TASK-112
**Title**: Audit SVG Files for HTTP URLs
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-022: Security Hardening](../stories/US-022-security-hardening.md)
**Status**: 📋 Not Started
**Priority**: 🟡 Medium
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Category**: Security

---

## Context

SVG files may contain http:// URLs that are vulnerable to MITM attacks. All URLs must use HTTPS.

---

## Technical Details

### Implementation

```bash
# Find all SVG files with http:// URLs
grep -r "http://" src/assets --include="*.svg"

# Replace with https:// (manual review recommended)
find src/assets -name "*.svg" -exec sed -i '' 's/http:\/\//https:\/\//g' {} \;
```

---

## Acceptance Criteria

- [ ] All SVG files audited
- [ ] All http:// URLs replaced with https://
- [ ] No http:// URLs remain in assets
- [ ] Visual verification that SVGs still render correctly

---

## Story Points & Effort

**Effort Estimate**: 1 hour

---

## Success Criteria

✅ No http:// URLs in SVG files
✅ All assets use HTTPS
✅ Visual verification complete

---

**Last Updated**: 2025-01-17

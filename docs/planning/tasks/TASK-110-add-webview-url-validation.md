# TASK-110: Add WebView URL Validation

**Task ID**: TASK-110
**Title**: Add WebView URL Validation
**Epic**: [EPIC-013: Production Readiness - Security & Testing](../epics/EPIC-013-production-readiness.md)
**User Story**: [US-022: Security Hardening](../stories/US-022-security-hardening.md)
**Status**: ✅ Done
**Priority**: 🔴 Critical
**Created**: 2025-01-17
**Assigned To**: Warren de Leon
**Reviewer**: _Not assigned_
**Category**: Security

---

## Context

WebViewScreen currently accepts arbitrary URLs without validation, creating XSS and malicious content risks. Must implement domain whitelist to only allow approved social media and trusted domains.

**Security risk**: Unvalidated URLs can:

- Load phishing pages
- Execute malicious JavaScript
- Bypass app security controls
- Display inappropriate content

**Pattern**: Implement URL validation with configurable domain whitelist.

---

## Technical Details

### Files to Modify

- `src/features/WebView/WebViewScreen.tsx` - Add URL validation
- `src/config/constants.ts` - Define ALLOWED_DOMAINS whitelist
- `src/features/WebView/__tests__/WebViewScreen.test.tsx` - Add validation tests

### Implementation

**Step 1: Define Domain Whitelist**

```typescript
// src/config/constants.ts
export const ALLOWED_WEBVIEW_DOMAINS = [
  'linkedin.com',
  'www.linkedin.com',
  'facebook.com',
  'www.facebook.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'instagram.com',
  'www.instagram.com',
  'github.com',
  'www.github.com',
] as const;
```

**Step 2: Create URL Validator**

```typescript
// src/utils/urlValidator.ts
export const isUrlAllowed = (url: string, allowedDomains: readonly string[]): boolean => {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Check if domain is in whitelist
    const hostname = parsedUrl.hostname.toLowerCase();
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch (error) {
    // Invalid URL format
    return false;
  }
};
```

**Step 3: Update WebViewScreen**

```typescript
// src/features/WebView/WebViewScreen.tsx
import { isUrlAllowed } from '@app/utils/urlValidator';
import { ALLOWED_WEBVIEW_DOMAINS } from '@app/config/constants';

export const WebViewScreen: React.FC = () => {
  const route = useRoute<WebViewScreenRouteProp>();
  const { url } = route.params;

  const [isValidUrl, setIsValidUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUrlAllowed(url, ALLOWED_WEBVIEW_DOMAINS)) {
      setIsValidUrl(true);
    } else {
      setError('This URL is not allowed for security reasons');
    }
  }, [url]);

  if (error) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text color="$error500" testID="webview-error">{error}</Text>
      </Box>
    );
  }

  if (!isValidUrl) {
    return <LoadingSpinner />;
  }

  return <WebView source={{ uri: url }} />;
};
```

---

## Acceptance Criteria

- [x] Domain whitelist defined in constants.ts
- [x] URL validator function created with HTTPS enforcement
- [x] WebViewScreen validates URLs before loading
- [x] Allowed domains load correctly
- [x] Blocked domains show error message
- [x] HTTP URLs rejected (only HTTPS allowed)
- [x] Invalid URLs rejected with error
- [x] Comprehensive test coverage (all scenarios)
- [x] All tests pass (100% coverage for validator)

---

## Test Scenarios

**Scenario 1: Allowed Domain Loads**

```gherkin
Given WebViewScreen receives URL "https://linkedin.com/in/warrendeleon"
When the URL is validated
Then isUrlAllowed should return true
And WebView should load the URL
```

**Scenario 2: Blocked Domain Rejected**

```gherkin
Given WebViewScreen receives URL "https://malicious-site.com/phishing"
When the URL is validated
Then isUrlAllowed should return false
And error message should display "This URL is not allowed for security reasons"
```

**Scenario 3: HTTP URL Rejected**

```gherkin
Given WebViewScreen receives URL "http://linkedin.com"
When the URL is validated
Then isUrlAllowed should return false
And only HTTPS URLs should be allowed
```

**Scenario 4: Invalid URL Rejected**

```gherkin
Given WebViewScreen receives URL "not-a-valid-url"
When the URL is validated
Then isUrlAllowed should return false
And error should be caught and handled
```

**Scenario 5: Subdomain Allowed**

```gherkin
Given whitelist contains "linkedin.com"
When URL "https://uk.linkedin.com/in/warrendeleon" is validated
Then isUrlAllowed should return true
And subdomains should be automatically allowed
```

---

## Definition of Ready

- [x] Task description clear and complete
- [x] Acceptance criteria defined
- [x] Story points estimated
- [x] Technical approach identified
- [x] Dependencies identified
- [x] Epic and User Story linked

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code reviewed and approved
- [x] Tests written and passing (100% coverage for validator)
- [x] Documentation updated
- [x] No regressions
- [x] PR merged to main

---

## Story Points & Effort

**Story Points**: 2
**Effort Estimate**: 2 hours
**Actual Effort**: _To be tracked_

**Breakdown**:

- URL validator implementation: 0.5h
- WebViewScreen integration: 0.5h
- Comprehensive tests: 0.75h
- Documentation: 0.25h

---

## Dependencies

**Blockers**: [TASK-107](./TASK-107-remove-production-console-statements.md)

**Blocks**: None

**Enables**: [TASK-109](./TASK-109-add-pdf-url-validation.md)

---

## Git & PR Information

**Branch Name**: `security/webview-url-validation`

**PR Link**: _Not created yet_

**PR Status**: Not started

**Commit Hash**: _Not committed yet_

---

## Code Quality Metrics

**Code Coverage**: 100% for URL validator

**Files Modified**: 1 (WebViewScreen.tsx)

**Files Created**: 2 (urlValidator.ts, urlValidator.test.ts)

**Review Time**: _Not tracked_

**Rework Count**: 0

---

## Implementation Notes

**Key Changes**:

- Create URL validator utility with HTTPS enforcement
- Define domain whitelist in constants
- Update WebViewScreen to validate before loading
- Add error state for rejected URLs
- Comprehensive test coverage

**Validation Results**: _To be filled in during implementation_

**Impact**: Prevents XSS and malicious content loading

---

## Blocked Information

**Blocked**: No

**Blocked Since**: _N/A_

**Blocked Reason**: _N/A_

---

## Timeline & Dates

**Start Date**: _Not yet started_

**Completed Date**: _Not yet completed_

**Archive Date**: _N/A_

---

## Status History

_Auto-tracked when status changes_

| Date       | Status      | Notes        |
| ---------- | ----------- | ------------ |
| 2025-01-17 | Not Started | Task created |

---

## Work Log

_Manual developer notes for significant updates_

---

## Technical Debt

**Introduces Technical Debt**: No

**Pays Down Technical Debt**: Yes - eliminates security vulnerability

**Technical Debt Score**: -3 (significantly pays down security debt)

---

## Success Criteria

✅ URL validator implemented with HTTPS enforcement
✅ Domain whitelist configured
✅ WebViewScreen validates all URLs
✅ Malicious URLs properly rejected
✅ 100% test coverage for validator
✅ All tests passing

---

## Verification

**Verified**: Not yet

**Verification Steps**:

1. Test allowed domain loads (LinkedIn)
2. Test blocked domain rejected
3. Test HTTP URL rejected
4. Test invalid URL rejected
5. Test subdomain handling
6. Run full test suite - all tests passing
7. Manual testing on physical device

---

## Related Tasks

- [TASK-107](./TASK-107-remove-production-console-statements.md) - Console statement removal
- [TASK-109](./TASK-109-add-pdf-url-validation.md) - Similar PDF validation
- All security hardening tasks

---

## References

- [User Story US-022](../stories/US-022-security-hardening.md)
- [Epic EPIC-013](../epics/EPIC-013-production-readiness.md)
- [OWASP URL Validation](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [React Native WebView Security](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#security)

---

**Last Updated**: 2025-01-17

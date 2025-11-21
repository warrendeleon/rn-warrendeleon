# TASK-318: Static Analysis Setup

**ID**: TASK-318 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Set up static security analysis tools for React Native application. Configure ESLint security plugins, install and configure security scanning tools (npm audit, Snyk, semgrep), and integrate into CI/CD pipeline.

---

## Acceptance Criteria

- [ ] ESLint security plugins configured
- [ ] npm audit configured
- [ ] Snyk CLI installed and configured
- [ ] semgrep configured for React Native
- [ ] Security scan scripts in package.json
- [ ] CI/CD integration configured
- [ ] Baseline security report generated
- [ ] Documentation of tools and usage

---

## Implementation Details

### ESLint Security Configuration

```javascript
// eslint.config.js additions

import securityPlugin from 'eslint-plugin-security';
import reactNativeSecurityPlugin from 'eslint-plugin-react-native-security';

export default [
  // ... existing config
  {
    plugins: {
      security: securityPlugin,
      'react-native-security': reactNativeSecurityPlugin,
    },
    rules: {
      // Detect unsafe usage of require
      'security/detect-non-literal-require': 'error',
      // Detect eval usage
      'security/detect-eval-with-expression': 'error',
      // Detect unsafe regex
      'security/detect-unsafe-regex': 'warn',
      // Detect potential command injection
      'security/detect-child-process': 'warn',
      // React Native specific
      'react-native-security/no-insecure-random': 'error',
      'react-native-security/no-inline-styles-with-sensitive-data': 'warn',
    },
  },
];
```

### Package.json Scripts

```json
{
  "scripts": {
    "security:audit": "npm audit --production",
    "security:audit:fix": "npm audit fix",
    "security:snyk": "snyk test",
    "security:snyk:monitor": "snyk monitor",
    "security:semgrep": "semgrep --config auto .",
    "security:all": "npm run security:audit && npm run security:snyk && npm run security:semgrep"
  }
}
```

### Snyk Configuration

```yaml
# .snyk

# Ignore specific vulnerabilities (with justification)
ignore:
  # Example: Ignoring dev dependency vulnerability
  'SNYK-JS-EXAMPLE-123456':
    - '*':
        reason: 'Dev dependency only, not in production'
        expires: '2025-12-31'

# Patch specific vulnerabilities
patch: {}

# Monitor settings
version: v1.29.0
```

### semgrep Configuration

```yaml
# .semgrep.yml

rules:
  - id: react-native-insecure-storage
    pattern: AsyncStorage.setItem($KEY, $SENSITIVE_DATA)
    message: Avoid storing sensitive data in AsyncStorage
    severity: WARNING
    languages: [typescript, javascript]

  - id: hardcoded-credentials
    pattern: |
      const $VAR = "$SECRET"
    message: Potential hardcoded secret
    severity: ERROR
    languages: [typescript, javascript]

  - id: sql-injection
    pattern: |
      `SELECT * FROM ${$TABLE}`
    message: Potential SQL injection
    severity: ERROR
    languages: [typescript, javascript]
```

---

## Definition of Done

- [ ] All security tools installed
- [ ] ESLint security rules configured
- [ ] npm audit working
- [ ] Snyk configured
- [ ] semgrep configured
- [ ] Scripts added to package.json
- [ ] Baseline report generated
- [ ] Documentation complete

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md)

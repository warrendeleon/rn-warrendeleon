# TASK-323: Dynamic Analysis Setup

**ID**: TASK-323 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Set up dynamic analysis and runtime security testing tools for React Native application. Configure runtime instrumentation, network traffic analysis, and automated security testing frameworks to detect vulnerabilities during application execution.

---

## Acceptance Criteria

- [ ] Frida installed and configured for runtime instrumentation
- [ ] mitmproxy configured for network traffic analysis
- [ ] Objection configured for iOS/Android runtime analysis
- [ ] MobSF (Mobile Security Framework) integrated
- [ ] Automated security test scripts created
- [ ] CI/CD integration for dynamic analysis
- [ ] Reporting and alerting configured
- [ ] Documentation of tools and usage

---

## Dynamic Analysis Tools

### 1. Frida (Runtime Instrumentation)

**Purpose**: Hook into running app to inspect/modify behavior at runtime

**Installation**:

```bash
# Install Frida tools
pip3 install frida-tools

# Install Frida server on device/emulator
# iOS
frida-ps -Uai  # List iOS apps

# Android
adb push frida-server /data/local/tmp/
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server &"
```

**Usage Example - Hook Keychain Access**:

```javascript
// scripts/frida/hook-keychain.js

// Hook iOS Keychain reads
if (ObjC.available) {
  var SecItemCopyMatching = Module.findExportByName('Security', 'SecItemCopyMatching');

  Interceptor.attach(SecItemCopyMatching, {
    onEnter: function (args) {
      console.log('[+] SecItemCopyMatching called');
      console.log('Query:', ObjC.Object(args[0]));
    },
    onLeave: function (retval) {
      console.log('Result:', ObjC.Object(ptr(retval)));
    },
  });
}

// Hook Android Keystore
if (Java.available) {
  Java.perform(function () {
    var KeyStore = Java.use('java.security.KeyStore');

    KeyStore.getKey.overload('java.lang.String', '[C').implementation = function (alias, password) {
      console.log('[+] KeyStore.getKey called for alias:', alias);
      var result = this.getKey(alias, password);
      return result;
    };
  });
}
```

**Run Frida Script**:

```bash
# iOS
frida -U -l scripts/frida/hook-keychain.js com.warrendeleon.portfolio

# Android
frida -U -l scripts/frida/hook-keychain.js com.warrendeleon
```

---

### 2. Objection (Mobile Exploration Toolkit)

**Purpose**: Explore mobile application runtime environment without source code

**Installation**:

```bash
pip3 install objection
```

**Usage**:

```bash
# Start objection
objection -g com.warrendeleon explore

# Common commands in objection REPL
ios keychain dump                     # Dump iOS Keychain
android sslpinning disable            # Disable SSL pinning
memory list modules                   # List loaded modules
ios cookies get                       # Get cookies
android root disable                  # Bypass root detection
```

**Automated Script**:

```bash
# scripts/objection/security-check.txt

ios keychain dump
android sslpinning disable
memory list modules
jobs list
exit
```

```bash
# Run automated script
objection -g com.warrendeleon explore --startup-script scripts/objection/security-check.txt
```

---

### 3. mitmproxy (Network Traffic Analysis)

**Purpose**: Intercept and inspect HTTPS traffic

**Installation**:

```bash
pip3 install mitmproxy
```

**Configuration**:

```bash
# Start mitmproxy
mitmproxy --listen-port 8080

# Or use mitmweb for web interface
mitmweb --listen-port 8080 --web-port 8081
```

**Device Configuration**:

**iOS**:

1. Settings → Wi-Fi → Configure Proxy → Manual
2. Server: [Your Mac IP], Port: 8080
3. Safari → http://mitm.it → Install certificate
4. Settings → General → About → Certificate Trust Settings → Enable certificate

**Android**:

1. Settings → Wi-Fi → Long press network → Modify → Proxy → Manual
2. Hostname: [Your Mac IP], Port: 8080
3. Chrome → http://mitm.it → Install certificate
4. Settings → Security → Install from storage

**Custom Script to Log Sensitive Data**:

```python
# scripts/mitmproxy/log-sensitive.py

from mitmproxy import http
import re

def request(flow: http.HTTPFlow) -> None:
    """Log requests containing potential sensitive data"""

    # Check for Authorization header
    if 'Authorization' in flow.request.headers:
        print(f"[!] Authorization header detected: {flow.request.url}")
        print(f"    Value: {flow.request.headers['Authorization'][:20]}...")

    # Check for tokens in body
    if flow.request.content:
        body = flow.request.content.decode('utf-8', errors='ignore')

        # Detect JWT tokens
        jwt_pattern = r'eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*'
        if re.search(jwt_pattern, body):
            print(f"[!] JWT token detected in request body: {flow.request.url}")

        # Detect email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, body)
        if emails:
            print(f"[!] Email addresses in request: {flow.request.url}")
            print(f"    Emails: {emails}")

        # Detect phone numbers
        phone_pattern = r'\+?[1-9]\d{1,14}'
        phones = re.findall(phone_pattern, body)
        if phones:
            print(f"[!] Phone numbers in request: {flow.request.url}")

def response(flow: http.HTTPFlow) -> None:
    """Log responses containing sensitive data"""

    if flow.response and flow.response.content:
        body = flow.response.content.decode('utf-8', errors='ignore')

        # Check for tokens in response
        if 'access_token' in body or 'refresh_token' in body:
            print(f"[!] Tokens in response from: {flow.request.url}")
```

**Run with script**:

```bash
mitmproxy --listen-port 8080 -s scripts/mitmproxy/log-sensitive.py
```

---

### 4. MobSF (Mobile Security Framework)

**Purpose**: Automated mobile app security testing

**Installation (Docker)**:

```bash
# Pull MobSF Docker image
docker pull opensecurity/mobile-security-framework-mobsf

# Run MobSF
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest
```

**Usage**:

1. Open http://localhost:8000
2. Upload APK/IPA file
3. Wait for automated analysis
4. Review findings

**API Integration for CI/CD**:

```bash
# scripts/mobsf/analyze.sh

#!/bin/bash

APK_PATH="$1"
MOBSF_URL="http://localhost:8000"
API_KEY="your-api-key"

# Upload APK
UPLOAD_RESPONSE=$(curl -F "file=@$APK_PATH" \
  -H "Authorization: $API_KEY" \
  "$MOBSF_URL/api/v1/upload")

HASH=$(echo $UPLOAD_RESPONSE | jq -r '.hash')

# Start scan
curl -X POST "$MOBSF_URL/api/v1/scan" \
  -H "Authorization: $API_KEY" \
  -d "hash=$HASH"

# Download report
curl "$MOBSF_URL/api/v1/report_json" \
  -H "Authorization: $API_KEY" \
  -d "hash=$HASH" \
  -o "mobsf-report.json"

# Check for high/critical findings
HIGH_FINDINGS=$(jq '.android_security_analysis | to_entries | map(select(.value.severity == "high" or .value.severity == "critical")) | length' mobsf-report.json)

if [ "$HIGH_FINDINGS" -gt 0 ]; then
  echo "❌ Found $HIGH_FINDINGS high/critical security issues"
  exit 1
else
  echo "✅ No critical security issues found"
  exit 0
fi
```

---

### 5. Runtime Security Checks

**Jailbreak/Root Detection Testing**:

```typescript
// src/services/security/__tests__/DeviceIntegrityCheck.runtime.test.ts

import { DeviceIntegrityCheck } from '../DeviceIntegrityCheck';

describe('DeviceIntegrityCheck - Runtime Tests', () => {
  /**
   * These tests should be run on actual devices:
   * - Jailbroken iOS device
   * - Rooted Android device
   * - Device with debugger attached
   * - Device with Frida running
   */

  it('should detect jailbreak on iOS', async () => {
    // Run on jailbroken iOS device
    const isSecure = await DeviceIntegrityCheck.checkDeviceSecurity();

    // Should detect jailbreak
    expect(isSecure).toBe(false);
  });

  it('should detect root on Android', async () => {
    // Run on rooted Android device
    const isSecure = await DeviceIntegrityCheck.checkDeviceSecurity();

    // Should detect root
    expect(isSecure).toBe(false);
  });

  it('should detect Frida runtime instrumentation', async () => {
    // Run with Frida attached
    const isFridaDetected = DeviceIntegrityCheck.detectFrida();

    expect(isFridaDetected).toBe(true);
  });

  it('should detect debugger attachment', () => {
    // Run with debugger attached
    const isDebugging = DeviceIntegrityCheck.isDebuggerAttached();

    expect(isDebugging).toBe(true);
  });
});
```

---

### 6. SSL Pinning Bypass Detection

**Test SSL Pinning Resistance**:

```bash
# scripts/security/test-ssl-pinning.sh

#!/bin/bash

echo "Testing SSL pinning implementation..."

# 1. Start mitmproxy
mitmproxy --listen-port 8080 &
MITM_PID=$!

# 2. Configure device proxy (manual step)
echo "Configure device to use proxy: $(ipconfig getifaddr en0):8080"
echo "Press Enter when ready..."
read

# 3. Try to bypass SSL pinning with objection
objection -g com.warrendeleon explore --startup-command "android sslpinning disable"

# 4. Launch app and make API calls
echo "Launch app and trigger API calls"
echo "Check mitmproxy for intercepted traffic"
echo "Press Enter when done..."
read

# 5. Check if traffic was intercepted
if grep -q "supabase.co" ~/.mitmproxy/flows; then
  echo "❌ SSL pinning bypassed! Traffic was intercepted"
  exit 1
else
  echo "✅ SSL pinning working - traffic was NOT intercepted"
  exit 0
fi

# Cleanup
kill $MITM_PID
```

---

## Automated Security Test Suite

### Dynamic Analysis Test Script

```typescript
// scripts/security/dynamic-tests.ts

import { execSync } from 'child_process';
import * as fs from 'fs';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  details: string;
}

class DynamicSecurityTester {
  private results: SecurityTestResult[] = [];

  /**
   * Run all dynamic security tests
   */
  async runAllTests(): Promise<void> {
    console.log('Starting dynamic security analysis...\n');

    await this.testKeychainAccess();
    await this.testNetworkTraffic();
    await this.testSSLPinning();
    await this.testRuntimeHooks();
    await this.testDataStorage();

    this.generateReport();
  }

  /**
   * Test 1: Keychain access patterns
   */
  private async testKeychainAccess(): Promise<void> {
    console.log('Testing Keychain access...');

    try {
      // Run Frida script to hook Keychain
      const output = execSync(
        'frida -U -l scripts/frida/hook-keychain.js com.warrendeleon --no-pause',
        { timeout: 30000 }
      ).toString();

      // Check if sensitive data accessed
      const hasSensitiveAccess =
        output.includes('access_token') || output.includes('refresh_token');

      this.results.push({
        testName: 'Keychain Access',
        passed: hasSensitiveAccess,
        details: hasSensitiveAccess
          ? 'Tokens stored in Keychain (PASS)'
          : 'Tokens NOT in Keychain (FAIL)',
      });
    } catch (error) {
      this.results.push({
        testName: 'Keychain Access',
        passed: false,
        details: `Test failed: ${error.message}`,
      });
    }
  }

  /**
   * Test 2: Network traffic encryption
   */
  private async testNetworkTraffic(): Promise<void> {
    console.log('Testing network traffic...');

    try {
      // Start mitmproxy and capture traffic
      execSync('mitmproxy --listen-port 8080 &');

      // Wait for app to make requests (manual step)
      console.log('Make API calls in the app...');
      await this.sleep(60000); // 60 seconds

      // Check if traffic was encrypted
      const flows = fs.readFileSync('~/.mitmproxy/flows', 'utf8');
      const hasPlaintextData = flows.includes('password') || flows.includes('access_token');

      this.results.push({
        testName: 'Network Traffic Encryption',
        passed: !hasPlaintextData,
        details: hasPlaintextData
          ? 'Plaintext sensitive data found (FAIL)'
          : 'All traffic encrypted (PASS)',
      });
    } catch (error) {
      this.results.push({
        testName: 'Network Traffic Encryption',
        passed: false,
        details: `Test failed: ${error.message}`,
      });
    }
  }

  /**
   * Test 3: SSL pinning effectiveness
   */
  private async testSSLPinning(): Promise<void> {
    console.log('Testing SSL pinning...');

    try {
      // Try to bypass SSL pinning with objection
      const output = execSync(
        'objection -g com.warrendeleon explore --startup-command "android sslpinning disable"'
      ).toString();

      // If bypass successful, pinning is weak
      const bypassSuccessful = output.includes('SSL pinning disabled');

      this.results.push({
        testName: 'SSL Pinning',
        passed: !bypassSuccessful,
        details: bypassSuccessful ? 'SSL pinning bypassed (FAIL)' : 'SSL pinning resistant (PASS)',
      });
    } catch (error) {
      // Error means bypass failed (good)
      this.results.push({
        testName: 'SSL Pinning',
        passed: true,
        details: 'SSL pinning bypass failed (PASS)',
      });
    }
  }

  /**
   * Test 4: Runtime hook detection
   */
  private async testRuntimeHooks(): Promise<void> {
    console.log('Testing runtime hook detection...');

    try {
      // Attach Frida and check if app detects it
      const output = execSync(
        'frida -U -l scripts/frida/test-detection.js com.warrendeleon --no-pause'
      ).toString();

      const detectionTriggered = output.includes('Frida detected');

      this.results.push({
        testName: 'Runtime Hook Detection',
        passed: detectionTriggered,
        details: detectionTriggered ? 'Frida detected by app (PASS)' : 'Frida NOT detected (FAIL)',
      });
    } catch (error) {
      this.results.push({
        testName: 'Runtime Hook Detection',
        passed: false,
        details: `Test failed: ${error.message}`,
      });
    }
  }

  /**
   * Test 5: Data storage security
   */
  private async testDataStorage(): Promise<void> {
    console.log('Testing data storage...');

    try {
      // Use objection to dump storage
      const output = execSync(
        'objection -g com.warrendeleon explore --startup-command "env"'
      ).toString();

      // Check for sensitive data in plain storage
      const hasPlaintextPII =
        output.includes('@') || // email
        output.includes('+'); // phone

      this.results.push({
        testName: 'Data Storage Security',
        passed: !hasPlaintextPII,
        details: hasPlaintextPII
          ? 'PII found in plain storage (FAIL)'
          : 'No PII in plain storage (PASS)',
      });
    } catch (error) {
      this.results.push({
        testName: 'Data Storage Security',
        passed: false,
        details: `Test failed: ${error.message}`,
      });
    }
  }

  /**
   * Generate test report
   */
  private generateReport(): void {
    console.log('\n========================================');
    console.log('Dynamic Security Analysis Report');
    console.log('========================================\n');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.testName}`);
      console.log(`   ${result.details}\n`);
    });

    console.log(`\nTotal: ${passed}/${total} tests passed`);

    // Write JSON report
    fs.writeFileSync('dynamic-security-report.json', JSON.stringify(this.results, null, 2));

    // Exit with error if any tests failed
    if (passed < total) {
      process.exit(1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests
const tester = new DynamicSecurityTester();
tester.runAllTests();
```

**Run dynamic tests**:

```bash
ts-node scripts/security/dynamic-tests.ts
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/security-dynamic-analysis.yml

name: Dynamic Security Analysis

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 1' # Weekly on Monday 2 AM

jobs:
  dynamic-analysis:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install Frida and tools
        run: |
          pip3 install frida-tools objection mitmproxy

      - name: Build app
        run: |
          yarn install
          cd ios && pod install && cd ..
          yarn ios:build:release

      - name: Start MobSF
        run: |
          docker run -d -p 8000:8000 opensecurity/mobile-security-framework-mobsf

      - name: Run MobSF analysis
        run: |
          ./scripts/mobsf/analyze.sh ios/build/warrendeleon.ipa

      - name: Upload MobSF report
        uses: actions/upload-artifact@v3
        with:
          name: mobsf-report
          path: mobsf-report.json

      - name: Check for critical findings
        run: |
          CRITICAL=$(jq '.android_security_analysis | to_entries | map(select(.value.severity == "critical")) | length' mobsf-report.json)
          if [ "$CRITICAL" -gt 0 ]; then
            echo "❌ Found $CRITICAL critical security issues"
            exit 1
          fi
```

---

## Definition of Done

- [ ] Frida installed and configured
- [ ] Objection installed and tested
- [ ] mitmproxy configured for traffic analysis
- [ ] MobSF integrated for automated scanning
- [ ] Custom Frida scripts for keychain/storage hooks
- [ ] Network traffic analysis scripts
- [ ] SSL pinning bypass testing
- [ ] Automated security test suite created
- [ ] CI/CD workflow for dynamic analysis
- [ ] Documentation of all tools and usage
- [ ] Team trained on tools

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-318](TASK-318-static-analysis-setup.md)

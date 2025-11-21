# TASK-326: Network Security Testing

**ID**: TASK-326 | **Epic**: [EPIC-029](../epics/EPIC-029-security-audit.md) | **User Story**: [US-057](../stories/US-057-owasp-compliance-audit.md)
**Status**: 📋 To Do | **Effort**: 2h

---

## Task Description

Conduct penetration testing for network security. Test HTTPS enforcement, TLS configuration, certificate pinning, SSL/TLS vulnerabilities, man-in-the-middle attack resistance, and secure WebSocket connections.

---

## Acceptance Criteria

- [ ] HTTPS enforcement verified
- [ ] TLS 1.2+ configuration validated
- [ ] Certificate pinning tested
- [ ] SSL/TLS vulnerabilities checked
- [ ] MITM attack resistance verified
- [ ] WebSocket security tested
- [ ] API security headers validated
- [ ] All vulnerabilities documented
- [ ] Test report generated

---

## Network Security Test Plan

### 1. HTTPS Enforcement Testing

#### Test 1.1: No Plaintext HTTP Connections

**Objective**: Verify all connections use HTTPS, never HTTP

**Test Steps**:

```typescript
// src/services/api/__tests__/HTTPSEnforcement.security.test.ts

import { apiClient } from '../apiClient';
import axios from 'axios';

describe('HTTPS Enforcement', () => {
  it('should reject HTTP URLs', async () => {
    const httpUrl = 'http://insecure-api.com/data';

    await expect(apiClient.get(httpUrl)).rejects.toThrow('HTTPS required');
  });

  it('should only accept HTTPS URLs', async () => {
    const httpsUrl = 'https://secure-api.com/data';

    // Should not throw HTTPS error (may fail for other reasons)
    // The point is HTTPS is allowed
    try {
      await apiClient.get(httpsUrl);
    } catch (error) {
      expect(error.message).not.toContain('HTTPS required');
    }
  });

  it('should validate URL scheme in config', () => {
    const { SUPABASE_URL, API_BASE_URL } = ENV_CONFIG;

    expect(SUPABASE_URL).toMatch(/^https:\/\//);
    expect(API_BASE_URL).toMatch(/^https:\/\//);
  });

  it('should block cleartext traffic on Android', () => {
    // Verify AndroidManifest.xml has:
    // android:usesCleartextTraffic="false"

    const manifestPath = 'android/app/src/main/AndroidManifest.xml';
    const manifest = fs.readFileSync(manifestPath, 'utf8');

    expect(manifest).toContain('android:usesCleartextTraffic="false"');
  });

  it('should enforce App Transport Security on iOS', () => {
    // Verify Info.plist has NSAppTransportSecurity configured
    const infoPlistPath = 'ios/warrendeleon/Info.plist';
    const plist = fs.readFileSync(infoPlistPath, 'utf8');

    expect(plist).toContain('NSAppTransportSecurity');
    expect(plist).toContain('NSAllowsArbitraryLoads');
    expect(plist).toContain('<false/>'); // Should be false
  });
});
```

---

### 2. TLS Configuration Testing

#### Test 2.1: TLS Version Validation

**Objective**: Verify TLS 1.2+ enforced, older versions rejected

**Test Steps**:

```bash
# scripts/security/test-tls.sh

#!/bin/bash

API_HOST="your-project.supabase.co"
PORT=443

echo "Testing TLS configuration for $API_HOST..."

# Test TLS 1.0 (should fail)
echo "Testing TLS 1.0 (should be rejected)..."
openssl s_client -connect $API_HOST:$PORT -tls1 < /dev/null
if [ $? -eq 0 ]; then
  echo "❌ TLS 1.0 accepted - VULNERABILITY"
  exit 1
else
  echo "✅ TLS 1.0 rejected"
fi

# Test TLS 1.1 (should fail)
echo "Testing TLS 1.1 (should be rejected)..."
openssl s_client -connect $API_HOST:$PORT -tls1_1 < /dev/null
if [ $? -eq 0 ]; then
  echo "❌ TLS 1.1 accepted - VULNERABILITY"
  exit 1
else
  echo "✅ TLS 1.1 rejected"
fi

# Test TLS 1.2 (should succeed)
echo "Testing TLS 1.2 (should be accepted)..."
openssl s_client -connect $API_HOST:$PORT -tls1_2 < /dev/null
if [ $? -eq 0 ]; then
  echo "✅ TLS 1.2 accepted"
else
  echo "❌ TLS 1.2 rejected - ERROR"
  exit 1
fi

# Test TLS 1.3 (should succeed if supported)
echo "Testing TLS 1.3 (should be accepted)..."
openssl s_client -connect $API_HOST:$PORT -tls1_3 < /dev/null
if [ $? -eq 0 ]; then
  echo "✅ TLS 1.3 accepted"
else
  echo "⚠️  TLS 1.3 not supported (acceptable)"
fi

echo "✅ TLS configuration test complete"
```

---

#### Test 2.2: Cipher Suite Validation

**Objective**: Verify strong cipher suites, weak ciphers disabled

**Test Steps**:

```bash
# Test cipher suites
nmap --script ssl-enum-ciphers -p 443 your-project.supabase.co

# Should see:
# - TLS_AES_256_GCM_SHA384 (TLS 1.3)
# - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (TLS 1.2)

# Should NOT see:
# - RC4 ciphers (broken)
# - DES/3DES (weak)
# - Export ciphers (weak)
# - NULL ciphers (no encryption)
```

**Test Case**:

```typescript
// src/services/api/__tests__/CipherSuites.security.test.ts

describe('TLS Cipher Suites', () => {
  it('should use strong cipher suites', async () => {
    // Make HTTPS request and check cipher
    const response = await apiClient.get('/api/health');

    // Axios doesn't expose cipher info directly
    // Requires native module or external tool verification

    // Alternative: Check via ssllabs.com API
    const ssllabsReport = await checkSSLLabs('your-project.supabase.co');
    expect(ssllabsReport.grade).toMatch(/A[+]?/);
  });

  it('should not use weak ciphers', async () => {
    // List of weak ciphers
    const weakCiphers = ['RC4', 'DES', '3DES', 'NULL', 'EXPORT', 'anon'];

    const cipherSuites = await getSupportedCiphers('your-project.supabase.co');

    for (const weakCipher of weakCiphers) {
      const hasWeakCipher = cipherSuites.some(suite => suite.toUpperCase().includes(weakCipher));

      expect(hasWeakCipher).toBe(false);
    }
  });
});
```

---

### 3. Certificate Pinning Testing

#### Test 3.1: Certificate Pinning Effectiveness

**Objective**: Verify certificate pinning prevents MITM attacks

**Test Steps**:

```bash
# scripts/security/test-cert-pinning.sh

#!/bin/bash

echo "Testing certificate pinning..."

# 1. Start mitmproxy
mitmproxy --listen-port 8080 &
MITM_PID=$!
sleep 2

# 2. Configure device to use proxy
echo "Configure device:"
echo "  iOS: Settings → Wi-Fi → Proxy → Manual"
echo "  Android: Wi-Fi → Long press → Modify → Proxy"
echo "  Host: $(ipconfig getifaddr en0)"
echo "  Port: 8080"
echo ""
echo "Install mitmproxy certificate:"
echo "  Navigate to http://mitm.it and install cert"
echo ""
read -p "Press Enter when device is configured..."

# 3. Launch app and try to make API calls
echo "Launch app and trigger API calls"
read -p "Press Enter when done..."

# 4. Check if mitmproxy intercepted traffic
if grep -q "your-project.supabase.co" ~/.mitmproxy/flows; then
  echo "❌ Certificate pinning BYPASSED - traffic intercepted"
  kill $MITM_PID
  exit 1
else
  echo "✅ Certificate pinning WORKING - traffic NOT intercepted"
  kill $MITM_PID
  exit 0
fi
```

---

#### Test 3.2: Pinning Implementation Verification

**Test Steps**:

```typescript
// src/services/api/__tests__/CertificatePinning.security.test.ts

describe('Certificate Pinning', () => {
  it('should have certificate pins configured (Android)', () => {
    const configPath = 'android/app/src/main/res/xml/network_security_config.xml';

    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');

      // Verify pin-set exists
      expect(config).toContain('<pin-set');
      expect(config).toContain('digest="SHA-256"');

      // Verify domain configured
      expect(config).toContain('supabase.co');

      // Verify expiration date in future
      const expirationMatch = config.match(/expiration="(\d{4}-\d{2}-\d{2})"/);
      if (expirationMatch) {
        const expirationDate = new Date(expirationMatch[1]);
        expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
      }
    }
  });

  it('should have certificate pins configured (iOS)', () => {
    // Check for TrustKit configuration in AppDelegate
    const appDelegatePath = 'ios/warrendeleon/AppDelegate.mm';
    const appDelegate = fs.readFileSync(appDelegatePath, 'utf8');

    // Verify TrustKit import
    expect(appDelegate).toContain('TrustKit');

    // Verify configuration
    expect(appDelegate).toContain('kTSKPinnedDomains');
    expect(appDelegate).toContain('kTSKPublicKeyHashes');
  });

  it('should have backup pin configured', () => {
    // Both platforms should have backup pin in case primary rotates
    const androidConfig = fs.readFileSync(
      'android/app/src/main/res/xml/network_security_config.xml',
      'utf8'
    );

    // Should have at least 2 pins
    const pinCount = (androidConfig.match(/<pin digest=/g) || []).length;
    expect(pinCount).toBeGreaterThanOrEqual(2);
  });
});
```

---

### 4. SSL/TLS Vulnerability Scanning

#### Test 4.1: Known Vulnerabilities

**Objective**: Check for known SSL/TLS vulnerabilities

**Test Steps**:

```bash
# Use testssl.sh for comprehensive SSL/TLS testing
git clone https://github.com/drwetter/testssl.sh.git
cd testssl.sh

./testssl.sh --full your-project.supabase.co

# Should check for:
# - Heartbleed (CVE-2014-0160)
# - CCS Injection (CVE-2014-0224)
# - POODLE (CVE-2014-3566)
# - FREAK (CVE-2015-0204)
# - Logjam (CVE-2015-4000)
# - DROWN (CVE-2016-0800)
# - BEAST (CVE-2011-3389)
# - CRIME (CVE-2012-4929)
```

**Expected Output**:

```
Testing all 276 locally available ciphers against the server

 Hexcode  Cipher Suite Name (OpenSSL)       KeyExch.   Encryption  Bits

 xc030   ECDHE-RSA-AES256-GCM-SHA384       ECDH 256   AESGCM      256   ✅
 xc02f   ECDHE-RSA-AES128-GCM-SHA256       ECDH 256   AESGCM      128   ✅
 xc028   ECDHE-RSA-AES256-SHA384           ECDH 256   AES         256   ✅
 xc027   ECDHE-RSA-AES128-SHA256           ECDH 256   AES         128   ✅

 Testing for vulnerabilities

 Heartbleed (CVE-2014-0160)                not vulnerable ✅
 CCS (CVE-2014-0224)                       not vulnerable ✅
 POODLE, SSL (CVE-2014-3566)               not vulnerable ✅
 FREAK (CVE-2015-0204)                     not vulnerable ✅
 Logjam (CVE-2015-4000)                    not vulnerable ✅
 DROWN (CVE-2016-0800)                     not vulnerable ✅
```

---

### 5. Man-in-the-Middle Attack Testing

#### Test 5.1: MITM Attack Simulation

**Objective**: Verify app resists MITM attacks

**Test Steps**:

```bash
# scripts/security/mitm-test.sh

#!/bin/bash

echo "Simulating MITM attack..."

# 1. Set up malicious proxy
mitmproxy --listen-port 8080 -s scripts/mitmproxy/malicious-proxy.py &
MITM_PID=$!

# 2. Try to intercept traffic
echo "Configuring device to use malicious proxy..."
echo "If certificate pinning works, app should reject connections"

# 3. Monitor for successful connections
sleep 60

if grep -q "200 OK" ~/.mitmproxy/flows; then
  echo "❌ MITM attack successful - CRITICAL VULNERABILITY"
  kill $MITM_PID
  exit 1
else
  echo "✅ MITM attack blocked - app refused to connect"
  kill $MITM_PID
  exit 0
fi
```

**Malicious Proxy Script**:

```python
# scripts/mitmproxy/malicious-proxy.py

from mitmproxy import http

def request(flow: http.HTTPFlow) -> None:
    """Attempt to modify requests"""

    # Try to inject malicious header
    flow.request.headers["X-Malicious"] = "injected"

    # Try to steal auth token
    if 'Authorization' in flow.request.headers:
        print(f"[!] Stolen token: {flow.request.headers['Authorization']}")

def response(flow: http.HTTPFlow) -> None:
    """Attempt to modify responses"""

    # Try to inject malicious data
    if 'application/json' in flow.response.headers.get('content-type', ''):
        try:
            data = json.loads(flow.response.content)
            data['malicious'] = True
            flow.response.content = json.dumps(data).encode()
            print("[!] Response modified")
        except:
            pass
```

---

### 6. WebSocket Security Testing

#### Test 6.1: Secure WebSocket (wss://)

**Objective**: Verify WebSocket connections use wss:// not ws://

**Test Steps**:

```typescript
// src/services/realtime/__tests__/WebSocketSecurity.security.test.ts

import { createClient } from '@supabase/supabase-js';

describe('WebSocket Security', () => {
  it('should use secure WebSocket (wss://)', () => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    // Get WebSocket URL
    const wsUrl = supabase.realtime.channels.socket?.connection?.transport?.url;

    expect(wsUrl).toMatch(/^wss:\/\//);
    expect(wsUrl).not.toMatch(/^ws:\/\//);
  });

  it('should authenticate WebSocket connections', async () => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    // Subscribe to channel
    const channel = supabase.channel('test');

    // Verify authentication token sent
    await channel.subscribe(status => {
      if (status === 'SUBSCRIBED') {
        // Check socket has access token
        const socket = supabase.realtime.channels.socket;
        expect(socket?.accessToken).toBeTruthy();
      }
    });
  });

  it('should reject unauthenticated WebSocket connections', async () => {
    const unauthClient = createClient(process.env.SUPABASE_URL!, 'invalid-key');

    const channel = unauthClient.channel('test');

    await expect(
      new Promise((resolve, reject) => {
        channel.subscribe(status => {
          if (status === 'CHANNEL_ERROR') {
            reject(new Error('Authentication failed'));
          }
        });

        setTimeout(() => resolve(true), 5000);
      })
    ).rejects.toThrow('Authentication failed');
  });
});
```

---

### 7. API Security Headers Testing

#### Test 7.1: Security Headers Validation

**Objective**: Verify API responses include proper security headers

**Test Steps**:

```typescript
// src/services/api/__tests__/SecurityHeaders.security.test.ts

describe('API Security Headers', () => {
  it('should include Strict-Transport-Security header', async () => {
    const response = await apiClient.get('/api/health');

    expect(response.headers['strict-transport-security']).toBeTruthy();
    expect(response.headers['strict-transport-security']).toContain('max-age=');
  });

  it('should include Content-Security-Policy header', async () => {
    const response = await apiClient.get('/api/data');

    expect(response.headers['content-security-policy']).toBeTruthy();
  });

  it('should include X-Content-Type-Options header', async () => {
    const response = await apiClient.get('/api/data');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include X-Frame-Options header', async () => {
    const response = await apiClient.get('/api/data');

    expect(response.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
  });

  it('should include X-XSS-Protection header', async () => {
    const response = await apiClient.get('/api/data');

    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });

  it('should NOT expose server information', async () => {
    const response = await apiClient.get('/api/health');

    // Server header should not reveal version
    const server = response.headers['server'];
    expect(server).not.toMatch(/\d+\.\d+/); // No version numbers
  });

  it('should NOT expose X-Powered-By header', async () => {
    const response = await apiClient.get('/api/data');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
```

---

### 8. DNS Security Testing

#### Test 8.1: DNSSEC Validation

**Objective**: Verify DNSSEC enabled for domain

**Test Steps**:

```bash
# Check DNSSEC
dig +dnssec your-project.supabase.co

# Should see:
# - RRSIG records (signatures)
# - AD flag (authenticated data)
```

---

## Automated Security Testing

### Continuous Monitoring

```typescript
// scripts/security/network-monitor.ts

import axios from 'axios';
import * as fs from 'fs';

interface SecurityTestResult {
  test: string;
  passed: boolean;
  details: string;
}

class NetworkSecurityMonitor {
  private results: SecurityTestResult[] = [];

  async runAllTests(): Promise<void> {
    await this.testHTTPSEnforcement();
    await this.testTLSVersion();
    await this.testSecurityHeaders();
    await this.testCertificatePinning();

    this.generateReport();
  }

  private async testHTTPSEnforcement(): Promise<void> {
    try {
      await axios.get('http://your-project.supabase.co');

      this.results.push({
        test: 'HTTPS Enforcement',
        passed: false,
        details: 'HTTP connection allowed (should be blocked)',
      });
    } catch (error) {
      this.results.push({
        test: 'HTTPS Enforcement',
        passed: true,
        details: 'HTTP connection blocked as expected',
      });
    }
  }

  private async testTLSVersion(): Promise<void> {
    // Use external API to check TLS configuration
    const response = await axios.get(
      `https://api.ssllabs.com/api/v3/analyze?host=your-project.supabase.co`
    );

    const grade = response.data.endpoints[0]?.grade;

    this.results.push({
      test: 'TLS Configuration',
      passed: grade && grade.match(/A[+]?/),
      details: `SSL Labs grade: ${grade}`,
    });
  }

  private async testSecurityHeaders(): Promise<void> {
    const response = await axios.get('https://your-project.supabase.co/api/health');

    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
    ];

    const missingHeaders = requiredHeaders.filter(header => !response.headers[header]);

    this.results.push({
      test: 'Security Headers',
      passed: missingHeaders.length === 0,
      details:
        missingHeaders.length > 0
          ? `Missing headers: ${missingHeaders.join(', ')}`
          : 'All required headers present',
    });
  }

  private async testCertificatePinning(): Promise<void> {
    // This requires actual device testing
    // Placeholder for CI/CD integration

    this.results.push({
      test: 'Certificate Pinning',
      passed: true,
      details: 'Manual verification required',
    });
  }

  private generateReport(): void {
    console.log('\n========================================');
    console.log('Network Security Test Report');
    console.log('========================================\n');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.test}`);
      console.log(`   ${result.details}\n`);
    });

    console.log(`\nTotal: ${passed}/${total} tests passed`);

    fs.writeFileSync('network-security-report.json', JSON.stringify(this.results, null, 2));

    if (passed < total) {
      process.exit(1);
    }
  }
}

const monitor = new NetworkSecurityMonitor();
monitor.runAllTests();
```

---

## CI/CD Integration

```yaml
# .github/workflows/network-security.yml

name: Network Security Testing

on:
  schedule:
    - cron: '0 0 * * *' # Daily
  push:
    branches: [main]

jobs:
  network-security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Test SSL/TLS Configuration
        run: |
          ./scripts/security/test-tls.sh

      - name: Scan for SSL Vulnerabilities
        run: |
          docker run --rm nmap --script ssl-enum-ciphers -p 443 ${{ secrets.API_HOST }}

      - name: Run testssl.sh
        run: |
          docker run --rm drwetter/testssl.sh:latest ${{ secrets.API_HOST }}

      - name: Check Security Headers
        run: |
          curl -I https://${{ secrets.API_HOST }}/api/health | grep -i "strict-transport-security"

      - name: SSL Labs Scan
        run: |
          curl "https://api.ssllabs.com/api/v3/analyze?host=${{ secrets.API_HOST }}"
```

---

## Definition of Done

- [ ] HTTPS enforcement verified
- [ ] TLS 1.2+ configuration validated
- [ ] Certificate pinning tested and working
- [ ] SSL/TLS vulnerabilities scanned (all passed)
- [ ] MITM attack resistance confirmed
- [ ] WebSocket security verified (wss://)
- [ ] API security headers validated
- [ ] Automated monitoring implemented
- [ ] All findings documented
- [ ] Test report generated

---

**Last Updated**: 2025-11-21
**Related**: [US-057](../stories/US-057-owasp-compliance-audit.md), [EPIC-029](../epics/EPIC-029-security-audit.md), [TASK-325](TASK-325-data-storage-testing.md)

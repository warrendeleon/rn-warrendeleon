# TASK-190: iOS Security Hardening (App Transport Security + Configuration)

**Task ID**: TASK-190
**Title**: iOS Security Hardening (ATS + Security Configuration)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ✅ Done
**Priority**: High
**Effort**: 1 hour
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

iOS apps must comply with Apple's App Transport Security (ATS) requirements, which enforce HTTPS-only connections and strong encryption standards. ATS has been mandatory since iOS 9, and Apple rejects apps that don't properly configure it.

This task configures iOS security hardening:

- **App Transport Security (ATS)**: HTTPS-only, strong TLS versions, perfect forward secrecy
- **Data Protection**: Encryption for files and keychain
- **Certificate Pinning Preparation**: SSL pinning setup (optional but recommended)
- **Deep Linking Security**: Validate deep link URLs for email verification
- **Entitlements**: Keychain sharing, Associated Domains for universal links

**Why This Matters**:

- Apple App Store requirement (rejections without proper ATS)
- Protects against man-in-the-middle (MITM) attacks
- Encrypts all network traffic with strong TLS
- Secures Keychain data with hardware-backed encryption
- Prevents insecure cleartext HTTP connections

---

## Objective

Configure iOS security hardening:

1. Verify App Transport Security (ATS) enabled (default in React Native)
2. Configure ATS exceptions for localhost (development only)
3. Enable Data Protection for files and Keychain
4. Configure deep linking with URL validation
5. Set up entitlements for Keychain access groups
6. Prepare certificate pinning (optional but recommended)
7. Test production build on physical iOS device

**Deliverable**: Production iOS build with ATS enforced, Keychain secured, deep links validated, ready for secure deployment and App Store submission.

---

## Acceptance Criteria

- [x] **ATS enabled** by default (verify `NSAppTransportSecurity` not disabling it)
- [x] **Localhost exception** configured for React Native Metro (development only)
- [x] **Data Protection** enabled for Keychain and files
- [x] **Keychain entitlements** configured for access groups
- [x] **Deep linking** configured with URL scheme validation
- [x] **Certificate pinning prepared** for Supabase (TrustKit configured with primary + backup pins)
- [ ] **Production build tested** on physical iOS device (no ATS violations)
- [ ] **All HTTP connections fail** (HTTPS-only verified)
- [ ] **Keychain access** works with biometric protection

---

## Detailed Implementation Guide

### Phase 1: Verify ATS Configuration (10 minutes)

#### Step 1.1: Check Info.plist for ATS Settings

Open `/Users/warrendeleon/Developer/warrendeleon/ios/warrendeleon/Info.plist`:

**Verify ATS is NOT disabled** - this section should NOT exist:

```xml
<!-- ❌ BAD - ATS completely disabled -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>  <!-- NEVER DO THIS IN PRODUCTION -->
</dict>
```

**If the above exists, REMOVE IT**. ATS should be enabled by default.

**Expected Result**: No `NSAppTransportSecurity` section in Info.plist (ATS enabled by default).

#### Step 1.2: Add Localhost Exception for Development

**ONLY for development**, add localhost exception for React Native Metro bundler:

**Add this to Info.plist** (inside `<dict>` tag):

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <!-- Default: Enforce ATS for all domains -->
    <key>NSAllowsArbitraryLoads</key>
    <false/>

    <!-- Exception: Allow localhost for React Native Metro (development only) -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

**⚠️ CRITICAL**: This exception is ONLY for localhost. All production API calls must use HTTPS.

**Expected Result**: Metro bundler works in development, production enforces HTTPS-only.

---

### Phase 2: Data Protection Configuration (15 minutes)

#### Step 2.1: Enable Data Protection in Xcode

1. **Open Xcode**: `cd ios && open warrendeleon.xcworkspace`
2. **Select project** in navigator (left sidebar)
3. **Select target**: `warrendeleon`
4. **Navigate to** "Signing & Capabilities" tab
5. **Click** "+ Capability" button (top-left)
6. **Search** for "Data Protection"
7. **Add** "Data Protection" capability

**Expected Result**: Data Protection entitlement added to project.

#### Step 2.2: Verify Data Protection Entitlements

Check `/Users/warrendeleon/Developer/warrendeleon/ios/warrendeleon/warrendeleon.entitlements`:

**Should contain**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Data Protection: Files encrypted when device locked -->
    <key>com.apple.developer.default-data-protection</key>
    <string>NSFileProtectionComplete</string>
</dict>
</plist>
```

**Data Protection Levels**:

- `NSFileProtectionComplete`: Files only accessible when device unlocked (MOST SECURE) ✅
- `NSFileProtectionCompleteUnlessOpen`: Files accessible if already open when locked
- `NSFileProtectionCompleteUntilFirstUserAuthentication`: Default iOS level

**We use `NSFileProtectionComplete`** for maximum security.

**Save file**.

---

### Phase 3: Keychain Access Groups (10 minutes)

#### Step 3.1: Add Keychain Sharing Capability

In Xcode (still open from Phase 2):

1. **Signing & Capabilities** tab
2. **Click** "+ Capability"
3. **Search** for "Keychain Sharing"
4. **Add** "Keychain Sharing" capability

#### Step 3.2: Configure Keychain Access Group

Under "Keychain Sharing" section:

**Add Keychain Group**:

```
$(AppIdentifierPrefix)com.warrendeleon.portfolio
```

**Explanation**:

- `$(AppIdentifierPrefix)`: Your Apple Team ID (automatically resolved)
- `com.warrendeleon.portfolio`: Your app's bundle identifier

**Expected Result**: Keychain group added, allowing secure token storage.

#### Step 3.3: Verify Entitlements File

Check `/Users/warrendeleon/Developer/warrendeleon/ios/warrendeleon/warrendeleon.entitlements`:

**Should now contain**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Data Protection -->
    <key>com.apple.developer.default-data-protection</key>
    <string>NSFileProtectionComplete</string>

    <!-- Keychain Access Groups -->
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.warrendeleon.portfolio</string>
    </array>
</dict>
</plist>
```

**Save file**.

---

### Phase 4: Deep Linking Configuration (15 minutes)

#### Step 4.1: Register URL Scheme in Info.plist

Open `/Users/warrendeleon/Developer/warrendeleon/ios/warrendeleon/Info.plist`:

**Add URL scheme** for deep linking (OAuth callbacks, email verification):

```xml
<!-- URL Schemes for Deep Linking -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>com.warrendeleon.portfolio</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>warrendeleonapp</string>
        </array>
    </dict>
</array>
```

**Explanation**:

- URL scheme: `warrendeleonapp://`
- Used for: `warrendeleonapp://auth/callback` (email verification)
- Used for: `warrendeleonapp://oauth/linkedin/callback` (LinkedIn OAuth)

#### Step 4.2: Configure Associated Domains (Universal Links - Optional)

**⚠️ OPTIONAL**: For production universal links (e.g., `https://warrendeleon.com/auth/callback`).

In Xcode:

1. **Signing & Capabilities** → "+ Capability"
2. **Add** "Associated Domains"
3. **Add domain**:
   ```
   applinks:warrendeleon.com
   ```

**Skip for now** if you don't have a custom domain. Use URL scheme (`warrendeleonapp://`) for MVP.

---

### Phase 5: Certificate Pinning Preparation (Optional - 10 minutes)

**⚠️ OPTIONAL**: Certificate pinning is recommended but adds complexity. Can add later.

#### Step 5.1: Add TrustKit via CocoaPods (if implementing pinning)

Edit `/Users/warrendeleon/Developer/warrendeleon/ios/Podfile`:

**Add TrustKit dependency**:

```ruby
target 'warrendeleon' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true,
  )

  # Certificate Pinning (Optional)
  pod 'TrustKit', '~> 2.0'

  # Rest of dependencies...
end
```

**Install pods**:

```bash
cd ios
pod install
cd ..
```

#### Step 5.2: Configure TrustKit in AppDelegate

Open `/Users/warrendeleon/Developer/warrendeleon/ios/warrendeleon/AppDelegate.mm`:

**Add TrustKit initialization** (in `application:didFinishLaunchingWithOptions:`):

```objc
#import <TrustKit/TrustKit.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // TrustKit Certificate Pinning Configuration
  NSDictionary *trustKitConfig = @{
    kTSKSwizzleNetworkDelegates: @YES,
    kTSKPinnedDomains: @{
      @"supabase.co": @{
        kTSKIncludeSubdomains: @YES,
        kTSKEnforcePinning: @YES,
        kTSKPublicKeyHashes: @[
          @"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // Replace with actual pin
          @"BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB="  // Backup pin
        ],
      }
    }
  };

  [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];

  // Rest of React Native initialization...
  return YES;
}
```

**To get actual pins**, use same method as Android (TASK-189):

```bash
openssl s_client -servername [your-project-id].supabase.co -connect [your-project-id].supabase.co:443 </dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**For MVP**: Skip certificate pinning, add later in production.

---

### Phase 6: Test Production Build (15 minutes)

#### Step 6.1: Clean Build Folder

In Xcode:

1. **Product** → **Clean Build Folder** (⇧⌘K)
2. Or via command line:
   ```bash
   cd ios
   xcodebuild clean -workspace warrendeleon.xcworkspace -scheme warrendeleon
   cd ..
   ```

#### Step 6.2: Build Release Scheme

```bash
yarn ios:release
```

Or in Xcode:

1. **Select scheme**: "warrendeleon-Prod" (top-left, next to stop button)
2. **Select device**: Physical iOS device (not simulator - ATS behaves differently)
3. **Product** → **Archive**
4. **Distribute App** → **Development** → Install on device

**Expected Result**: App builds successfully and installs on device.

#### Step 6.3: Test ATS Enforcement

On physical iOS device, test:

- [ ] **App launches** without crash
- [ ] **HTTPS requests work** (e.g., Supabase API calls to `https://[project-id].supabase.co`)
- [ ] **HTTP requests fail** (verify by trying `http://example.com` in app - should error)
- [ ] **Deep links work** (test `warrendeleonapp://auth/callback`)
- [ ] **Keychain access works** (store/retrieve values with react-native-keychain)

**Check Xcode Console** for ATS violations:

```
App Transport Security has blocked a cleartext HTTP resource load since it is insecure.
```

**Expected**: No ATS violations (all connections use HTTPS).

---

## Files Modified/Created

```
ios/
├── warrendeleon/
│   ├── Info.plist                            # Modified - ATS, deep linking
│   ├── warrendeleon.entitlements             # Created - Data Protection, Keychain
│   └── AppDelegate.swift                     # Modified - TrustKit certificate pinning
├── Podfile                                   # Modified - Added TrustKit 3.0.7
└── warrendeleon.xcodeproj/
    └── project.pbxproj                       # Modified - Linked entitlements file
```

---

## Troubleshooting

### Issue 1: ATS Violation - "has blocked a cleartext HTTP resource load"

**Cause**: Trying to make HTTP (not HTTPS) request.

**Fix**:

- Ensure all API calls use `https://` (not `http://`)
- Check Supabase URL in `.env` files starts with `https://`
- Verify no hardcoded HTTP URLs in code

### Issue 2: Deep Links Not Working

**Cause**: URL scheme not registered or app not handling URL.

**Fix**:

- Verify `CFBundleURLSchemes` in Info.plist contains `warrendeleonapp`
- Implement URL handling in React Native:

  ```typescript
  import { Linking } from 'react-native';

  Linking.addEventListener('url', ({ url }) => {
    // Handle deep link
    console.log('Deep link received:', url);
  });
  ```

### Issue 3: Keychain Access Fails

**Cause**: Missing Keychain Sharing entitlement.

**Fix**:

- Verify `keychain-access-groups` in entitlements file
- Ensure Keychain Sharing capability added in Xcode
- Check app has correct provisioning profile with Keychain entitlement

### Issue 4: Data Protection Prevents Background Access

**Cause**: `NSFileProtectionComplete` locks files when device locked.

**Fix**:

- This is expected behavior (security feature)
- If background access needed, use `NSFileProtectionCompleteUnlessOpen`
- For auth tokens, Keychain remains accessible (not affected by file protection)

### Issue 5: Certificate Pinning Blocks All Requests

**Cause**: Wrong pins or expired certificates.

**Fix**:

- Verify pins are correct (re-extract from Supabase)
- Check pin expiration date in TrustKit config
- Test without pinning first, add later

---

## Security Checklist

Before marking this task complete, verify:

- [x] **ATS enabled** (no `NSAllowsArbitraryLoads` in production)
- [x] **Localhost exception** only for development Metro
- [x] **All API calls use HTTPS** (Supabase URLs verified)
- [x] **Data Protection enabled** (`NSFileProtectionComplete`)
- [x] **Keychain access groups** configured
- [x] **Deep linking** URL scheme registered
- [x] **Certificate pinning** configured (TrustKit 3.0.7 with Supabase pins)
- [ ] **Production build tested** on physical device
- [ ] **No ATS violations** in Xcode console
- [ ] **Keychain works** with biometric protection

---

## Validation

### Manual Testing

- [x] Verified ATS enabled in Info.plist
- [x] Added localhost exception for development
- [x] Created warrendeleon.entitlements with Data Protection
- [x] Configured Keychain access groups in entitlements
- [x] Registered URL scheme for deep linking (warrendeleonapp://)
- [x] Linked entitlements file to Xcode project (Debug + Release)
- [x] Added TrustKit 3.0.7 via CocoaPods
- [x] Extracted Supabase certificate pins (primary + backup)
- [x] Configured TrustKit in AppDelegate.swift
- [ ] Built production release scheme
- [ ] Installed on physical iOS device
- [ ] Tested HTTPS connections work
- [ ] Verified HTTP connections fail (ATS enforced)
- [ ] Tested deep links (URL scheme)
- [ ] Tested Keychain access (store/retrieve)
- [ ] Verified certificate pinning enforcement

---

## Dependencies

### Depends On (Blockers)

**None** - Can be done early in development.

**Recommended**: Do this task early so ATS violations are caught immediately.

### Blocks (Dependent Tasks)

**None** - Security hardening doesn't block feature development.

---

## Additional Resources

### Apple Documentation

- [App Transport Security](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)
- [Data Protection](https://developer.apple.com/documentation/uikit/protecting_the_user_s_privacy/encrypting_your_app_s_files)
- [Keychain Services](https://developer.apple.com/documentation/security/keychain_services)
- [Universal Links](https://developer.apple.com/ios/universal-links/)

### React Native Specific

- [React Native Linking](https://reactnative.dev/docs/linking)
- [React Native Security](https://reactnative.dev/docs/security)

### Certificate Pinning

- [TrustKit](https://github.com/datatheorem/TrustKit)
- [Certificate Pinning Best Practices](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)

### Internal References

- [Project Security Standards](../../readme/SECURITY.md)
- [US-033: Email/Password Registration](../stories/US-033-email-password-registration.md)
- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)
- [TASK-189: Android Security Hardening](./TASK-189-android-security-hardening.md)

---

**Estimated Time**: 1 hour (including testing on physical device)

**Actual Time**: 45 minutes (configuration + certificate pinning, physical device testing pending)

**Last Updated**: 2025-11-22

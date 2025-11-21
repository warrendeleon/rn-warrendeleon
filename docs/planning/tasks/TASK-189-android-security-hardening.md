# TASK-189: Android Security Hardening (ProGuard + Security Configuration)

**Task ID**: TASK-189
**Title**: Android Security Hardening (ProGuard + Security Configuration)
**User Story**: [US-033](../stories/US-033-email-password-registration.md) - Email/Password Registration
**Epic**: [EPIC-021](../epics/EPIC-021-registration-profile-setup.md) - Registration & Profile Setup
**Status**: ⏳ In Progress
**Priority**: High
**Effort**: 1.5 hours
**Owner**: Warren de Leon
**Created**: 2025-11-21

---

## Context

Android apps are distributed as APK/AAB files that can be reverse-engineered to extract code, API keys, and logic. ProGuard (R8) is Android's code obfuscation and optimization tool that makes reverse engineering significantly harder by:

- **Shrinking**: Removing unused code
- **Obfuscation**: Renaming classes/methods to meaningless names (a, b, c, etc.)
- **Optimization**: Optimizing bytecode for better performance
- **Protection**: Making code analysis extremely difficult

This task configures ProGuard for production builds and implements additional Android security measures like network security config and certificate pinning setup.

**Why This Matters**:

- Protects against reverse engineering of auth logic
- Makes API key extraction harder (though still possible)
- Prevents tampering with business logic
- Reduces APK size by 20-40%
- Industry standard for production Android apps

---

## Objective

Configure Android security hardening:

1. Enable ProGuard (R8) for release builds
2. Configure ProGuard rules to protect critical code while preserving functionality
3. Add keep rules for React Native, third-party libraries, and reflection
4. Configure network security (HTTPS-only, certificate pinning preparation)
5. Verify production build works correctly with ProGuard enabled
6. Document ProGuard configuration for future maintenance

**Deliverable**: Production Android build with ProGuard enabled, HTTPS enforced, ready for secure deployment.

---

## Acceptance Criteria

- [ ] **ProGuard enabled** in `android/app/build.gradle` for release builds
- [ ] **ProGuard rules configured** in `proguard-rules.pro` with React Native keep rules
- [ ] **Third-party library rules** added (Supabase, Keychain, Biometrics, etc.)
- [ ] **Network security config** created to enforce HTTPS-only
- [ ] **Certificate pinning prepared** (optional but recommended for Supabase)
- [ ] **Release build tested** on physical Android device to verify no crashes
- [ ] **APK size reduced** by 20%+ compared to debug build
- [ ] **All functionality works** (auth, storage, biometrics) after obfuscation
- [ ] **ProGuard mapping file saved** for crash report deobfuscation

---

## Detailed Implementation Guide

### Phase 1: Enable ProGuard in Gradle (10 minutes)

#### Step 1.1: Edit `android/app/build.gradle`

Open `/Users/warrendeleon/Developer/warrendeleon/android/app/build.gradle`:

**Find the `buildTypes` section** (around line 150):

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
    }
    release {
        signingConfig signingConfigs.debug
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**Modify the `release` section**:

```gradle
buildTypes {
    debug {
        signingConfig signingConfigs.debug
        // Debug builds: No obfuscation for faster builds
        minifyEnabled false
        shrinkResources false
    }
    release {
        // Production builds: Enable ProGuard
        signingConfig signingConfigs.release  // Use release signing
        minifyEnabled true                     // Enable code obfuscation ✅
        shrinkResources true                   // Remove unused resources ✅
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

        // Optional: Enable code splitting for smaller APKs
        splits {
            abi {
                enable true
                reset()
                include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
                universalApk false  // Set to true for single APK
            }
        }
    }
}
```

**Save file**.

**Expected Result**: ProGuard will run on release builds.

---

### Phase 2: Configure ProGuard Rules (45 minutes)

#### Step 2.1: Create `proguard-rules.pro`

Create or edit `/Users/warrendeleon/Developer/warrendeleon/android/app/proguard-rules.pro`:

```proguard
# Warren de Leon Portfolio - ProGuard Configuration
# Last Updated: 2025-11-21

###################################################################################################
# REACT NATIVE CORE
###################################################################################################

# Keep React Native core classes
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep,allowobfuscation @interface com.facebook.jni.annotations.DoNotStrip

# Keep classes annotated with DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keep @com.facebook.jni.annotations.DoNotStrip class *

# Keep native methods
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
    @com.facebook.jni.annotations.DoNotStrip *;
}

# Keep methods annotated with KeepGettersAndSetters
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

# Keep React Native JavaScript interface
-keepclassmembers class * {
  @android.webkit.JavascriptInterface <methods>;
}

# Keep Hermes engine
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

###################################################################################################
# REACT NATIVE LIBRARIES
###################################################################################################

# react-native-keychain (CRITICAL - stores auth tokens)
-keep class com.oblador.keychain.** { *; }
-keepclassmembers class com.oblador.keychain.** { *; }

# react-native-encrypted-storage (CRITICAL - stores PII)
-keep class com.emeraldsanto.encryptedstorage.** { *; }
-keepclassmembers class com.emeraldsanto.encryptedstorage.** { *; }

# react-native-biometrics (CRITICAL - biometric auth)
-keep class com.rnbiometrics.** { *; }
-keepclassmembers class com.rnbiometrics.** { *; }

# react-native-image-picker (profile picture selection)
-keep class com.imagepicker.** { *; }
-keep class com.reactnative.imagepicker.** { *; }

# react-native-image-resizer (profile picture processing)
-keep class fr.bamlab.rnimageresizer.** { *; }

# @react-native-async-storage/async-storage (Redux Persist)
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# react-native-device-info (device detection)
-keep class com.learnium.RNDeviceInfo.** { *; }

# jail-monkey (root/jailbreak detection)
-keep class com.gantix.JailMonkey.** { *; }

###################################################################################################
# REDUX & STATE MANAGEMENT
###################################################################################################

# Redux Toolkit & Redux Persist
# These use reflection for serialization/deserialization
-keepclassmembers class * {
  @com.facebook.react.bridge.ReactMethod <methods>;
}

# Keep Redux state classes (if using TypeScript interfaces, this may not apply)
-keep class com.warrendeleon.redux.** { *; }

###################################################################################################
# NETWORKING & API
###################################################################################################

# Axios (HTTP client for Supabase REST API)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# Supabase realtime (WebSocket for chat later)
-keep class io.supabase.** { *; }
-dontwarn io.supabase.**

# Certificate pinning (if implemented)
-keep class com.datatheorem.android.trustkit.** { *; }

###################################################################################################
# JSON SERIALIZATION
###################################################################################################

# Keep JSON model classes for Zod validation
# If you have model classes, add them here
-keep class com.warrendeleon.models.** { *; }

# Generic JSON keep rules
-keepclassmembers class * {
  @com.google.gson.annotations.SerializedName <fields>;
}

###################################################################################################
# REACT NATIVE NAVIGATION
###################################################################################################

# React Navigation
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# react-native-safe-area-context
-keep public class com.th3rdwave.safeareacontext.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

###################################################################################################
# GLUESTACK UI & STYLING
###################################################################################################

# NativeWind (Tailwind CSS for React Native)
# Generally safe, but keep if issues arise
-dontwarn com.shopify.reactnative.**

###################################################################################################
# GENERAL ANDROID
###################################################################################################

# Keep Android support/AndroidX libraries
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-dontwarn androidx.**

# Keep Google Play Services (if used for push notifications later)
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Keep custom exceptions for debugging
-keep public class * extends java.lang.Exception

# Keep line numbers for crash reports
-keepattributes SourceFile,LineNumberTable

# Keep generic signatures for reflection
-keepattributes Signature

# Keep annotations
-keepattributes *Annotation*

# Keep inner classes
-keepattributes InnerClasses

###################################################################################################
# WARNINGS TO IGNORE
###################################################################################################

# Ignore warnings from third-party libraries
-dontwarn com.facebook.react.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

###################################################################################################
# OPTIMIZATION
###################################################################################################

# Optimize for size and performance
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Enable aggressive mode (optional, may cause issues - test carefully)
# -overloadaggressively

###################################################################################################
# DEBUGGING
###################################################################################################

# Print configuration for debugging (disable in final release)
# -printconfiguration proguard-config.txt
# -printusage proguard-usage.txt
# -printmapping proguard-mapping.txt

# Keep for debugging crashes (ALWAYS KEEP THIS)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
```

**Save file**.

**Expected Result**: Comprehensive ProGuard rules covering React Native + all dependencies.

---

### Phase 3: Network Security Configuration (20 minutes)

#### Step 3.1: Create Network Security Config

Create `/Users/warrendeleon/Developer/warrendeleon/android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Production: HTTPS-only, no cleartext traffic -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <!-- Trust system CA certificates -->
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Certificate Pinning for Supabase (Optional but Recommended) -->
    <!-- IMPORTANT: Update pins before they expire (check every 90 days) -->
    <domain-config>
        <domain includeSubdomains="true">supabase.co</domain>
        <!-- Certificate pins - REPLACE WITH YOUR ACTUAL PINS -->
        <!-- To get pins, see Phase 4 instructions below -->
        <pin-set expiration="2026-01-01">
            <!-- Primary certificate pin (SHA-256 hash of public key) -->
            <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
            <!-- Backup certificate pin -->
            <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
        </pin-set>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>

    <!-- Development: Allow localhost for React Native Metro -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain> <!-- Android emulator -->
        <domain includeSubdomains="true">10.0.3.2</domain> <!-- Genymotion emulator -->
    </domain-config>
</network-security-config>
```

**Save file**.

#### Step 3.2: Reference Network Config in AndroidManifest.xml

Open `/Users/warrendeleon/Developer/warrendeleon/android/app/src/main/AndroidManifest.xml`:

**Find the `<application>` tag** and add `networkSecurityConfig` attribute:

```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:networkSecurityConfig="@xml/network_security_config">  <!-- ADD THIS LINE -->

    <!-- Rest of application config -->
</application>
```

**Save file**.

**Expected Result**: HTTPS enforced, cleartext traffic blocked in production.

---

### Phase 4: Certificate Pinning (Optional but Recommended) - (15 minutes)

**⚠️ OPTIONAL**: Certificate pinning is recommended but adds complexity. Skip for MVP, add later.

#### Step 4.1: Extract Supabase Certificate Pins

**Install OpenSSL** (if not already):

```bash
brew install openssl
```

**Extract certificate from Supabase**:

```bash
# Replace [your-project-id] with actual Supabase project ID
openssl s_client -servername [your-project-id].supabase.co -connect [your-project-id].supabase.co:443 </dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**Expected Output**:

```
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

**Replace the placeholder pins** in `network_security_config.xml` with actual pins.

**⚠️ CRITICAL**: Certificate pins expire. Set expiration date and monitor.

**For now**: Leave placeholder pins or remove `<domain-config>` for Supabase (skip pinning for MVP).

---

### Phase 5: Test Production Build (30 minutes)

#### Step 5.1: Clean Previous Builds

```bash
cd android
./gradlew clean
cd ..
```

#### Step 5.2: Build Release APK

```bash
cd android
./gradlew assembleRelease
cd ..
```

**Expected Output**:

```
BUILD SUCCESSFUL in 2m 34s
```

**Expected Location**:

```
android/app/build/outputs/apk/release/app-release.apk
```

#### Step 5.3: Check APK Size Reduction

```bash
# Check debug APK size
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Check release APK size
ls -lh android/app/build/outputs/apk/release/app-release.apk
```

**Expected Result**: Release APK should be 20-40% smaller than debug APK.

**Example**:

- Debug APK: 45 MB
- Release APK: 28 MB (38% reduction) ✅

#### Step 5.4: Install on Physical Device

**⚠️ CRITICAL**: Test on PHYSICAL device, not emulator (ProGuard behaves differently).

```bash
# Connect Android device via USB with USB debugging enabled
adb devices  # Verify device connected

# Install release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Expected Result**: App installs successfully.

#### Step 5.5: Test All Critical Functionality

Open app on physical device and test:

- [ ] **App launches** without crash
- [ ] **Navigation works** (all screens accessible)
- [ ] **Forms render** (registration screen shows correctly)
- [ ] **Keychain access** (if testing biometric setup)
- [ ] **Network requests** (if testing auth API calls)
- [ ] **Image upload** (if testing profile picture picker)

**If app crashes**:

1. Check logcat: `adb logcat | grep -E "(AndroidRuntime|ReactNative)"`
2. Look for `ClassNotFoundException` or `MethodNotFoundException`
3. Add missing keep rules to `proguard-rules.pro`
4. Rebuild and test again

**Common crash causes**:

- Missing keep rule for third-party library
- Reflection used by library (add `-keep class`)
- Custom model classes obfuscated (add `-keep class com.warrendeleon.models.**`)

---

## Files Modified/Created

```
android/
├── app/
│   ├── build.gradle                          # Modified - Enabled ProGuard
│   ├── proguard-rules.pro                    # Created - ProGuard configuration
│   └── src/main/
│       ├── AndroidManifest.xml               # Modified - Added network security config
│       └── res/xml/
│           └── network_security_config.xml   # Created - HTTPS enforcement + cert pinning
```

---

## Troubleshooting

### Issue 1: Build Fails with "Duplicate class" Error

**Cause**: ProGuard conflicts with library dependencies.

**Fix**:

```gradle
// In android/app/build.gradle, add to dependencies:
configurations.all {
    exclude group: 'com.facebook.react', module: 'react-native'
}
```

### Issue 2: App Crashes with ClassNotFoundException

**Cause**: ProGuard obfuscated a class that's accessed via reflection.

**Fix**:

- Identify class name from logcat
- Add keep rule: `-keep class com.example.ClassName { *; }`
- Rebuild

### Issue 3: Network Requests Fail After ProGuard

**Cause**: Network security config blocking requests or OkHttp obfuscated.

**Fix**:

- Verify network_security_config.xml syntax
- Add OkHttp keep rules (already in proguard-rules.pro above)
- Check logcat for "CleartextTrafficNotPermittedException"

### Issue 4: Release APK Not Signing

**Cause**: Missing release signing config in `build.gradle`.

**Fix**:

```gradle
// In android/app/build.gradle:
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

### Issue 5: ProGuard Mapping File Not Generated

**Cause**: Mapping file output not configured.

**Fix**:

```gradle
// In android/app/build.gradle, release buildType:
release {
    ...
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    // Save mapping file for crash deobfuscation
    printMapping file("$buildDir/outputs/mapping/release/mapping.txt")
}
```

---

## Security Checklist

Before marking this task complete, verify:

- [ ] **ProGuard enabled** for release builds (`minifyEnabled true`)
- [ ] **Shrink resources enabled** (`shrinkResources true`)
- [ ] **All critical libraries** have keep rules (keychain, encrypted storage, biometrics)
- [ ] **Network security config** enforces HTTPS-only
- [ ] **Cleartext traffic blocked** (except localhost for development)
- [ ] **Release APK tested** on physical device (all features work)
- [ ] **APK size reduced** by 20%+ (optimization working)
- [ ] **ProGuard mapping file saved** (for crash report deobfuscation)
- [ ] **No sensitive data** in ProGuard rules (no hardcoded secrets)

---

## Validation

### Manual Testing

- [x] Enabled ProGuard in build.gradle
- [x] Created comprehensive proguard-rules.pro
- [x] Created network_security_config.xml
- [x] Referenced network config in AndroidManifest.xml
- [x] Built release APK successfully
- [x] Verified APK size reduction
- [x] Installed release APK on physical device
- [x] Tested app launch (no crashes)
- [x] Tested navigation (all screens work)
- [x] Tested critical functionality (forms, networking, storage)

---

## Dependencies

### Depends On (Blockers)

**None** - Can be done early in development.

**Recommended Order**: Do this task before implementing features, so you catch ProGuard issues early.

### Blocks (Dependent Tasks)

**None** - Security hardening doesn't block feature development, but should be tested continuously.

---

## Additional Resources

### Android ProGuard Documentation

- [ProGuard Manual](https://www.guardsquare.com/manual/home)
- [Android R8 Shrinking](https://developer.android.com/studio/build/shrink-code)
- [Network Security Config](https://developer.android.com/training/articles/security-config)

### React Native Specific

- [React Native ProGuard](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk-optional)
- [Troubleshooting ProGuard](https://reactnative.dev/docs/signed-apk-android#troubleshooting)

### Internal References

- [Project Security Standards](../../readme/SECURITY.md)
- [US-033: Email/Password Registration](../stories/US-033-email-password-registration.md)
- [EPIC-021: Registration & Profile Setup](../epics/EPIC-021-registration-profile-setup.md)

---

**Estimated Time**: 1.5 hours (including testing on physical device)

**Actual Time**: _To be tracked_

**Last Updated**: 2025-11-21

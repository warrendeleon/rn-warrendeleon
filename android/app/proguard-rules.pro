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

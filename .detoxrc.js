/** @type {Detox.DetoxConfig} */
module.exports = {
  behavior: {
    init: {
      reinstallApp: true,
    },
  },
  apps: {
    // OTHER_SWIFT_FLAGS=-D DETOX_BUILD compiles TrustKit OUT of the binary
    // for E2E builds (see ios/warrendeleon/AppDelegate.swift). The flag is
    // set ONLY here, never on regular Debug/Release builds, so production
    // and developer builds always include cert pinning.
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/warrendeleon.app',
      build:
        "xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -arch arm64 ONLY_ACTIVE_ARCH=YES DEBUG_INFORMATION_FORMAT=dwarf OTHER_SWIFT_FLAGS='$(inherited) -D DETOX_BUILD'",
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/warrendeleon.app',
      build:
        "xcodebuild -workspace ios/warrendeleon.xcworkspace -scheme warrendeleon -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -arch arm64 ONLY_ACTIVE_ARCH=YES OTHER_SWIFT_FLAGS='$(inherited) -D DETOX_BUILD'",
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      headless: process.env.CI ? true : false, // Headless in CI, visible locally
      device: {
        type: 'iPhone 17 Pro',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
    emulator: {
      type: 'android.emulator',
      headless: process.env.CI ? true : false, // Headless in CI, visible locally
      device: {
        avdName: 'Pixel_7_API_35',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};

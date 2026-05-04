import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import RCTLinking
import TrustKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // TrustKit is compiled OUT of Detox E2E builds via the DETOX_BUILD Swift
    // flag (set by xcodebuild OTHER_SWIFT_FLAGS in .detoxrc.js). The previous
    // implementation used a runtime ProcessInfo argument check, which shipped
    // into the release IPA — anyone could launch the app with `-detoxServer`
    // (Xcode, lldb, jailbroken device) and disable cert pinning entirely.
    // The whole point of the pin is to defend against attackers with network
    // access; a runtime kill-switch defeats that. Compile-time exclusion
    // means the Detox bypass cannot exist in any artifact a user sees.
    #if !DETOX_BUILD
      // Configure TrustKit for SSL certificate pinning
      let trustKitConfig: [String: Any] = [
        kTSKSwizzleNetworkDelegates: true,
        kTSKPinnedDomains: [
          "rgsvcwaxzfzqcvtyfcwk.supabase.co": [
            kTSKIncludeSubdomains: true,
            kTSKEnforcePinning: true,
            kTSKPublicKeyHashes: [
              "PzfKSv758ttsdJwUCkGhW/oxG9Wk1Y4N+NMkB5I7RXc=",  // Primary pin (leaf certificate)
              "kIdp6NNEd8wsugYyyIYFsi1ylMCED3hZbSR8ZFsa/A4="   // Backup pin (intermediate certificate)
            ]
          ]
        ]
      ]
      TrustKit.initSharedInstance(withConfiguration: trustKitConfig)
    #endif

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "warrendeleon",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  /// Handle deep links when app is already running (warm starts)
  /// This is required for React Native Linking to receive URL events
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView)
  }
}
